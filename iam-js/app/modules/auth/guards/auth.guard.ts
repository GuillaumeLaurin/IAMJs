import { Injectable } from "@nestjs/common";
import { AuthGuard as Auth } from "@nestjs/passport";

@Injectable()
export class AuthGuard extends Auth('jwt-access') {}