import {ApplePayElementInstance, HookState, useElementInstances, useElements} from "@/components/CityPayProvider";
import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useRef} from "react";
import {AltPaymentOptions} from "@citypay/sdk";

type ApplepayElementContextShape = {
    identifier: string
    getElement: () => ApplePayElementInstance | null;
    ensureElement: (opts: AltPaymentOptions, h: Dispatch<SetStateAction<HookState>>) => Promise<ApplePayElementInstance>
}

const ApplepayElementContext = createContext<ApplepayElementContextShape | null>(null);

export function ApplepayElementProvider({id, children}: PropsWithChildren<{id: string}>) {

    const elements = useElements()
    const elementInstances = useElementInstances()

    const elementInstance = useRef<ApplePayElementInstance | null>(null);

    const inFlight = useRef<Map<string, Promise<ApplePayElementInstance>>>(new Map());

    /**
     * Ensure an Applepay element is mounted and ready.
     * @param opts
     * @param h
     */
    const ensureElement = async (opts: AltPaymentOptions, h: Dispatch<SetStateAction<HookState>>) => {
        if (!elements) throw new Error('Elements not ready');

        if (elementInstance.current) return elementInstance.current;

        const pending = inFlight.current.get(id);
        if (pending) return pending;

        // Create the form and push to the current refs..
        const p = (async () => {
            h('el:creating');
            const elementsApi = elements.applePay(opts)
            await elementsApi.init()
            await elementsApi.awaitReady()
            h("el:ready");
            const ref: ApplePayElementInstance = {api: elementsApi, opts};
            elementInstances.set(id, ref)
            elementInstance.current = ref;
            return ref;
        })().finally(() => {
            inFlight.current.delete(id);
        });

        inFlight.current.set(id, p);
        return p;
    };

    const getElement = () => { return elementInstance.current }

    const value = useMemo<ApplepayElementContextShape>(() => ({
        identifier: id,
        getElement: getElement,
        ensureElement: ensureElement
    }), [elements, id]);

    return (
        <ApplepayElementContext.Provider value={value}>{children}</ApplepayElementContext.Provider>
    )

}

export function useApplepayElementContext() {
    const ctx = useContext(ApplepayElementContext);
    if (!ctx) throw new Error('useCardElement must be used within an <ApplepayElementContext>');
    return ctx
}

export function useApplepayElementIdentifier() {
    const ctx = useContext(ApplepayElementContext);
    if (!ctx) throw new Error('useCardElement must be used within an <ApplepayElementContext>');
    return ctx.identifier
}
