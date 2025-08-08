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
  MeterProvider,
  MetricOptions,
  metrics,
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
import { PluginMetricsService } from './PluginMetricsService';
import { RootLoggerService } from '@backstage/backend-plugin-api';
import {
  createCounterMetric,
  createGaugeMetric,
  createHistogramMetric,
  createObservableCounterMetric,
  createObservableUpDownCounterMetric,
  createObservableGaugeMetric,
  createUpDownCounterMetric,
  createMetricNamePrefixer,
} from '../../lib';

export class DefaultRootMetricsService implements RootMetricsService {
  private readonly rootNamespace: string = 'backstage';
  private readonly globalMeterProvider: MeterProvider;
  private readonly rootMeter: Meter;
  private readonly rootLogger?: RootLoggerService;
  private readonly prefixMetricName: (name: string) => string;

  private constructor({ rootLogger }: { rootLogger?: RootLoggerService }) {
    this.rootLogger = rootLogger;

    this.globalMeterProvider = metrics.getMeterProvider();
    this.rootMeter = this.globalMeterProvider.getMeter(this.rootNamespace);
    this.prefixMetricName = createMetricNamePrefixer({
      rootNamespace: this.rootNamespace,
      scope: 'framework',
    });
  }

  static forRoot(opts?: {
    rootLogger?: RootLoggerService;
  }): RootMetricsService {
    return new DefaultRootMetricsService({
      rootLogger: opts?.rootLogger,
    });
  }

  forPlugin(pluginId: string): MetricsService {
    this.rootLogger?.info('Creating plugin-scoped metrics service', {
      pluginId,
    });
    const namespace = `${this.rootNamespace}.plugin.${pluginId}`;

    return new PluginMetricsService({
      pluginId,
      namespace,
      meter: this.globalMeterProvider.getMeter(namespace),
    });
  }

  createCounter(name: string, options?: MetricOptions): CounterMetric {
    return createCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.rootMeter,
      metricOpts: options,
    });
  }

  createUpDownCounter(name: string, opts?: MetricOptions): UpDownCounterMetric {
    return createUpDownCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.rootMeter,
      metricOpts: opts,
    });
  }

  createHistogram(name: string, opts?: MetricOptions): HistogramMetric {
    return createHistogramMetric({
      name: this.prefixMetricName(name),
      meter: this.rootMeter,
      metricOpts: opts,
    });
  }

  createGauge(name: string, opts?: MetricOptions): GaugeMetric {
    return createGaugeMetric({
      name: this.prefixMetricName(name),
      meter: this.rootMeter,
      metricOpts: opts,
    });
  }

  createObservableCounter(
    name: string,
    observer: ObservableCallback<Attributes>,
    opts?: MetricOptions,
  ): void {
    createObservableCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.rootMeter,
      observer,
      metricOpts: opts,
    });
  }

  createObservableUpDownCounter(
    name: string,
    observer: ObservableCallback<Attributes>,
    opts?: MetricOptions,
  ): void {
    createObservableUpDownCounterMetric({
      name: this.prefixMetricName(name),
      meter: this.rootMeter,
      observer,
      metricOpts: opts,
    });
  }

  createObservableGauge(
    name: string,
    observer: ObservableCallback<Attributes>,
    opts?: MetricOptions,
  ): void {
    createObservableGaugeMetric({
      name: this.prefixMetricName(name),
      meter: this.rootMeter,
      observer,
      metricOpts: opts,
    });
  }
}
