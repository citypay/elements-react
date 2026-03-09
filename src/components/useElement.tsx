import {useEffect, useMemo, useRef, useState} from "react";
import {addApiListeners, CpeApiEventListeners} from "@/components/Common";
import {ElementsInstance, HookState, useElementsStatus} from "@/components/CityPayProvider";
import {
    ElementProviderContextShape, ElementReactOptions,
    useApplepayElementContext,
    useGooglepayElementContext,
    useCardElementContext
} from "@/components/ElementProvider";
import {AltPaymentOptions, CardElementOptions, GooglePaymentOptions, MonoFrameElementOptions} from "@citypay/sdk";

function useElement<
    TSdkOpts extends MonoFrameElementOptions,
    TOpts extends ElementReactOptions<TSdkOpts>>
(
    options: TOpts,
    listeners: CpeApiEventListeners,
    elementContextProvider: () => ElementProviderContextShape<TSdkOpts>
) {
    const elementsRef = elementContextProvider();
    const { status: providerStatus } = useElementsStatus();

    const formRef = useRef<any | null>(null);
    const mountedRef = useRef<boolean>(false);

    const [elementsInstance, setElementsInstance] = useState<ElementsInstance | undefined>();
    const [state, setState] = useState<HookState>("el:idle");
    const [error, setError] = useState<Error | string | null>(null);

    useEffect(() => {
        if (providerStatus !== "cpp:ready") return;
        if (!options.mountElement) return; // rely on reactive element (state/callback-ref)

        let cancelled = false;

        (async () => {
            try {
                const ref = await elementsRef.ensureElement(options, setState);
                if (!cancelled) setElementsInstance(ref);
            } catch (err: unknown) {
                if (!cancelled) {
                    listeners?.onError?.(err);
                    console.error(err);
                    //TODO Sam setting these causes infinite re-render
                    // setState("el:error");
                    // setError(err instanceof Error ? err : String(err));
                }
            }
        })();

        return () => {
            cancelled = true;
            try {
                formRef.current?.unmount?.();
                formRef.current?.destroy?.();
            } catch {}
            mountedRef.current = false;
            formRef.current = null;
            setElementsInstance(undefined);
            setState("el:idle");
            setError(null);
        };
    }, [providerStatus, options, elementsRef, listeners]);

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

export function useCardElement(
    options: ElementReactOptions<CardElementOptions>,
    listeners: CpeApiEventListeners,
) {
    return useElement(options, listeners, useCardElementContext);
}

export function useGooglepayElement(
    options: ElementReactOptions<GooglePaymentOptions>,
    listeners: CpeApiEventListeners
) {
    return useElement(options, listeners, useGooglepayElementContext);
}

export function useApplepayElement(
    options: ElementReactOptions<AltPaymentOptions>,
    listeners: CpeApiEventListeners
) {
    return useElement(options, listeners, useApplepayElementContext);
}