import { Injectable } from '@nestjs/common';
import { AuthGuard as Auth } from '@nestjs/passport';

@Injectable()
export class GoogleGuard extends Auth('google') {}
