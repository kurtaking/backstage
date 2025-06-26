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
import { TelemetryService } from '@backstage/backend-plugin-api';
import {
  Counter,
  Gauge,
  Histogram,
  Meter,
  MetricOptions,
  metrics,
  ObservableGauge,
} from '@opentelemetry/api';

export class PluginTelemetryService implements TelemetryService {
  private readonly meter: Meter;

  constructor(id: string) {
    this.meter = metrics.getMeter(id);
  }

  createCounter(name: string, opts?: MetricOptions): Counter {
    return this.meter.createCounter(name, opts);
  }

  createHistogram(name: string, options?: MetricOptions): Histogram {
    return this.meter.createHistogram(name, options);
  }

  createGauge(name: string, options?: MetricOptions): Gauge {
    return this.meter.createGauge(name, options);
  }

  createObservableGauge(
    name: string,
    options?: MetricOptions,
  ): ObservableGauge {
    return this.meter.createObservableGauge(name, options);
  }
}
