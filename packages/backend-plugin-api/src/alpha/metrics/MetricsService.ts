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
  MetricOptions,
  ObservableCallback,
} from '@opentelemetry/api';
import {
  CounterMetric,
  UpDownCounterMetric,
  HistogramMetric,
  GaugeMetric,
} from '.';

/**
 * A service that provides a metrics facility
 *
 * @alpha
 */
export interface MetricsService {
  createCounter(name: string, opts?: MetricOptions): CounterMetric;

  createUpDownCounter(name: string, opts?: MetricOptions): UpDownCounterMetric;

  createHistogram(name: string, opts?: MetricOptions): HistogramMetric;

  createGauge(name: string, opts?: MetricOptions): GaugeMetric;

  createObservableCounter(
    name: string,
    observer: ObservableCallback<Attributes>,
    opts?: MetricOptions,
  ): void;

  createObservableUpDownCounter(
    name: string,
    observer: ObservableCallback<Attributes>,
    opts?: MetricOptions,
  ): void;

  createObservableGauge(
    name: string,
    observer: ObservableCallback<Attributes>,
    opts?: MetricOptions,
  ): void;
}
