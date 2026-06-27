import { api } from "../api";
import type {
  ApiKeyInfo,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from "@/lib/types/orvix";

export const apiKeysApi = api.injectEndpoints({
  endpoints: (builder) => ({
    listKeys: builder.query<ApiKeyInfo[], void>({
      query: () => "/api-keys",
      providesTags: ["ApiKeys"],
    }),
    createKey: builder.mutation<CreateApiKeyResponse, CreateApiKeyRequest>({
      query: (body) => ({ url: "/api-keys", method: "POST", body }),
      invalidatesTags: ["ApiKeys"],
    }),
    // Issues a new secret for the key; the full key is returned once.
    rotateKey: builder.mutation<CreateApiKeyResponse, string>({
      query: (keyId) => ({ url: `/api-keys/${keyId}/rotate`, method: "POST" }),
      invalidatesTags: ["ApiKeys"],
    }),
    // Soft-revoke: the key remains listed with is_active=false.
    revokeKey: builder.mutation<void, string>({
      query: (keyId) => ({ url: `/api-keys/${keyId}`, method: "DELETE" }),
      invalidatesTags: ["ApiKeys"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListKeysQuery,
  useCreateKeyMutation,
  useRotateKeyMutation,
  useRevokeKeyMutation,
} = apiKeysApi;
