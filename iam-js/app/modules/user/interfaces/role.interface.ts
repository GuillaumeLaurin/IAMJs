import { IPermission } from "@user/interfaces/permission.interface";

export interface IRole {
    name: string;
    permissions: string[];
}