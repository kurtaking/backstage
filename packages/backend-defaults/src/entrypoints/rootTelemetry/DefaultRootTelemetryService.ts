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
  Counter,
  Gauge,
  Histogram,
  Meter,
  MetricOptions,
  metrics,
  ObservableGauge,
} from '@opentelemetry/api';
import {
  RootLifecycleService,
  RootTelemetryService,
  TelemetryService,
} from '@backstage/backend-plugin-api';
import {
  defaultResource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { PluginTelemetryService } from './PluginTelemetryService';
import { Config } from '@backstage/config';

type DefaultRootTelemetryServiceOptions = {
  serviceName: string;
  sdk: NodeSDK;
};

export class DefaultRootTelemetryService implements RootTelemetryService {
  private readonly sdk: NodeSDK;
  private readonly serviceName: string;
  private readonly meter: Meter;

  private constructor(opts: DefaultRootTelemetryServiceOptions) {
    this.sdk = opts.sdk;
    this.serviceName = opts.serviceName;
    this.meter = metrics.getMeter(this.serviceName);
  }

  static fromConfig(config: Config): RootTelemetryService {
    const telemetryConfig = config.getConfig('telemetry');

    const serviceName = telemetryConfig.getString('resource.serviceName');
    const serviceVersion = telemetryConfig.getString('resource.serviceVersion');

    const resource = defaultResource().merge(
      resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName,
        [ATTR_SERVICE_VERSION]: serviceVersion,
      }),
    );

    const autoInstrumentationsConfig = telemetryConfig.getConfig(
      'autoInstrumentations',
    );

    const sdk = new NodeSDK({
      resource,
      // traceExporter: new ConsoleSpanExporter(),
      // metricReader: prometheus,
      metricReader: new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-express': {
            enabled:
              autoInstrumentationsConfig.getOptionalBoolean('express') ?? true,
          },
          '@opentelemetry/instrumentation-http': {
            enabled:
              autoInstrumentationsConfig.getOptionalBoolean('http') ?? true,
          },
          '@opentelemetry/instrumentation-knex': {
            enabled:
              autoInstrumentationsConfig.getOptionalBoolean('knex') ?? true,
          },
        }),
      ],
    });

    return new DefaultRootTelemetryService({
      serviceName,
      sdk,
    });
  }

  bootstrap(opts?: { lifecycle?: RootLifecycleService }) {
    if (opts?.lifecycle) {
      opts.lifecycle.addBeforeShutdownHook(() => this.sdk.shutdown());
    }

    this.sdk.start();
  }

  getMeter(): Meter {
    return this.meter;
  }

  forPlugin(pluginId: string): TelemetryService {
    const id = `${this.serviceName}.plugin.${pluginId}`;
    return new PluginTelemetryService(id);
  }

  createCounter(name: string, opts?: MetricOptions): Counter {
    return this.meter.createCounter(name, opts);
  }

  createHistogram(name: string, opts?: MetricOptions): Histogram {
    return this.meter.createHistogram(name, opts);
  }

  createGauge(name: string, opts?: MetricOptions): Gauge {
    return this.meter.createGauge(name, opts);
  }

  createObservableGauge(name: string, opts?: MetricOptions): ObservableGauge {
    return this.meter.createObservableGauge(name, opts);
  }
}
