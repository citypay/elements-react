import {
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useMemo,
    useRef,
} from "react";
import { CardFieldsElementOptions } from "@citypay/sdk";
import {
    ElementsInstance,
    HookState,
    useElementInstances,
    useElements,
} from "@/components/CityPayProvider";

export type CardFieldsContextShape = {
    getElement: () => ElementsInstance | null;
    ensureElement: (
        opts: CardFieldsElementOptions,
        setState: Dispatch<SetStateAction<HookState>>
    ) => Promise<ElementsInstance>;
};

const CardFieldsContext = createContext<CardFieldsContextShape | null>(null);

export function CardFieldsProvider({
                                       id,
                                       children,
                                   }: PropsWithChildren<{ id: string }>) {
    const elements = useElements();
    const elementInstances = useElementInstances();
    const elementInstance = useRef<ElementsInstance | null>(null);

    const ensureElement = async (
        opts: CardFieldsElementOptions,
        setState: Dispatch<SetStateAction<HookState>>
    ) => {
        if (!elements) throw new Error("Elements not ready");

        const existing = elementInstance.current;
        if (existing) return existing;

        setState("el:creating");

        const api = elements.cardFieldsElement(opts);
        await api.init();
        await api.awaitReady();

        const ref = { api, opts };
        elementInstances.set(id, ref);
        elementInstance.current = ref;

        setState("el:ready");
        return ref;
    };

    const getElement = () => elementInstance.current;

    const value = useMemo<CardFieldsContextShape>(
        () => ({
            getElement,
            ensureElement,
        }),
        [elements]
    );

    return (
        <CardFieldsContext.Provider value={value}>
            {children}
        </CardFieldsContext.Provider>
    );
}

export function useCardFieldsContext() {
    const ctx = useContext(CardFieldsContext);
    if (!ctx) {
        throw new Error("useCardFields must be used within a <CardFieldsProvider>");
    }
    return ctx;
}