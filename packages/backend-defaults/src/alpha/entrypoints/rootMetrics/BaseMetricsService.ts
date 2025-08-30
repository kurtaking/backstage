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
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter,
} from '@opentelemetry/api';

import { MetricsService, ObservableMetric } from '@backstage/backend-plugin-api/alpha';

export abstract class BaseMetricsService implements MetricsService {
  protected abstract get meter(): Meter;
  protected abstract get prefixMetricName(): string;

  createCounter(name: string, options?: MetricOptions): Counter {
    const prefixedName = `${this.prefixMetricName}.${name}`;
    return this.meter.createCounter(prefixedName, options);
  }

  createUpDownCounter(
    name: string,
    options?: MetricOptions,
  ): UpDownCounter {
    const prefixedName = `${this.prefixMetricName}.${name}`;
    return this.meter.createUpDownCounter(prefixedName, options);
  }
  createHistogram(name: string, options?: MetricOptions): Histogram {
    const prefixedName = `${this.prefixMetricName}.${name}`;
    return this.meter.createHistogram(prefixedName, options);
  }

  createGauge(name: string, options?: MetricOptions): Gauge {
    const prefixedName = `${this.prefixMetricName}.${name}`;
    return this.meter.createGauge(prefixedName, options);
  }

  createObservableCounter(metric: ObservableMetric): ObservableCounter {
    const prefixedName = `${this.prefixMetricName}.${metric.name}`;
    const observableCounter = this.meter.createObservableCounter(prefixedName, metric.opts);

    observableCounter.addCallback(metric.handler);
    return observableCounter;
  }

  createObservableUpDownCounter(metric: ObservableMetric): ObservableUpDownCounter {
    const prefixedName = `${this.prefixMetricName}.${metric.name}`;
    const observableUpDownCounter = this.meter.createObservableUpDownCounter(prefixedName, metric.opts);

    observableUpDownCounter.addCallback(metric.handler);
    return observableUpDownCounter;
  }

  createObservableGauge(metric: ObservableMetric): ObservableGauge {
    const prefixedName = `${this.prefixMetricName}.${metric.name}`;
    const observableGauge = this.meter.createObservableGauge(prefixedName, metric.opts);

    observableGauge.addCallback(metric.handler);
    return observableGauge;
  }
}
