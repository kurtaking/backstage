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
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { createRootTelemetryService } from './createRootTelemetryService';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

export const rootTelemetryServiceFactory = createServiceFactory({
  service: coreServices.rootTelemetry,
  deps: {
    rootLifecycle: coreServices.rootLifecycle,
  },
  async factory({ rootLifecycle }) {
    const rootServiceName = 'backstage';
    const rootServiceVersion = '0.0.0';

    const resource = defaultResource().merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: rootServiceName,
        [ATTR_SERVICE_VERSION]: rootServiceVersion,
      }),
    );

    const prometheus = new PrometheusExporter();

    const sdk = new NodeSDK({
      resource,
      metricReader: prometheus,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    rootLifecycle.addBeforeShutdownHook(() => sdk.shutdown());
    rootLifecycle.addStartupHook(() => sdk.start());

    return createRootTelemetryService({ rootServiceName });
  },
});
