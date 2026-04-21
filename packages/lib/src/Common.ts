import {ElementsApi, ElementsApiListeners} from "@citypay/sdk";

export function addApiListeners(api: ElementsApi, listeners: ElementsApiListeners) {

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