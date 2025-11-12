import { Container, Heading, Text } from "@medusajs/ui"
import { NotConnected } from "./components/not-connected"
import { useAdyenAccount } from "../../hooks/api"
import { Status } from "./components/status"
import { Connected } from "./components/connected"
import { PaymentProvider } from "../../types/providers"
import { Skeleton } from "../../components/common/skeleton"

const getStatus = (payout_account: any) => {

  switch (payout_account?.status) {
    case "pending":
      return "pending"
    case "active":
      return "connected"
    default:
      return "not connected"
  }
}

export const AdyenConnect = () => {
  const response = useAdyenAccount();

  console.log(response.isLoading)

  const adyen = response.payout_accounts?.find((account: any) => account.payment_provider_id === PaymentProvider.ADYEN_CONNECT);

  if (response.isLoading) {
    return (
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Adyen Connect</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Connect Adyen to receive automatic payouts from the marketplace
            </Text>
          </div>
          <div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-col gap-y-4 items-center justify-center">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Adyen Connect</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Connect Adyen to receive automatic payouts from the marketplace
          </Text>
        </div>
        <div>
          <Status status={getStatus(adyen)} />
        </div>
      </div>
      <div className="px-6 py-4">
        {!adyen ? (
          <NotConnected isLoading={response.isLoading} />
        ) : (
          <Connected status={getStatus(adyen)} adyenAccount={adyen} />
        )}
      </div>
    </Container>
  )
}
