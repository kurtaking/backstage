---
title: The standardization of metrics naming patterns
status: implementable
authors:
  - '@kurtaking'
owners:
  - '@kurtaking'
  - '@backstage/core-maintainers'
project-areas:
  - core-framework
creation-date: 2025-08-06
---

# BEP: The standardization of metrics naming patterns

- [Summary](#summary)
- [Motivation](#motivation)
  - [Goals](#goals)
  - [Non-Goals](#non-goals)
- [Proposal](#proposal)
- [Design Details](#design-details)
- [Release Plan](#release-plan)
- [Dependencies](#dependencies)
- [Alternatives](#alternatives)

## Summary

This document proposes a unified naming convention for OpenTelemetry metrics in Backstage, addressing current inconsistencies and establishing patterns that align with both OpenTelemetry best practices and Backstage's plugin-oriented architecture.

## Motivation

- Mixed separator usage (`catalog_entities_count` vs `catalog.processing.duration`)
- Inconsistent hierarchical organization
- Non-standard unit representations
- Missing semantic conventions alignment

### Goals

- An agreed-upon naming convention for the Backstage framework, aligned with OpenTelemetry semantic conventions
- Governance for future metrics additions and community plugin compliance
- Easily digestible documentation via a new Observability section in the docs
- A clear pattern a future metrics service can implement to ensure consistency

### Non-Goals

- Migrating existing metrics to the new pattern.
- The introduction of a new metrics service.
- Functionality to enforce the new naming convention.

## Proposal

Hierarchical Naming Structure

### Root-Scoped Services

```markdown
backstage.services.{service_name}.{metric_name}
│ │ │ │
│ │ │ └─ Specific metric (snake_case)
│ │ └─ Root service name (logger, health, lifecycle, etc.)
│ └─ Services namespace for backend-wide concerns
└─ Top-level Backstage namespace
```

### Plugins

```markdown
backstage.{plugin}.{component}.{metric_name}
│ │ │ │
│ │ │ └─ Specific metric (snake_case)
│ │ └─ Component/feature within plugin
│ └─ Plugin name (matches package structure)
└─ Top-level Backstage namespace
```

### Plugin-Scoped Service Usage

```markdown
backstage.{plugin}.{service_name}.{metric_name}
│ │ │ │
│ │ │ └─ Specific metric (snake_case)
│ │ └─ Service name (database, cache, scheduler, etc.)
│ └─ Plugin using the service
└─ Top-level Backstage namespace
```

### Plugin Modules

```markdown
backstage.{plugin}.{module}.{metric_name}
│ │ │ │
│ │ │ └─ Specific metric (snake_case)
│ │ └─ Module name (matches package structure)
│ └─ Plugin name (matches package structure)
└─ Top-level Backstage namespace
```

## Design Details

### Core Naming Rules

1. **Use `backstage.` prefix** for all Backstage-specific metrics
2. **Service-aware organization** distinguishing between:
   - Plugin metrics: `backstage.{plugin}.*`
   - Root services: `backstage.services.{root_service}.*`
   - Plugin service usage: `backstage.{plugin}.{service}.*`
   - Plugin module usage: `backstage.{plugin}.{module}.*`
3. **Dot separation** for hierarchical levels
4. **Snake_case** for final metric names only
5. **Singular nouns** unless measuring count of items
6. **No units in names** when OpenTelemetry metadata provides them

### Extension Point Instrumentation Pattern

**Key principle**: Plugin authors instrument extension point execution flows

For extensible components (processors, actions, providers), use functional component naming:

```typescript
// Catalog plugin processor execution
backstage.catalog.processor.processing.duration
backstage.catalog.processor.entities.processed.count

{
  'processor.name': 'github_discovery_processor',
  'processor.type': 'custom | built_in',
  'operation.status': 'success | error',
  'entity.kind': 'component'
}

// Scaffolder plugin action execution
backstage.scaffolder.action.execution.duration
backstage.scaffolder.action.executions.count

{
  'action.name': 'fetch:template',
  'action.type': 'custom | built_in',
  'template.name': 'react-template',  // or template.ref
  'operation.status': 'success | error'
}
```

This approach...

- **Prevents metric explosion** - Consistent metrics regardless of installed modules
- **Provides visibility** - Operators can filter by specific implementations
- **Maintains boundaries** - Plugin controls telemetry, modules focus on business logic
- **Scales naturally** - Works for any extensible component

### Attribute Strategy

**Key principle**: No redundant attributes that duplicate metric name information

```typescript
// ✅ Keep operational attributes (provide debugging context):
{
  "operation.name": "refresh_entity",
  "operation.status": "success",
  "entity.kind": "component",
  "processor.name": "github_discovery",
  "processor.type": "custom",
  "db.operation": "select",
  "http.method": "GET",
  "http.status_code": "200"
}

// ❌ Remove redundant attributes (duplicate metric name):
// "plugin.name": "catalog"     // Already in backstage.catalog.*
// "service.name": "database"   // Already in backstage.*.database.*
```

### Migration Mapping

**Core plugins migration:**

```yaml
# Catalog Metrics - Move to functional component pattern
catalog_entities_count → backstage.catalog.entities.count
catalog.processed.entities.count → backstage.catalog.processor.entities.processed.count
catalog.processing.duration → backstage.catalog.processor.processing.duration
catalog.processors.duration → backstage.catalog.processor.execution.duration

# Scaffolder Metrics - Move to functional component pattern
scaffolder.task.count → backstage.scaffolder.tasks.count
scaffolder.step.count → backstage.scaffolder.scaffolder_action.steps.executed.count
scaffolder.step.duration → backstage.scaffolder.scaffolder_action.steps.duration

# Backend Tasks - Clarify as scheduler service usage
backend_tasks.task.runs.count → backstage.services.scheduler.tasks.executed.count
backend_tasks.task.runs.duration → backstage.services.scheduler.tasks.duration
```

## Release Plan

Provide documentation for the new naming convention once the BEP is finalized

## Dependencies

None identified at this time.

## Alternatives

Users choose how they want to name their metrics.

## Future Considerations

- **MetricsService** - A core service that handles the naming convention and validation.
- **Trace naming conventions** - Similar patterns could apply to distributed tracing

## References

- [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- [OpenTelemetry Metrics Specification](https://opentelemetry.io/docs/specs/otel/metrics/)
- [Backstage Backend System Architecture](https://backstage.io/docs/backend-system/architecture/)
- [Backstage Extension Points](https://backstage.io/docs/backend-system/architecture/extension-points/)
- [Current Backstage Metrics](https://backstage.io/docs/tutorials/setup-opentelemetry/#available-metrics)
