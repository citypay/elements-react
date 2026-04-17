import {ElementsInstance, HookState, useElementInstances, useElements} from "@/components/CityPayProvider";
import {ChakraElementOptions} from "@citypay/sdk";
import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useRef} from "react";

const CHAKRA_READY_TIMEOUT_MS = 10000;

export type ChakraElementContextShape = {
    getElement: () => ElementsInstance | null;
    ensureElement: (opts: ChakraElementOptions, h: Dispatch<SetStateAction<HookState>>) => Promise<ElementsInstance>
}

const ChakraElementContext = createContext<ChakraElementContextShape | null>(null);

export function ChakraElementProvider({id, children}: PropsWithChildren<{id: string}>) {

    const elements = useElements()
    const elementInstances = useElementInstances()

    const elementInstance = useRef<ElementsInstance | null>(null);

    const ensureElement = async (opts: ChakraElementOptions, h: Dispatch<SetStateAction<HookState>>) => {
        if (!elements) throw new Error('Elements not ready');

        const stableOpts = {
            ...opts,
            targetElement: opts.element,
        }

        h('el:creating');
        const elementsApi = elements.chakraElement(stableOpts);
        await elementsApi.init()
        await Promise.race([
            elementsApi.awaitReady(),
            new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Chakra iframe did not become ready. Check that the Chakra route is available on the elements host.'));
                }, CHAKRA_READY_TIMEOUT_MS);
            })
        ])
        h("el:ready");
        const ref = {api: elementsApi, opts: stableOpts};
        elementInstances.set(id, ref)
        elementInstance.current = ref
        return ref;
    };

    const getElement = () => { return elementInstance.current }

    const value: ChakraElementContextShape = {
        getElement: getElement,
        ensureElement: ensureElement
    };

    return (
        <ChakraElementContext.Provider value={value}>{children}</ChakraElementContext.Provider>
    )

}

export function useChakraElementContext() {
    const ctx = useContext(ChakraElementContext);
    if (!ctx) throw new Error('useChakraElement must be used within an <ChakraElementContext>');
    return ctx
}
