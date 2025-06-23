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
  CounterMetric,
  MetricOptions,
  RootTelemetryService,
  TelemetryService,
  TelemetryServicePluginOptions,
} from '@backstage/backend-plugin-api';
import { metrics, Meter } from '@opentelemetry/api';
import { PluginTelemetryService } from './PluginTelemetryService';

export async function createRootTelemetryService({
  rootServiceName,
}: {
  rootServiceName: string;
}): Promise<RootTelemetryService> {
  const meter: Meter = metrics.getMeter(rootServiceName);

  const forPlugin = (opts: TelemetryServicePluginOptions): TelemetryService => {
    return new PluginTelemetryService(opts.pluginId, rootServiceName);
  };

  const createCounter = (name: string, opts?: MetricOptions): CounterMetric => {
    const counter = meter.createCounter(name, opts);

    return {
      add: (value: number, attributes?: Record<string, string>) => {
        counter.add(value, attributes);
      },

      increment: (attributes?: Record<string, string>) => {
        counter.add(1, attributes);
      },
    };
  };

  return {
    forPlugin,
    createCounter,
  };
}
