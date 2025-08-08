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

/**
 * Standard Backstage metric names following OpenTelemetry conventions
 * All metrics are prefixed with 'backstage' as the root namespace
 *
 * @public
 */
export const BackstageMetrics = {
  // Catalog Metrics
  CATALOG: {
    ENTITIES_TOTAL: 'backstage.plugin.catalog.entities.total',
    ENTITIES_OPERATIONS: 'backstage.plugin.catalog.entities.operations',
    ENTITY_QUERIES: 'backstage.plugin.catalog.entity.queries',
    ENTITY_QUERY_DURATION: 'backstage.plugin.catalog.entity.query.duration',
    ENTITY_PROCESSING_DURATION:
      'backstage.plugin.catalog.entity.processing.duration',
    ENTITY_PROCESSING_QUEUE_SIZE:
      'backstage.plugin.catalog.entity.processing.queue.size',

    LOCATIONS_TOTAL: 'backstage.plugin.catalog.locations.total',
    LOCATION_OPERATIONS: 'backstage.plugin.catalog.location.operations',
    LOCATION_ANALYSIS_DURATION:
      'backstage.plugin.catalog.location.analysis.duration',

    REFRESH_OPERATIONS: 'backstage.plugin.catalog.refresh.operations',
    REFRESH_DURATION: 'backstage.plugin.catalog.refresh.duration',
  },

  // Scheduler Metrics
  SCHEDULER: {
    TASK_RUNS: 'backstage.service.scheduler.task.runs',
    TASK_DURATION: 'backstage.service.scheduler.task.duration',
    TASK_QUEUE_SIZE: 'backstage.service.scheduler.task.queue.size',
    ACTIVE_TASKS: 'backstage.service.scheduler.tasks.active',
  },
} as const;

/**
 * Standard attribute names following OpenTelemetry semantic conventions
 *
 * @public
 */
export const BackstageAttributes = {
  PLUGIN_ID: 'backstage.plugin.id',
  PLUGIN_VERSION: 'backstage.plugin.version',
  SERVICE_ID: 'backstage.service.id',
  SERVICE_SCOPE: 'backstage.service.scope',
} as const;
