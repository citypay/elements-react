'use client';

import React, {RefObject, useEffect, useMemo, useRef, useState} from 'react';
import {type HookState, useElementInstances, useElements, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import {
    CityPayElements,
    ElementsApiListeners,
    CardFieldsElementOptions,
} from "@citypay/sdk";
import {addApiListeners, splitElementProps} from "@/Common";

export type FieldReferences = {
    csc: RefObject<HTMLElement | null>;
    expiry: RefObject<HTMLElement | null>;
    name: RefObject<HTMLElement | null>;
    pan: RefObject<HTMLElement | null>;
}

export type CreateFieldsComponentProps =
    {fieldReferences: FieldReferences} & Omit<CardFieldsElementOptions, 'cscElement' | 'nameElement' | 'expiryElement' | 'panElement'> & ElementsApiListeners;

/**
 * Create an element, including the element API instance from the SDK and DOM object
 *
 * @param componentProps    Props passed by the developer from the component
 * @returns                 DOM object for the element
 */
export function CardFields(
    componentProps: CreateFieldsComponentProps
) {

    useSdkFieldsElement(componentProps)

    const {status, error}  = useElementsStatus()

    return (
        <>
            {status === 'cpp:initialising' && <>init...</>}
            {status === 'cpp:idle' && <>idle...</>}

            {status === 'cpp:error' && (
                <p className="text-sm">
                    <span>Unable to render CityPay PaymentElement:</span>
                    <span className="text-gray-700">{' ' + error}</span>
                </p>
            )}
        </>
    );
}

/**
 * Create an element API instance from the SDK
 *
 * @param componentProps    Props passed by the developer from the component
 */
function useSdkFieldsElement(
    componentProps: CreateFieldsComponentProps,
) {

    const elements: CityPayElements | null = useElements();
    const elementsInstances = useElementInstances();
    const {status: providerStatus} = useElementsStatus();

    const fieldRefs = componentProps.fieldReferences

    const elementsInstance = useRef<ElementsInstance | undefined>(undefined);
    const [state, setState] = useState<HookState>('el:idle');
    const [error, setError] = useState<Error | string | null>(null);

    const initStartedRef = useRef(false);

    const latestPropsRef = useRef(componentProps);

    const idSafe = useRef<string>(componentProps.identifier ?? 'cardfields');

    const [fieldsReady, setFieldsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let frameId: number | null = null;

        const check = () => {
            if (cancelled) return;

            if (areFieldRefsReady(fieldRefs)) {
                setFieldsReady(true);
                return;
            }

            frameId = requestAnimationFrame(check);
        };

        check();

        return () => {
            cancelled = true;
            if (frameId !== null) cancelAnimationFrame(frameId);
        };
    }, [fieldRefs]);

    useEffect(() => {
        const current = componentProps.identifier ?? 'cardfields';
        if (current !== idSafe.current) {
            throw new Error('"identifier" parameter cannot be changed after mount');
        }
    }, [componentProps.identifier]);

    useEffect(() => {
        latestPropsRef.current = componentProps;
    });

    useEffect(() => {
        if (providerStatus !== 'cpp:ready') return;
        if (!fieldsReady) return;
        if (!elements) return;
        if (initStartedRef.current) return;

        let cancelled = false;

        const existing = elementsInstances.get(idSafe.current);

        if (existing) {
            elementsInstance.current = existing;
            setState('el:ready');
            return;
        }

        const init = async () => {
            if (cancelled) return;

            setState('el:creating');
            setError(null);

            const {nonListenerProps} = splitElementProps(latestPropsRef.current);
            const {fieldReferences, ...sdkOptions} = nonListenerProps;

            const finalOpts: CardFieldsElementOptions = {
                ...sdkOptions,
                identifier: idSafe.current,
                cscElement: fieldRefs.csc.current as HTMLElement,
                expiryElement: fieldRefs.expiry.current as HTMLElement,
                nameElement: fieldRefs.name.current as HTMLElement,
                panElement: fieldRefs.pan.current as HTMLElement,
            } as unknown as CardFieldsElementOptions;

            const elementsApi = elements.cardFieldsElement(finalOpts)

            elementsInstance.current = { api: elementsApi, opts: finalOpts };

            elementsInstances.set(idSafe.current, elementsInstance.current);

            addApiListeners(elementsApi, latestPropsRef);

            await elementsApi.init()
            await elementsApi.awaitReady()

            // Check if this hook was cleaned up before the element was ready
            if (cancelled) {
                elementsApi?.destroy?.();
                return
            }

            setState('el:ready');
        };


        if (initStartedRef.current) return;
        initStartedRef.current = true;

        void init().catch(err => {

            if (cancelled) return; // Cleanup has already been called while waiting

            initStartedRef.current = false;
            const normalized = err instanceof Error ? err : String(err);
            setError(normalized);
            setState('el:error');
            elementsInstances.delete(idSafe.current);
            elementsInstance.current?.api.destroy?.();
            elementsInstance.current = undefined;
            latestPropsRef.current.onError?.(err);
        });

        return () => {
            cancelled = true;
            if (elementsInstance.current && elementsInstance.current.api && elementsInstance.current.api.destroy) {
                elementsInstance.current.api.destroy()
            }
            elementsInstances.delete(idSafe.current);
            elementsInstance.current = undefined;
            initStartedRef.current = false;
            setState("el:idle");
            setError(null);
        };
    }, [providerStatus, fieldsReady, elements, elementsInstances]);

    const api = useMemo(() => ({
        state,
        error,
    }), [state, error]);

    return {idSafe: idSafe.current, ...api};
}

function areFieldRefsReady(fieldRefs: FieldReferences) {
    return Boolean(
        fieldRefs.csc.current &&
        fieldRefs.expiry.current &&
        fieldRefs.name.current &&
        fieldRefs.pan.current
    );
}
