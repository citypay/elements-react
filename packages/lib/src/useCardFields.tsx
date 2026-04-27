'use client';

import {RefObject, useEffect, useMemo, useState} from 'react';
import {type HookState, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import {CardFieldsElementOptions} from "@citypay/sdk";
import {useCardFieldsContext} from "@/CardFieldsProvider";
import {addApiListeners} from "@/Common";
import {CardFieldsProps} from "@/CardFields";

export type FieldsReferences = {
    csc: RefObject<HTMLElement | null>;
    expiry: RefObject<HTMLElement | null>;
    name: RefObject<HTMLElement | null>;
    pan: RefObject<HTMLElement | null>;
}

export function useCardFields(props: CardFieldsProps) {

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
                ...props,
                identifier: elementCtx.identifier,
                cscElement: props.refs.csc.current as HTMLElement,
                expiryElement: props.refs.expiry.current as HTMLElement,
                nameElement: props.refs.name.current as HTMLElement,
                panElement: props.refs.pan.current as HTMLElement,
            }

            elementCtx.ensureElement(optsWithElements, setState)
                .then(ref => {
                    setElementsInstance(ref);
                })
                .catch((err: unknown) => {
                    props?.onError?.(err);
                });
        };

        if (!(Object.values(props.refs).every(r => r.current !== null))){
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

    return {...api};
}
