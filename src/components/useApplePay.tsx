'use client';

import {SetStateAction, useEffect, useMemo, useRef, useState} from 'react';
import {type HookState, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import type {AltPaymentOptions, CpeChangeState, ElementsApi} from "@citypay/sdk";
import {useApplepayElementContext} from "@/components/ApplepayProvider";


// extends CpeChangeState with access to the elements api
export type ChangeState = {
    elements: ElementsApi
} & CpeChangeState

export type CpeApplePayHandlers = {
    // onChange?: (c: ChangeState) => void
    // onReady?: (elements: ElementsApi) => void
    onAuthoriseEnd?: (elements: ElementsApi) => void
    onError?: (elements: ElementsApi | null, e: unknown) => void
}

export function useApplepayElement(
    options: AltPaymentOptions,
    handlers?: CpeApplePayHandlers
) {

    const elementsRef = useApplepayElementContext();
    const {status: providerStatus, error: providerError} = useElementsStatus();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const formRef = useRef<any | null>(null);
    const mountedRef = useRef<boolean>(false);

    const [elementsInstance, setElementsInstance] = useState<ElementsInstance | undefined>();
    const [state, setState] = useState<HookState>('el:idle');
    const [error, setError] = useState<Error | string | null>(null);

    useEffect(() => {
        if (providerStatus !== 'cpp:ready') return;

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            if (cancelled) return;

            elementsRef.ensureElement(options, setState)
                .then((ref: SetStateAction<ElementsInstance | undefined>) => {
                    setElementsInstance(ref);
                })
                .catch((err: unknown) => {
                    handlers?.onError?.(null, err);
                });
        };

        if (!containerRef.current) {
            // Defer until after the ref attaches (commit phase)
            timeoutId = setTimeout(init, 0);
        } else {
            init();
        }

        // void createAndMount();
        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
            try {
                formRef.current?.unmount?.();
                formRef.current?.destroy?.();
            } catch {
            }
            mountedRef.current = false;
            formRef.current = null;
            setState("el:idle");
            setError(null);
        };
    }, [providerStatus, providerError, options, elementsRef]);

    useEffect(() => {
        if (!elementsInstance || !window) return;

        const {opts, api} = elementsInstance;
        const {element} = opts;
        console.log('>>>> elementsInstance', element)

        if (!element) {
            throw new Error('No element provided');
        }

        if (handlers?.onAuthoriseEnd) {
            api.onAuthoriseEnd(handlers?.onAuthoriseEnd)
        }

    }, [elementsInstance])

    const api = useMemo(() => ({
        state,
        error,
    }), [state, error]);

    return {containerRef, ...api};
}
