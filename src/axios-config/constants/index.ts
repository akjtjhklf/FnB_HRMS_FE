export const TOKEN_KEYS = {
  ACCESS_TOKEN: "ac_token",
  REFRESH_TOKEN: "rf_token",
  ORG_TOKEN: "org_token",
} as const;

export const API_VERSION = "/api";

export const HEADER_KEYS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  X_ORGANIZATION_KEY: "X-Organization-Key",
  NGROK_SKIP_WARNING: "ngrok-skip-browser-warning",
} as const;

export const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
} as const;

export type MethodType = (typeof METHODS)[keyof typeof METHODS];

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000,
} as const;

export const AUTH_CONFIG = {
  LOGIN_ENDPOINT: `${API_VERSION}/auth/login`,
  REFRESH_TOKEN_ENDPOINT: `${API_VERSION}/auth/refresh-token`,
  LOGOUT_ENDPOINT: `${API_VERSION}/auth/logout`,
  ME_ENDPOINT: `${API_VERSION}/users/me`,
} as const;
