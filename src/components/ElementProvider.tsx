import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useMemo,
    useRef
} from "react";
import {ElementsInstance, HookState, useElementInstances, useElements} from "@/components/CityPayProvider";
import {
    AltPaymentOptions, CardElementOptions, CityPayElements, ElementsApi, GooglePaymentOptions,
    MonoFrameElementOptions
} from "@citypay/sdk";

export interface ElementReactOptions<TSdkOpts extends MonoFrameElementOptions> {

    /** The DOM element where the CityPay Element will be mounted */
    mountElement?: HTMLElement;

    /**
     * Adapt these options into a version accepted by the SDK for the chosen element type
     */
    adapt: () => TSdkOpts;
}

export type ElementProviderProps<TSdkOpts extends MonoFrameElementOptions> = {
    logName: string
    createElementFn: (elements: CityPayElements) => (id: string, opts: TSdkOpts) => ElementsApi
}

export type ElementProviderContextShape<TSdkOpts extends MonoFrameElementOptions> = {
    identifier: string;
    getElement: () => ElementsInstance | null;
    ensureElement: (
        opts: ElementReactOptions<TSdkOpts>,
        h: Dispatch<SetStateAction<HookState>>
    ) => Promise<ElementsInstance>;
};

export function ElementProvider<TSdkOpts extends MonoFrameElementOptions>(props: ElementProviderProps<TSdkOpts>) {

    const Ctx = createContext<ElementProviderContextShape<TSdkOpts> | null>(null);

    function Provider({ id, children }: PropsWithChildren<{ id: string }>) {
        const elements = useElements(); // your hook
        const elementInstances = useElementInstances(); // your registry hook

        const elementInstance = useRef<ElementsInstance | null>(null);
        const inFlight = useRef<Map<string, Promise<ElementsInstance>>>(new Map());

        const ensureElement = useCallback(async (opts: ElementReactOptions<TSdkOpts>, h: Dispatch<SetStateAction<HookState>>) => {

            if (!elements) throw new Error("Elements not ready");

            if (elementInstance.current) return elementInstance.current;

            const existInRegistry = elementInstances.get(id);
            if (existInRegistry) {
                elementInstance.current = existInRegistry;
                return existInRegistry;
            }

            const pending = inFlight.current.get(id);
            if (pending) return pending;

            const elementFactory = props.createElementFn(elements);



            const p = (async () => {
                h("el:creating");
                const elementsApi = elementFactory(id, opts.adapt());
                await elementsApi.init();
                await elementsApi.awaitReady();
                h("el:ready");

                const ref: ElementsInstance = { api: elementsApi, opts: opts.adapt() };
                elementInstances.set(id, ref);
                elementInstance.current = ref;
                return ref;
            })().finally(() => {
                inFlight.current.delete(id);
            });

            inFlight.current.set(id, p);
            return p;
            }, [elements, elementInstances, id, props.createElementFn]);

        const getElement = useCallback(() => elementInstance.current, []);

        const value = useMemo<ElementProviderContextShape<TSdkOpts>>(
            () => ({
                identifier: id,
                getElement,
                ensureElement,
            }),
            // `ensureElement` closes over `elements` and `elementInstances`,
            // but those are stable hooks in most implementations.
            // If they’re not stable, you can include them, but then value changes more often.
            [id, ensureElement, getElement]
        );

        return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
    }

    function useElementContext() {
        const ctx = useContext(Ctx);
        if (!ctx)
            throw new Error(
                `${props.logName} must be used within its corresponding Provider`
            );
        return ctx;
    }

    function useElementIdentifier() {
        return useElementContext().identifier;
    }

    return {
        Provider,
        useElementContext,
        useElementIdentifier,
        Context: Ctx,
    };
}

// Card Element
export const {
    Provider: CardElementProvider,
    useElementContext: useCardElementContext,
    useElementIdentifier: useCardElementIdentifier,
} = ElementProvider<CardElementOptions> ({
    logName: "CardElementContext",
    createElementFn: (elements: CityPayElements) => (id, opts) => elements.cardElement({...opts, identifier: id})
})

// Apple Pay
export const {
    Provider: ApplepayElementProvider,
    useElementContext: useApplepayElementContext,
    useElementIdentifier: useApplepayElementIdentifier,
} = ElementProvider<AltPaymentOptions>({
    logName: "ApplepayElementContext",
    createElementFn: (elements: CityPayElements) => (id, opts) => elements.applePay(id, opts),
});

// Google Pay
export const {
    Provider: GooglepayElementProvider,
    useElementContext: useGooglepayElementContext,
    useElementIdentifier: useGooglepayElementIdentifier,
} = ElementProvider<GooglePaymentOptions>({
    logName: "GooglepayElementContext",
    createElementFn: (elements: CityPayElements) => (id, opts) => elements.googlePay(id, opts),
});