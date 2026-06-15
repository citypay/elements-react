import {ElementsApi, ElementsApiListeners} from "@citypay/sdk";
import {RefObject} from "react";

export type ListenerProps<T> = {
    [K in keyof T as K extends `on${string}` ? K : never]: T[K];
};

export type NonListenerProps<T> = {
    [K in keyof T as K extends `on${string}` ? never : K]: T[K];
};

/**
 * Split a set of props into two groups: those that are listeners (with an 'on' prefix) and those that are not.
 */
export function splitElementProps<T extends Record<string, unknown>>(props: T) {
    const listeners: Partial<ListenerProps<T>> = {};
    const options: Partial<NonListenerProps<T>> = {};

    for (const [key, value] of Object.entries(props) as Array<[keyof T, T[keyof T]]>) {
        if (typeof key === 'string' && key.startsWith('on')) {
            listeners[key as keyof ListenerProps<T>] = value as ListenerProps<T>[keyof ListenerProps<T>];
        } else {
            options[key as keyof NonListenerProps<T>] = value as NonListenerProps<T>[keyof NonListenerProps<T>];
        }
    }

    return {
        // @ts-ignore
        listeners: listeners as ListenerProps<T>,
        // @ts-ignore
        nonListenerProps: options as NonListenerProps<T>,
    };
}

export function addApiListeners(api: ElementsApi, listeners: RefObject<ElementsApiListeners>) {

    console.debug('[citypay] Adding API listeners')

    if (listeners.current.onChange) {
        api.onChange(listeners.current.onChange)
    }

    if (listeners.current.onAttention) {
        api.onAttention(listeners.current.onAttention)
    }

    if (listeners.current.onReady) {
        api.onReady(listeners.current.onReady)
    }

    if (listeners.current.onProcessingStart) {
        api.onProcessingStart(listeners.current.onProcessingStart)
    }

    if (listeners.current.onProcessingEnd) {
        api.onProcessingEnd(listeners.current.onProcessingEnd)
    }

    if (listeners.current.onAuthoriseStart) {
        api.onAuthoriseStart(listeners.current.onAuthoriseStart)
    }

    if (listeners.current.onAuthoriseEnd) {
        api.onAuthoriseEnd(listeners.current.onAuthoriseEnd)
    }

    if (listeners.current.onError) {
        api.onError(listeners.current.onError)
    }

    if (listeners.current.onTokeniseEnd) {
        api.onTokeniseEnd(listeners.current.onTokeniseEnd)
    }
}