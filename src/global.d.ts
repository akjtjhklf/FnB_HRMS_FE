declare global {
  type BaseResponseAPI<T> = {
    statusCode: number;
    message: string | string[];
    data: T;
    is_success: boolean;
    requestId?: string;
    path?: string;
    timestamp?: string;
  };

  type ResponseAPI<T> = BaseResponseAPI<T>;

  type ListResponseAPI<T> = BaseResponseAPI<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  }>;

  type ListPaginationRequest = {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    filter?: Record<string, Record<string, string[]>>;
    isGetAll?: boolean;
  };
}

export {};
