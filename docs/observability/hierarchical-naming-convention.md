# Hierarchical Naming Convention

This document defines the standardized naming patterns for OpenTelemetry metrics in Backstage, following OpenTelemetry semantic conventions and best practices.

## Philosophy: Framework-First Instrumentation

Backstage provides **comprehensive native instrumentation** for all infrastructure services, allowing plugin authors to focus exclusively on business domain metrics. The framework automatically instruments database, HTTP, authentication, scheduling, and other core services with rich plugin attribution.

## Core Principles

1. **Use `backstage.` prefix** for all Backstage-specific metrics
2. **Framework handles infrastructure** - automatic instrumentation of core services
3. **Plugins focus on business logic** - domain-specific metrics only
4. **Rich attribution through attributes** - plugin context automatically injected
5. **Dot separation** for hierarchical levels (no underscores or mixed separators)
6. **Snake_case** for final metric names only
7. **No units in names** - units specified in OpenTelemetry metadata

## Framework Infrastructure Metrics

**Automatically instrumented by Backstage framework - plugin authors get these for free:**

```markdown
backstage.framework.{service_name}.{metric_name}
│ │ │ │
│ │ │ └─ Specific metric (snake_case)
│ │ └─ Infrastructure service (database, http, auth, scheduler, etc.)
│ └─ Framework namespace for infrastructure concerns
└─ Top-level Backstage namespace
```

**Examples:**

```typescript
backstage.framework.database.queries.duration;
backstage.framework.http.requests.count;
backstage.framework.auth.token.validations.count;
backstage.framework.scheduler.tasks.executed.count;
```

## Plugin Business Metrics

**Instrumented by plugin authors for domain-specific concerns:**

```markdown
backstage.{plugin}.{metric_name}
│ │ │
│ │ └─ Business metric (snake_case)
│ └─ Plugin name (matches package structure)
└─ Top-level Backstage namespace
```

**Examples:**

```typescript
backstage.catalog.entities.count;
backstage.scaffolder.tasks.count;
backstage.techdocs.builds.count;
```

## Framework Attribution

All framework infrastructure metrics automatically include plugin context through attributes:

```typescript
// Framework database metrics with automatic plugin attribution
backstage.framework.database.queries.duration

// Attributes automatically injected by framework
{
  'plugin.id': 'catalog',
  'component': 'processor',
  'db.operation': 'select',
  'db.table': 'entities',
  'operation.status': 'success'
}
```

## Plugin Extension Points

For plugins with extension points (processors, actions, providers), use functional component naming with rich attribution:

```typescript
// Plugin business logic metrics
backstage.catalog.processor.duration
backstage.scaffolder.action.duration

// Attributes provide extension point context
{
  'processor.name': 'github_discovery_processor',
  'processor.type': 'custom | built_in',
  'operation.status': 'success | error',
  'entity.kind': 'component'
}
```

## Metric Types and Units

### Standard Metric Types

**Counter** - Monotonically increasing values (counts, totals):

```ts
backstage.catalog.entities.count; // unit: "1" (dimensionless)
backstage.framework.database.queries.count; // unit: "1" (dimensionless)
backstage.scaffolder.tasks.count; // unit: "1" (dimensionless)
```

**Gauge** - Current point-in-time values (queue lengths, active connections):

```ts
backstage.catalog.queue.length; // unit: "1" (dimensionless)
backstage.framework.database.connections.active; // unit: "1" (dimensionless)
```

**Histogram** - Distribution of values (durations, sizes):

```ts
backstage.catalog.processor.duration; // unit: "s" (seconds)
backstage.framework.database.queries.duration; // unit: "s" (seconds)
backstage.scaffolder.action.duration; // unit: "s" (seconds)
```

### Standard Units

Following OpenTelemetry semantic conventions:

- **Time durations**: `"s"` (seconds)
- **Counts/ratios**: `"1"` (dimensionless)
- **Bytes**: `"By"` (bytes)
- **Rates**: `"{unit}/s"` (e.g., `"1/s"` for requests per second)

## Stability Levels

Metrics follow a stability progression:

1. **Experimental** - New metrics, subject to change
2. **Stable** - Established metrics with backwards compatibility guarantees

Mark experimental metrics in documentation and consider deprecation paths for breaking changes.

## Attribute Guidelines

### Operational Attributes (Keep)

```ts
{
  "operation.name": "refresh_entity",
  "operation.status": "success | error",
  "processor.name": "github_discovery",
  "processor.type": "custom | built_in",
  "action.name": "fetch:template",
  "action.type": "custom | built_in",
  "entity.kind": "component",
  "template.name": "react-ssr-template"
}
```

### Redundant Attributes (Remove)

```ts
// ❌ These duplicate information already in metric name:
// "plugin.name": "catalog"     // Already in backstage.catalog.* or plugin.id attribute
// "service.name": "database"   // Already in backstage.framework.database.*
// "component.name": "processor" // Already in backstage.*.processor.*
```

### Template Attributes

For user-defined key-value pairs (e.g., custom template parameters):

```ts
{
  "template.parameter.region": "us-east-1",
  "template.parameter.environment": "production"
}
```

## What Plugin Authors Should Instrument

### ✅ Business Domain Metrics (Plugin Responsibility)

Plugin authors should focus exclusively on metrics that represent their business domain:

```typescript
// Entity management
backstage.catalog.entities.count;
backstage.catalog.entities.discovered.count;
backstage.catalog.entities.stale.count;

// Processing workflows
backstage.catalog.processor.duration;
backstage.catalog.refresh.queue.length;

// Template usage
backstage.scaffolder.templates.used.count;
backstage.scaffolder.tasks.count;
backstage.scaffolder.action.duration;

// Documentation builds
backstage.techdocs.builds.count;
backstage.techdocs.sites.generated.count;
```

### ❌ Infrastructure Metrics (Framework Responsibility)

Plugin authors should **NOT** instrument these - they get them automatically:

```typescript
// ❌ Don't instrument - framework provides automatically
// Database operations, HTTP requests, authentication, scheduling, etc.
// These are handled by backstage.framework.* metrics with plugin.id attribution
```

### Key Benefits

- **Zero Infrastructure Burden**: Get comprehensive infrastructure observability for free
- **Consistent Patterns**: All plugins get the same infrastructure metrics
- **Focus on Value**: Spend time on domain-specific observability that matters
- **Rich Attribution**: Framework automatically adds plugin context to all infrastructure metrics
