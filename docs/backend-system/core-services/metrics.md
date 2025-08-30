---
id: metrics-service
title: Metrics Service
description: Overview of the metrics service in Backstage
---

# Metrics Service

The metrics service is a core service that provides a standardized way to collect and report metrics in the Backstage ecosystem.

## Naming conventions

All Backstage metrics follow a hierarchical naming pattern with clear context about where the metric originates and what it measures. We recommend following this pattern for all metrics.

```md
backstage.{scope}.{scope_name}.{metric_name}
```

:::tip
We strive to stay aligned with the OpenTelemetry best practices. When in doubt, refer to the OpenTelemetry documentation. If you notice any inconsistencies, please open an issue or submit a PR.
:::

This section defines the conventions for all metrics in the Backstage ecosystem based on [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/reference/specification/metrics/semantic_conventions/). Following these conventions ensures consistency, discoverability, and compatibility with monitoring tools.

**Building blocks:**

- `backstage` - Root namespace for all Backstage metrics
- `{scope}` - System scope (`plugin` or `core`)
- `{scope_name}` - Name of the plugin or core service
- `{metric_name}` - Hierarchical metric name provided by the implementer

## Implementation Details

The metrics system follows the established Backstage service pattern with two service references:

### Service Reference Pattern

The metrics system uses the same pattern as other Backstage services:

- **`metricsServiceRef`** (plugin-scoped): For plugin metrics, automatically prefixed with `backstage.plugin.{pluginId}`
- **`rootMetricsServiceRef`** (root-scoped): Acts as a MetricsProvider that can create different scoped metrics services

### Plugin Metrics

When using `metricsServiceFactory`, the service automatically prefixes all metrics with `backstage.plugin.{pluginId}`.

**Example:**

```typescript
// For plugin 'catalog'
reg.register(metricsServiceFactory);
// Metrics are automatically prefixed with backstage.plugin.catalog
const counter = metrics.createCounter('entities.operations.total');
// Results in: backstage.plugin.catalog.entities.operations.total
```

### Core Service Metrics

When using `rootMetricsServiceRef.forService()`, the service automatically prefixes all metrics with `backstage.core.{serviceId}`.

**Example:**

```typescript
// For core service 'database'
const serviceMetrics = rootMetrics.forService('database', 'core');
// Metrics are automatically prefixed with backstage.core.database
const counter = serviceMetrics.createCounter('connections.active');
// Results in: backstage.core.database.connections.active
```

### Root Metrics

When using `rootMetricsServiceRef` directly, metrics are prefixed with `backstage`.

**Example:**

```typescript
// Direct usage of root metrics service
const counter = rootMetrics.createCounter('startup.duration');
// Results in: backstage.startup.duration
```

### Benefits of This Approach

1. **Consistent with Backstage Pattern**: Follows the same root/plugin service pattern as logger, http router, etc.
2. **Clear Separation**: Root service acts as provider, plugin service for plugins
3. **Flexible**: Root service can create different scoped metrics as needed
4. **Type Safe**: Service refs ensure correct usage
5. **Future-Proof**: Easy to extend for module support

## Architecture

The metrics system is built on OpenTelemetry and provides automatic prefixing through a layered architecture that aligns with the Backstage backend architecture:

### Service Hierarchy

```md
RootMetricsService (DefaultRootMetricsService)
├── forPlugin(pluginId) → PluginMetricsService
│   └── prefix: backstage.plugin.{pluginId}
├── forService(serviceId, scope) → PluginMetricsService
│   └── prefix: backstage.{scope}.{serviceId} (scope: 'core' | 'plugin')
└── direct usage → DefaultRootMetricsService
    └── prefix: backstage
```

### Scope Definitions

- **`plugin`**: External plugins that extend Backstage functionality (e.g., catalog, scaffolder, techdocs)
- **`core`**: Internal Backstage services that support multiple plugins (e.g., database, scheduler, http router)
- **`root`**: System-level metrics when using the root metrics service directly

### Future Module Support

The metrics system is designed to support plugin modules in the future. When module support is implemented, metrics will follow the pattern:

```md
backstage.plugin.{pluginId}.module.{moduleId}.{metric_name}
```

