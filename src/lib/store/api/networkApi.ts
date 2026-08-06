import { api } from "../api";
import type { ComputeStats } from "@/lib/types/orvix";

export const networkApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Public, no auth. The server caches the response for 30s, except
    // nodes.online which is read live from the websocket registry.
    getComputeStats: builder.query<ComputeStats, void>({
      query: () => "/network/stats",
      providesTags: ["Nodes"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetComputeStatsQuery } = networkApi;
