---
id: logging
title: Logging
description: Structured logging in Backstage
---

The backend supplies a central logging service, [`rootLogger`](../../backend-system/core-services/root-logger.md), as well as a plugin-based logger, [`logger`](../../backend-system/core-services/logger.md) from `coreServices`. Both of which support structured logging.

To add additional granularity to your logs, you can create children from the plugin-based logger, using the `.child()` method and provide it with JSON data. For example, if you wanted to log items for a specific span in your plugin, you could do

```ts
export function createRouter({ logger }) {
  const router = Router();

  router.post('/task/:taskId/queue', (req, res) => {
    const { taskId } = req.params;
    const taskLogger = logger.child({ task: taskId });
    taskLogger.log('Queueing this task.');
  });

  router.get('/task/:taskId/results', (req, res) => {
    const { taskId } = req.params;
    const taskLogger = logger.child({ task: taskId });
    taskLogger.log('Getting the results of this task.');
  });
}
```

You can also add additional metadata to all logs for your Backstage instance by overriding the `rootLogger` implementation, you can see an example in the [`rootLogger` docs](../../backend-system/core-services/root-logger.md#configuring-the-service).
