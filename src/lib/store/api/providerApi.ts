import { api } from "../api";
import type {
  ProviderEarnings,
  ProviderNode,
  ProviderNodeDetail,
  ProviderSecret,
  WithdrawRequest,
  WithdrawResponse,
  WithdrawalRecord,
} from "@/lib/types/provider";

/**
 * /v1/provider/* — everything a GPU owner needs: credentials for the node
 * agent, their nodes, what they earned, and getting paid.
 *
 * All of it authenticates with the session JWT, which the base query attaches.
 */
export const providerApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Opt in as a provider and receive a node secret. The secret is returned
     * once and stored only as a hash — calling this again issues a new one and
     * invalidates the old, so it doubles as a rotation.
     */
    registerProvider: builder.mutation<ProviderSecret, { display_name?: string } | void>({
      query: (body) => ({ url: "/provider/register", method: "POST", body: body ?? {} }),
      invalidatesTags: ["Nodes", "ProviderEarnings", "User"],
    }),

    /** Rotate the node secret. Any node still using the old one drops at its next reconnect. */
    regenerateSecret: builder.mutation<ProviderSecret, void>({
      query: () => ({ url: "/provider/regenerate-secret", method: "POST" }),
    }),

    listNodes: builder.query<ProviderNode[], void>({
      query: () => "/provider/nodes",
      providesTags: ["Nodes"],
    }),

    getNode: builder.query<ProviderNodeDetail, string>({
      query: (nodeId) => `/provider/nodes/${nodeId}`,
      providesTags: (_result, _error, nodeId) => [{ type: "Nodes", id: nodeId }],
    }),

    renameNode: builder.mutation<{ id: string; name: string }, { nodeId: string; name: string }>({
      query: ({ nodeId, name }) => ({
        url: `/provider/nodes/${nodeId}/rename`,
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Nodes"],
    }),

    /** Marks the node offline and asks the agent to shut down. Returns 204. */
    deleteNode: builder.mutation<void, string>({
      query: (nodeId) => ({ url: `/provider/nodes/${nodeId}`, method: "DELETE" }),
      invalidatesTags: ["Nodes"],
    }),

    getEarnings: builder.query<ProviderEarnings, void>({
      query: () => "/provider/earnings",
      providesTags: ["ProviderEarnings"],
    }),

    /** Queues a real Solana payout. Guard the amount before calling. */
    withdraw: builder.mutation<WithdrawResponse, WithdrawRequest>({
      query: (body) => ({ url: "/provider/withdraw", method: "POST", body }),
      invalidatesTags: ["ProviderEarnings", "Withdrawals"],
    }),

    listWithdrawals: builder.query<WithdrawalRecord[], number | void>({
      query: (limit) => `/provider/withdrawals?limit=${limit ?? 50}`,
      providesTags: ["Withdrawals"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useRegisterProviderMutation,
  useRegenerateSecretMutation,
  useListNodesQuery,
  useGetNodeQuery,
  useRenameNodeMutation,
  useDeleteNodeMutation,
  useGetEarningsQuery,
  useWithdrawMutation,
  useListWithdrawalsQuery,
} = providerApi;
