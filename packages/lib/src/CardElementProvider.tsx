import {ElementsInstance, HookState, useElementInstances, useElements} from "@/CityPayProvider";
import {CardElementOptions} from '@citypay/sdk';
import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useRef} from "react";

export type CardElementContextShape = {
    identifier: string
    getElement: () => ElementsInstance | null;
    ensureElement: (opts: CardElementOptions, h: Dispatch<SetStateAction<HookState>>) => Promise<ElementsInstance>
}

const CardElementContext = createContext<CardElementContextShape | null>(null);

export function CardElementProvider({identifier, children}: PropsWithChildren<{identifier?: string}>) {

    const elements = useElements()
    const elementInstances = useElementInstances()

    const elementInstance = useRef<ElementsInstance | null>(null);

    const identifierSafe = identifier ?? 'default-cardelement'

    /**
     * Ensure a card element is mounted and ready.
     * @param opts
     * @param h
     */
    const ensureElement = async (opts: CardElementOptions, h: Dispatch<SetStateAction<HookState>>) => {
        if (!elements) throw new Error('Elements not ready');
        // const existing = elementRefs.current.get(opts.id);
        // if (existing) return existing;


        h('el:creating');
        const elementsApi = elements.cardElement(opts);
        await elementsApi.init()
        await elementsApi.awaitReady()
        h("el:ready");
        const ref = {api: elementsApi, opts: opts};
        elementInstances.set(identifierSafe, ref)
        elementInstance.current = ref
        return ref;
    };

    const getElement = () => { return elementInstance.current }

    const value = useMemo<CardElementContextShape>(() => ({
        identifier: identifierSafe,
        getElement: getElement,
        ensureElement: ensureElement
    }), [elements]);

    return (
        <CardElementContext.Provider value={value}>{children}</CardElementContext.Provider>
    )

}

export function useCardElementContext() {
    const ctx = useContext(CardElementContext);
    if (!ctx) throw new Error('useCardElement must be used within an <CardElementContext>');
    return ctx
}