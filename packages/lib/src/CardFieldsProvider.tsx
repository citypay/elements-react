import {ElementsInstance, HookState, useElementInstances, useElements} from "@/CityPayProvider";
import {CardFieldsElementOptions} from "@citypay/sdk"
import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useMemo, useRef} from "react";

export type CardFieldsContextShape = {
    identifier: string
    getElement: () => ElementsInstance | null;
    ensureElement: (opts: CardFieldsElementOptions, h: Dispatch<SetStateAction<HookState>>) => Promise<ElementsInstance>
}

const CardFieldsContext = createContext<CardFieldsContextShape | null>(null);

export function CardFieldsProvider({identifier, children}: PropsWithChildren<{identifier?: string}>) {

    const elements = useElements()
    const elementInstances = useElementInstances()

    const elementInstance = useRef<ElementsInstance | null>(null);

    const identifierSafe = identifier ?? 'default-cardfields'

    /**
     * Ensure a card fields element is mounted and ready.
     * @param opts
     * @param h
     */
    const ensureElement = async (opts: CardFieldsElementOptions, h: Dispatch<SetStateAction<HookState>>) => {
        if (!elements) throw new Error('Elements not ready');
        // const existing = elementRefs.current.get(opts.id);
        // if (existing) return existing;

        h('el:creating');
        const elementsApi = elements.cardFieldsElement(opts)
        console.log('>> init()')
        await elementsApi.init()
        console.log('>> await()')
        await elementsApi.awaitReady()
        console.log('>> done')
        h("el:ready");
        const ref = {api: elementsApi, opts: opts};
        elementInstances.set(identifierSafe, ref)
        elementInstance.current = ref
        return ref;
    };

    const getElement = () => { return elementInstance.current }

    const value = useMemo<CardFieldsContextShape>(() => ({
        identifier: identifierSafe,
        getElement: getElement,
        ensureElement: ensureElement
    }), [elements]);

    return (
        <CardFieldsContext.Provider value={value}>{children}</CardFieldsContext.Provider>
    )

}

export function useCardFieldsContext() {
    const ctx = useContext(CardFieldsContext);
    if (!ctx) throw new Error('useCardElement must be used within an <CardElementContext>');
    return ctx
}