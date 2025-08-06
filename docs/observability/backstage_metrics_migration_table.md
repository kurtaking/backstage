# Backstage Metrics Migration Mapping

## Current to Proposed Metric Names

| **Current Metric**                   | **New Metric**                                         | **Notes**                                                  |
| ------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------- |
| `catalog_entities_count`             | `backstage.catalog.entities.count`                     | Add backstage prefix, use dots                             |
| `catalog_registered_locations_count` | `backstage.catalog.locations.registered.count`         | Add backstage prefix, restructure hierarchy                |
| `catalog_relations_count`            | `backstage.catalog.relations.count`                    | Add backstage prefix, use dots                             |
| `catalog.processed.entities.count`   | `backstage.catalog.processor.entities.processed.count` | Group under processor functional component                 |
| `catalog.processing.duration`        | `backstage.catalog.processor.processing.duration`      | Group under processor functional component                 |
| `catalog.processors.duration`        | `backstage.catalog.processor.execution.duration`       | Group under processor, clarify as execution time           |
| `catalog.processing.queue.delay`     | `backstage.catalog.processor.queue.delay`              | Group under processor functional component                 |
| `catalog.stitched.entities.count`    | `backstage.catalog.stitching.entities.count`           | Add backstage prefix, keep stitching as separate component |
| `catalog.stitching.duration`         | `backstage.catalog.stitching.duration`                 | Add backstage prefix                                       |
| `catalog.stitching.queue.length`     | `backstage.catalog.stitching.queue.length`             | Add backstage prefix                                       |
| `catalog.stitching.queue.delay`      | `backstage.catalog.stitching.queue.delay`              | Add backstage prefix                                       |
| `scaffolder.task.count`              | `backstage.scaffolder.tasks.count`                     | Add backstage prefix, pluralize for consistency            |
| `scaffolder.task.duration`           | `backstage.scaffolder.tasks.duration`                  | Add backstage prefix, pluralize for consistency            |
| `scaffolder.step.count`              | `backstage.scaffolder.action.count`                    | Map step → action (architectural correction)               |
| `scaffolder.step.duration`           | `backstage.scaffolder.action.duration`                 | Map step → action (architectural correction)               |
| `backend_tasks.task.runs.count`      | `backstage.services.scheduler.tasks.executed.count`    | Clarify as scheduler service usage                         |
| `backend_tasks.task.runs.duration`   | `backstage.services.scheduler.tasks.duration`          | Clarify as scheduler service usage                         |

## Transformation Patterns Applied

### ✅ Consistent Prefixing

All metrics now start with `backstage.` namespace

### ✅ Hierarchy Standardization

- **Mixed separators** (`_` and `.`) → **consistent dots** (`.`)
- **Unclear groupings** → **logical functional components**

### ✅ Functional Component Grouping

- **Processing metrics** grouped under `processor`
- **Scaffolder steps** mapped to `action` (architectural correction)
- **Backend tasks** clarified as `scheduler` service usage

### ✅ Semantic Improvements

- `processors.duration` → `processor.execution.duration` (clearer intent)
- `step.*` → `action.*` (architecturally correct mapping)
- `task.runs.*` → `tasks.executed.*` (clearer action description)

## Enhanced Attribute Strategy

### New Attributes Added

**Scaffolder Actions:**

```typescript
{
  'action.name': 'fetch:template',
  'action.type': 'built_in',
  'template.name': 'react-ssr-template',
  'template.namespace': 'default',
  'operation.status': 'success'
}
```

**Catalog Processors:**

```typescript
{
  'processor.name': 'github_discovery_processor',
  'processor.type': 'custom',
  'entity.kind': 'component',
  'operation.status': 'success'
}
```

**Operational Context:**

```typescript
{
  'operation.name': 'refresh_entity',
  'operation.status': 'success',
  'provider.name': 'github'
}
```
