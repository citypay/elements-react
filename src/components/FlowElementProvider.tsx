import {ElementsInstance, HookState, useElementInstances, useElements} from "@/components/CityPayProvider";
import {FlowElementOptions} from '@citypay/sdk';
import {createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useRef} from "react";

const FLOW_READY_TIMEOUT_MS = 10000;

export type FlowElementContextShape = {
    getElement: () => ElementsInstance | null;
    ensureElement: (opts: FlowElementOptions, h: Dispatch<SetStateAction<HookState>>) => Promise<ElementsInstance>
}

const FlowElementContext = createContext<FlowElementContextShape | null>(null);

export function FlowElementProvider({id, children}: PropsWithChildren<{id: string}>) {

    const elements = useElements()
    const elementInstances = useElementInstances()

    const elementInstance = useRef<ElementsInstance | null>(null);

    const ensureElement = async (opts: FlowElementOptions, h: Dispatch<SetStateAction<HookState>>) => {
        if (!elements) throw new Error('Elements not ready');

        const stableOpts = {
            ...opts,
            targetElement: opts.element,
        }

        h('el:creating');
        const elementsApi = elements.flowElement(stableOpts);
        await elementsApi.init()
        await Promise.race([
            elementsApi.awaitReady(),
            new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Flow iframe did not become ready. Check that the Flow route is available on the elements host.'));
                }, FLOW_READY_TIMEOUT_MS);
            })
        ])
        h("el:ready");
        const ref = {api: elementsApi, opts: stableOpts};
        elementInstances.set(id, ref)
        elementInstance.current = ref
        return ref;
    };

    const getElement = () => { return elementInstance.current }

    const value: FlowElementContextShape = {
        getElement: getElement,
        ensureElement: ensureElement
    };

    return (
        <FlowElementContext.Provider value={value}>{children}</FlowElementContext.Provider>
    )

}

export function useFlowElementContext() {
    const ctx = useContext(FlowElementContext);
    if (!ctx) throw new Error('useFlowElement must be used within an <FlowElementContext>');
    return ctx
}
