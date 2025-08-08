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
import { Attributes, Meter, metrics, UpDownCounter } from '@opentelemetry/api';
import { MetricOptions } from '.';

export interface CounterMetric {
  /**
   * Increment the counter by the specified value.
   *
   * @param value - The amount to increment by.
   * @param labels - Additional labels for this observation
   *
   * @public
   */
  add(value: number, attributes?: Attributes): void;

  /**
   * Increment the counter by 1 with optional labels.
   *
   * @param labels - Additional labels for this observation
   *
   * @remarks
   * If you need to increment by a value other than 1, use the `add` method.
   *
   * @public
   */
  increment(attributes?: Attributes): void;
}

export interface CreateMetricOptions {
  name: string;
  meter: Meter;
  metricOpts?: MetricOptions;
}

export function createCounterMetric(opts: CreateMetricOptions): CounterMetric {
  const { name, meter, metricOpts } = opts;
  const counter = meter.createCounter(name, metricOpts);

  return {
    add: (value: number, attributes?: Attributes) => {
      counter.add(value, attributes);
    },

    increment: (attributes?: Attributes) => {
      counter.add(1, attributes);
    },
  };
}

export interface MetricsService {
  createCounter(name: string, options?: MetricOptions): CounterMetric;
  createUpDownCounter(name: string, options?: MetricOptions): UpDownCounter;
}

export class DefaultMetricsService implements MetricsService {
  private readonly meter: Meter;

  constructor(namespace: string, version?: string) {
    this.meter = metrics.getMeter(namespace, version);
  }

  createCounter(name: string, options?: MetricOptions): CounterMetric {
    return createCounterMetric({
      name,
      meter: this.meter,
      metricOpts: options,
    });
  }

  createUpDownCounter(name: string, options?: MetricOptions): UpDownCounter {
    return this.meter.createUpDownCounter(name, options);
  }
}
