// useCardForm.tsx
'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {type HookState, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import type {CardElementOptions} from "@citypay/sdk";
import {useCardElementContext} from "@/CardElementProvider";
import {addApiListeners} from "@/Common";
import {CardElementProps} from "@/CardElement";

export function useCardElement(props: CardElementProps) {

    const elementCtx = useCardElementContext();
    const {status: providerStatus, error: providerError} = useElementsStatus();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const mountedRef = useRef<boolean>(false);

    // const [form, setForm] = useState<any>();
    const [elementsInstance, setElementsInstance] = useState<ElementsInstance | undefined>();
    const [state, setState] = useState<HookState>('el:idle');
    const [error, setError] = useState<Error | string | null>(null);

    useEffect(() => {
        if (providerStatus !== 'cpp:ready') return;

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            if (cancelled) return;

            if (!containerRef.current) throw new Error('No container available')

            const elementOpts: CardElementOptions = {
                ...props,
                identifier: elementCtx.identifier,
                element: containerRef.current
            }

            elementCtx.ensureElement(elementOpts, setState)
                .then(ref => {
                    setElementsInstance(ref);
                })
                .catch((err: unknown) => {
                    props.onError?.(err);
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
            mountedRef.current = false;
            setState("el:idle");
            setError(null);
        };
    }, [providerStatus, providerError, props, elementCtx]);


    useEffect(() => {
        if (!elementsInstance || !window) return;

        const {api} = elementsInstance;

        addApiListeners(api, props)
    }, [elementsInstance])

    const api = useMemo(() => ({
        state,
        error,
    }), [state, error]);

    return {containerRef, ...api};
}
