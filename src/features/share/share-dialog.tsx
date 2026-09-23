import { Check, Copy, Download, MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatKb } from '@/utils/format.utils'
import { useTranslations, type AppLang } from '@/i18n'
import type { Preview } from './use-snapdom-capture'
import type { ActionFeedback, ShareStatus } from './use-share-feedback'

type ShareDialogProps = {
  lang: AppLang
  open: boolean
  onOpenChange: (open: boolean) => void
  preview: Preview | null
  status: ShareStatus
  feedback: ActionFeedback
  canNativeShare: boolean
  onNativeShare: () => void
  onWhatsApp: () => void
  onCopyImage: () => void
  onDownload: () => void
}

export const ShareDialog = ({
  lang,
  open,
  onOpenChange,
  preview,
  status,
  feedback,
  canNativeShare,
  onNativeShare,
  onWhatsApp,
  onCopyImage,
  onDownload,
}: ShareDialogProps) => {
  const t = useTranslations(lang)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('share.previewTitle')}</DialogTitle>
          <DialogDescription>{t('share.previewDescription')}</DialogDescription>
        </DialogHeader>

        {preview ? (
          <div className="flex flex-col gap-3">
            <img
              src={preview.url}
              alt={t('share.previewTitle')}
              className="h-auto w-full rounded-md border border-border"
            />
            <p className="font-mono text-xs text-muted-foreground">
              PNG · {preview.width}×{preview.height} ·{' '}
              {formatKb(preview.blob.size)}
            </p>
            {/* The native sheet leads when the browser actually supports
                file sharing; where it does not, WhatsApp takes over as the
                primary action instead of leaving a dead button on top. */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={onNativeShare}
                disabled={!canNativeShare}
                variant={canNativeShare ? 'default' : 'secondary'}
              >
                {/* Send, not Share2: the page CTA already owns the
                    share glyph and this is one destination among four. */}
                <Send aria-hidden="true" />
                {t('share.nativeShare')}
              </Button>
              <Button
                type="button"
                variant={canNativeShare ? 'secondary' : 'default'}
                onClick={onWhatsApp}
              >
                <MessageCircle aria-hidden="true" />
                {t('share.whatsapp')}
              </Button>
              <Button type="button" variant="secondary" onClick={onCopyImage}>
                {feedback === 'copied' ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {feedback === 'copied'
                  ? t('share.copied')
                  : t('share.copyImage')}
              </Button>
              <Button type="button" variant="outline" onClick={onDownload}>
                {feedback === 'downloaded' ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Download aria-hidden="true" />
                )}
                {feedback === 'downloaded'
                  ? t('share.downloaded')
                  : t('share.download')}
              </Button>
            </div>
            {/* Every outcome reports inside the dialog. The page-level alert
                sits behind the overlay, so a failure there was invisible. */}
            {status === 'error' ? (
              <p role="alert" className="text-xs text-ember">
                {t('share.error')}
              </p>
            ) : null}
            {feedback === 'text' ? (
              <p role="status" className="text-xs text-muted-foreground">
                {t('share.copyTextFallback')}
              </p>
            ) : null}
            {feedback === 'error' ? (
              <p role="alert" className="text-xs text-ember">
                {t('share.copyError')}
              </p>
            ) : null}
            {canNativeShare ? null : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('share.nativeUnsupported')} {t('share.whatsappHint')}
              </p>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
