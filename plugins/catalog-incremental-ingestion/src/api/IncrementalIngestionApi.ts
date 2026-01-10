/*
 * Copyright 2026 The Backstage Authors
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
import { createApiRef } from '@backstage/frontend-plugin-api';

/**
 * Health check response for incremental providers.
 *
 * @public
 */
export interface IncrementalProviderHealthResponse {
  healthy: boolean;
  duplicateIngestions?: string[];
}

/**
 * Provider status information.
 *
 * @public
 */
export interface ProviderStatus {
  current_action: string;
  next_action_at?: string;
}

/**
 * Response for getting a single provider's status.
 *
 * @public
 */
export interface ProviderStatusResponse {
  success: boolean;
  status: ProviderStatus;
  last_error?: string;
}

/**
 * Response for listing all providers.
 *
 * @public
 */
export interface ProvidersListResponse {
  success: boolean;
  providers: string[];
}

/**
 * Standard success response with optional message.
 *
 * @public
 */
export interface SuccessResponse {
  success: boolean;
  message: string;
}

/**
 * Response for provider deletion/purge operation.
 *
 * @public
 */
export interface ProviderPurgeResponse {
  provider: string;
  ingestionsDeleted: number;
  marksDeleted: number;
  markEntitiesDeleted: number;
}

/**
 * Response for getting ingestion marks.
 *
 * @public
 */
export interface IngestionMarksResponse {
  success: boolean;
  records?: unknown[];
  message?: string;
}

/**
 * Response for deleting ingestion marks.
 *
 * @public
 */
export interface DeleteMarksResponse {
  success: boolean;
  message: string;
  deletions: number;
}

/**
 * Response for cleanup operation.
 *
 * @public
 */
export interface CleanupResponse {
  ingestionsDeleted: number;
  ingestionMarksDeleted: number;
  markEntitiesDeleted: number;
}

/**
 * API for managing incremental entity providers.
 *
 * @public
 */
export interface IncrementalIngestionApi {
  /**
   * Checks the health of all incremental providers.
   * Returns array of any unhealthy ones.
   */
  getHealth(): Promise<IncrementalProviderHealthResponse>;

  /**
   * Get a list of all known incremental entity providers.
   */
  getProviders(): Promise<ProvidersListResponse>;

  /**
   * Checks the status of an incremental provider (resting, interstitial, etc).
   */
  getProviderStatus(provider: string): Promise<ProviderStatusResponse>;

  /**
   * Triggers a provider's next action immediately.
   * E.g., if it's currently interstitial, it will trigger the next burst.
   */
  triggerProvider(provider: string): Promise<SuccessResponse>;

  /**
   * Stop the current ingestion cycle and start a new one immediately.
   */
  startProvider(provider: string): Promise<SuccessResponse>;

  /**
   * Stop the current ingestion cycle and start a new one in 24 hours.
   */
  cancelProvider(provider: string): Promise<SuccessResponse>;

  /**
   * Completely remove all records for the provider and schedule it to start again in 24 hours.
   */
  deleteProvider(provider: string): Promise<ProviderPurgeResponse>;

  /**
   * Retrieve a list of all ingestion marks for the current ingestion cycle.
   */
  getProviderMarks(provider: string): Promise<IngestionMarksResponse>;

  /**
   * Remove all ingestion marks for the current ingestion cycle.
   */
  deleteProviderMarks(provider: string): Promise<DeleteMarksResponse>;

  /**
   * Completely remove all records for ALL providers and schedule them to start again in 24 hours.
   * CAUTION! Can cause orphans!
   */
  cleanup(): Promise<CleanupResponse>;
}

/**
 * API reference for the {@link IncrementalIngestionApi}.
 *
 * @public
 */
export const incrementalIngestionApiRef = createApiRef<IncrementalIngestionApi>(
  {
    id: 'plugin.catalog-incremental-ingestion.service',
  },
);
