import type {
  AxiosInterceptorManager,
  InternalAxiosRequestConfig,
} from "axios";

import { AUTH_CONFIG, HEADER_KEYS } from "../constants";
import { tokenManager } from "../utils/token-manager";
import { Enum } from "@/configs";
import { DecryptBasic } from "@/utils/hashAes";

export const requestInterceptor = (
  request: AxiosInterceptorManager<InternalAxiosRequestConfig>
) => {
  request.use(
    (config: InternalAxiosRequestConfig) => {
      // Không thêm token cho refresh token endpoint
      if (config.url === AUTH_CONFIG.REFRESH_TOKEN_ENDPOINT) {
        return config;
      }

      const accessToken = tokenManager.getAccessToken();

      if (accessToken) {
        config.headers.set(HEADER_KEYS.AUTHORIZATION, `Bearer ${accessToken}`);
      }

      // Thêm organization key nếu có
      const orgToken = tokenManager.getOrgToken();
      if (orgToken) {
        const orgKey = DecryptBasic(orgToken, Enum.secretKey);
        if (orgKey) {
          config.headers.set(HEADER_KEYS.X_ORGANIZATION_KEY, orgKey);
        }
      }

      // Thêm ngrok header
      config.headers.set(HEADER_KEYS.NGROK_SKIP_WARNING, "true");

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};
