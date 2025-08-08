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
  Attributes,
  Meter,
  MetricOptions,
  ObservableCallback,
} from '@opentelemetry/api';
import {
  CounterMetric,
  GaugeMetric,
  HistogramMetric,
  UpDownCounterMetric,
  MetricsService,
} from '@backstage/backend-plugin-api/alpha';
import {
  createCounterMetric,
  createGaugeMetric,
  createHistogramMetric,
  createUpDownCounterMetric,
  createObservableCounterMetric,
  createObservableUpDownCounterMetric,
  createObservableGaugeMetric,
} from '../../lib';

export abstract class BaseMetricsService implements MetricsService {
  protected abstract get meter(): Meter;
  protected abstract get prefixMetricName(): (name: string) => string;

  createCounter(name: string, options?: MetricOptions): CounterMetric {
    return createCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.meter,
      metricOpts: options,
    });
  }

  createUpDownCounter(
    name: string,
    options?: MetricOptions,
  ): UpDownCounterMetric {
    return createUpDownCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.meter,
      metricOpts: options,
    });
  }

  createHistogram(name: string, options?: MetricOptions): HistogramMetric {
    return createHistogramMetric({
      name: this.prefixMetricName(name),
      meter: this.meter,
      metricOpts: options,
    });
  }

  createGauge(name: string, options?: MetricOptions): GaugeMetric {
    return createGaugeMetric({
      name: this.prefixMetricName(name),
      meter: this.meter,
      metricOpts: options,
    });
  }

  createObservableCounter(
    name: string,
    observer: ObservableCallback<Attributes>,
    options?: MetricOptions,
  ): void {
    createObservableCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.meter,
      observer,
      metricOpts: options,
    });
  }

  createObservableUpDownCounter(
    name: string,
    observer: ObservableCallback<Attributes>,
    options?: MetricOptions,
  ): void {
    createObservableUpDownCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.meter,
      observer,
      metricOpts: options,
    });
  }

  createObservableGauge(
    name: string,
    observer: ObservableCallback<Attributes>,
    options?: MetricOptions,
  ): void {
    createObservableGaugeMetric({
      name: this.prefixMetricName(name),
      meter: this.meter,
      observer,
      metricOpts: options,
    });
  }
}
