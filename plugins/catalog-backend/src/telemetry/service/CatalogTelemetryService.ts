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
import {
  Counter,
  Gauge,
  Meter,
  MetricOptions,
  metrics,
  ObservableGauge,
} from '@opentelemetry/api';
import { Knex } from 'knex';
import {
  DbSearchRow,
  DbLocationsRow,
  DbRelationsRow,
} from '../../database/tables';

export interface TelemetryService {
  createCounter(name: string, options?: MetricOptions): Counter;
  createGauge(name: string, options?: MetricOptions): Gauge;
  createObservableGauge(name: string, options?: MetricOptions): ObservableGauge;
}

export class TelemetryServiceImpl implements TelemetryService {
  private readonly meter: Meter;

  constructor() {
    this.meter = metrics.getMeter('default');
  }

  createCounter(name: string, options?: MetricOptions): Counter {
    return this.meter.createCounter(name, options);
  }

  createGauge(name: string, options?: MetricOptions): Gauge {
    return this.meter.createGauge(name, options);
  }

  createObservableGauge(
    name: string,
    options?: MetricOptions,
  ): ObservableGauge {
    return this.meter.createObservableGauge(name, options);
  }
}

export function initCatalogDatabaseMetrics(opts: {
  knex: Knex;
  telemetry: TelemetryService;
}) {
  const { knex, telemetry } = opts;

  const catalogEntityObservableGauge = telemetry
    .createObservableGauge('catalog_entities_count', {
      description: 'Total amount of entities in the catalog.',
    })
    .addCallback(async gauge => {
      const results = await knex<DbSearchRow>('search')
        .where('key', '=', 'kind')
        .whereNotNull('value')
        .select({ kind: 'value', count: knex.raw('count(*)') })
        .groupBy('value');

      results.forEach(({ kind, count }) => {
        gauge.observe(Number(count), { kind });
      });
    });

  const catalogRegisteredLocationsObservableGauge = telemetry
    .createObservableGauge('catalog_registered_locations_count', {
      description: 'Total amount of registered locations in the catalog.',
    })
    .addCallback(async gauge => {
      if (knex.client.config.client === 'pg') {
        // https://stackoverflow.com/questions/7943233/fast-way-to-discover-the-row-count-of-a-table-in-postgresql
        const total = await knex.raw(`
        SELECT reltuples::bigint AS estimate
        FROM   pg_class
        WHERE  oid = 'locations'::regclass;
      `);
        gauge.observe(Number(total.rows[0].estimate));
      } else {
        const total = await knex<DbLocationsRow>('locations').count({
          count: '*',
        });
        gauge.observe(Number(total[0].count));
      }
    });

  const catalogRelationsObservableGauge = telemetry
    .createObservableGauge('catalog_relations_count', {
      description: 'Total amount of relations between entities.',
    })
    .addCallback(async gauge => {
      if (knex.client.config.client === 'pg') {
        // https://stackoverflow.com/questions/7943233/fast-way-to-discover-the-row-count-of-a-table-in-postgresql
        const total = await knex.raw(`
        SELECT reltuples::bigint AS estimate
        FROM   pg_class
        WHERE  oid = 'relations'::regclass;
      `);
        gauge.observe(Number(total.rows[0].estimate));
      } else {
        const total = await knex<DbRelationsRow>('relations').count({
          count: '*',
        });
        gauge.observe(Number(total[0].count));
      }
    });

  return {
    entities_count: catalogEntityObservableGauge,
    registered_locations: catalogRegisteredLocationsObservableGauge,
    relations: catalogRelationsObservableGauge,
  };
}
