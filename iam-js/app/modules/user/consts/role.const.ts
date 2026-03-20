import { Role } from '@user/enums/role.enum';
import { Action } from '@user/enums/action.enum';
import { Resource } from '@user/enums/resource.enum';
import { Scope } from '@user/enums/scope.enum';
import { IRole } from '@user/interfaces/role.interface';

export const ROLES: IRole[] = [
  {
    name: `${Role.SuperAdmin}`,
    permissions: [
      `${Action.Manage}:${Resource.User}:${Scope.All}`,
      `${Action.Manage}:${Resource.Role}:${Scope.All}`,
      `${Action.Manage}:${Resource.Permission}`,
      `${Action.Delete}:${Resource.Document}:${Scope.All}`,
      `${Action.Read}:${Resource.Report}:${Scope.All}`,
      `${Action.Export}:${Resource.Report}:${Scope.All}`,
    ],
  },
  {
    name: `${Role.UserManager}`,
    permissions: [
      `${Action.Read}:${Resource.User}:${Scope.All}`,
      `${Action.List}:${Resource.User}`,
      `${Action.Create}:${Resource.User}`,
      `${Action.Update}:${Resource.User}:${Scope.All}`,
      `${Action.Delete}:${Resource.User}`,
      `${Action.Assign}:${Resource.Role}`,
    ],
  },
  {
    name: `${Role.ContentManager}`,
    permissions: [
      `${Action.Read}:${Resource.Document}:${Scope.All}`,
      `${Action.Create}:${Resource.Document}`,
      `${Action.Update}:${Resource.Document}:${Scope.All}`,
      `${Action.Delete}:${Resource.Document}:${Scope.All}`,
      `${Action.Share}:${Resource.Document}:${Scope.All}`,
      `${Action.Read}:${Resource.Report}:${Scope.All}`,
    ],
  },
  {
    name: `${Role.Editor}`,
    permissions: [
      `${Action.Read}:${Resource.Document}:${Scope.All}`,
      `${Action.Create}:${Resource.Document}`,
      `${Action.Update}:${Resource.Document}:${Scope.Own}`,
      `${Action.Delete}:${Resource.Document}:${Scope.Own}`,
      `${Action.Read}:${Resource.Report}:${Scope.Own}`,
    ],
  },
  {
    name: `${Role.Viewer}`,
    permissions: [
      `${Action.Read}:${Resource.Document}:${Scope.All}`,
      `${Action.Read}:${Resource.Report}:${Scope.All}`,
    ],
  },
  {
    name: `${Role.Auditor}`,
    permissions: [
      `${Action.Read}:${Resource.User}:${Scope.All}`,
      `${Action.Read}:${Resource.Document}:${Scope.All}`,
      `${Action.Read}:${Resource.Report}:${Scope.All}`,
      `${Action.Read}:${Resource.AuditTrail}`,
      `${Action.Export}:${Resource.Report}:${Scope.All}`,
    ],
  },
];