This will allow modules to have their own metrics namespace while maintaining the hierarchical structure.

### Automatic Prefixing

All metrics services extend `BaseMetricsService`, which automatically prepends the service's `prefixMetricName` to all metric names:

```typescript
// BaseMetricsService automatically does this:
const prefixedName = `${this.prefixMetricName}.${name}`;
return this.meter.createCounter(prefixedName, options);
```

This ensures consistent naming without requiring developers to manually construct metric names.

## Scopes

### Plugin Scope

**Pattern:** `backstage.plugin.{pluginId}.{metric_name}`

Plugin-scoped metrics represent functionality specific to individual plugins. Each plugin operates as an independent microservice with its own metrics namespace.

**Examples:**

```md
backstage.plugin.catalog.entities.operations.total
backstage.plugin.scaffolder.tasks.total
backstage.plugin.techdocs.builds.duration
```

### Core Scope

**Pattern:** `backstage.core.{service}.{metric_name}`

Core-scoped metrics represent internal Backstage services that support multiple plugins or provide cross-cutting functionality.

**Examples:**

```md
backstage.core.database.connections.active
backstage.core.database.operations.duration
backstage.core.scheduler.tasks.total
backstage.core.http.requests.total
```

## Metric Name Structure

The `{metric_name}` component should be hierarchical using dot notation to create logical groupings.

### Recommended Hierarchies

```md
# Entity operations (use consolidated metrics with attributes)

entities.operations.total

# Task/Job operations (use consolidated metrics with attributes)

tasks.total
tasks.duration
tasks.running
tasks.queued

# Generic operations pattern

operations.total
operations.duration
```

## Metric Type Conventions

Use attributes to distinguish between different statuses, operations, or outcomes rather than creating separate metrics.

### Counters (`.total` suffix)

Use `.total` suffix for counters that measure cumulative values:

```md
# Good - consolidated with attributes

backstage.plugin.catalog.entities.operations.total
backstage.plugin.scaffolder.tasks.total
backstage.core.database.operations.total

# Avoid - separate metrics for status/operation

backstage.plugin.catalog.entities.created.total # Use attributes instead
backstage.plugin.catalog.entities.updated.total # Use attributes instead
backstage.plugin.scaffolder.tasks.completed.total # Use attributes instead
backstage.plugin.scaffolder.tasks.failed.total # Use attributes instead
```

### UpDownCounters (dynamic counts)

Use descriptive names that indicate the value can increase or decrease:

```md
backstage.core.database.connections.active
backstage.plugin.scaffolder.tasks.running
backstage.core.scheduler.tasks.pending
```

### Histograms (`.duration`, `.size` suffixes)

Use descriptive suffixes for histograms based on what they measure:

```md
# Duration measurements

backstage.plugin.catalog.operations.duration
backstage.core.database.operations.duration
backstage.plugin.scaffolder.tasks.duration

# Size measurements

backstage.core.http.request.size
backstage.core.database.result.size
backstage.plugin.techdocs.document.size
```

### Gauges (current state)

Gauges typically don't need special suffixes, but use descriptive names:

```md
backstage.core.database.connections.count
backstage.plugin.catalog.entities.count
backstage.plugin.scaffolder.tasks.queued
```

## Attribute Naming

Attributes (labels/tags) provide dimensional context to metrics. Use attributes to distinguish between different operations, statuses, and outcomes instead of creating separate metrics.

### Standard Attributes

**Always use these attributes when applicable:**

```md
# Operation and status context

operation: "create" | "read" | "update" | "delete" | "refresh" | "validation"
status: "success" | "error" | "timeout"

# Entity context (for catalog metrics)

entity.kind: "Component" | "API" | "Resource" | "System" | "Domain" | "..."
entity.type: specific entity type
entity.namespace: entity namespace

# Error context (when status="error")

error.type: error class name or type
error.code: specific error code
```

### Attribute Naming Rules

1. **Use `snake_case`** for attribute names
2. **Be consistent** across related metrics
3. **Keep cardinality reasonable** (avoid unique identifiers)
4. **Use semantic names** that clearly indicate the attribute's purpose
5. **Use attributes instead of separate metrics** for different statuses/operations

