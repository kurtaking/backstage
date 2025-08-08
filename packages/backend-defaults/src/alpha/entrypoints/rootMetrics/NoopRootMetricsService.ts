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
  RootMetricsService,
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

export class NoopRootMetricsService implements RootMetricsService {
  private readonly meter: Meter;

  constructor() {
    this.meter = null as unknown as Meter;
  }

  forPlugin(_pluginId: string): MetricsService {
    return {} as MetricsService;
  }

  createCounter(_name: string, _options?: MetricOptions): CounterMetric {
    return createCounterMetric({
      name: 'noop',
      meter: this.meter,
      metricOpts: _options,
    });
  }

  createUpDownCounter(
    _name: string,
    _options?: MetricOptions,
  ): UpDownCounterMetric {
    return createUpDownCounterMetric({
      name: 'noop',
      meter: this.meter,
      metricOpts: _options,
    });
  }

  createHistogram(_name: string, _options?: MetricOptions): HistogramMetric {
    return createHistogramMetric({
      name: 'noop',
      meter: this.meter,
      metricOpts: _options,
    });
  }

  createGauge(_name: string, _options?: MetricOptions): GaugeMetric {
    return createGaugeMetric({
      name: 'noop',
      meter: this.meter,
      metricOpts: _options,
    });
  }

  createObservableCounter(
    _name: string,
    _observer: ObservableCallback<Attributes>,
    _opts?: MetricOptions,
  ): void {
    return createObservableCounterMetric({
      name: 'noop',
      meter: this.meter,
      observer: _observer,
      metricOpts: _opts,
    });
  }

  createObservableUpDownCounter(
    _name: string,
    _observer: ObservableCallback<Attributes>,
    _opts?: MetricOptions,
  ): void {
    return createObservableUpDownCounterMetric({
      name: 'noop',
      meter: this.meter,
      observer: _observer,
      metricOpts: _opts,
    });
  }

  createObservableGauge(
    _name: string,
    _observer: ObservableCallback<Attributes>,
    _opts?: MetricOptions,
  ): void {
    return createObservableGaugeMetric({
      name: 'noop',
      meter: this.meter,
      observer: _observer,
      metricOpts: _opts,
    });
  }
}
