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

import { WarningPanel, StatusOK } from '@backstage/core-components';
import { useApi } from '@backstage/frontend-plugin-api';
import useAsync from 'react-use/esm/useAsync';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { incrementalIngestionApiRef } from '../../api';

/**
 * Health banner component that displays the overall health status of incremental providers.
 *
 * @public
 */
export const HealthBanner = () => {
  const api = useApi(incrementalIngestionApiRef);

  const { value, loading, error } = useAsync(async () => {
    return await api.getHealth();
  }, [api]);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <WarningPanel severity="error" title="Failed to check provider health">
        {error.message}
      </WarningPanel>
    );
  }

  if (!value) {
    return null;
  }

  // Healthy state - show success banner
  if (value.healthy) {
    return (
      <Grid container spacing={2} style={{ marginBottom: '1rem' }}>
        <Grid item xs={12}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '4px',
            }}
          >
            <StatusOK />
            <Typography
              variant="body1"
              style={{ marginLeft: '0.5rem', color: '#2e7d32' }}
            >
              All incremental providers are healthy
            </Typography>
          </div>
        </Grid>
      </Grid>
    );
  }

  // Unhealthy state - show warning with duplicate ingestions
  const duplicateCount = value.duplicateIngestions?.length ?? 0;
  const duplicateList = value.duplicateIngestions ?? [];

  return (
    <WarningPanel
      severity="warning"
      title={`Unhealthy Providers Detected (${duplicateCount} duplicate ingestion${
        duplicateCount !== 1 ? 's' : ''
      })`}
    >
      <Typography variant="body2" paragraph>
        The following providers have duplicate ingestion records:
      </Typography>
      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
        {duplicateList.map(provider => (
          <li key={provider}>
            <Typography variant="body2" component="span">
              <strong>{provider}</strong>
            </Typography>
          </li>
        ))}
      </ul>
      <Typography variant="body2" style={{ marginTop: '1rem' }}>
        This may indicate a configuration issue or a problem with the ingestion
        system. Please investigate and resolve duplicate ingestions.
      </Typography>
    </WarningPanel>
  );
};
