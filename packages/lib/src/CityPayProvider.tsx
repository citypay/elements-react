'use client'

import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    AltPaymentOptions, CardElementOptions,
    CardFieldsElementOptions,
    CityPayElements,
    CityPayPromise,
    ElementsApi,
    PaymentIntentSession,
} from '@citypay/sdk';

type ProviderStatus = 'cpp:idle' | 'cpp:initialising' | 'cpp:ready' | 'cpp:error';
export type HookState = 'el:idle' | 'el:creating' | 'el:mounting' | 'el:ready' | 'el:error';

// ---------- Context shape ----------
export type CityPayContextShape = {
    status: ProviderStatus;
    error?: unknown;
    elements: CityPayElements | null;
    elementInstances: Map<string, ElementsInstance>;
    getElementInstance: (id: string) => ElementsInstance | undefined;
}

const CityPayContext = createContext<CityPayContextShape | null>(null);

// ---------- Provider ----------
export type CityPayProviderProps = PropsWithChildren<{
    pubKey?: string;
    createServerIntent?: () => Promise<PaymentIntentSession>;
    debug?: boolean;
    middleware?: {
        /**
         * Middleware route for attaching a payment method or token.
         */
        attach?: string;

        /**
         * Middleware route for confirming a payment intent.
         */
        confirm?: string;

        /**
         * Middleware route for authorising a payment intent.
         * Strongly recommended to always provide this.
         */
        authorise?: string;

        /**
         * Middleware route for verifying the authorisation
         * of a payment intent.
         * Strongly recommended to always provide this.
         */
        verifyAuth?: string;
    };
    // payButtonConfig?: PayButtonConfig;    // optional → lazy-init supported
}>;

export type ElementsInstance = {
    api: ElementsApi;
    opts: CardElementOptions | CardFieldsElementOptions | AltPaymentOptions;
}

function initPreconnect() {
    const ORIGIN = 'https://ui.elements.citypay.com'; // OK to hard-code this as it is only for prod optimisation
    const ensureLink = (rel: 'preconnect' | 'dns-prefetch', origin: string, extraAttrs?: Record<string, string>) => {
        const selector = `link[rel="${rel}"][href="${origin}"][data-citypay="true"]`;
        let link = document.head.querySelector<HTMLLinkElement>(selector);
        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            link.href = origin;
            link.setAttribute('data-citypay', 'true');
            link.setAttribute('data-citypay-origin', origin);
            if (extraAttrs) {
                for (const [k, v] of Object.entries(extraAttrs)) {
                    link.setAttribute(k, v);
                }
            }
            document.head.appendChild(link);
        }
        return link;
    };

    const preconnect = ensureLink('preconnect', ORIGIN, {crossOrigin: 'anonymous'});
    const dnsPrefetch = ensureLink('dns-prefetch', ORIGIN);

    return () => {
        preconnect?.remove();
        dnsPrefetch?.remove();
    };
}

export function CityPayProvider({
                                    pubKey,
                                    createServerIntent,
                                    debug = false,
                                    middleware,
                                    children,
                                }: CityPayProviderProps) {

    const elementRefs = useRef<Map<string, ElementsInstance>>(new Map());

    const [status, setStatus] = useState<ProviderStatus>('cpp:idle');
    const [error, setError] = useState<unknown>();
    const elementsRef = useRef<CityPayElements | null>(null);
    const lastPubKeyRef = useRef<string | null>(null);

    // Inject preconnect/dns-prefetch without Next.js
    useEffect(initPreconnect, []);

    useEffect(() => {
        let cancelled = false;

        if (!pubKey) {
            setStatus('cpp:error');
            setError("No pubKey provided");
            return;
        }

        if (!createServerIntent) {
            setStatus('cpp:error');
            setError("No createServerIntent function provided");
            return;
        }

        (async () => {
            // Only (re)create if no instance yet or pubKey changed
            try {
                const needsNew = !elementsRef.current || lastPubKeyRef.current !== pubKey;

                if (needsNew) {
                    lastPubKeyRef.current = pubKey;

                    setStatus('cpp:initialising');

                     const api = await CityPayPromise({
                         debug,
                    });

                    if (cancelled) {
                        return;
                    }

                    elementsRef.current = await api.elements({
                        pubKey,
                        createServerIntent,
                        eager: true,
                        middleware: middleware,
                    });
                    setStatus('cpp:ready');
                }
            } catch (e) {
                if (cancelled) {
                    return;
                }
                setError(e);
                setStatus('cpp:error');
            }
        })()
        return () => {
            cancelled = true;
        };
    }, [pubKey, debug]);

    const getElementRef = (id: string) => elementRefs.current.get(id);

    const value = useMemo<CityPayContextShape>(() => ({
        status,
        error,
        elements: elementsRef.current,
        elementInstances: elementRefs.current,
        getElementInstance: getElementRef
    }), [status, error, elementsRef.current]);

    return (
        <>
            <CityPayContext.Provider value={value}>{children}</CityPayContext.Provider>
        </>
    );
}


// ---------- Hooks ----------
export function useElements(): CityPayElements | null {
    const ctx = useContext(CityPayContext);
    if (!ctx) throw new Error('useElements must be used within a <CityPayProvider>');
    return ctx.elements;
}

export function useElementInstances() {
    const ctx = useContext(CityPayContext);
    if (!ctx) throw new Error('useElements must be used within a <CityPayProvider>');
    return ctx.elementInstances
}

export function useElementsStatus() {
    const ctx = useContext(CityPayContext);
    if (!ctx) throw new Error('useElementsStatus must be used within a <CityPayProvider>');
    return {status: ctx.status, error: ctx.error};
}
