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
  LOGIN_ENDPOINT: `/auth/login`,
  REFRESH_TOKEN_ENDPOINT: `/auth/refresh-token`,
  LOGOUT_ENDPOINT: `/auth/logout`,
  ME_ENDPOINT: `/users/me`,
} as const;

export const ANALYTICS_ENDPOINTS = {
  OVERVIEW: `/analytics/overview`,
  EMPLOYEES: `/analytics/employees`,
  ATTENDANCE: `/analytics/attendance`,
  SCHEDULE: `/analytics/schedule`,
  SALARY: `/analytics/salary`,
  TRENDS: `/analytics/trends`,
  COMPARISON: `/analytics/comparison`,
  PERFORMANCE_RANKING: `/analytics/performance-ranking`,
  EXPORT: `/analytics/export`,
} as const;
