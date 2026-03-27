import { Injectable } from '@nestjs/common';
import { AuthGuard as Auth } from '@nestjs/passport';

@Injectable()
export class RefreshGuard extends Auth('jwt-refresh') {}
