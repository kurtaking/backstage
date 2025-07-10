---
id: metrics
title: Metrics
description: Metrics for your Backstage instance
---

Backstage uses [OpenTelemetry](https://opentelemetry.io/) to instrument its components by reporting metrics.

<!-- ## Services

Backstage provides a `MetricsService` that can be used to instrument metrics throughout your instance. For more information, see the [Metrics Service](../../backend-system/core-services/metrics.md) documentation. -->

## Naming Conventions

All Backstage metrics should follow this hierarchical pattern:

`backstage.{plugin|core}.{pluginId|coreServiceName}.{category}.{metric_name}`

**Where:**

- `backstage` is the root namespace for all Backstage metrics
- `{plugin|core}` is the scope of the metric (either **plugin** or **core**)
- `{pluginId|coreServiceName}` is the name of the scope (e.g. `my-plugin`, `catalog`, `scaffolder`, etc.)
- `{category}` is the logical grouping within the scope
- `{metric_name}` is the name of the metric as provided by the plugin author.

### Scope

The `scope` represents where it belongs in the Backstage ecosystem.

- `plugin` - A plugin-specific metric (e.g. `backstage.plugin.my-plugin.entities.count`)
- `core` - A core service metric (e.g. `backstage.core.database.connections.active`)

### Category

The `category` represents the logical grouping within the scope. For example, a metric related to entities would look like `backstage.plugin.my-plugin.entities.count`.

## Existing Metrics

The following metrics are available and may not follow the naming conventions outlined above.

| Metric Name                          | Description                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `catalog_entities_count`             | Total amount of entities in the catalog                                                               |
| `catalog_registered_locations_count` | Total amount of registered locations in the catalog                                                   |
| `catalog_relations_count`            | Total amount of relations between entities                                                            |
| `catalog.processed.entities.count`   | Amount of entities processed                                                                          |
| `catalog.processing.duration`        | Time spent executing the full processing flow                                                         |
| `catalog.processors.duration`        | Time spent executing catalog processors                                                               |
| `catalog.processing.queue.delay`     | The amount of delay between being scheduled for processing, and the start of actually being processed |
| `catalog.stitched.entities.count`    | Amount of entities stitched                                                                           |
| `catalog.stitching.duration`         | Time spent executing the full stitching flow                                                          |
| `catalog.stitching.queue.length`     | Number of entities currently in the stitching queue                                                   |
| `catalog.stitching.queue.delay`      | The amount of delay between being scheduled for stitching, and the start of actually being stitched   |
| `scaffolder.task.count`              | Count of task runs                                                                                    |
| `scaffolder.task.duration`           | Duration of a task run                                                                                |
| `scaffolder.step.count`              | Count of step runs                                                                                    |
| `scaffolder.step.duration`           | Duration of a step runs                                                                               |
| `backend_tasks.task.runs.count`      | Total number of times a task has been run                                                             |
| `backend_tasks.task.runs.duration`   | Histogram of task run durations                                                                       |
