"use client";

import { DataProvider } from "@refinedev/core";
import axiosClient from "@/axios-config/apiClient";

export const dataProvider = (apiUrl: string): DataProvider => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `/${resource}`;

    // Check if pagination mode is "off" - fetch all data
    const paginationMode = (pagination as any)?.mode;
    const isPaginationOff = paginationMode === "off";

    // Refine v5 pagination API - support multiple field names
    const current =
      (pagination as any)?.currentPage ?? 
      (pagination as any)?.current ?? 
      (pagination as any)?.page ?? 1;
    const pageSize =
      (pagination as any)?.pageSize ?? (pagination as any)?.limit ?? 10;

    const params: any = {};

    // Only add pagination params if pagination is enabled
    if (!isPaginationOff) {
      params.page = current;
      params.limit = pageSize;
    } else {
      // When pagination is off, set limit to -1 to get all records
      params.limit = -1;
    }

    // Handle filters
    if (filters) {
      filters.forEach((filter) => {
        if ("field" in filter && filter.field && filter.value !== undefined) {
          // Special handling for "search" field - send as direct search param
          if (filter.field === "search") {
            params.search = filter.value;
          } else {
            params[`filter[${filter.field}]`] = filter.value;
          }
        }
      });
    }

    // Handle sorters
    if (sorters && sorters.length > 0) {
      const sortField = sorters[0].field;
      const sortOrder = sorters[0].order === "asc" ? "" : "-";
      params.sort = `${sortOrder}${sortField}`;
    }

    // Handle meta.fields - for Directus field selection
    if (meta?.fields && Array.isArray(meta.fields)) {
      params.fields = meta.fields.join(',');
    }

    try {
      const response = await axiosClient.get<ListResponseAPI<any>>(url, {
        params,
      });
      const data = response.data;

      console.log(`[DataProvider] getList ${resource}:`, {
        responseData: data,
        items: data.data?.items,
        total: data.data?.total,
      });

      // BE returns: { statusCode, message, data: { items, total, page, limit, total_pages }, is_success }
      // Or wrapped in success: { success: true, data: {...}, message }
      // Or direct array: { success: true, data: [...], message }
      const actualData =
        (data as any).success !== undefined ? (data as any).data : data.data;

      // Handle both formats: actualData can be { items: [...], total: N } or just [...]
      let items: any[];
      let total: number;

      if (Array.isArray(actualData)) {
        // Direct array format: { data: [...] }
        items = actualData;
        total = actualData.length;
      } else if (actualData?.items) {
        // Object format: { data: { items: [...], total: N } }
        items = actualData.items;
        total = actualData.total || actualData.items.length;
      } else {
        // Fallback
        items = [];
        total = 0;
      }

      return {
        data: items,
        total: total,
        // ⚠️ Quan trọng: cần để refine hiểu pagination
        meta: {
          current: actualData?.page ?? current,
          pageSize: actualData?.limit ?? pageSize,
          totalPages: actualData?.total_pages,
        },
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
      const response = await axiosClient.patch<ResponseAPI<any>>(
        url,
        variables
      );
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

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
  }) => {
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
