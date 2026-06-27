import { api } from "../api";
import type {
  NetworkStats,
  StakingStatusResponse,
  StakeIntentRequest,
  StakeIntentResponse,
  UnstakeRequest,
  UnstakeResponse,
  BuybackEventInfo,
  BurnEventInfo,
} from "@/lib/types/orvix";

export const stakingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNetworkStats: builder.query<NetworkStats, void>({
      query: () => "/staking/network-stats",
      providesTags: ["Staking"],
    }),
    getStakingStatus: builder.query<StakingStatusResponse, void>({
      query: () => "/staking/status",
      providesTags: ["Staking"],
    }),
    // Returns a memo + treasury address; the user sends ORVX to stake.
    createStakeIntent: builder.mutation<StakeIntentResponse, StakeIntentRequest>({
      query: (body) => ({ url: "/staking/stake-intent", method: "POST", body }),
    }),
    unstake: builder.mutation<UnstakeResponse, UnstakeRequest>({
      query: (body) => ({ url: "/staking/unstake", method: "POST", body }),
      invalidatesTags: ["Staking", "User"],
    }),
    getBuybackHistory: builder.query<BuybackEventInfo[], number | void>({
      query: (limit) => `/staking/buyback-history?limit=${limit ?? 10}`,
      providesTags: ["Staking"],
    }),
    getBurnHistory: builder.query<BurnEventInfo[], number | void>({
      query: (limit) => `/staking/burn-history?limit=${limit ?? 10}`,
      providesTags: ["Staking"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNetworkStatsQuery,
  useGetStakingStatusQuery,
  useCreateStakeIntentMutation,
  useUnstakeMutation,
  useGetBuybackHistoryQuery,
  useGetBurnHistoryQuery,
} = stakingApi;
