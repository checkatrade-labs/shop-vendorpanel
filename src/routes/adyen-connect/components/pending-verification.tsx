import { Button, Heading, Text } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { useCreateAdyenOnboarding } from "../../../hooks/api"
import { PaymentProvider } from "../../../types/providers"

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

interface PendingVerificationProps {
    verificationErrors?: VerificationError[]
}

export const PendingVerification = ({
    verificationErrors,
}: PendingVerificationProps) => {
    const { mutateAsync, isPending } = useCreateAdyenOnboarding()

    const hostname = window.location.href

    const handleContinueOnboarding = async () => {
        try {
            const { payout_account } = await mutateAsync({
                payment_provider_id: PaymentProvider.ADYEN_CONNECT,
                context: {
                    refresh_url: hostname,
                    return_url: hostname,
                },
            })
            window.location.replace(payout_account.onboarding.data.url)
        } catch {
            window.location.reload()
        }
    }

    if (!verificationErrors || verificationErrors.length === 0) {
        return (
            <div className="flex items-center justify-center text-center my-32 flex-col gap-y-4">
                <CheckCircleSolid className="text-green-600 mx-auto" />
                <div className="flex flex-col gap-y-2">
                    <Heading level="h2">Setup Complete</Heading>
                    <Text className="text-ui-fg-subtle">
                        Your account verification is complete
                    </Text>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-2">
                <Heading level="h2">Complete Your Setup</Heading>
                <Text className="text-ui-fg-subtle">
                    Please complete the following items to activate your account
                </Text>
            </div>

            <div className="flex flex-col gap-y-2">
                {verificationErrors.map((error, index) => {
                    return (
                        <div
                            key={error.code}
                            className="flex items-start gap-x-3 p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle"
                        >
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ui-border-strong text-ui-fg-muted">
                                <Text size="xsmall">{index + 1}</Text>
                            </div>
                            <div className="flex flex-col gap-y-0.5 flex-1">
                                <Text weight="plus">{error.message}</Text>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="flex items-center justify-end pt-2">
                <Button onClick={handleContinueOnboarding} isLoading={isPending}>
                    Continue Setup
                </Button>
            </div>
        </div>
    )
}

