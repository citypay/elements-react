// useCardForm.tsx
'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {type HookState, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import type {CardElementOptions, CpeChangeState, ElementsApi} from "@citypay/sdk";
import {useCardElementContext} from "@/components/CardElementProvider";


// extends CpeChangeState with access to the elements api
export type ChangeState = {
    elements: ElementsApi
} & CpeChangeState

export type CpeFormHandlers = {
    onChange?: (c: ChangeState) => void
    onReady?: (elements: ElementsApi) => void
    onError?: (elements: ElementsApi | null, e: unknown) => void
}

export function useCardElement(
    id: string,
    baseOptions?: Omit<CardElementOptions, 'id' | 'element'>,
    handlers?: CpeFormHandlers
) {

    const elementCtx = useCardElementContext();
    const {status: providerStatus, error: providerError} = useElementsStatus();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const formRef = useRef<ElementsApi | null>(null);
    const handlersRef = useRef<CpeFormHandlers | undefined>(handlers);
    const mountedRef = useRef<boolean>(false);

    // const [form, setForm] = useState<any>();
    const [elementsInstance, setElementsInstance] = useState<ElementsInstance | undefined>();
    const [state, setState] = useState<HookState>('el:idle');
    const [error, setError] = useState<Error | string | null>(null);

    const options = useMemo<CardElementOptions>(() => ({
        id,
        identifier: id,
        ...(baseOptions ?? {}),
        element: `#cp-form-${id}`,
    }), []);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (providerStatus !== 'cpp:ready') {
            console.debug('not ready')
            return;
        }

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            if (cancelled) return;

            const node = containerRef.current;
            // Pass the real HTMLElement if present; otherwise keep the selector and try once on next tick.
            const initOptions = node ? { ...options, element: node } : options;

            elementCtx.ensureElement(initOptions, setState)
                .then(ref => {
                    if (cancelled) {
                        ref.api.destroy?.();
                        return;
                    }
                    formRef.current = ref.api;
                    setElementsInstance(ref);
                })
                .catch((err: unknown) => {
                    handlersRef.current?.onError?.(null, err);
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
    }, [providerStatus, providerError, options, elementCtx]);


    useEffect(() => {
        if (!elementsInstance || !window) return;

        const {opts, api} = elementsInstance;

        if(!opts) {
            throw new Error('No opts provided');
        }

        const {element} = opts as CardElementOptions;
        console.log('>>>> elementsInstance', element)

        if (!element) {
            throw new Error('No element provided');
        }

        api.onChange((changeState: CpeChangeState) => {
            handlersRef.current?.onChange?.({...changeState, elements: api});
        });

    }, [elementsInstance])

    const api = useMemo(() => ({
        state,
        error,
    }), [state, error]);

    console.log('useCardElement', containerRef, api)

    return {containerRef, ...api};
}
