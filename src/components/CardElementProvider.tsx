import {ElementsInstance, HookState, useElementInstances, useElements} from "@/components/CityPayProvider";
import {CardElementOptions} from '@citypay/sdk';
import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useRef} from "react";

export type CardElementContextShape = {
    getElement: () => ElementsInstance | null;
    ensureElement: (opts: CardElementOptions, h: Dispatch<SetStateAction<HookState>>) => Promise<ElementsInstance>
}

const CardElementContext = createContext<CardElementContextShape | null>(null);

export function CardElementProvider({id, children}: PropsWithChildren<{id: string}>) {

    const elements = useElements()
    const elementInstances = useElementInstances()

    const elementInstance = useRef<ElementsInstance | null>(null);

    /**
     * Ensure a card element is mounted and ready.
     * @param opts
     * @param h
     */
    const ensureElement = async (opts: CardElementOptions, h: Dispatch<SetStateAction<HookState>>) => {
        if (!elements) throw new Error('Elements not ready');
        // const existing = elementRefs.current.get(opts.id);
        // if (existing) return existing;

        // Create the form and push to the current refs..
        const stableOpts = {
            ...opts,
            targetElement: opts.element,
        }

        h('el:creating');
        const elementsApi = elements.cardElement(stableOpts);
        const ref = {api: elementsApi, opts: stableOpts};
        elementInstances.set(id, ref)
        elementInstance.current = ref

        await elementsApi.init()
        h('el:mounting');
        void elementsApi.awaitReady()
            .then(() => h("el:ready"))
            .catch(() => h("el:error"));

        return ref;
    };

    const getElement = () => { return elementInstance.current }

    const value = useMemo<CardElementContextShape>(() => ({
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
