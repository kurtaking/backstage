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
  CreateObservableMetricOptions,
  MetricType,
  MetricTypes,
} from '@backstage/backend-plugin-api/alpha';

/**
 * Helper function to create an observable metric.
 *
 * @internal
 */
function createObservableInstrument(
  metricType: Extract<
    MetricType,
    'observableCounter' | 'observableUpDownCounter' | 'observableGauge'
  >,
  options: CreateObservableMetricOptions,
): void {
  const { name, meter, observer, metricOpts: opts } = options;

  switch (metricType) {
    case MetricTypes.OBSERVABLE_COUNTER:
      meter.createObservableCounter(name, opts).addCallback(observer);
      break;
    case MetricTypes.OBSERVABLE_UP_DOWN_COUNTER:
      meter.createObservableUpDownCounter(name, opts).addCallback(observer);
      break;
    case MetricTypes.OBSERVABLE_GAUGE:
      meter.createObservableGauge(name, opts).addCallback(observer);
      break;
    default: {
      throw new Error(`Unsupported metric type: ${metricType}`);
    }
  }
}

export const createObservableCounterMetric = (
  opts: CreateObservableMetricOptions,
): void => createObservableInstrument(MetricTypes.OBSERVABLE_COUNTER, opts);

export const createObservableUpDownCounterMetric = (
  opts: CreateObservableMetricOptions,
): void =>
  createObservableInstrument(MetricTypes.OBSERVABLE_UP_DOWN_COUNTER, opts);

export const createObservableGaugeMetric = (
  opts: CreateObservableMetricOptions,
): void => createObservableInstrument(MetricTypes.OBSERVABLE_GAUGE, opts);
