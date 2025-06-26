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
  createServiceRef,
  RootTelemetryService,
} from '@backstage/backend-plugin-api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {
  createRootTelemetryService,
  DefaultRootTelemetryService,
} from './DefaultRootTelemetryService';

export const rootTelemetry = createServiceRef<RootTelemetryService>({
  id: 'core.rootTelemetry',
  scope: 'root',
});

export const rootTelemetryServiceFactory = createServiceFactory({
  service: rootTelemetry,
  deps: {
    rootLifecycle: coreServices.rootLifecycle,
    rootLogger: coreServices.rootLogger,
    rootConfig: coreServices.rootConfig,
  },
  async factory({ rootLifecycle, rootConfig }) {
    const rootTelemetryService =
      DefaultRootTelemetryService.fromConfig(rootConfig);
    rootTelemetryService.bootstrap({ lifecycle: rootLifecycle });
    return rootTelemetryService;
  },
});
