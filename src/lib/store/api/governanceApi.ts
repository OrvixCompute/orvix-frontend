import { api } from "../api";
import type { GovernanceSnapshot } from "@/lib/types/orvix";

export const governanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSnapshotUrl: builder.query<GovernanceSnapshot, void>({
      query: () => "/governance/snapshot-url",
      providesTags: ["Governance"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSnapshotUrlQuery } = governanceApi;
