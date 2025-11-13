import { Button, Heading, Text, toast } from "@medusajs/ui"
import { RouteDrawer, useRouteModal } from "../../../components/modals"
import { useTranslation } from "react-i18next"
import { useMemo, useState, useEffect } from "react"
import {
  useConfirmImportProducts,
  useImportProducts,
} from "../../../hooks/api"
import { UploadImport } from "./components/upload-import"
import { ImportSummary } from "./components/import-summary"
import { Trash } from "@medusajs/icons"
import { FilePreview } from "../../../components/common/file-preview"
import { getProductImportCsvTemplate } from "./helpers/import-template"
import { fetchQuery } from "../../../lib/client"

// Global polling state (prevents duplicate polling)
let activePollInterval: number | null = null

// Global polling function that survives component unmount
const startGlobalPolling = (transactionId: string) => {
  // Stop any existing polling
  if (activePollInterval !== null) {
    clearInterval(activePollInterval)
    activePollInterval = null
  }
  
  let pollCount = 0
  const maxPolls = 150 // 5 minutes max (150 * 2 seconds)
  
  activePollInterval = window.setInterval(async () => {
    pollCount++
    
    try {
      const statusData = await fetchQuery(`/vendor/products/import/${transactionId}/status`, {
        method: "GET",
      })

      if (statusData.status === 'completed') {
        // Stop polling
        if (activePollInterval !== null) {
          clearInterval(activePollInterval)
          activePollInterval = null
        }
        sessionStorage.removeItem('pending_import')

        // Show success message
        const { summary } = statusData
        toast.success('Import completed! 🎉', {
          description: `Successfully imported ${summary.created} of ${summary.total} products. ${summary.errors > 0 ? `${summary.errors} errors occurred.` : ''}`,
          duration: 10000
        })
      } else if (statusData.status === 'failed') {
        // Stop polling
        if (activePollInterval !== null) {
          clearInterval(activePollInterval)
          activePollInterval = null
        }
        sessionStorage.removeItem('pending_import')

        // Show error message
        toast.error('Import failed', {
          description: statusData.error || 'An error occurred during import.',
          duration: 10000
        })
      }
      // If still 'processing', continue polling
    } catch (error: any) {
      // Continue polling on error (might be temporary)
    }
    
    // Safety timeout
    if (pollCount >= maxPolls) {
      if (activePollInterval !== null) {
        clearInterval(activePollInterval)
        activePollInterval = null
      }
      sessionStorage.removeItem('pending_import')
    }
  }, 2000) // Poll every 2 seconds
}

export const ProductImport = () => {
  const { t } = useTranslation()

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("products.import.header")}</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("products.import.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      <ProductImportContent />
    </RouteDrawer>
  )
}

const ProductImportContent = () => {
  const { t } = useTranslation()
  const [filename, setFilename] = useState<string>()

  const { mutateAsync: importProducts, isPending, data } = useImportProducts()
  const { mutateAsync: confirm } = useConfirmImportProducts()
  const { handleSuccess } = useRouteModal()

  const productImportTemplateContent = useMemo(() => {
    return getProductImportCsvTemplate()
  }, [])

  const handleUploaded = async (file: File) => {
    setFilename(file.name)
    await importProducts(
      { file },
      {
        onError: (err) => {
          toast.error(err.message)
          setFilename(undefined)
        },
      }
    )
  }

  const handleConfirm = async () => {
    if (!data?.transaction_id) {
      return
    }

    await confirm(data.transaction_id, {
      onSuccess: (result: any) => {
        toast.success('Import started!', {
          description: result?.message || 'Your products are being imported in the background.',
          duration: 5000
        })
        
        // Store transaction ID for polling (survives component unmount)
        const transactionId = data.transaction_id
        sessionStorage.setItem('pending_import', transactionId)
        
        // Start polling using window.setInterval (survives component unmount)
        startGlobalPolling(transactionId)
        
        // Close modal
        handleSuccess()
      },
      onError: (err) => {
        toast.error(err.message)
      },
    })
  }

  // Check for pending imports on mount
  useEffect(() => {
    const pendingImport = sessionStorage.getItem('pending_import')
    if (pendingImport) {
      startGlobalPolling(pendingImport)
    }
  }, [])

  const uploadedFileActions = [
    {
      actions: [
        {
          label: t("actions.delete"),
          icon: <Trash />,
          onClick: () => setFilename(undefined),
        },
      ],
    },
  ]

  return (
    <>
      <RouteDrawer.Body>
        <Heading level="h2">{t("products.import.upload.title")}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("products.import.upload.description")}
        </Text>

        <div className="mt-4">
          {filename ? (
            <FilePreview
              filename={filename}
              loading={isPending}
              activity={t("products.import.upload.preprocessing")}
              actions={uploadedFileActions}
            />
          ) : (
            <UploadImport onUploaded={handleUploaded} />
          )}
        </div>

        {data?.summary && !!filename && (
          <div className="mt-4">
            {data?.message && data.summary.toUpdate > 0 && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-300 rounded-lg">
                <Heading level="h4" className="mb-1 text-orange-800">⚠️ Existing Products Detected</Heading>
                <Text size="small" className="text-orange-700">
                  {data.message}
                </Text>
              </div>
            )}
            <ImportSummary summary={data?.summary} />
            {data?.errorDetails && data.errorDetails.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Heading level="h4" className="mb-2 text-red-700">Errors Found</Heading>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.errorDetails.map((error: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <Text size="small" weight="plus">Row {error.row}: {error.title || error.sku}</Text>
                      <Text size="xsmall" className="text-red-600">{error.error}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data?.skipped && data.skipped.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Heading level="h4" className="mb-2 text-yellow-700">Skipped Items</Heading>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {data.skipped.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <Text size="small" weight="plus">Row {item.row}: {item.title} ({item.sku})</Text>
                      <Text size="xsmall" className="text-yellow-600">{item.reason}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Heading className="mt-6" level="h2">
          {t("products.import.template.title")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("products.import.template.description")}
        </Text>
        <div className="mt-4">
          <FilePreview
            filename={"product-import-template.csv"}
            url={productImportTemplateContent}
          />
        </div>
      </RouteDrawer.Body>
      <RouteDrawer.Footer>
        <div className="flex items-center gap-x-2">
          <RouteDrawer.Close asChild>
            <Button size="small" variant="secondary">
              {t("actions.cancel")}
            </Button>
          </RouteDrawer.Close>
          <Button
            onClick={handleConfirm}
            size="small"
            disabled={!data?.transaction_id || !filename || isPending}
          >
            {t("actions.import")}
          </Button>
        </div>
      </RouteDrawer.Footer>
    </>
  )
}
