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
import { Meter, MeterProvider, metrics } from '@opentelemetry/api';
import {
  RootMetricsService,
  MetricsService,
} from '@backstage/backend-plugin-api/alpha';
import { PluginMetricsService } from './PluginMetricsService';
import { RootLoggerService } from '@backstage/backend-plugin-api';
import { BaseMetricsService } from './BaseMetricsService';

export class DefaultRootMetricsService
  extends BaseMetricsService
  implements RootMetricsService {
  private readonly rootNamespace: string = 'backstage';
  private readonly globalMeterProvider: MeterProvider;
  private readonly rootMeter: Meter;
  private readonly rootLogger?: RootLoggerService;

  private constructor ({ rootLogger }: { rootLogger?: RootLoggerService }) {
    super();
    this.rootLogger = rootLogger;

    this.globalMeterProvider = metrics.getMeterProvider();
    this.rootMeter = this.globalMeterProvider.getMeter(this.rootNamespace);
  }

  static forRoot(opts?: {
    rootLogger?: RootLoggerService;
  }): RootMetricsService {
    return new DefaultRootMetricsService({
      rootLogger: opts?.rootLogger,
    });
  }

  forService(serviceId: string, scope: 'core' | 'plugin'): MetricsService {
    this.rootLogger?.info('Creating core-scoped metrics service', {
      serviceId,
    });

    const namespace = `${this.rootNamespace}.${scope}.${serviceId}`;

    return new PluginMetricsService({
      pluginId: serviceId,
      meter: this.getPluginMeter(namespace),
      namespace,
    });
  }

  forPlugin(pluginId: string): MetricsService {
    this.rootLogger?.info('Creating plugin-scoped metrics service', {
      pluginId,
    });
    const namespace = `${this.rootNamespace}.plugin.${pluginId}`;

    return new PluginMetricsService({
      pluginId,
      meter: this.getPluginMeter(namespace),
      namespace,
    });
  }

  private getPluginMeter(namespace: string): Meter {
    return this.globalMeterProvider.getMeter(namespace);
  }

  protected get meter(): Meter {
    return this.rootMeter;
  }

  protected get prefixMetricName(): string {
    return this.rootNamespace;
  }
}
