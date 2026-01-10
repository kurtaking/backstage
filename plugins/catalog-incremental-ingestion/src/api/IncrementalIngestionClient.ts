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
import { DiscoveryApi, FetchApi } from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';
import {
  IncrementalIngestionApi,
  IncrementalProviderHealthResponse,
  ProvidersListResponse,
  ProviderStatusResponse,
  SuccessResponse,
  ProviderPurgeResponse,
  IngestionMarksResponse,
  DeleteMarksResponse,
  CleanupResponse,
} from './IncrementalIngestionApi';

/**
 * Client for interacting with the incremental ingestion API catalog backend module.
 *
 * @public
 */
export class IncrementalIngestionClient implements IncrementalIngestionApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getHealth(): Promise<IncrementalProviderHealthResponse> {
    return await this.request<IncrementalProviderHealthResponse>('/health');
  }

  async getProviders(): Promise<ProvidersListResponse> {
    return await this.request<ProvidersListResponse>('/providers');
  }

  async getProviderStatus(provider: string): Promise<ProviderStatusResponse> {
    return await this.request<ProviderStatusResponse>(
      `/providers/${encodeURIComponent(provider)}`,
    );
  }

  async triggerProvider(provider: string): Promise<SuccessResponse> {
    return await this.request<SuccessResponse>(
      `/providers/${encodeURIComponent(provider)}/trigger`,
      {
        method: 'POST',
      },
    );
  }

  async startProvider(provider: string): Promise<SuccessResponse> {
    return await this.request<SuccessResponse>(
      `/providers/${encodeURIComponent(provider)}/start`,
      {
        method: 'POST',
      },
    );
  }

  async cancelProvider(provider: string): Promise<SuccessResponse> {
    return await this.request<SuccessResponse>(
      `/providers/${encodeURIComponent(provider)}/cancel`,
      {
        method: 'POST',
      },
    );
  }

  async deleteProvider(provider: string): Promise<ProviderPurgeResponse> {
    return await this.request<ProviderPurgeResponse>(
      `/providers/${encodeURIComponent(provider)}`,
      {
        method: 'DELETE',
      },
    );
  }

  async getProviderMarks(provider: string): Promise<IngestionMarksResponse> {
    return await this.request<IngestionMarksResponse>(
      `/providers/${encodeURIComponent(provider)}/marks`,
    );
  }

  async deleteProviderMarks(provider: string): Promise<DeleteMarksResponse> {
    return await this.request<DeleteMarksResponse>(
      `/providers/${encodeURIComponent(provider)}/marks`,
      {
        method: 'DELETE',
      },
    );
  }

  async cleanup(): Promise<CleanupResponse> {
    return await this.request<CleanupResponse>('/cleanup', {
      method: 'POST',
    });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = await this.discoveryApi.getBaseUrl('catalog');
    const url = `${baseUrl}/incremental${path}`;

    const response = await this.fetchApi.fetch(url, init);

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
