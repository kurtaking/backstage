# Hierarchical Naming Convention

## Root-Scoped Services

```markdown
backstage.services.{service_name}.{metric_name}
│         │         │            │
│         │         │            └─ Specific metric (snake_case)
│         │         └─ Root service name (logger, health, lifecycle, etc.)
│         └─ Services namespace for backend-wide concerns
└─ Top-level Backstage namespace
```

## Plugin Operations

```markdown
backstage.{plugin}.{component}.{metric_name}
│         │        │           │
│         │        │           └─ Specific metric (snake_case)
│         │        └─ Component/feature within plugin
│         └─ Plugin name (matches package structure)
└─ Top-level Backstage namespace
```

## Plugin-Scoped Service Usage

```markdown
backstage.{plugin}.{service_name}.{metric_name}
│         │        │             │
│         │        │             └─ Specific metric (snake_case)
│         │        └─ Service name (database, cache, scheduler, etc.)
│         └─ Plugin using the service
└─ Top-level Backstage namespace
```

## Plugin Modules

Modules are part of their plugin and leverage the same service instances. Therefore, we will not differentiate between modules and plugins.

Ideally, a plugin provides the instrumentation around the extension point where module information is attached as attributes. For example, the catalog plugin injects the `processor.name` when it executes a processor. So a module providing a custom processor would be identifiable by the `processor.name` attribute, but grouped under the `catalog` plugin.

```ts
backstage.catalog.processor.processing.duration
backstage.catalog.processor.entities.processed.count

// example attributes
{
  'processor.name': 'github_discovery_processor',
  'operation.status': 'success | error',
  // ...
  'entity.kind': 'component'
}
```
