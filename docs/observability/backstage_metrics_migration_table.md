# Backstage Metrics Migration Mapping

This document shows how existing metrics map to the new framework-first approach where infrastructure is automatically instrumented and plugins focus on business metrics.

## Current to Proposed Metric Names

| **Current Metric**                   | **New Metric**                                         | **Type**  | **Unit** | **Notes**                                                  |
| ------------------------------------ | ------------------------------------------------------ | --------- | -------- | ---------------------------------------------------------- |
| `catalog_entities_count`             | `backstage.catalog.entities.count`                     | Counter   | `1`      | Add backstage prefix, use dots                             |
| `catalog_registered_locations_count` | `backstage.catalog.locations.registered.count`         | Counter   | `1`      | Add backstage prefix, restructure hierarchy                |
| `catalog_relations_count`            | `backstage.catalog.relations.count`                    | Counter   | `1`      | Add backstage prefix, use dots                             |
| `catalog.processed.entities.count`   | `backstage.catalog.processor.entities.processed.count` | Counter   | `1`      | Group under processor functional component                 |
| `catalog.processing.duration`        | `backstage.catalog.processor.duration`                 | Histogram | `s`      | Remove redundant "processing", group under processor       |
| `catalog.processors.duration`        | `backstage.catalog.processor.duration`                 | Histogram | `s`      | Consolidate with processing.duration metric                |
| `catalog.processing.queue.delay`     | `backstage.catalog.processor.queue.delay`              | Histogram | `s`      | Group under processor functional component                 |
| `catalog.stitched.entities.count`    | `backstage.catalog.stitching.entities.count`           | Counter   | `1`      | Add backstage prefix, keep stitching as separate component |
| `catalog.stitching.duration`         | `backstage.catalog.stitching.duration`                 | Histogram | `s`      | Add backstage prefix                                       |
| `catalog.stitching.queue.length`     | `backstage.catalog.stitching.queue.length`             | Gauge     | `1`      | Add backstage prefix                                       |
| `catalog.stitching.queue.delay`      | `backstage.catalog.stitching.queue.delay`              | Histogram | `s`      | Add backstage prefix                                       |
| `scaffolder.task.count`              | `backstage.scaffolder.tasks.count`                     | Counter   | `1`      | Add backstage prefix, pluralize for consistency            |
| `scaffolder.task.duration`           | `backstage.scaffolder.tasks.duration`                  | Histogram | `s`      | Add backstage prefix, pluralize for consistency            |
| `scaffolder.step.count`              | `backstage.scaffolder.action.count`                    | Counter   | `1`      | Map step → action (architectural correction)               |
| `scaffolder.step.duration`           | `backstage.scaffolder.action.duration`                 | Histogram | `s`      | Map step → action (architectural correction)               |
| `backend_tasks.task.runs.count`      | `backstage.framework.scheduler.tasks.executed.count`   | Counter   | `1`      | Framework infrastructure metric with plugin attribution    |
| `backend_tasks.task.runs.duration`   | `backstage.framework.scheduler.tasks.duration`         | Histogram | `s`      | Framework infrastructure metric with plugin attribution    |

## Transformation Patterns Applied

### ✅ Consistent Prefixing

All metrics now start with `backstage.` namespace

### ✅ Hierarchy Standardization

- **Mixed separators** (`_` and `.`) → **consistent dots** (`.`)
- **Unclear groupings** → **logical functional components**

### ✅ Functional Component Grouping

- **Processing metrics** grouped under `processor`
- **Scaffolder steps** mapped to `action` (architectural correction)
- **Backend tasks** moved to framework infrastructure with automatic plugin attribution

### ✅ Semantic Improvements

- `processing.duration` + `processors.duration` → `processor.duration` (consolidated, remove redundancy)
- `step.*` → `action.*` (architecturally correct mapping)
- `task.runs.*` → `tasks.executed.*` (clearer action description)
- `backend_tasks.*` → `framework.scheduler.*` (infrastructure metrics with plugin attribution)

### ✅ OpenTelemetry Alignment

- **Metric Types**: Added Counter, Gauge, and Histogram classifications
- **Standard Units**: Time in seconds (`s`), counts as dimensionless (`1`)
- **Naming Consistency**: Removed redundant words like "processing" from "processing.duration"

### ✅ Framework-First Approach

- **Infrastructure Automation**: Framework provides comprehensive instrumentation automatically
- **Plugin Attribution**: Rich context through attributes rather than metric name duplication
- **Business Focus**: Plugin authors focus solely on domain-specific metrics

## Framework vs Plugin Metrics

### Framework Infrastructure Metrics (Automatic)

Plugin authors get these automatically with rich attribution:

```typescript
// Database operations
backstage.framework.database.queries.duration
{
  'plugin.id': 'catalog',
  'component': 'processor',
  'db.operation': 'select',
  'db.table': 'entities',
  'operation.status': 'success'
}

// HTTP requests
backstage.framework.http.requests.duration
{
  'plugin.id': 'scaffolder',
  'http.method': 'POST',
  'http.route': '/api/scaffolder/tasks',
  'operation.status': 'success'
}

// Scheduler operations
backstage.framework.scheduler.tasks.duration
{
  'plugin.id': 'techdocs',
  'task.name': 'generate_docs',
  'operation.status': 'success'
}
```

### Plugin Business Metrics (Manual)

Plugin authors instrument domain-specific concerns:

```typescript
// Catalog business metrics
backstage.catalog.entities.count
backstage.catalog.processor.duration
{
  'processor.name': 'github_discovery_processor',
  'processor.type': 'custom',
  'entity.kind': 'component',
  'operation.status': 'success'
}

// Scaffolder business metrics
backstage.scaffolder.tasks.count
backstage.scaffolder.action.duration
{
  'action.name': 'fetch:template',
  'action.type': 'built_in',
  'template.name': 'react-ssr-template',
  'operation.status': 'success'
}
```

## Metric Types Reference

### Counter Metrics

Monotonically increasing values that reset only on restart:

- `*.count` - Total number of items
- `*.executed.count` - Total number of executions
- `*.processed.count` - Total number of processed items

### Gauge Metrics

Current point-in-time values that can go up or down:

- `*.queue.length` - Current number of items in queue
- `*.active_tasks` - Current number of active tasks

### Histogram Metrics

Distribution of observed values:

- `*.duration` - Time measurements
- `*.delay` - Time delays
- `*.size` - Size measurements

## Stability Progression

**Phase 1: Experimental** (0-6 months)

- New metrics marked as experimental
- Breaking changes allowed with notice
- Community feedback collection

**Phase 2: Stable** (6+ months)

- Metrics proven in production
- Backwards compatibility guaranteed
- Deprecation process for changes
