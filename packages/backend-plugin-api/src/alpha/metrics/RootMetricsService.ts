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
  Meter,
  MeterProvider,
  metrics,
  UpDownCounter,
  MetricOptions,
} from '@opentelemetry/api';
import { ServiceRef } from '../../services';
import { MetricTypes, MetricType } from '.';
import { DefaultMetricsService, MetricsService } from './MetricsService';

export interface RootMetricsService extends MetricsService {
  forPlugin(pluginId: string, version?: string): MetricsService;
  forService(
    service: ServiceRef<unknown, 'plugin' | 'root'>,
    version?: string,
  ): MetricsService;
}

export class DefaultRootMetricsService implements RootMetricsService {
  private readonly rootNamespace: string = 'backstage';
  private readonly meterProvider: MeterProvider = metrics.getMeterProvider();
  private readonly rootMeter: Meter = this.meterProvider.getMeter(
    this.rootNamespace,
  );

  forService(
    service: ServiceRef<unknown, 'plugin' | 'root'>,
    version?: string,
  ): MetricsService {
    return new DefaultMetricsService(
      this._createFullyQualifiedName(service.id),
      version,
    );
  }

  forPlugin(pluginId: string, version?: string): MetricsService {
    return new DefaultMetricsService(
      this._createFullyQualifiedName(pluginId),
      version,
    );
  }

  createCounter(name: string, options?: MetricOptions): Counter {
    return this._createInstrument({
      type: MetricTypes.COUNTER,
      name,
      options,
    });
  }

  createUpDownCounter(name: string, options?: MetricOptions): UpDownCounter {
    return this._createInstrument({
      type: MetricTypes.UP_DOWN_COUNTER,
      name,
      options,
    });
  }

  private _createInstrument(opts: {
    name: string;
    type: MetricType;
    options?: MetricOptions;
  }) {
    const { name, type, options } = opts;
    const metricName = this._createFullyQualifiedName(name);

    switch (type) {
      case MetricTypes.COUNTER:
        return this.rootMeter.createCounter(metricName, options);
      case MetricTypes.UP_DOWN_COUNTER:
        return this.rootMeter.createUpDownCounter(metricName, options);
      default:
        throw new Error(`Provided metric type is not supported: ${type}`);
    }
  }

  private _createFullyQualifiedName(name: string) {
    return `${this.rootNamespace}.${name}`;
  }
}
