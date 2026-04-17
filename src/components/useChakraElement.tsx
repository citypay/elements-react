'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {type HookState, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import type {ChakraElementOptions} from "@citypay/sdk";
import {type CpeFormHandlers} from "@/components/useCardElement";
import {useChakraElementContext} from "@/components/ChakraElementProvider";

export function useChakraElement(
    id: string,
    baseOptions?: Omit<ChakraElementOptions, 'identifier' | 'element'>,
    handlers?: CpeFormHandlers
) {

    const elementCtx = useChakraElementContext();
    const {status: providerStatus, error: providerError} = useElementsStatus();

    const containerRef = useRef<HTMLDivElement | null>(null);

    const [elementsInstance, setElementsInstance] = useState<ElementsInstance | undefined>();
    const [state, setState] = useState<HookState>('el:idle');
    const [error, setError] = useState<Error | string | null>(null);

    const options = useMemo<ChakraElementOptions>(() => ({
        identifier: id,
        ...(baseOptions ?? {}),
        element: `#cp-form-${id}`,
    }), [id, baseOptions]);

    useEffect(() => {
        if (providerStatus !== 'cpp:ready') return;

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const init = () => {
            if (cancelled) return;

            const node = containerRef.current;
            const initOptions = node ? {...options, element: node as HTMLElement} : options;

            elementCtx.ensureElement(initOptions, setState)
                .then(ref => {
                    setElementsInstance(ref);
                })
                .catch((err: unknown) => {
                    handlers?.onError?.(null, err);
                });
        };

        if (!containerRef.current) {
            timeoutId = setTimeout(init, 0);
        } else {
            init();
        }

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

        if (!opts) {
            throw new Error('No opts provided');
        }

        const {element} = opts as ChakraElementOptions;
        console.log('>>>> chakra elementsInstance', element)

        if (!element) {
            throw new Error('No element provided');
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

    return {containerRef, ...api};
}
