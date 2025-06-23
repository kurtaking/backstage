/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  createServiceFactory,
  coreServices,
} from '@backstage/backend-plugin-api';
import { DefaultRootTelemetryService } from './DefaultRootTelemetryService';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

export const rootTelemetryServiceFactory = createServiceFactory({
  service: coreServices.rootTelemetry,
  deps: {
    rootLifecycle: coreServices.rootLifecycle,
  },
  async factory({ rootLifecycle }) {
    const prometheus = new PrometheusExporter();
    const sdk = new NodeSDK({
      metricReader: prometheus,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    rootLifecycle.addBeforeShutdownHook(() => sdk.shutdown());
    rootLifecycle.addStartupHook(() => sdk.start());

    return DefaultRootTelemetryService.create(sdk);
  },
});
