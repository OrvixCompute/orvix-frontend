import { api } from "../api";
import type { TierResponse, QuotaResponse } from "@/lib/types/orvix";

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTier: builder.query<TierResponse, void>({
      query: () => "/account/tier",
      providesTags: ["User"],
    }),
    getQuota: builder.query<QuotaResponse, void>({
      query: () => "/account/quota",
      providesTags: ["Quota"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTierQuery, useGetQuotaQuery } = accountApi;
