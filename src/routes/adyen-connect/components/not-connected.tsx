import { zodResolver } from "@hookform/resolvers/zod"
import { CogSixTooth } from "@medusajs/icons"
import { Button, Heading, Text, Input, Select } from "@medusajs/ui"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Form } from "../../../components/common/form"
import { useCreateAdyenAccount } from "../../../hooks/api"
import { useMe } from "../../../hooks/api/users.tsx"
import { countries } from "../../../lib/data/countries"
import {
  industryCodesNoApprovalRequired,
  industryCodesApprovalRequired,
} from "../../../lib/data/industry-codes"
import { PaymentProvider } from "../../../types/providers"

const AdyenConnectSchema = z.object({
  legal_name: z.string().min(1, { message: "Legal name is required" }),
  industry_code: z.string().min(1, { message: "Industry code is required" }),
  phone_number: z.string().min(1, { message: "Phone number is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  city: z.string().min(1, { message: "City is required" }),
  postal_code: z.string().min(1, { message: "Postal code is required" }),
  street: z.string().min(1, { message: "Street address is required" }),
  street2: z.string().optional(),
})

type AdyenConnectSchemaType = z.infer<typeof AdyenConnectSchema>

export const NotConnected = ({ isLoading }: { isLoading: boolean }) => {
  const { mutateAsync, isPending } = useCreateAdyenAccount()
  const { seller, isPending: sellerPending } = useMe()

  // Combine all industry codes
  const allIndustryCodes = [
    ...industryCodesNoApprovalRequired,
    ...industryCodesApprovalRequired,
  ]

  const form = useForm<AdyenConnectSchemaType>({
    resolver: zodResolver(AdyenConnectSchema),
    defaultValues: {
      legal_name: "",
      industry_code: "",
      phone_number: "",
      country: "",
      city: "",
      postal_code: "",
      street: "",
      street2: "",
    },
  })

  // Pre-fill form with seller data
  useEffect(() => {
    if (seller) {
      form.reset({
        legal_name: seller.name || "",
        industry_code: "",
        phone_number: seller.phone || "",
        country: seller.country_code?.toLowerCase() || "",
        city: seller.city || "",
        postal_code: seller.postal_code || "",
        street: seller.address_line || "",
        street2: "",
      })
    }
  }, [seller, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    await mutateAsync({
      payment_provider_id: PaymentProvider.ADYEN_CONNECT,
      context: {
        legal_name: data.legal_name,
        industry_code: data.industry_code,
        phone_number: data.phone_number,
        country: data.country.toUpperCase(),
        city: data.city,
        postal_code: data.postal_code,
        street: data.street,
        street2: data.street2 || "",
      },
    })
  })

  if (sellerPending) {
    return (
      <div className="flex items-center justify-center text-center my-32 flex-col">
        <Text>Loading...</Text>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center my-8 flex-col">
      <Heading level="h2" className="mt-4">
        Not connected
      </Heading>
      <Text className="text-ui-fg-subtle" size="small">
        Please connect your Adyen account to receive payouts
      </Text>

      <Form {...form}>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl mt-8 flex flex-col gap-y-4"
        >
          {/* Legal Name and Phone Number on the same line */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Field
              control={form.control}
              name="legal_name"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>Legal Name</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Enter legal business name" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="phone_number"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="+44 330 175 5667" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
          </div>

          {/* Industry Code on its own line */}
          <Form.Field
            control={form.control}
            name="industry_code"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>Industry Code</Form.Label>
                  <Form.Control>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select an industry code" />
                      </Select.Trigger>
                      <Select.Content>
                        {allIndustryCodes.map((industry) => (
                          <Select.Item key={industry.code} value={industry.code}>
                            {industry.code} - {industry.description}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />

          {/* Country, City, and Postal Code on the same line */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Form.Field
              control={form.control}
              name="country"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>Country</Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select a country" />
                        </Select.Trigger>
                        <Select.Content>
                          {countries.map((country) => (
                            <Select.Item key={country.iso_2} value={country.iso_2}>
                              {country.display_name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="city"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>City</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Enter city" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="postal_code"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>Postal Code</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Enter postal code" />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
          </div>

          {/* Street Address */}
          <Form.Field
            control={form.control}
            name="street"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter street address" />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />

          {/* Street Address 2 (Optional) */}
          <Form.Field
            control={form.control}
            name="street2"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label optional>Street Address 2</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Apartment, suite, etc." />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )
            }}
          />

          <Button
            type="submit"
            isLoading={isPending}
            className="mt-2 w-full"
            disabled={isLoading || sellerPending}
          >
            <CogSixTooth /> Connect Adyen
          </Button>
        </form>
      </Form>
    </div>
  )
}
