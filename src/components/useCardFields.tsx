'use client';

import {RefObject, useEffect, useMemo, useState} from 'react';
import {type HookState, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import {CardFieldsElementOptions} from "@citypay/sdk";
import {useCardFieldsContext} from "@/components/CardFieldsProvider";
import {CpeFormHandlers} from "@/components/useCardElement";

export type FieldsReferences = {
    csc: RefObject<HTMLElement | null>;
    expiry: RefObject<HTMLElement | null>;
    name: RefObject<HTMLElement | null>;
    pan: RefObject<HTMLElement | null>;
}

export function useCardFields(
    refs: FieldsReferences,
    options: CardFieldsElementOptions,
    handlers?: CpeFormHandlers
) {

    const elementCtx = useCardFieldsContext();
    const {status: providerStatus, error: providerError} = useElementsStatus();

    const [elementsInstance, setElementsInstance] = useState<ElementsInstance | undefined>();
    const [state, setState] = useState<HookState>('el:idle');
    const [error, setError] = useState<Error | string | null>(null);

    useEffect(() => {
        if (providerStatus !== 'cpp:ready') return;

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            if (cancelled) return;

            const optsWithElements: CardFieldsElementOptions = {
                ...options,
                cscElement: refs.csc.current as HTMLElement,
                expiryElement: refs.expiry.current as HTMLElement,
                nameElement: refs.name.current as HTMLElement,
                panElement: refs.pan.current as HTMLElement,
            }

            elementCtx.ensureElement(optsWithElements, setState)
                .then(ref => {
                    setElementsInstance(ref);
                })
                .catch((err: unknown) => {
                    handlers?.onError?.(null, err);
                });
        };

        if (!(Object.values(refs).every(r => r.current !== null))){
            // Defer until after the ref attaches (commit phase)
            timeoutId = setTimeout(init, 0);
        } else {
            init();
        }

        // void createAndMount();
        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
            setState("el:idle");
            setError(null);
        };
    }, [providerStatus, providerError, options, elementCtx, handlers]);


    useEffect(() => {
        if (!elementsInstance || !window) return;

        const {opts, api} = elementsInstance;

        if(!opts) {
            throw new Error('No opts provided');
        }

        if (handlers?.onChange) {
            api.onChange(handlers.onChange);
        }
        if (handlers?.onReady) {
            api.onReady(handlers.onReady)
        }
        if (handlers?.onError) {
            api.onError(handlers.onError)
        }

    }, [elementsInstance, handlers?.onChange, handlers?.onError, handlers?.onReady])

    const api = useMemo(() => ({
        state,
        error,
    }), [state, error]);

    return {...api};
}
