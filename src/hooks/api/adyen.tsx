import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { FetchError } from "@medusajs/js-sdk"
import { queryKeysFactory } from "../../lib/query-key-factory"

const ADYEN_QUERY_KEY = "adyen" as const
export const adyenQueryKeys = queryKeysFactory(ADYEN_QUERY_KEY)

export const useAdyenAccount = () => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery("/vendor/payout-account", {
        method: "GET",
      }),
    queryKey: [ADYEN_QUERY_KEY, "account"],
  })

  return { ...data, ...rest }
}

export const useCreateAdyenAccount = (
  options?: UseMutationOptions<any, FetchError, any>
) => {
  return useMutation({
    mutationFn: (payload) =>
      fetchQuery("/vendor/payout-account", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [ADYEN_QUERY_KEY, "account"],
      })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useCreateAdyenOnboarding = (
  options?: UseMutationOptions<any, FetchError, any>
) => {
  return useMutation({
    mutationFn: (payload) =>
      fetchQuery("/vendor/payout-account/onboarding", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [ADYEN_QUERY_KEY, "onboarding"],
      })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
