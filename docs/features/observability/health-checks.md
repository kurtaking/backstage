---
id: health-checks
title: Health Checks
description: Health checks for your Backstage instance
---

Backstage provides two health check endpoints to help you monitor the health of your Backstage instance. You can read more about this service and how to customize it in the [Root Health Service documentation](../../backend-system/core-services/root-health.md).

| Endpoint                          | Description              |
| --------------------------------- | ------------------------ |
| `/.backstage/health/v1/readiness` | Provides readiness check |
| `/.backstage/health/v1/liveness`  | Provides liveness check  |
