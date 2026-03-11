'use client';

import { RefObject, useEffect, useMemo, useState } from "react";
import { CardFieldsElementOptions } from "@citypay/sdk";
import { addApiListeners, CpeApiEventListeners } from "@/components/Common";
import {
    ElementsInstance,
    HookState,
    useElementsStatus,
} from "@/components/CityPayProvider";
import { useCardFieldsContext } from "@/components/CardFieldsProvider";

export type FieldsReferences = {
    csc: RefObject<HTMLElement | null>;
    expiry: RefObject<HTMLElement | null>;
    name: RefObject<HTMLElement | null>;
    pan: RefObject<HTMLElement | null>;
};

export function useCardFields(
    refs: FieldsReferences,
    options: CardFieldsElementOptions,
    listeners?: CpeApiEventListeners
) {
    const elementCtx = useCardFieldsContext();
    const { status: providerStatus } = useElementsStatus();

    const [elementsInstance, setElementsInstance] = useState<ElementsInstance | undefined>();
    const [state, setState] = useState<HookState>("el:idle");
    const [error, setError] = useState<Error | string | null>(null);

    const refsReady = Boolean(
        refs.csc.current &&
        refs.expiry.current &&
        refs.name.current &&
        refs.pan.current
    );

    const adaptedOptions = useMemo<CardFieldsElementOptions | null>(() => {
        if (!refsReady) return null;

        return {
            ...options,
            cscElement: refs.csc.current as HTMLElement,
            expiryElement: refs.expiry.current as HTMLElement,
            nameElement: refs.name.current as HTMLElement,
            panElement: refs.pan.current as HTMLElement,
        };
    }, [
        refsReady,
        options,
        refs.csc.current,
        refs.expiry.current,
        refs.name.current,
        refs.pan.current,
    ]);

    useEffect(() => {
        console.log(">>>> useCardFields main effect", providerStatus, adaptedOptions);
        if (providerStatus !== "cpp:ready") return;
        if (!adaptedOptions) return;

        let cancelled = false;

        (async () => {
            try {
                setError(null);

                const ref = await elementCtx.ensureElement(adaptedOptions, setState);

                if (!cancelled) {
                    setElementsInstance(ref);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    listeners?.onError?.(err);
                    // setState("el:error");
                    // setError(err instanceof Error ? err : String(err));
                    console.error(err);
                }
            }
        })();

        return () => {
            cancelled = true;

            try {
                elementsInstance?.api?.destroy?.();
            } catch {}

            setElementsInstance(undefined);
            setState("el:idle");
            setError(null);
        };
    }, [providerStatus, adaptedOptions, elementCtx, listeners]);

    useEffect(() => {
        if (!elementsInstance) return;
        if (typeof window === "undefined") return;

        addApiListeners(elementsInstance.api, listeners);
    }, [elementsInstance, listeners]);

    return useMemo(
        () => ({
            state,
            error,
        }),
        [state, error]
    );
}