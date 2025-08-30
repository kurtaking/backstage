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
  Counter,
  Gauge,
  Histogram,
  MetricOptions,
  ObservableCallback,
  ObservableCounter,
  ObservableGauge,
  ObservableUpDownCounter,
  UpDownCounter,
} from '@opentelemetry/api';

/**
 * @alpha
 */
export interface ObservableMetric {
  /**
   * The name of the instrument.
   */
  name: string;

  /**
   * The callback to be called when the instrument is observed.
   */
  handler: ObservableCallback<Attributes>;

  /**
   * The options for the instrument.
   */
  opts: MetricOptions;
}

/**
 * A service that provides a metrics facility
 *
 * @alpha
 */
export interface MetricsService {
  createCounter(name: string, opts?: MetricOptions): Counter;

  createUpDownCounter(name: string, opts?: MetricOptions): UpDownCounter;

  createHistogram(name: string, opts?: MetricOptions): Histogram;

  createGauge(name: string, opts?: MetricOptions): Gauge;

  createObservableCounter(metric: ObservableMetric): ObservableCounter;

  createObservableUpDownCounter(metric: ObservableMetric): ObservableUpDownCounter;

  createObservableGauge(metric: ObservableMetric): ObservableGauge;
}
