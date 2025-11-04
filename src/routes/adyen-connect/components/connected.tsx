import { Badge, Heading, Text } from "@medusajs/ui"
import { CheckCircleSolid, BuildingsSolid, CreditCardSolid, Users } from "@medusajs/icons"
import { PendingVerification } from "./pending-verification"

interface VerificationError {
  code: string
  type: string
  message: string
  capabilities: string[]
  remediatingActions: Array<{
    code: string
    message: string
  }>
}

interface ConnectedProps {
  status: "connected" | "pending" | "not connected"
  adyenAccount?: any
}

export const Connected = ({ status, adyenAccount }: ConnectedProps) => {
  const legalEntity = adyenAccount.data.legal_entity;
  const verificationErrors: VerificationError[] | undefined = legalEntity?.problems?.[0]?.verificationErrors

    console.log(status)

  if (status === "connected") {
    const organization = legalEntity?.organization
    const transferInstruments = legalEntity?.transferInstruments
    const entityAssociations = legalEntity?.entityAssociations || []
    const bankAccount = transferInstruments?.[0]?.accountIdentifier
    const phoneNumber = organization?.phone?.number
    const registrationNumber = organization?.registrationNumber
    
    // Get active capabilities
    const capabilities = legalEntity?.capabilities || {}
    const activeCapabilities = Object.entries(capabilities)
      .filter(([_, capability]: [string, any]) => 
        capability.allowed && capability.verificationStatus === "valid"
      )
      .map(([key]) => key)

    return (
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-3">
          <CheckCircleSolid className="text-green-600 w-8 h-8" />
          <div>
            <Heading level="h2">Account Active</Heading>
            <Text className="text-ui-fg-subtle">
              Your payment account is ready to receive payouts
            </Text>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-ui-border-base p-4">
              <div className="flex items-start gap-x-3">
                <BuildingsSolid className="text-ui-fg-subtle w-5 h-5 mt-0.5" />
                <div className="flex-1">
                  <Text weight="plus" size="small" className="text-ui-fg-subtle">
                    Business Information
                  </Text>
                  <div className="mt-2 space-y-2">
                    <div>
                      <Text size="small" className="text-ui-fg-subtle">Legal Name</Text>
                      <Text>{organization?.legalName}</Text>
                    </div>
                    {registrationNumber && (
                      <div>
                        <Text size="small" className="text-ui-fg-subtle">Registration Number</Text>
                        <Text>{registrationNumber}</Text>
                      </div>
                    )}
                    {phoneNumber && (
                      <div>
                        <Text size="small" className="text-ui-fg-subtle">Phone Number</Text>
                        <Text>{phoneNumber}</Text>
                      </div>
                    )}
                    {organization?.registeredAddress && (
                      <div>
                        <Text size="small" className="text-ui-fg-subtle">Registered Address</Text>
                        <Text size="small">
                          {organization.registeredAddress.street},{" "}
                          {organization.registeredAddress.city},{" "}
                          {organization.registeredAddress.postalCode},{" "}
                          {organization.registeredAddress.country}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {entityAssociations.length > 0 && (
              <div className="rounded-lg border border-ui-border-base p-4">
                <div className="flex items-start gap-x-3">
                  <Users className="text-ui-fg-subtle w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <Text weight="plus" size="small" className="text-ui-fg-subtle mb-3">
                      Associated Individuals
                    </Text>
                    <div className="space-y-3">
                      {entityAssociations.map((association: any, index: number) => (
                        <div key={index} className="flex items-start gap-x-4">
                          <div>
                            <Text size="small">{association.name}:</Text>
                            {association.jobTitle && (
                              <Text size="xsmall" className="text-ui-fg-subtle">
                                {association.jobTitle}
                              </Text>
                            )}
                          </div>
                          <Badge size="xsmall">{association.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {bankAccount && (
              <div className="rounded-lg border border-ui-border-base p-4">
                <div className="flex items-start gap-x-3">
                  <CreditCardSolid className="text-ui-fg-subtle w-5 h-5 mt-0.5" />
                  <div className="flex-1">
                    <Text weight="plus" size="small" className="text-ui-fg-subtle">
                      Bank Account
                    </Text>
                    <Text className="mt-1 font-mono">{bankAccount}</Text>
                  </div>
                </div>
              </div>
            )}

            {activeCapabilities.length > 0 && (
              <div className="rounded-lg border border-ui-border-base p-4">
                <Text weight="plus" size="small" className="text-ui-fg-subtle mb-3">
                  Active Capabilities
                </Text>
                <div className="flex flex-wrap gap-2">
                  {activeCapabilities.map((capability) => (
                    <Badge key={capability} size="xsmall"  color="green">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // For pending status, show the verification component
  if (status === "pending") {
    return <PendingVerification status={status} verificationErrors={verificationErrors} />
  }

  // Fallback for other statuses
  return null
}