```md
# Good attributes

entity.kind: 'Component'
operation: 'refresh'
status: 'success'
db.table.name: 'entities'

# Avoid high cardinality

user.id: 'user123456' # Too many unique values
request.id: 'req-abc-123' # Unique per request
entity.name: 'my-service-api' # Too many unique values (use entity.kind instead)

# Avoid unclear names

type: 'thing' # Too generic
t: 'Component' # Too abbreviated
```

## Examples

### Plugins

```md
# Entity operations

backstage.plugin.catalog.entities.operations.total

# Attributes: { operation: "create" | "update" | "delete", entity.kind: "Component", status: "success" | "error" }

# Processing operations

backstage.plugin.catalog.operations.total

# Attributes: { operation: "refresh" | "validation" | "provider_sync", status: "success" | "error" }

backstage.plugin.catalog.operations.duration

# Attributes: { operation: "refresh" | "validation", status: "success" | "error" }

# Current state

backstage.plugin.catalog.entities.count

# Attributes: { entity.kind: "Component", entity.namespace: "default" }

# Common attributes for all catalog metrics

{
"entity.kind": "Component",
"entity.namespace": "default",
"operation": "refresh",
"provider": "github",
"status": "success"
}

# Task lifecycle

backstage.plugin.scaffolder.tasks.total

# Attributes: { status: "created" | "completed" | "failed", template: "react-component" }

backstage.plugin.scaffolder.tasks.duration

# Attributes: { template: "react-component", status: "success" | "error" }

# Template operations

backstage.plugin.scaffolder.templates.operations.total

# Attributes: { operation: "render", status: "success" | "error" }

backstage.plugin.scaffolder.templates.operations.duration

# Attributes: { operation: "render", template: "react-component" }

# Action execution

backstage.plugin.scaffolder.actions.total

# Attributes: { action: "github:repo:create", status: "success" | "error" }

backstage.plugin.scaffolder.actions.duration

# Attributes: { action: "github:repo:create", status: "success" | "error" }

backstage.plugin.scaffolder.tasks.queued

# Attributes: { template: "react-component" }

# Common attributes for all scaffolder metrics

{
"template": "react-component",
"action": "github:repo:create",
"status": "success",
"operation": "execute"
}
```

### Services

```md
# Task management (consolidated)

backstage.core.scheduler.tasks.total

# Attributes: { status: "scheduled" | "completed" | "failed", task.type: "catalog_refresh" }

backstage.core.scheduler.tasks.duration

# Attributes: { task.type: "catalog_refresh", status: "success" | "error" }

backstage.core.scheduler.tasks.running
backstage.core.scheduler.tasks.queued

# Common attributes for all scheduler metrics

{
"task.type": "catalog_refresh",
"task.frequency": "PT1H",
"status": "success"
}
```

## Anti-Patterns to Avoid

### ❌ Bad Naming Examples

```md
# Missing namespace

catalog.entities.count # Should start with backstage.

# Wrong scope

backstage.catalog.entities.count # Should be backstage.plugin.catalog.

# Separate metrics for status/operation (use attributes instead)

backstage.plugin.catalog.entities.created.total # Use operation="create" attribute
backstage.plugin.catalog.entities.updated.total # Use operation="update" attribute
backstage.plugin.scaffolder.tasks.failed.total # Use status="failed" attribute
backstage.plugin.catalog.refresh.errors.total # Use status="error" attribute

# Inconsistent suffixes

backstage.plugin.catalog.entities.cnt # Use .count or .total
backstage.plugin.catalog.processing_time # Use .duration

# Generic/unclear names

backstage.plugin.catalog.stuff.count # Be specific
backstage.plugin.catalog.thing.duration # What thing?

# Missing hierarchy

backstage.plugin.catalog.count # Count of what?

# Inconsistent style

backstage.plugin.catalog.entitiesCount # Use snake_case in hierarchies
backstage.plugin.catalog.entity-count # Use dots, not dashes
```

### ❌ Bad Attribute Examples

