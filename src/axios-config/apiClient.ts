import type { AxiosInstance } from "axios";
import axios from "axios";

import { HEADER_KEYS } from "./constants";
import { requestInterceptor } from "./interceptors/request.interceptor";
import { responseInterceptor } from "./interceptors/response.interceptor";

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  timeout: 30000,
  withCredentials: true, // Tắt vì dùng CookieUtil manual
  headers: {
    [HEADER_KEYS.CONTENT_TYPE]: "application/json",
  },
});

requestInterceptor(axiosClient.interceptors.request);
responseInterceptor(axiosClient.interceptors.response, axiosClient);

export default axiosClient;
