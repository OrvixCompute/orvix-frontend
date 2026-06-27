import { api } from "../api";
import type { TierResponse } from "@/lib/types/orvix";

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTier: builder.query<TierResponse, void>({
      query: () => "/account/tier",
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTierQuery } = accountApi;
