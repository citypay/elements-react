'use client';

import {SetStateAction, useEffect, useMemo, useRef, useState} from 'react';
import {type HookState, useElementsStatus} from '@/CityPayProvider';
import type {ElementsInstance} from '@/CityPayProvider';
import {useApplepayElementContext} from "@/ApplepayProvider";
import {ApplepayElementProps} from "@/ApplepayElement";
import {addApiListeners} from "@/Common";

export function useApplepayElement(props: ApplepayElementProps) {

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

            elementsRef.ensureElement(props, setState)
                .then((ref: SetStateAction<ElementsInstance | undefined>) => {
                    setElementsInstance(ref);
                })
                .catch((err: unknown) => {
                    props?.onError?.(null, err);
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
    }, [providerStatus, providerError, props, elementsRef]);

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
