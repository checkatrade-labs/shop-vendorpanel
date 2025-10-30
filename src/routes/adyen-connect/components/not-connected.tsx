import { ExclamationCircle, CogSixTooth,  } from "@medusajs/icons"
import { Button, Heading, Text } from "@medusajs/ui"
import { useCreateAdyenAccount } from "../../../hooks/api"
import { PaymentProvider } from "../../../types/providers"

export const NotConnected = () => {
  const { mutateAsync, isPending } = useCreateAdyenAccount()

  return (
    <div className="flex items-center justify-center text-center my-32 flex-col">
      <ExclamationCircle />
      <Heading level="h2" className="mt-4">
        Not connected
      </Heading>
      <Text className="text-ui-fg-subtle" size="small">
        Please connect your Adyen account to receive payouts
      </Text>
      <Button
        isLoading={isPending}
        className="mt-4"
        onClick={() =>
          mutateAsync({
            payment_provider_id: PaymentProvider.ADYEN_CONNECT,
            context: {
              legal_name: "Luka LTD Vendor",
              industry_code: "442B",
              phone_number: "+44 330 175 5667",
              country: "GB",
              city: "Liverpool",
              postal_code: "L36 6AN",
              street: "Unit 1 Superstop Building, Wilson Road",
              street2: "",
            },
          })
        }
      >
        <CogSixTooth /> Connect Adyen
      </Button>
    </div>
  )
}
