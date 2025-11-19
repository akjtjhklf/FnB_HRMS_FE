"use client";

import { DataProvider } from "@refinedev/core";
import axiosClient from "@/axios-config/apiClient";

export const dataProvider = (apiUrl: string): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `/${resource}`;

    // Refine v5 pagination API
    const current = (pagination as any)?.current ?? (pagination as any)?.page ?? 1;
    const pageSize = (pagination as any)?.pageSize ?? (pagination as any)?.limit ?? 10;

    const params: any = {
      page: current,
      limit: pageSize,
    };

    // Handle filters
    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter && filter.field && filter.value !== undefined) {
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

    try {
      const response = await axiosClient.get<ListResponseAPI<any>>(url, { params });
      const data = response.data;

      // BE returns: { statusCode, message, data: { items, total, page, limit, total_pages }, is_success }
      return {
        data: data.data?.items || [],
        total: data.data?.total || 0,
      };
    } catch (error: any) {
      console.error("getList error:", error);
      throw error;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `/${resource}/${id}`;

    try {
      const response = await axiosClient.get<ResponseAPI<any>>(url);
      const data = response.data;

      // BE returns: { statusCode, message, data: {...}, is_success }
      return {
        data: data.data,
      };
    } catch (error: any) {
      console.error("getOne error:", error);
      throw error;
    }
  },

  create: async ({ resource, variables, meta }) => {
    const url = `/${resource}`;

    try {
      const response = await axiosClient.post<ResponseAPI<any>>(url, variables);
      const data = response.data;

      return {
        data: data.data,
      };
    } catch (error: any) {
      console.error("create error:", error);
      throw error;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `/${resource}/${id}`;

    try {
      const response = await axiosClient.patch<ResponseAPI<any>>(url, variables);
      const data = response.data;

      return {
        data: data.data,
      };
    } catch (error: any) {
      console.error("update error:", error);
      throw error;
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    const url = `/${resource}/${id}`;

    try {
      const response = await axiosClient.delete<ResponseAPI<any>>(url);
      const data = response.data;

      return {
        data: data.data,
      };
    } catch (error: any) {
      console.error("deleteOne error:", error);
      throw error;
    }
  },

  getApiUrl: () => apiUrl,

  custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
    let requestUrl = url.startsWith("/") ? url : `/${url}`;

    try {
      const response = await axiosClient({
        url: requestUrl,
        method,
        data: payload,
        params: query,
        headers,
      });

      return {
        data: response.data?.data || response.data,
      };
    } catch (error: any) {
      console.error("custom error:", error);
      throw error;
    }
  },
});
