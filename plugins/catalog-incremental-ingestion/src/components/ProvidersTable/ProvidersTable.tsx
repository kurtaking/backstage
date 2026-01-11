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
  StatusRunning,
} from '@backstage/core-components';
import { useApi, alertApiRef } from '@backstage/frontend-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import Typography from '@material-ui/core/Typography';
import { incrementalIngestionApiRef } from '../../api';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import RefreshIcon from '@material-ui/icons/Refresh';
import StopIcon from '@material-ui/icons/Stop';
import { useState, useCallback } from 'react';

interface ProviderRow {
  name: string;
  status: string;
  nextActionAt?: string;
  lastError?: string;
}

interface IncrementalEntityProvidersTableProps {
  providers: string[];
}

/**
 * Component that displays a table of incremental ingestion providers and their status.
 *
 * @public
 */
export const IncrementalEntityProvidersTable = ({
  providers,
}: IncrementalEntityProvidersTableProps) => {
  const api = useApi(incrementalIngestionApiRef);
  const alertApi = useApi(alertApiRef);
  const [triggeringProvider, setTriggeringProvider] = useState<string | null>(
    null,
  );
  const [startingProvider, setStartingProvider] = useState<string | null>(null);
  const [cancelingProvider, setCancelingProvider] = useState<string | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [api, providers, refreshKey]);

  const handleTrigger = useCallback(
    async (providerName: string) => {
      setTriggeringProvider(providerName);
      try {
        const response = await api.triggerProvider(providerName);
        alertApi.post({
          message: response.message || `Successfully triggered ${providerName}`,
          severity: 'success',
          display: 'transient',
        });
        // Refresh the data after a short delay to see updated status
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
        }, 1000);
      } catch (err) {
        alertApi.post({
          message: `Failed to trigger ${providerName}: ${
            err instanceof Error ? err.message : String(err)
          }`,
          severity: 'error',
          display: 'transient',
        });
      } finally {
        setTriggeringProvider(null);
      }
    },
    [api, alertApi],
  );

  const handleStart = useCallback(
    async (providerName: string) => {
      setStartingProvider(providerName);
      try {
        const response = await api.startProvider(providerName);
        alertApi.post({
          message: response.message || `Successfully started ${providerName}`,
          severity: 'success',
          display: 'transient',
        });
        // Refresh the data after a short delay to see updated status
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
        }, 1000);
      } catch (err) {
        alertApi.post({
          message: `Failed to start ${providerName}: ${
            err instanceof Error ? err.message : String(err)
          }`,
          severity: 'error',
          display: 'transient',
        });
      } finally {
        setStartingProvider(null);
      }
    },
    [api, alertApi],
  );

  const handleCancel = useCallback(
    async (providerName: string) => {
      setCancelingProvider(providerName);
      try {
        const response = await api.cancelProvider(providerName);
        alertApi.post({
          message:
            response.message ||
            `Successfully canceled ${providerName}. Will restart in 24 hours.`,
          severity: 'success',
          display: 'transient',
        });
        // Refresh the data after a short delay to see updated status
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
        }, 1000);
      } catch (err) {
        alertApi.post({
          message: `Failed to cancel ${providerName}: ${
            err instanceof Error ? err.message : String(err)
          }`,
          severity: 'error',
          display: 'transient',
        });
      } finally {
        setCancelingProvider(null);
      }
    },
    [api, alertApi],
  );

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
      return <StatusRunning />;
    }

    if (normalizedStatus.includes('backing off')) {
      return <StatusWarning />;
    }

    if (normalizedStatus.includes('error')) {
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
        <Box display="flex" alignItems="center">
          {getStatusIcon(row.status)}
          <Typography variant="body2" component="span">
            {row.status}
          </Typography>
        </Box>
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
    {
      title: 'Actions',
      field: 'actions',
      sorting: false,
      render: row => {
        const isActionInProgress =
          triggeringProvider === row.name ||
          startingProvider === row.name ||
          cancelingProvider === row.name;

        return (
          <Box display="flex" alignItems="center">
            <Tooltip title="Trigger next action">
              <IconButton
                aria-label={`Trigger ${row.name}`}
                disabled={isActionInProgress}
                onClick={() => handleTrigger(row.name)}
                size="small"
              >
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Start new ingestion cycle">
              <IconButton
                aria-label={`Start ${row.name}`}
                disabled={isActionInProgress}
                onClick={() => handleStart(row.name)}
                size="small"
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel current cycle (restart in 24 hours)">
              <IconButton
                aria-label={`Cancel ${row.name}`}
                disabled={isActionInProgress}
                onClick={() => handleCancel(row.name)}
                size="small"
              >
                <StopIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Table
      title="Incremental Entity Providers"
      options={{ search: false, paging: false }}
      data={providersWithStatus}
      columns={columns}
    />
  );
};
