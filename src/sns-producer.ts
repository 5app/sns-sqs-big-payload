import {Upload} from '@aws-sdk/lib-storage';
import {S3} from '@aws-sdk/client-s3';
import {PublishCommandOutput, SNS} from '@aws-sdk/client-sns';
import {randomUUID as uuid} from 'node:crypto';
import type {S3PayloadMeta} from './types';
import {
	buildS3PayloadWithExtendedCompatibility,
	buildS3Payload,
	createExtendedCompatibilityAttributeMap,
} from './util';

export interface SnsProducerOptions {
	topicArn?: string;
	region?: string;
	largePayloadThoughS3?: boolean;
	allPayloadThoughS3?: boolean;
	s3Bucket?: string;
	sns?: SNS;
	s3?: S3;
	snsEndpointUrl?: string;
	s3EndpointUrl?: string;
	messageSizeThreshold?: number;
	// Opt-in to enable compatibility with
	// Amazon SQS Extended Client Java Library (and other compatible libraries)
	extendedLibraryCompatibility?: boolean;
}

export interface PublishResult {
	snsResponse: any;
	s3Response?: any;
}

// https://aws.amazon.com/sns/pricing/
// Amazon SNS currently allows a maximum size of 256 KB for published messages.
export const DEFAULT_MAX_SNS_MESSAGE_SIZE = 256 * 1024;

export class SnsProducer {
	private topicArn: string;
	private sns: SNS;
	private s3: S3;
	private largePayloadThoughS3: boolean;
	private allPayloadThoughS3: boolean;
	private s3Bucket: string;
	private messageSizeThreshold: number;
	private extendedLibraryCompatibility: boolean;

	constructor(options: SnsProducerOptions) {
		if (options.sns) {
			this.sns = options.sns;
		} else {
			this.sns = new SNS({
				region: options.region,
				endpoint: options.snsEndpointUrl,
			});
		}
		if (options.allPayloadThoughS3 || options.largePayloadThoughS3) {
			if (!options.s3Bucket) {
				throw new Error(
					'Need to specify "s3Bucket" option when using allPayloadThoughS3 or  largePayloadThoughS3.'
				);
			}

			if (options.s3) {
				this.s3 = options.s3;
			} else {
				this.s3 = new S3({
					region: options.region,
					endpoint: options.s3EndpointUrl,
				});
			}
		}

		this.topicArn = options.topicArn;
		this.largePayloadThoughS3 = options.largePayloadThoughS3;
		this.allPayloadThoughS3 = options.allPayloadThoughS3;
		this.s3Bucket = options.s3Bucket;
		this.messageSizeThreshold =
			options.messageSizeThreshold ?? DEFAULT_MAX_SNS_MESSAGE_SIZE;
		this.extendedLibraryCompatibility =
			options.extendedLibraryCompatibility;
	}

	public static create(options: SnsProducerOptions): SnsProducer {
		return new SnsProducer(options);
	}

	async publishJSON(message: unknown): Promise<PublishResult> {
		const messageBody = JSON.stringify(message);
		const msgSize = Buffer.byteLength(messageBody, 'utf-8');

		if (
			(msgSize > this.messageSizeThreshold &&
				this.largePayloadThoughS3) ||
			this.allPayloadThoughS3
		) {
			const payloadId = uuid();
			const payloadKey = this.extendedLibraryCompatibility
				? payloadId
				: `${payloadId}.json`;
			const s3Response = await new Upload({
				client: this.s3,

				params: {
					Bucket: this.s3Bucket,
					Body: messageBody,
					Key: payloadKey,
					ContentType: 'application/json',
				},
			}).done();

			const snsResponse = await this.publishS3Payload(
				{
					Id: payloadId,
					Bucket: s3Response.Bucket,
					Key: s3Response.Key,
					Location: s3Response.Location,
				},
				msgSize
			);

			return {
				s3Response,
				snsResponse,
			};
		} else if (msgSize > this.messageSizeThreshold) {
			throw new Error(
				`Message is too big (${msgSize} > ${this.messageSizeThreshold}). Use 'largePayloadThoughS3' option to send large payloads though S3.`
			);
		}

		const snsResponse = await this.sns.publish({
			Message: messageBody,
			TopicArn: this.topicArn,
		});

		return {
			snsResponse,
		};
	}

	async publishS3Payload(
		s3PayloadMeta: S3PayloadMeta,
		msgSize?: number
	): Promise<PublishCommandOutput> {
		const messageAttributes = this.extendedLibraryCompatibility
			? createExtendedCompatibilityAttributeMap(msgSize)
			: {};
		return this.sns.publish({
			Message: this.extendedLibraryCompatibility
				? buildS3PayloadWithExtendedCompatibility(s3PayloadMeta)
				: buildS3Payload(s3PayloadMeta),
			TopicArn: this.topicArn,
			MessageAttributes: messageAttributes,
		});
	}
}
