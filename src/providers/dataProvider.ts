import { DataProvider } from "@refinedev/core";
import apiClient from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const dataProvider = (apiUrl: string = API_URL): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `/${resource}`;

    const page = (pagination as any)?.current ?? 1;
    const limit = (pagination as any)?.pageSize ?? 10;

    const params: any = {
      page,
      limit,
    };

    // Handle filters
    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter) {
          params[`filter[${filter.field}]`] = filter.value;
        }
      });
    }

    // Handle sorters
    if (sorters && sorters.length > 0) {
      const sortField = sorters[0].field;
      const sortOrder = sorters[0].order === "asc" ? "" : "-";
      params.sort = `${sortOrder}${sortField}`;
    }

    const response = await apiClient.get(url, { params });
    const data = response.data;

    // BE returns: { success: true, data: [...], meta: { total, page, limit, totalPages } }
    return {
      data: data.data || [],
      total: data.meta?.total || data.data?.length || 0,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `/${resource}/${id}`;
    const response = await apiClient.get(url);
    const data = response.data;

    // BE returns: { success: true, data: {...} }
    return {
      data: data.data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `/${resource}`;
    const response = await apiClient.post(url, variables);
    const data = response.data;

    return {
      data: data.data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `/${resource}/${id}`;
    const response = await apiClient.put(url, variables);
    const data = response.data;

    return {
      data: data.data,
    };
  },

  deleteOne: async ({ resource, id, meta }) => {
    const url = `/${resource}/${id}`;
    const response = await apiClient.delete(url);
    const data = response.data;

    return {
      data: data.data,
    };
  },

  getApiUrl: () => apiUrl,

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = url.startsWith("/") ? url : `/${url}`;

    const response = await apiClient({
      url: requestUrl,
      method,
      data: payload,
      params: query,
      headers,
    });

    return {
      data: response.data?.data || response.data,
    };
  },
});
