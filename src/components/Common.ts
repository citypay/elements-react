import { ElementsApi } from "@citypay/sdk";

export interface CpeApiEventListeners {
    onChange?: (cs: any) => void
    onAttention?: () => void
    onReady?: () => void
    onProcessingStart?: () => void
    onProcessingEnd?: () => void
    onAuthoriseStart?: () => void
    onAuthoriseEnd?: () => void
    onError?: (err: unknown) => void
    onTokeniseEnd?: () => void
}

export function addApiListeners(api: ElementsApi, listeners?: CpeApiEventListeners) {
    if (!listeners) {
        return
    }

    console.debug('[citypay] Adding API listeners')

    if (listeners.onChange) {
        api.onChange(listeners.onChange)
    }

    if (listeners.onAttention) {
        api.onAttention(listeners.onAttention)
    }

    if (listeners.onReady) {
        api.onReady(listeners.onReady)
    }

    if (listeners.onProcessingStart) {
        api.onProcessingStart(listeners.onProcessingStart)
    }

    if (listeners.onProcessingEnd) {
        api.onProcessingEnd(listeners.onProcessingEnd)
    }

    if (listeners.onAuthoriseStart) {
        api.onAuthoriseStart(listeners.onAuthoriseStart)
    }

    if (listeners.onAuthoriseEnd) {
        api.onAuthoriseEnd(listeners.onAuthoriseEnd)
    }

    if (listeners.onError) {
        api.onError(listeners.onError)
    }

    if (listeners.onTokeniseEnd) {
        api.onTokeniseEnd(listeners.onTokeniseEnd)
    }
}