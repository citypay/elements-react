"use client";

import {ChevronDownIcon} from "@heroicons/react/16/solid";
import {useEffect, useMemo, useRef, useState} from "react";
import {CityPayPromise} from "@citypay/sdk";

type ProductVariant = {
    id: string;
    name: string;
};

type Product = {
    id: string;
    sku: string;
    name: string;
    description: string;
    unitAmount: number;
    imageSrc: string;
    imageAlt: string;
    variants: ProductVariant[];
};

type PaymentDetails = {
    total: {
        label: string;
        amount: number;
        currency: "GBP";
        country: "GB";
    };
    identifier: string;
    merchantData: {
        productId: string;
        sku: string;
        quantity: number;
        variant: ProductVariant;
    };
};

type ExpressCheckoutApi = {
    init: () => Promise<boolean | string[] | {methods?: string[]; availableMethods?: string[]}>;
    awaitReady: () => Promise<void>;
    on?: (type: string, listener: (event: unknown) => void) => ExpressCheckoutApi;
    onError?: (handler: (event: unknown) => void) => ExpressCheckoutApi;
    addEventListener?: (type: string, listener: (event: Event) => void) => void;
    destroy?: () => void;
    unmount?: () => void;
};

type ExpressCheckoutElements = {
    expressCheckout: (options: {
        element: string;
        methods: Array<"apple_pay" | "google_pay">;
        resolvePaymentDetails: () => PaymentDetails;
        appearance: {
            applePay: {
                type: "buy";
                style: "dark";
            };
        };
    }) => ExpressCheckoutApi;
};

type CityPayBrowserApi = {
    elements: (options: {
        checkoutContext: unknown;
        checkoutContextStorage: "session";
    }) => Promise<ExpressCheckoutElements>;
};

const selectedProduct: Product = {
    id: "prod_citypay_elements_tee",
    sku: "CITYPAY-TEE-001",
    name: "CityPay Elements Tee",
    description: "A product-page Express Checkout demo item for testing Apple Pay payment details resolution.",
    unitAmount: 3200,
    imageSrc: "https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-01-related-product-01.jpg",
    imageAlt: "Folded black tee on a neutral background.",
    variants: [
        {id: "black-small", name: "Black / Small"},
        {id: "black-medium", name: "Black / Medium"},
        {id: "black-large", name: "Black / Large"},
    ],
};

const requestedMethods = ["apple_pay", "google_pay"] as const;

function formatMoney(amount: number) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(amount / 100);
}

function getCheckoutContextId(checkoutContext: unknown): string {
    if (!checkoutContext || typeof checkoutContext !== "object") return "unknown";

    const context = checkoutContext as Record<string, unknown>;
    const candidates = [
        context.id,
        context.checkoutContextId,
        context.checkout_context_id,
        context.contextId,
    ];

    const id = candidates.find((candidate): candidate is string => typeof candidate === "string" && candidate.length > 0);
    return id ?? "unknown";
}

function normaliseAvailableMethods(
    initResult: Awaited<ReturnType<ExpressCheckoutApi["init"]>>
) {
    if (Array.isArray(initResult)) return initResult;
    if (typeof initResult === "object" && initResult) {
        return initResult.methods ?? initResult.availableMethods ?? [];
    }
    return initResult ? [...requestedMethods] : [];
}

function describeSdkEvent(event: unknown) {
    if (event instanceof Error) return `${event.name}: ${event.message}`;

    if (event && typeof event === "object") {
        const maybeEvent = event as {type?: unknown; detail?: unknown; message?: unknown};
        if (typeof maybeEvent.message === "string") return maybeEvent.message;
        if (typeof maybeEvent.type === "string") {
            const detail = maybeEvent.detail ? ` ${JSON.stringify(maybeEvent.detail)}` : "";
            return `${maybeEvent.type}${detail}`;
        }
    }

    if (typeof event === "string") return event;

    try {
        return JSON.stringify(event);
    } catch {
        return "Unserialisable SDK event";
    }
}

