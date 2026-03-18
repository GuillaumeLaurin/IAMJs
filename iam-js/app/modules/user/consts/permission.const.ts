import { Action } from '@user/enums/action.enum';
import { Resource } from "@user/enums/resource.enum";
import { Scope } from "@user/enums/scope.enum";

export const PERMISSIONS = [
    // Users
    { name: `${Action.Read}:${Resource.User}:${Scope.All}`, description: 'See any users' },
    { name: `${Action.List}:${Resource.User}`, description: 'List users' },
    { name: `${Action.Create}:${Resource.User}`, description: 'Create an user' },
    { name: `${Action.Update}:${Resource.User}:${Scope.All}`, description: 'Update an user' },
    { name: `${Action.Delete}:${Resource.User}`, description: 'Delete an user' },
    { name: `${Action.Assign}:${Resource.Role}`, description: 'Assign a role to an user' },
    // Documents
    { name: `${Action.Read}:${Resource.Document}:${Scope.All}`, description: 'Read any documents' },
    { name: `${Action.Create}:${Resource.Document}`, description: 'Create a document' },
    { name: `${Action.Update}:${Resource.Document}:${Scope.Own}`, description: 'Update own documents' },
    { name: `${Action.Update}:${Resource.Document}:${Scope.All}`, description: 'Update any documents' },
    { name: `${Action.Delete}:${Resource.Document}:${Scope.Own}`, description: 'Delete own documents' },
    { name: `${Action.Delete}:${Resource.Document}:${Scope.All}`, description: 'Delete any documents' },
    { name: `${Action.Share}:${Resource.Document}`, description: 'Share a document' },
    // Report
    { name: `${Action.Read}:${Resource.Report}:${Scope.Own}`, description: 'See own reports' },
    { name: `${Action.Read}:${Resource.Report}:${Scope.All}`, description: 'See any reports' },
    { name: `${Action.Export}:${Resource.Report}:${Scope.All}`, description: 'Export any reports' },
    // Audit
    { name: `${Action.Read}:${Resource.AuditTrail}`, description: 'Consult audit trail' },
    // Admin
    { name: `${Action.Manage}:${Resource.User}:${Scope.All}`, description: 'Manage any users' },
    { name: `${Action.Manage}:${Resource.Role}:${Scope.All}`, description: 'Manage any roles' },
    { name: `${Action.Manage}:${Resource.Permission}`, description: 'Manage permissions' },
];