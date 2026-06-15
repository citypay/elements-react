'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {type HookState, useElementInstances, useElements, useElementsStatus} from './CityPayProvider';
import type {ElementsInstance} from './CityPayProvider';
import {CityPayElements, MonoFrameElementOptions, ElementsApiListeners, ElementsApi} from "@citypay/sdk";
import {addApiListeners, splitElementProps} from "@/Common";

export type CreateElementComponentProps<TSdkOpts extends MonoFrameElementOptions> = { visible?: boolean; } & Omit<TSdkOpts, 'element'> & ElementsApiListeners;

export type CreateElementFunctionProps<TSdkOpts extends MonoFrameElementOptions> = {
    defaultName: string,
    elementFactory: (opts: TSdkOpts, elements: CityPayElements) => ElementsApi,
}

/**
 * @param componentProps    Props passed by the developer from the component
 * @param functionProps     'Configuration' props that allow this function to create a particular element type
 */
export function createElement<TSdkOpts extends MonoFrameElementOptions>(
    componentProps: CreateElementComponentProps<TSdkOpts>,
    functionProps: CreateElementFunctionProps<TSdkOpts>,
) {

    const elements: CityPayElements | null = useElements();
    const elementsInstances = useElementInstances();
    const {status: providerStatus} = useElementsStatus();

    const containerRef = useRef<HTMLDivElement | null>(null);

    const elementsInstance = useRef<ElementsInstance | undefined>(undefined);
    const [state, setState] = useState<HookState>('el:idle');
    const [error, setError] = useState<Error | string | null>(null);

    const initStartedRef = useRef(false);

    const latestPropsRef = useRef(componentProps);

    const idSafe = useRef<string>(componentProps.identifier ?? functionProps.defaultName);

    useEffect(() => {
        const current = componentProps.identifier ?? functionProps.defaultName;
        if (current !== idSafe.current) {
            throw new Error('"identifier" parameter cannot be changed after mount');
        }
    }, [componentProps.identifier]);

    useEffect(() => {
        latestPropsRef.current = componentProps;
    });

    useEffect(() => {
        if (providerStatus !== 'cpp:ready') return;

        let cancelled = false;

        const existing = elementsInstances.get(idSafe.current);

        if (existing) {
            elementsInstance.current = existing;
            setState('el:ready');
            return;
        }

        const init = async () => {
            if (cancelled) return;

            if (!containerRef.current) throw new Error('No container available')
            if (!elements) throw new Error('Elements not ready')

            setState('el:creating');
            setError(null);

            const {nonListenerProps} = splitElementProps(latestPropsRef.current);
            const {visible, ...sdkOptions} = nonListenerProps;

            const finalOpts: TSdkOpts = {
                ...sdkOptions,
                identifier: idSafe.current,
                element: containerRef.current
            }

            const elementsApi = functionProps.elementFactory(finalOpts, elements);

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

        if (!containerRef.current) {
            throw new Error('No container available')
        } else {

            if (initStartedRef.current) return;
            initStartedRef.current = true;

            void init().catch(err => {setError(err); latestPropsRef.current.onError?.(err)});
        }

        return () => {
            cancelled = true;
            if (elementsInstance.current && elementsInstance.current.api && elementsInstance.current.api.destroy) {
                elementsInstance.current.api.destroy()
            }
            elementsInstances.delete(idSafe.current);
            setState("el:idle");
            setError(null);
        };
    }, [providerStatus, elements, elementsInstances]);

    const api = useMemo(() => ({
        state,
        error,
    }), [state, error]);

    return {containerRef, idSafe: idSafe.current, ...api};
}
