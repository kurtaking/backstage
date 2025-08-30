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
import { MetricsService } from './MetricsService';

/**
 * A service that provides a metrics facility for the core system.
 *
 * @alpha
 */
export interface RootMetricsService extends MetricsService {
  /**
   * Creates a service-scoped metrics service.
   *
   * @param serviceId - The ID of the service to create a metrics service for.
   * @param scope - The scope of the metrics service.
   * @returns A service-scoped metrics service
   */
  forService(serviceId: string, scope: 'core' | 'plugin'): MetricsService;

  /**
   * Creates a plugin-scoped metrics service.
   *
   * @param pluginId - The ID of the plugin to create a metrics service for.
   * @returns A plugin-scoped metrics service
   */
  forPlugin(pluginId: string): MetricsService;
}
