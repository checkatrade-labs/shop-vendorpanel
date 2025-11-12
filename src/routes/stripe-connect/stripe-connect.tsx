import { Container, Heading, Text } from "@medusajs/ui"
import { NotConnected } from "./components/not-connected"
import { useStripeAccount } from "../../hooks/api"
import { Status } from "./components/status"
import { Connected } from "./components/connected"
import { PaymentProvider } from "../../types/providers"

const getStatus = (payout_account: any) => {
  if (!payout_account) return "not connected"

  if (!payout_account?.onboarding) return "pending"

  return "connected"
}

export const StripeConnect = () => {
  const response = useStripeAccount()

  const stripe = response.payout_accounts?.find((account: any) => account.payment_provider_id === PaymentProvider.STRIPE_CONNECT);

  console.log("stripe", stripe)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Stripe Connect</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Connect Stripe to receive automatic payouts from the marketplace
          </Text>
        </div>
        <div>
          <Status status={getStatus(stripe)} />
        </div>
      </div>
      <div className="px-6 py-4">
        {!stripe ? (
          <NotConnected />
        ) : (
          <Connected status={getStatus(stripe)} />
        )}
      </div>
    </Container>
  )
}