export default function ExpressCheckoutPage() {
    const [quantity, setQuantity] = useState(1);
    const [variantId, setVariantId] = useState(selectedProduct.variants[0].id);
    const [checkoutContext, setCheckoutContext] = useState<unknown>();
    const [checkoutContextError, setCheckoutContextError] = useState<string>();
    const [availableMethods, setAvailableMethods] = useState<string[]>([]);
    const [expressStatus, setExpressStatus] = useState("Initialising checkout context");
    const [lastResolvedPaymentDetails, setLastResolvedPaymentDetails] = useState<PaymentDetails>();
    const [lastSdkEvent, setLastSdkEvent] = useState<string>("None");

    const stateRef = useRef({
        quantity,
        variant: selectedProduct.variants[0],
    });

    const selectedVariant = useMemo(
        () => selectedProduct.variants.find((variant) => variant.id === variantId) ?? selectedProduct.variants[0],
        [variantId]
    );

    useEffect(() => {
        stateRef.current = {
            quantity,
            variant: selectedVariant,
        };
    }, [quantity, selectedVariant]);

    useEffect(() => {
        let cancelled = false;
        let express: ExpressCheckoutApi | undefined;

        async function initialiseExpressCheckout() {
            try {
                setExpressStatus("Creating checkout context");
                const contextResponse = await fetch("/api/citypay/checkout-context", {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                });

                const context = await contextResponse.json();
                if (!contextResponse.ok) {
                    throw new Error(context?.error ?? "Failed to create checkout context");
                }

                if (cancelled) return;

                setCheckoutContext(context);
                setExpressStatus("Loading CityPay Elements");

                const citypay = await CityPayPromise({debug: false}) as CityPayBrowserApi;
                const elements = await citypay.elements({
                    checkoutContext: context,
                    checkoutContextStorage: "session",
                });

                if (cancelled) return;

                express = elements.expressCheckout({
                    element: "#express-buttons",
                    methods: [...requestedMethods],
                    resolvePaymentDetails: () => {
                        const {quantity: latestQuantity, variant} = stateRef.current;
                        const details: PaymentDetails = {
                            total: {
                                label: selectedProduct.name,
                                amount: selectedProduct.unitAmount * latestQuantity,
                                currency: "GBP",
                                country: "GB",
                            },
                            identifier: selectedProduct.sku,
                            merchantData: {
                                productId: selectedProduct.id,
                                sku: selectedProduct.sku,
                                quantity: latestQuantity,
                                variant,
                            },
                        };

                        setLastResolvedPaymentDetails(details);
                        setLastSdkEvent("resolvePaymentDetails called");
                        return details;
                    },
                    appearance: {
                        applePay: {type: "buy", style: "dark"},
                    },
                });

                const recordEvent = (event: unknown) => setLastSdkEvent(describeSdkEvent(event));
                express.on?.("ready", recordEvent);
                express.on?.("change", recordEvent);
                express.on?.("error", recordEvent);
                express.on?.("authorise:start", recordEvent);
                express.on?.("authorise:end", recordEvent);
                express.on?.("cpe:error", recordEvent);
                express.onError?.(recordEvent);
                express.addEventListener?.("error", recordEvent);

                setExpressStatus("Checking Express Checkout availability");
                const initResult = await express.init();
                const methods = normaliseAvailableMethods(initResult);

                if (cancelled) return;

                setAvailableMethods(methods);
                if (!initResult || methods.length === 0) {
                    setExpressStatus("Apple Pay unavailable in this browser or device");
                    setLastSdkEvent("expressCheckout.init returned unavailable");
                    return;
                }

                setExpressStatus("Waiting for Express Checkout button readiness");
                await express.awaitReady();

                if (cancelled) return;

                setExpressStatus("Express Checkout ready");
            } catch (e) {
                if (cancelled) return;

                const message = e instanceof Error ? e.message : "Unexpected Express Checkout error";
                setCheckoutContextError(message);
                setExpressStatus("Express Checkout failed to initialise");
                setLastSdkEvent(message);
            }
        }

        initialiseExpressCheckout();

        return () => {
            cancelled = true;
            express?.destroy?.();
            express?.unmount?.();
        };
    }, []);

    const total = selectedProduct.unitAmount * quantity;

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:px-8">
                <section className="bg-white">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
                        <img
                            src={selectedProduct.imageSrc}
                            alt={selectedProduct.imageAlt}
                            className="aspect-square w-full rounded-lg object-cover"
                        />

                        <div className="flex flex-col justify-between">
                            <div>
                                <p className="text-sm font-medium text-indigo-700">{selectedProduct.sku}</p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-gray-950">
                                    {selectedProduct.name}
                                </h1>
                                <p className="mt-4 text-base leading-7 text-gray-600">{selectedProduct.description}</p>
                                <p className="mt-6 text-2xl font-semibold text-gray-950">
                                    {formatMoney(selectedProduct.unitAmount)}
                                </p>
                            </div>

                            <div className="mt-8 space-y-6">
                                <div>
                                    <label htmlFor="variant" className="block text-sm font-medium text-gray-800">
                                        Variant
                                    </label>
                                    <div className="mt-2 grid grid-cols-1">
                                        <select
                                            id="variant"
                                            value={variantId}
                                            onChange={(event) => setVariantId(event.target.value)}
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-3 pr-10 pl-3 text-base text-gray-950 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                                        >
                                            {selectedProduct.variants.map((variant) => (
                                                <option key={variant.id} value={variant.id}>
                                                    {variant.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-800">
                                        Quantity
                                    </label>
                                    <div className="mt-2 grid grid-cols-1">
                                        <select
                                            id="quantity"
                                            value={quantity}
                                            onChange={(event) => setQuantity(Number(event.target.value))}
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-3 pr-10 pl-3 text-base text-gray-950 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                                                <option key={value} value={value}>
                                                    {value}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-gray-500"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center justify-between text-base font-medium text-gray-950">
                                        <span>Total</span>
                                        <span>{formatMoney(total)}</span>
                                    </div>
                                    <div id="express-buttons" className="mt-4 min-h-12 w-full" />
                                    {expressStatus.includes("unavailable") && (
                                        <p className="mt-3 text-sm text-amber-700">{expressStatus}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="self-start rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
                    <h2 className="text-base font-semibold text-gray-950">Express Checkout debug</h2>
                    <dl className="mt-5 space-y-4 text-sm">
                        <div>
                            <dt className="font-medium text-gray-700">Status</dt>
                            <dd className="mt-1 text-gray-950">{expressStatus}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-700">Checkout context id</dt>
                            <dd className="mt-1 break-all font-mono text-xs text-gray-950">
                                {checkoutContext ? getCheckoutContextId(checkoutContext) : "Pending"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-700">Available express methods</dt>
                            <dd className="mt-1 text-gray-950">
                                {availableMethods.length > 0 ? availableMethods.join(", ") : "None reported"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-700">Current selection</dt>
                            <dd className="mt-1 text-gray-950">
                                {quantity} x {selectedVariant.name}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-700">Last resolved payment details</dt>
                            <dd className="mt-1 max-h-48 overflow-auto rounded-md bg-gray-950 p-3 font-mono text-xs text-gray-50">
                                <pre>{lastResolvedPaymentDetails ? JSON.stringify(lastResolvedPaymentDetails, null, 2) : "Not called yet"}</pre>
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-700">Last SDK error/event</dt>
                            <dd className="mt-1 break-words text-gray-950">{lastSdkEvent}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-700">Expected current completion result</dt>
                            <dd className="mt-1 text-gray-950">Checkout context commit is not implemented yet</dd>
                        </div>
                    </dl>
                    {checkoutContextError && (
                        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                            {checkoutContextError}
                        </p>
                    )}
                </aside>
            </div>
        </main>
    );
}
