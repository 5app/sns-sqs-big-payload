## [1.0.3](https://github.com/5app/sns-sqs-big-payload/compare/v1.0.2...v1.0.3) (2025-03-12)


### Performance Improvements

* **npm:** refer to @aws-sdk/* as peer dependencies ([#2](https://github.com/5app/sns-sqs-big-payload/issues/2)) ([6525348](https://github.com/5app/sns-sqs-big-payload/commit/652534816b95fd844f8a6c6ca24dd57cd7c04d24))

## [1.0.2](https://github.com/5app/sns-sqs-big-payload/compare/v1.0.1...v1.0.2) (2025-03-11)


### Bug Fixes

* **ts:** export correct definitions ([5ac721c](https://github.com/5app/sns-sqs-big-payload/commit/5ac721c525e9a605442a29e35cb7fdb9309e960f))

## [1.0.1](https://github.com/5app/sns-sqs-big-payload/compare/v1.0.0...v1.0.1) (2025-03-11)


### Bug Fixes

* **ci:** fix npm deployment ([c8b7125](https://github.com/5app/sns-sqs-big-payload/commit/c8b71253fd09b450bc38ef6db2156ec56cd4df4d))

# 1.0.0 (2025-03-11)


### Bug Fixes

* add aws-sdk as a dependency (instead of peer dep) ([1fc11e4](https://github.com/5app/sns-sqs-big-payload/commit/1fc11e4c69c9473c172889f598374020f554f4bc))
* ci ([#14](https://github.com/5app/sns-sqs-big-payload/issues/14)) ([a0e33a7](https://github.com/5app/sns-sqs-big-payload/commit/a0e33a7a52745d72752ae926007eaa2af4278849))
* ctor and processing fixes ([3dce3dc](https://github.com/5app/sns-sqs-big-payload/commit/3dce3dc9f17c5bd53084d6820cdaeb7f3553755e))
* do not ignore build folder in npm ([042fdd2](https://github.com/5app/sns-sqs-big-payload/commit/042fdd25eafeac5c3733fbab77aaa5e6e7139a55))
* events ([b3ad63a](https://github.com/5app/sns-sqs-big-payload/commit/b3ad63a5f8ba1a30e0101e5b1ab578c2526d8242))
* lib name in the readme ([fad44eb](https://github.com/5app/sns-sqs-big-payload/commit/fad44ebdc15e4ad51280200bc2eb69fef5fa43a6))
* no sleep between batch receive calls ([57bd33f](https://github.com/5app/sns-sqs-big-payload/commit/57bd33f6e7369d6f7fb896f9446dde11d7496311))
* package.json -> main reference ([69c5022](https://github.com/5app/sns-sqs-big-payload/commit/69c5022a1f1dee588e1361b4e825c2068f5f6249))
* type ([5bfb220](https://github.com/5app/sns-sqs-big-payload/commit/5bfb220441b350f71e49e6097615ef57d16b9058))
* update, test and build ([b669049](https://github.com/5app/sns-sqs-big-payload/commit/b669049eeff9045e2e77f0cfe591bfcff715b762))
* use correct schema for extended lib compatibility ([#43](https://github.com/5app/sns-sqs-big-payload/issues/43)) ([f1dd6c5](https://github.com/5app/sns-sqs-big-payload/commit/f1dd6c534d3d135eea23b55f2b0d4a8bfc3930c8)), closes [#42](https://github.com/5app/sns-sqs-big-payload/issues/42) [#19](https://github.com/5app/sns-sqs-big-payload/issues/19)
* wait for messages to be processed before loading another batch ([be552f4](https://github.com/5app/sns-sqs-big-payload/commit/be552f4d927209485d7f6face699bdee3adfaa99))


### Features

* add messageSizeThreshold option to producers ([#23](https://github.com/5app/sns-sqs-big-payload/issues/23)) ([b4a58d7](https://github.com/5app/sns-sqs-big-payload/commit/b4a58d7ee6bd8da5f03ea73bac0d6f77bf410560))
* aws credentials ([154b866](https://github.com/5app/sns-sqs-big-payload/commit/154b866bc9ac19052d1e706dcc2ed1969036cf9b))
* batch processed event ([c1d1129](https://github.com/5app/sns-sqs-big-payload/commit/c1d1129f1e228be4fbf959cb7c696fdeeb067326))
* init ([805c1fe](https://github.com/5app/sns-sqs-big-payload/commit/805c1fea2985c35f4c3ee6d6b1d42028f399fca4))
* initial working version w/o docs ([f1e5592](https://github.com/5app/sns-sqs-big-payload/commit/f1e5592a72c52d3274156cc03e9e84637cdc710c))
* license ([eb58952](https://github.com/5app/sns-sqs-big-payload/commit/eb58952fe04822b69ee05819d1e0d73ed96a85b3))
* make aws-sdk a both peer and dev dependency ([b0eb1a3](https://github.com/5app/sns-sqs-big-payload/commit/b0eb1a39b4a1b49954d724439cc890c660c16e29))
* return s3 payload from consumer, and add send method which accept it to producer ([#24](https://github.com/5app/sns-sqs-big-payload/issues/24)) ([08221a5](https://github.com/5app/sns-sqs-big-payload/commit/08221a5f95f611c75aa7a340002987780b98bb8b))
* run tests over localstack ([8515f3c](https://github.com/5app/sns-sqs-big-payload/commit/8515f3c7b73eba46b03e5685e82263000df67546))
* usage in lambda ([#13](https://github.com/5app/sns-sqs-big-payload/issues/13)) ([19df75b](https://github.com/5app/sns-sqs-big-payload/commit/19df75b8c9ca01ca7b86e8371a7bb0415cb60ab0))
