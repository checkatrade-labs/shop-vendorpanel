import { Container, Heading, Text } from "@medusajs/ui"
import { NotConnected } from "./components/not-connected"
import { useAdyenAccount } from "../../hooks/api"
import { Status } from "./components/status"
import { Connected } from "./components/connected"
import { PaymentProvider } from "../../types/providers"

const getStatus = (payout_account: any) => {
  return payout_account?.status ?? "not connected"
}

export const AdyenConnect = () => {
  const response = useAdyenAccount();


  const adyen = response.payout_accounts?.find((account: any) => account.payment_provider_id === PaymentProvider.ADYEN_CONNECT);

  console.log("response", JSON.stringify(adyen, null, 2))


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
          <NotConnected />
        ) : (
          <Connected status={getStatus(adyen)} />
        )}
      </div>
    </Container>
  )
}
