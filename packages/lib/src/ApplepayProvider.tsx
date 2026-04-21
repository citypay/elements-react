import {ElementsInstance, HookState, useElementInstances, useElements} from "@/CityPayProvider";
import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useRef} from "react";
import {AltPaymentOptions} from "@citypay/sdk";

export type ApplepayElementContextShape = {
    identifier: string
    getElement: () => ElementsInstance | null;
    ensureElement: (opts: AltPaymentOptions, h: Dispatch<SetStateAction<HookState>>) => Promise<ElementsInstance>
}

const ApplepayElementContext = createContext<ApplepayElementContextShape | null>(null);

export function ApplepayElementProvider({identifier, children}: PropsWithChildren<{identifier?: string}>) {

    const elements = useElements()
    const elementInstances = useElementInstances()

    const elementInstance = useRef<ElementsInstance | null>(null);

    const inFlight = useRef<Map<string, Promise<ElementsInstance>>>(new Map());

    const identifierSafe = identifier ?? 'default-applepay'

    /**
     * Ensure an Applepay element is mounted and ready.
     * @param opts
     * @param h
     */
    const ensureElement = async (opts: AltPaymentOptions, h: Dispatch<SetStateAction<HookState>>) => {
        if (!elements) throw new Error('Elements not ready');

        if (elementInstance.current) return elementInstance.current;

        const existInRegistry = elementInstances.get(identifierSafe);
        if (existInRegistry) {
            elementInstance.current = existInRegistry;
            return existInRegistry;
        }

        const pending = inFlight.current.get(identifierSafe);
        if (pending) return pending;

        const p = (async () => {
            h('el:creating');
            const elementsApi = elements.applePay(opts)
            await elementsApi.init()
            await elementsApi.awaitReady()
            h("el:ready");
            const ref = {api: elementsApi, opts: opts};
            elementInstances.set(identifierSafe, ref)
            elementInstance.current = ref;
            return ref;
        })().finally(() => {
            inFlight.current.delete(identifierSafe);
        });

        inFlight.current.set(identifierSafe, p);
        return p;
    };

    const getElement = () => { return elementInstance.current }

    const value = useMemo<ApplepayElementContextShape>(() => ({
        identifier: identifierSafe,
        getElement: getElement,
        ensureElement: ensureElement
    }), [elements, identifier]);

    return (
        <ApplepayElementContext.Provider value={value}>{children}</ApplepayElementContext.Provider>
    )

}

export function useApplepayElementContext() {
    const ctx = useContext(ApplepayElementContext);
    if (!ctx) throw new Error('useCardElement must be used within an <ApplepayElementContext>');
    return ctx
}