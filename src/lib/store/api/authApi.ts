import { api } from "../api";
import type { ChallengeResponse, User, VerifyResponse } from "@/lib/types/orvix";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getChallenge: builder.query<ChallengeResponse, string>({
      query: (wallet) => `/auth/challenge?wallet=${encodeURIComponent(wallet)}`,
    }),
    verifySignature: builder.mutation<
      VerifyResponse,
      { wallet: string; message: string; signature: string }
    >({
      query: (body) => ({ url: "/auth/verify", method: "POST", body }),
      invalidatesTags: ["Auth", "User"],
    }),
    // Note: /v1/auth/me is a POST endpoint that returns the current user.
    getMe: builder.query<User, void>({
      query: () => ({ url: "/auth/me", method: "POST" }),
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLazyGetChallengeQuery,
  useVerifySignatureMutation,
  useGetMeQuery,
} = authApi;