```md
# High cardinality

user_id: '12345'          # Too many unique values
entity_name: 'my-service' # Use entity.kind instead
request_id: 'req-abc-123' # Don't track individual requests

# Inconsistent naming

entityType: 'Component'       # Use entity.kind
httpMethod: 'GET'             # Use http.method
errorType: 'ValidationError'  # Use error.type

# Unclear values

status: 'ok' # Use "success"
type: '1' # Use descriptive values
result: 'good' # Be specific
```

## Usage Patterns

### Plugin Development

Plugins should use the metrics service factory:

```typescript
import { metricsServiceFactory } from '@backstage/backend-defaults/alpha';

export default createBackendPlugin({
  id: 'my-plugin',
  register(reg) {
    // Install the metrics service factory
    reg.register(metricsServiceFactory);
    
    reg.registerInit({
      deps: {
        metrics: metricsServiceRef,
      },
      async init({ metrics }) {
        // Metrics are automatically prefixed with backstage.plugin.my-plugin
        const counter = metrics.createCounter('operations.total');
        const histogram = metrics.createHistogram('operations.duration');

        // Use attributes for different operations
        counter.add(1, { operation: 'create', status: 'success' });
        histogram.record(150, { operation: 'create', status: 'success' });
      },
    });
  },
});
```

### Core Service Development

Core services should use the root metrics service directly:

```typescript
import { rootMetricsServiceRef } from '@backstage/backend-plugin-api/alpha';

export default createBackendPlugin({
  id: 'core-database',
  register(reg) {
    reg.registerInit({
      deps: {
        rootMetrics: rootMetricsServiceRef,
      },
      async init({ rootMetrics }) {
        // Create core service-scoped metrics
        const serviceMetrics = rootMetrics.forService('database', 'core');
        
        // Metrics are automatically prefixed with backstage.core.database
        const connectionsGauge = serviceMetrics.createGauge('connections.active');
        const operationsHistogram = serviceMetrics.createHistogram('operations.duration');

        // Update metrics
        connectionsGauge.record(5);
        operationsHistogram.record(25, { operation: 'query', table: 'entities' });
      },
    });
  },
});
```

### Root System Development

For system-level metrics, use the root metrics service directly:

```typescript
import { rootMetricsServiceRef } from '@backstage/backend-plugin-api/alpha';

export default createBackendPlugin({
  id: 'system-monitor',
  register(reg) {
    reg.registerInit({
      deps: {
        rootMetrics: rootMetricsServiceRef,
      },
      async init({ rootMetrics }) {
        // Metrics are automatically prefixed with backstage
        const startupHistogram = rootMetrics.createHistogram('startup.duration');
        const memoryGauge = rootMetrics.createGauge('memory.usage');

        // Update metrics
        startupHistogram.record(2500);
        memoryGauge.record(process.memoryUsage().heapUsed);
      },
    });
  },
});
```

### Plugin with Service Metrics

For plugins that provide both plugin functionality and services, you can use both metrics approaches:

```typescript
import { metricsServiceRef, rootMetricsServiceRef } from '@backstage/backend-plugin-api/alpha';
import { metricsServiceFactory } from '@backstage/backend-defaults/alpha';

export default createBackendPlugin({
  id: 'catalog',
  register(reg) {
    // Install the plugin metrics service factory for plugin-scoped metrics
    reg.register(metricsServiceFactory);
    
    reg.registerInit({
      deps: {
        metrics: metricsServiceRef,           // Plugin-scoped metrics
        rootMetrics: rootMetricsServiceRef,  // For service-scoped metrics
      },
      async init({ metrics, rootMetrics }) {
        // Plugin-scoped metrics (backstage.plugin.catalog.*)
        const entityProcessingCounter = metrics.createCounter('entities.processing.total');
        const refreshHistogram = metrics.createHistogram('refresh.duration');
        
        // Service-scoped metrics (backstage.core.catalog.*)
        const serviceMetrics = rootMetrics.forService('catalog', 'core');
        const apiCallCounter = serviceMetrics.createCounter('api.calls.total');
        const searchHistogram = serviceMetrics.createHistogram('search.duration');
        
        // Update plugin metrics
        entityProcessingCounter.add(1, { operation: 'create', status: 'success' });
        refreshHistogram.record(150, { provider: 'github' });
        
        // Update service metrics
        apiCallCounter.add(1, { endpoint: '/entities', status: 'success' });
        searchHistogram.record(25, { query_type: 'component' });
      },
    });
  },
});
```

