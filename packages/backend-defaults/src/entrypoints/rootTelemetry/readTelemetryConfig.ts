import { Config } from '@backstage/config';

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
export interface TelemetryResourceConfig {
  serviceName: string;
  serviceVersion: string;
}

export interface TelemetryExporterConfig {
  type: 'console' | 'prometheus';
  enabled: boolean;
}

export interface TelemetryInstrumentationConfig {
  http?: boolean;
  knex?: boolean;
  express?: boolean;
}

export interface TelemetryConfig {
  enabled: boolean;
  resource: TelemetryResourceConfig;
  exporters: TelemetryExporterConfig[];
  instrumentations: TelemetryInstrumentationConfig;
}

export const readTelemetryConfig = async (
  config: Config,
): Promise<TelemetryConfig> => {
  const telemetryConfig = config.getOptionalConfig('telemetry');
  const resourceConfig = telemetryConfig?.getOptionalConfig('resource');
  const autoInstrumentationsConfig = telemetryConfig?.getOptionalConfig(
    'autoInstrumentations',
  );

  return {
    enabled: telemetryConfig?.getOptionalBoolean('enabled') ?? true,
    resource: {
      serviceName:
        resourceConfig?.getOptionalString('serviceName') ?? 'backstage',
      serviceVersion:
        resourceConfig?.getOptionalString('serviceVersion') ?? '0.0.0',
    },
    exporters: [
      {
        type: 'console',
        enabled: true,
      },
    ],
    instrumentations: {
      http: autoInstrumentationsConfig?.getOptionalBoolean('http') ?? true,
      knex: autoInstrumentationsConfig?.getOptionalBoolean('knex') ?? true,
      express:
        autoInstrumentationsConfig?.getOptionalBoolean('express') ?? true,
    },
  };
};
