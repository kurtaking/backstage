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

import {
  Content,
  EmptyState,
  ErrorPanel,
  Header,
  Page,
  Progress,
} from '@backstage/core-components';
import { HealthBanner } from './HealthBanner';
import { ProvidersTable } from './ProvidersTable';
import { incrementalIngestionApiRef } from '../api';
import { useApi } from '@backstage/frontend-plugin-api';
import useAsync from 'react-use/esm/useAsync';

export const IncrementalIngestion = () => {
  const api = useApi(incrementalIngestionApiRef);

  const {
    value: providers,
    loading,
    error,
  } = useAsync(async () => {
    const providersResponse = await api.getProviders();
    return providersResponse.providers;
  }, [api]);

  return (
    <Page themeId="tool">
      <Header
        title="Incremental Ingestion"
        subtitle="Manage catalog incremental entity providers"
      />

      <Content>
        {loading && <Progress />}
        {error && <ErrorPanel error={error} />}

        {!loading && !error && providers && providers.length > 0 && (
          <>
            <HealthBanner />
            <ProvidersTable providers={providers} />
          </>
        )}

        {!loading && !error && (!providers || providers.length === 0) && (
          <EmptyState
            missing="data"
            title="No incremental providers found"
            description="There are no incremental entity providers configured."
          />
        )}
      </Content>
    </Page>
  );
};
