import { AxiosError } from "axios";

export const createErrorResponse = (error: AxiosError): BaseResponseAPI<null> => {
  if (!error.response) {
    return {
      statusCode: 0,
      message: ["Network error. Please check your connection."],
      data: null,
      is_success: false,
      requestId: error.request?.responseURL,
      path: error.config?.url,
      timestamp: new Date().toISOString(),
    };
  }

  return error.response.data as BaseResponseAPI<null>;
};
