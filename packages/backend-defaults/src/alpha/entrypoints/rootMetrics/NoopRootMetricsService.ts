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
import { Meter } from '@opentelemetry/api';
import {
  MetricsService,
  RootMetricsService,
} from '@backstage/backend-plugin-api/alpha';
import { BaseMetricsService } from './BaseMetricsService';

export class NoopRootMetricsService
  extends BaseMetricsService
  implements RootMetricsService {
  private readonly _meter: Meter;

  constructor () {
    super();
    this._meter = null as unknown as Meter;
  }

  forService(_serviceId: string, _scope: 'core' | 'plugin'): MetricsService {
    return this.createNoops();
  }

  forPlugin(_pluginId: string): MetricsService {
    return this.createNoops();
  }

  private createNoops(): MetricsService {
    return {
      createCounter: () => ({
        add: () => { },
      }),
      createUpDownCounter: () => ({
        add: () => { },
        subtract: () => { },
      }),
      createHistogram: () => ({
        record: () => { },
      }),
      createGauge: () => ({
        record: () => { },
      }),
      createObservableCounter: () => ({
        addCallback: () => { },
        removeCallback: () => { },
      }),
      createObservableUpDownCounter: () => ({
        addCallback: () => { },
        removeCallback: () => { },
      }),
      createObservableGauge: () => ({
        addCallback: () => { },
        removeCallback: () => { },
      }),
    };
  }

  protected get meter(): Meter {
    return this._meter;
  }

  protected get prefixMetricName(): string {
    return 'noop';
  }
}
