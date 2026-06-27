import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import { config } from "@/lib/constants/config";

/**
 * Base RTK Query API. Specific endpoints are injected by feature api files
 * (e.g. stakingApi) via api.injectEndpoints.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${config.apiUrl}/v1`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "User",
    "ApiKeys",
    "Balance",
    "Transactions",
    "TopupIntents",
    "Jobs",
    "Nodes",
    "Staking",
    "Governance",
  ],
  endpoints: () => ({}),
});
