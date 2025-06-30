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
  Histogram,
  Meter,
  MetricOptions,
  metrics,
  ObservableGauge,
} from '@opentelemetry/api';

export interface TelemetryService {
  createCounter(name: string, options: MetricOptions): Counter;
  createHistogram(name: string, options: MetricOptions): Histogram;
  createObservableGauge(name: string, options: MetricOptions): ObservableGauge;
}

export class CatalogTelemetryService implements TelemetryService {
  private readonly meter: Meter;
  private readonly instrumentationScope: string;

  constructor() {
    this.meter = metrics.getMeter('default');
    this.instrumentationScope = 'catalog';
  }

  private getPluginServiceName(name: string): string {
    return `${this.instrumentationScope}.${name}`;
  }

  createCounter(name: string, options: MetricOptions) {
    return this.meter.createCounter(this.getPluginServiceName(name), options);
  }

  createHistogram(name: string, options: MetricOptions) {
    return this.meter.createHistogram(this.getPluginServiceName(name), options);
  }

  createObservableGauge(name: string, options: MetricOptions) {
    return this.meter.createObservableGauge(
      this.getPluginServiceName(name),
      options,
    );
  }
}
