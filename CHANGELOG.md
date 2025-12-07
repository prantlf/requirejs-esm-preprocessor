# Changes

## [3.1.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v3.0.0...v3.1.0) (2025-12-07)

### Features

* Support transformation and opdating hooks ([a25e233](https://github.com/prantlf/requirejs-esm-preprocessor/commit/a25e233e16a7519e7b18c1f8f6dab1f9b3f72dd6))

## [3.0.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v2.1.1...v3.0.0) (2025-11-09)

### Features

* Insert "use strict" to output AMD code by default ([ba6e047](https://github.com/prantlf/requirejs-esm-preprocessor/commit/ba6e04735f2f58bd281e6554cc2b7f996515de43))

### BREAKING CHANGES

Each AMD module output will start with `"use strict"` by default from now on. ESM execution mode is strict by default. Comply to this in the output AMD code too. If you use a module bundler, which inserts `"use strict"` to the outer scope, you can set the `useStrict` flag to `false` to avoid inserting `"use strict"` to each inner AMD module.

## [2.1.1](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v2.1.0...v2.1.1) (2025-05-14)

### Bug Fixes

* Upgrade dependencies ([a106818](https://github.com/prantlf/requirejs-esm-preprocessor/commit/a1068185dff3f71690f1dd94327ea6fde670e221))

## [2.1.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v2.0.0...v2.1.0) (2025-05-14)

### Features

* Upgrade dependencies ([79b6cc4](https://github.com/prantlf/requirejs-esm-preprocessor/commit/79b6cc43d10afe4591bf256b67f30c10670666a4))

## [2.0.0](https://github.com/prantlf/requirejs-esm/compare/v1.5.0...v2.0.0) (2024-08-06)

### Bug Fixes

* Re-release 1.5.0 as 2.0.0 because of a breaking change ([46031f6](https://github.com/prantlf/requirejs-esm/commit/46031f63ac081ad44c5facc7fcd256f4eff4ce99))

### BREAKING CHANGES

The minimum version of Node.js is 18 from now on.

## [1.5.1](https://github.com/prantlf/requirejs-esm/compare/v1.4.1...v1.5.1) (2024-08-06)

### Bug Fixes

* Re-release 1.4.1 to fix a breaking change in 1.5.0 ([a4283a1](https://github.com/prantlf/requirejs-esm/commit/a4283a111665a5beb64ae056c02b3e064de8c701))

## [1.5.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.4.1...v1.5.0) (2024-07-27)

### Features

* Upgrade dependencies ([ac6054a](https://github.com/prantlf/requirejs-esm-preprocessor/commit/ac6054a837869a8eee9e0fb1763af282c7baa836))

## [1.4.1](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.4.0...v1.4.1) (2023-05-29)

### Bug Fixes

* Disabling insecure and secure servers on the command line did not work ([5bc3069](https://github.com/prantlf/requirejs-esm-preprocessor/commit/5bc3069551415122e9207901578252d0a55207af))

## [1.4.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.3.1...v1.4.0) (2023-05-10)

### Features

* Allow inserting additional handlers vua server options ([e0bb38e](https://github.com/prantlf/requirejs-esm-preprocessor/commit/e0bb38e290f4fdec49b3d6c308d94badd9f61982))

## [1.3.1](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.3.0...v1.3.1) (2023-05-05)

### Bug Fixes

* Upgrade dependencies ([dc98d06](https://github.com/prantlf/requirejs-esm-preprocessor/commit/dc98d06b1dd4969489bb7bb2860d6491ba424858))

## [1.3.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.2.1...v1.3.0) (2022-08-28)

### Features

* Add failthrough flag and setHeaders callback ([38f5d4d](https://github.com/prantlf/requirejs-esm-preprocessor/commit/38f5d4dc6b68be7be22894a914add7d97681f94a))
* Add parameter cache to disable the 304 caching ([7a794bb](https://github.com/prantlf/requirejs-esm-preprocessor/commit/7a794bbd75bc1d5156fec3613fe0802061ec1200))

## [1.2.1](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.2.0...v1.2.1) (2022-04-18)

### Bug Fixes

* Skip directories, when passed to the preprocessor middleware ([34c93ff](https://github.com/prantlf/requirejs-esm-preprocessor/commit/34c93ff332b53a55d3c4e502d81d2d440dc75966))

## [1.2.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.1.1...v1.2.0) (2022-04-09)

### Features

* Make defaults in defaultUsage configurable ([35cfefb](https://github.com/prantlf/requirejs-esm-preprocessor/commit/35cfefbf98b0af659fcfe972fc035ec0fad3881a))

## [1.1.1](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.1.0...v1.1.1) (2022-04-09)

### Bug Fixes

* Upgrade dependencies ([a28c766](https://github.com/prantlf/requirejs-esm-preprocessor/commit/a28c76651726b4a1b3481cc841047d67993d60bd))

## [1.1.0](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.0.2...v1.1.0) (2022-04-09)

### Features

* Add a command-lite script to launch the development web server ([3c41ae6](https://github.com/prantlf/requirejs-esm-preprocessor/commit/3c41ae60f5029cf43a241e4ef44a71fb8eb47894))
* Block requests to favicon.ico by default ([e13f6d1](https://github.com/prantlf/requirejs-esm-preprocessor/commit/e13f6d1bc6ffc16536ca709e800b7e46e99b2cdd))

## [1.0.2](https://github.com/prantlf/requirejs-esm-preprocessor/compare/v1.0.1...v1.0.2) (2022-04-09)

### Bug Fixes

* Upgrade dependencies, fix links in package.json ([041641f](https://github.com/prantlf/requirejs-esm-preprocessor/commit/041641f0267e63231a2ee18a3d1fe99de5f0d6d6))

# Changes

## 1.0.1 (2022-04-08)

* Upgrade dependencies

## 1.0.0 (2022-04-04)

Initial release.
