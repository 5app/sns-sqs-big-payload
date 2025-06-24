import {Upload} from '@aws-sdk/lib-storage';
import {S3} from '@aws-sdk/client-s3';
import {type SendMessageCommandOutput, SQS} from '@aws-sdk/client-sqs';
import {randomUUID as uuid} from 'node:crypto';
import type {S3PayloadMeta} from './types';
import {
	buildS3PayloadWithExtendedCompatibility,
	buildS3Payload,
	createExtendedCompatibilityAttributeMap,
} from './util';

// 256KiB
export const DEFAULT_MAX_SQS_MESSAGE_SIZE = 256 * 1024;

export interface SqsProducerOptions {
	queueUrl: string;
	region?: string;
	largePayloadThoughS3?: boolean;
	allPayloadThoughS3?: boolean;
	s3Bucket?: string;
	s3KeyPrefix?: string;
	sqs?: SQS;
	s3?: S3;
	sqsEndpointUrl?: string;
	s3EndpointUrl?: string;
	messageSizeThreshold?: number;
	// Opt-in to enable compatibility with
	// Amazon SQS Extended Client Java Library (and other compatible libraries)
	extendedLibraryCompatibility?: boolean;
}

export interface SqsMessageOptions {
	DelaySeconds?: number;
	MessageDeduplicationId?: string;
	MessageGroupId?: string;
}

export class SqsProducer {
	private sqs: SQS;
	private s3: S3;
	private queueUrl: string;
	private largePayloadThoughS3: boolean;
	private allPayloadThoughS3: boolean;
	private s3Bucket: string;
	private s3KeyPrefix: string;
	private messageSizeThreshold: number;
	private extendedLibraryCompatibility: boolean;

	constructor(options: SqsProducerOptions) {
		this.sqs =
			options.sqs ||
			new SQS({
				region: options.region,
				endpoint: options.sqsEndpointUrl,
			});

		if (options.largePayloadThoughS3 || options.allPayloadThoughS3) {
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

		this.queueUrl = options.queueUrl;
		this.largePayloadThoughS3 = options.largePayloadThoughS3;
		this.allPayloadThoughS3 = options.allPayloadThoughS3;
		this.s3Bucket = options.s3Bucket;
		this.s3KeyPrefix = options.s3KeyPrefix || 'queue-big-payload/';
		this.messageSizeThreshold =
			options.messageSizeThreshold ?? DEFAULT_MAX_SQS_MESSAGE_SIZE;
		this.extendedLibraryCompatibility =
			options.extendedLibraryCompatibility;
	}

	static create(options: SqsProducerOptions): SqsProducer {
		return new SqsProducer(options);
	}

	async sendJSON(
		message: unknown,
		options: SqsMessageOptions = {}
	): Promise<any> {
		const messageBody = JSON.stringify(message);
		const msgSize = Buffer.byteLength(messageBody, 'utf-8');

		if (
			(msgSize > this.messageSizeThreshold &&
				this.largePayloadThoughS3) ||
			this.allPayloadThoughS3
		) {
			const payloadId = uuid();
			const payloadKey =
				this.s3KeyPrefix +
				payloadId +
				(this.extendedLibraryCompatibility ? '' : '.json');
			const s3Response = await new Upload({
				client: this.s3,

				params: {
					Bucket: this.s3Bucket,
					Body: messageBody,
					Key: payloadKey,
					ContentType: 'application/json',
				},
			}).done();

			const sqsResponse = await this.sendS3Payload(
				{
					Id: payloadId,
					Bucket: s3Response.Bucket,
					Key: s3Response.Key,
					Location: s3Response.Location,
				},
				msgSize,
				options
			);

			return {
				s3Response,
				sqsResponse,
			};
		} else if (msgSize > this.messageSizeThreshold) {
			throw new Error(
				"Message is too big. Use 'largePayloadThoughS3' option to send large payloads though S3."
			);
		}

		const sqsResponse = await this.sqs.sendMessage({
			QueueUrl: this.queueUrl,
			MessageBody: messageBody,
			DelaySeconds: options.DelaySeconds,
			MessageDeduplicationId: options.MessageDeduplicationId,
			MessageGroupId: options.MessageGroupId,
		});

		return {
			sqsResponse,
		};
	}

	// send a message into the queue with payload which is already in s3.
	// for example: can be used to resend an unmodified message received via this lib from a queue
	// into another queue without duplicating the s3 object
	async sendS3Payload(
		s3PayloadMeta: S3PayloadMeta,
		msgSize?: number,
		options: SqsMessageOptions = {}
	): Promise<SendMessageCommandOutput> {
		const messageAttributes = this.extendedLibraryCompatibility
			? createExtendedCompatibilityAttributeMap(msgSize)
			: {};
		return await this.sqs.sendMessage({
			QueueUrl: this.queueUrl,
			MessageBody: this.extendedLibraryCompatibility
				? buildS3PayloadWithExtendedCompatibility(s3PayloadMeta)
				: buildS3Payload(s3PayloadMeta),
			DelaySeconds: options.DelaySeconds,
			MessageDeduplicationId: options.MessageDeduplicationId,
			MessageGroupId: options.MessageGroupId,
			MessageAttributes: messageAttributes,
		});
	}
}