This approach gives you:

- **Plugin metrics**: `backstage.plugin.catalog.entities.processing.total`
- **Service metrics**: `backstage.core.catalog.api.calls.total`

The distinction helps separate:

- **Plugin operations**: Internal catalog functionality (entity processing, refresh cycles)
- **Service operations**: External API usage (search requests, entity lookups)

### When to Use Each Approach

**Use plugin-scoped metrics for:**

- Internal plugin operations (entity processing, background tasks)
- Plugin lifecycle events (startup, shutdown, configuration)
- Plugin-specific business logic metrics

**Use service-scoped metrics for:**

- API endpoints and external service calls
- Service operations that other plugins consume
- Cross-plugin communication metrics
- Service-level performance indicators

**Use root-scoped metrics for:**

- System-wide metrics (startup time, memory usage)
- Backend-wide operations (health checks, global state)
- Infrastructure-level metrics

### Custom Metrics Service

For advanced use cases, you can create custom metrics services by extending `BaseMetricsService`:

```typescript
import { BaseMetricsService } from '@backstage/backend-defaults/alpha';

export class CustomMetricsService extends BaseMetricsService {
  private readonly _meter: Meter;
  private readonly _customPrefix: string;

  constructor(meter: Meter, customPrefix: string) {
    super();
    this._meter = meter;
    this._customPrefix = customPrefix;
  }

  protected get meter(): Meter {
    return this._meter;
  }

  protected get prefixMetricName(): string {
    return `backstage.custom.${this._customPrefix}`;
  }
}
```

## Validation Checklist

The following can be used as a validation checklist for metrics. It is not exhaustive, but should be used as a guide to ensure that metrics are named correctly.

### ✅ Naming Structure

- Starts with `backstage.`
- Uses correct scope (`plugin` or `core`)
- Includes proper scope name (plugin ID or service name)
- Uses hierarchical dot notation for metric name
- Follows appropriate suffix conventions
- Uses consolidated metrics with attributes instead of separate metrics for status/operation

### ✅ Consistency

- Aligns with existing metrics in the same plugin/service
- Uses standard attribute names where applicable
- Uses attributes for different statuses/operations instead of separate metrics
- Follows [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/specs/semconv/general/metrics/) where relevant

### ✅ Clarity

- Metric name clearly indicates what is measured
- Attribute names are descriptive and unambiguous
- Units are specified in the metric options
- Description explains the metric's purpose
- Attributes provide sufficient context to answer operational questions

### ✅ Implementation

- Uses the appropriate metrics service (plugin vs core vs root)
- Leverages automatic prefixing instead of manual prefix construction
- Provides meaningful metric descriptions in options
- Uses attributes for dimensional data instead of separate metrics
- Follows the established naming patterns for the specific scope

## Quick Reference

### Service Selection

| Use Case | Service | Method | Resulting Prefix |
|----------|---------|--------|------------------|
| Plugin metrics | `metricsServiceRef` | `metricsServiceFactory` | `backstage.plugin.{pluginId}` |
| Core service metrics | `rootMetricsServiceRef` | `forService(id, 'core')` | `backstage.core.{serviceId}` |
| Root system metrics | `rootMetricsServiceRef` | Direct usage | `backstage` |
| Plugin + Service metrics | Both services | Both methods | Both prefixes |

### Common Patterns

```typescript
// Plugin: backstage.plugin.catalog.entities.operations.total
const counter = metrics.createCounter('entities.operations.total');

// Core service: backstage.core.database.connections.active  
const gauge = metrics.createGauge('connections.active');

// Root: backstage.startup.duration
const histogram = metrics.createHistogram('startup.duration');
```

### Key Principles

1. **Automatic prefixing**: Never manually construct metric names with prefixes
2. **Use attributes**: Distinguish operations/statuses with attributes, not separate metrics
3. **Hierarchical names**: Use dot notation for logical groupings
4. **Consistent suffixes**: Use `.total`, `.duration`, `.count` appropriately
5. **Low cardinality**: Avoid unique identifiers in attributes
