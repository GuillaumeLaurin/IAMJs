export type Payload = {
  sub: string;
  tokenVersion: number;
  jti: string;
  iat?: number;
  exp?: number;
};
