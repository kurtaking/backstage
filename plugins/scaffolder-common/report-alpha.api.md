## API Report File for "@backstage/plugin-scaffolder-common"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
import { BasicPermission } from '@backstage/plugin-permission-common';
import { ResourcePermission } from '@backstage/plugin-permission-common';

// @alpha
export const actionExecutePermission: ResourcePermission<'scaffolder-action'>;

// @alpha
export const RESOURCE_TYPE_SCAFFOLDER_ACTION = 'scaffolder-action';

// @alpha
export const RESOURCE_TYPE_SCAFFOLDER_TEMPLATE = 'scaffolder-template';

// @alpha
export const scaffolderActionPermissions: ResourcePermission<'scaffolder-action'>[];

// @alpha
export const scaffolderPermissions: (
  | BasicPermission
  | ResourcePermission<'scaffolder-action'>
  | ResourcePermission<'scaffolder-template'>
)[];

// @alpha
export const scaffolderTaskPermissions: BasicPermission[];

// @alpha
export const scaffolderTemplatePermissions: ResourcePermission<'scaffolder-template'>[];

// @alpha
export const taskCancelPermission: BasicPermission;

// @alpha
export const taskCreatePermission: BasicPermission;

// @alpha
export const taskReadPermission: BasicPermission;

// @alpha
export const templateManagementPermission: BasicPermission;

// @alpha
export const templateParameterReadPermission: ResourcePermission<'scaffolder-template'>;

// @alpha
export const templateStepReadPermission: ResourcePermission<'scaffolder-template'>;

// (No @packageDocumentation comment for this package)
```
