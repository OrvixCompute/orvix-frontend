import { api } from "../api";
import type {
  BalanceResponse,
  TransactionInfo,
  TopupIntentRequest,
  TopupIntentResponse,
  TopupIntentInfo,
} from "@/lib/types/orvix";

export const billingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBalance: builder.query<BalanceResponse, void>({
      query: () => "/billing/balance",
      providesTags: ["Balance"],
    }),
    getTransactions: builder.query<TransactionInfo[], { limit?: number; offset?: number } | void>({
      query: (args) => {
        const limit = args?.limit ?? 10;
        const offset = args?.offset ?? 0;
        return `/billing/transactions?limit=${limit}&offset=${offset}`;
      },
      providesTags: ["Transactions"],
    }),
    // Creates a unique memo the user attaches to their USDC transfer.
    createTopupIntent: builder.mutation<TopupIntentResponse, TopupIntentRequest>({
      query: (body) => ({ url: "/billing/topup-intent", method: "POST", body }),
      invalidatesTags: ["TopupIntents"],
    }),
    listTopupIntents: builder.query<TopupIntentInfo[], void>({
      query: () => "/billing/topup-intents",
      providesTags: ["TopupIntents"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBalanceQuery,
  useGetTransactionsQuery,
  useCreateTopupIntentMutation,
  useListTopupIntentsQuery,
} = billingApi;
