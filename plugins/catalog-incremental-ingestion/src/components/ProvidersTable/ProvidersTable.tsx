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
  EmptyState,
  ErrorPanel,
  Progress,
  StatusOK,
  StatusWarning,
  StatusError,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/frontend-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import Typography from '@material-ui/core/Typography';
import { incrementalIngestionApiRef } from '../../api';

interface ProviderRow {
  name: string;
  status: string;
  nextActionAt?: string;
  lastError?: string;
}

interface ProvidersTableProps {
  providers: string[];
}

/**
 * Component that displays a table of incremental ingestion providers and their status.
 *
 * @public
 */
export const ProvidersTable = ({ providers }: ProvidersTableProps) => {
  const api = useApi(incrementalIngestionApiRef);

  const {
    value: providersWithStatus,
    loading,
    error,
  } = useAsync(async () => {
    if (!providers || providers.length === 0) {
      return [];
    }

    const statusPromises = providers.map(async provider => {
      try {
        const statusResponse = await api.getProviderStatus(provider);
        return {
          name: provider,
          status: statusResponse.status.current_action || 'unknown',
          nextActionAt: statusResponse.status.next_action_at,
          lastError: statusResponse.last_error,
        };
      } catch (err) {
        return {
          name: provider,
          status: 'error',
          nextActionAt: undefined,
          lastError: err instanceof Error ? err.message : String(err),
        };
      }
    });

    return Promise.all(statusPromises);
  }, [api, providers]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  if (!providersWithStatus || providersWithStatus.length === 0) {
    return (
      <EmptyState
        missing="data"
        title="No incremental providers found"
        description="There are no incremental entity providers configured."
      />
    );
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (
      normalizedStatus.includes('resting') ||
      normalizedStatus.includes('complete')
    ) {
      return <StatusOK />;
    }
    if (
      normalizedStatus.includes('interstitial') ||
      normalizedStatus.includes('bursting')
    ) {
      return <StatusWarning />;
    }
    if (
      normalizedStatus.includes('error') ||
      normalizedStatus.includes('backing off')
    ) {
      return <StatusError />;
    }
    return null;
  };

  const columns: TableColumn<ProviderRow>[] = [
    {
      title: 'Provider Name',
      field: 'name',
      render: row => (
        <Typography
          style={{ fontWeight: 'bold' }}
          variant="body2"
          component="span"
        >
          {row.name}
        </Typography>
      ),
    },
    {
      title: 'Status',
      field: 'status',
      render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {getStatusIcon(row.status)}
          <Typography variant="body2" component="span">
            {row.status}
          </Typography>
        </div>
      ),
    },
    {
      title: 'Next Action',
      field: 'nextActionAt',
      render: row => (
        <Typography variant="body2" component="span">
          {formatDate(row.nextActionAt)}
        </Typography>
      ),
    },
    {
      title: 'Last Error',
      field: 'lastError',
      render: row =>
        row.lastError ? (
          <Typography variant="body2" component="span">
            {row.lastError.length > 100
              ? `${row.lastError.substring(0, 100)}...`
              : row.lastError}
          </Typography>
        ) : (
          <Typography variant="body2" component="span" color="textSecondary">
            —
          </Typography>
        ),
    },
  ];

  return (
    <Table
      title="Incremental Providers"
      options={{ search: false, paging: true, pageSize: 5 }}
      data={providersWithStatus}
      columns={columns}
    />
  );
};
