export interface Payload {
  sub: string;
  tokenVersion: number;
  jti: string;
  iat?: number;
  exp?: number;
}
