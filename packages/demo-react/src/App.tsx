import {ChevronDownIcon} from '@heroicons/react/16/solid'
import {CheckCircleIcon, ExclamationCircleIcon, TrashIcon, XMarkIcon} from '@heroicons/react/20/solid'
import {useEffect, useRef, useState, type FormEvent} from "react";
import {FieldsCardForm} from "@/components/FieldsCardForm";

import {
    ApplepayElement,
    CardElement,
    CardFields,
    CityPayElements,
    CityPayProvider,
    FieldReferences,
    FormLayoutName,
    GooglepayElement,
    PaymentIntentSession,
    useElements,
    useElementInstances,
    VerifyAuthResponse
} from "@citypay/elements-react"
import {VERIFY_AUTH_PATH} from "@/server-conn/config";
import {ServerConnection} from "@/server-conn/serverConnection";

const products = [
    {
        id: 1,
        title: 'Basic Tee',
        href: '#',
        price: '£32.00',
        color: 'Black',
        size: 'Large',
        imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-02-product-01.jpg',
        imageAlt: "Front of men's Basic Tee in black.",
    },
    {
        id: 2,
        title: 'Basic Tee',
        href: '#',
        price: '£32.00',
        color: 'Sienna',
        size: 'Large',
        imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/checkout-page-02-product-02.jpg',
        imageAlt: "Front of men's Basic Tee in sienna.",
    },
]
const deliveryMethods = [
    {id: 1, title: 'Standard', turnaround: '4–10 business days', price: '£5.00'},
    {id: 2, title: 'Express', turnaround: '2–5 business days', price: '£16.00'},
]
const paymentMethods = [
    {id: 'credit-card', title: 'Card widget'},
    {id: 'credit-card-form', title: 'Card fields'},
    {id: 'apple', title: 'Apple Pay'},
    {id: 'google', title: 'Google Pay'},
]

type ToastTone = 'success' | 'error' | 'info';

type ToastMessage = {
    id: number;
    tone: ToastTone;
    title: string;
    message?: string;
}

function formatError(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred.';
}

function ToastViewport({toasts, onDismiss}: {
    toasts: ToastMessage[];
    onDismiss: (id: number) => void;
}) {
    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
                >
                    {toast.tone === 'success' ? (
                        <CheckCircleIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-green-600"/>
                    ) : toast.tone === 'error' ? (
                        <ExclamationCircleIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600"/>
                    ) : (
                        <CheckCircleIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-indigo-600"/>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                        {toast.message && <p className="mt-1 text-sm text-gray-600">{toast.message}</p>}
                    </div>
                    <button
                        type="button"
                        className="-m-1.5 rounded-md p-1.5 text-gray-400 hover:text-gray-600 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600"
                        onClick={() => onDismiss(toast.id)}
                    >
                        <span className="sr-only">Dismiss notification</span>
                        <XMarkIcon aria-hidden="true" className="size-5"/>
                    </button>
                </div>
            ))}
        </div>
    )
}


function ContactInfo() {
    return (
        <div>
            <h2 className="text-lg font-medium text-gray-900">Contact information</h2>

            <div className="mt-4">
                <label htmlFor="email-address" className="block text-sm/6 font-medium text-gray-700">
                    Email address
                </label>
                <div className="mt-2">
                    <input
                        id="email-address"
                        name="email-address"
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                </div>
            </div>
        </div>
    )
}

function ShippingInfo() {
    return (
        <div className="mt-10 border-t border-gray-200 pt-10">
            <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>

            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                    <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-700">
                        First name
                    </label>
                    <div className="mt-2">
                        <input
                            id="first-name"
                            name="first-name"
                            type="text"
                            autoComplete="given-name"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-700">
                        Last name
                    </label>
                    <div className="mt-2">
                        <input
                            id="last-name"
                            name="last-name"
                            type="text"
                            autoComplete="family-name"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="company" className="block text-sm/6 font-medium text-gray-700">
                        Company
                    </label>
                    <div className="mt-2">
                        <input
                            id="company"
                            name="company"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm/6 font-medium text-gray-700">
                        Address
                    </label>
                    <div className="mt-2">
                        <input
                            id="address"
                            name="address"
                            type="text"
                            autoComplete="street-address"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="apartment" className="block text-sm/6 font-medium text-gray-700">
                        Apartment, suite, etc.
                    </label>
                    <div className="mt-2">
                        <input
                            id="apartment"
                            name="apartment"
                            type="text"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm/6 font-medium text-gray-700">
                        City
                    </label>
                    <div className="mt-2">
                        <input
                            id="city"
                            name="city"
                            type="text"
                            autoComplete="address-level2"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm/6 font-medium text-gray-700">
                        Country
                    </label>
                    <div className="mt-2 grid grid-cols-1">
                        <select
                            id="country"
                            name="country"
                            autoComplete="country-name"
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        >
                            <option>United Kingdom</option>
                        </select>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="region" className="block text-sm/6 font-medium text-gray-700">
                        State / Province
                    </label>
                    <div className="mt-2">
                        <input
                            id="region"
                            name="region"
                            type="text"
                            autoComplete="address-level1"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="postal-code" className="block text-sm/6 font-medium text-gray-700">
                        Postal code
                    </label>
                    <div className="mt-2">
                        <input
                            id="postal-code"
                            name="postal-code"
                            type="text"
                            autoComplete="postal-code"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-700">
                        Phone
                    </label>
                    <div className="mt-2">
                        <input
                            id="phone"
                            name="phone"
                            type="text"
                            autoComplete="tel"
                            className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function OrderSummary({formDisabled}: { formDisabled: boolean }) {

    return (
        <>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0">
                <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-xs">
                    <h3 className="sr-only">Items in your cart</h3>
                    <ul role="list" className="divide-y divide-gray-200">
                        {products.map((product) => (
                            <li key={product.id} className="flex px-4 py-6 sm:px-6">
                                <div className="shrink-0">
                                    <img alt={product.imageAlt} src={product.imageSrc} className="w-20 rounded-md"/>
                                </div>

                                <div className="ml-6 flex flex-1 flex-col">
                                    <div className="flex">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm">
                                                <a href={product.href}
                                                   className="font-medium text-gray-700 hover:text-gray-800">
                                                    {product.title}
                                                </a>
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-500">{product.color}</p>
                                            <p className="mt-1 text-sm text-gray-500">{product.size}</p>
                                        </div>

                                        <div className="ml-4 flow-root shrink-0">
                                            <button
                                                type="button"
                                                className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                                            >
                                                <span className="sr-only">Remove</span>
                                                <TrashIcon aria-hidden="true" className="size-5"/>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 items-end justify-between pt-2">
                                        <p className="mt-1 text-sm font-medium text-gray-900">{product.price}</p>

                                        <div className="ml-4">
                                            <div className="grid grid-cols-1">
                                                <select
                                                    id="quantity"
                                                    name="quantity"
                                                    aria-label="Quantity"
                                                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                >
                                                    <option value={1}>1</option>
                                                    <option value={2}>2</option>
                                                    <option value={3}>3</option>
                                                    <option value={4}>4</option>
                                                    <option value={5}>5</option>
                                                    <option value={6}>6</option>
                                                    <option value={7}>7</option>
                                                    <option value={8}>8</option>
                                                </select>
                                                <ChevronDownIcon
                                                    aria-hidden="true"
                                                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex items-center justify-between">
                            <dt className="text-sm">Subtotal</dt>
                            <dd className="text-sm font-medium text-gray-900">£64.00</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-sm">Shipping</dt>
                            <dd className="text-sm font-medium text-gray-900">£5.00</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-sm">Taxes</dt>
                            <dd className="text-sm font-medium text-gray-900">£5.52</dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                            <dt className="text-base font-medium">Total</dt>
                            <dd className="text-base font-medium text-gray-900">£75.52</dd>
                        </div>
                    </dl>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <button
                            type="submit"
                            disabled={formDisabled}
                            className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 focus:outline-hidden disabled:opacity-50"
                        >
                            Confirm order
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

function Delivery() {
    return (
        <>
            <div className="mt-10 border-t border-gray-200 pt-10">
                <fieldset>
                    <legend className="text-lg font-medium text-gray-900">Delivery method</legend>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                        {deliveryMethods.map((deliveryMethod) => (
                            <label
                                key={deliveryMethod.id}
                                aria-label={deliveryMethod.title}
                                aria-description={`£{deliveryMethod.turnaround} for £{deliveryMethod.price}`}
                                className="group relative flex rounded-lg border border-gray-300 bg-white p-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-indigo-600 has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25"
                            >
                                <input
                                    defaultValue={deliveryMethod.id}
                                    defaultChecked={deliveryMethod === deliveryMethods[0]}
                                    name="delivery-method"
                                    type="radio"
                                    className="absolute inset-0 appearance-none focus:outline-none"
                                />
                                <div className="flex-1">
                                                <span
                                                    className="block text-sm font-medium text-gray-900">{deliveryMethod.title}</span>
                                    <span
                                        className="mt-1 block text-sm text-gray-500">{deliveryMethod.turnaround}</span>
                                    <span
                                        className="mt-6 block text-sm font-medium text-gray-900">{deliveryMethod.price}</span>
                                </div>
                                <CheckCircleIcon
                                    aria-hidden="true"
                                    className="invisible size-5 text-indigo-600 group-has-checked:visible"
                                />
                            </label>
                        ))}
                    </div>
                </fieldset>
            </div>

        </>
    )
}

export function FormExample({paymentSession}: { paymentSession: PaymentIntentSession }) {

    const elementsCtx: CityPayElements | null = useElements()
    const elementsInstances = useElementInstances()
    const [cardFormComplete, setCardFormComplete] = useState(false);
    const [cardFieldsComplete, setCardFieldsComplete] = useState(false);
    const [formDisabled, setFormDisabled] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0])
    const [layout, setLayout] = useState<FormLayoutName>('stack');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const cardElementId = `cardform-${layout}`;
    const cardFieldsId = `cardfields`;
    const fieldsRefs: FieldReferences = {
        csc: useRef(null),
        expiry: useRef(null),
        name: useRef(null),
        pan: useRef(null)

    }

    const getActiveApi = () => {
        return (paymentMethod.id === "credit-card"
            ? elementsInstances?.get(cardElementId)?.api
            : paymentMethod.id === "credit-card-form"
                ? elementsInstances?.get(cardFieldsId)?.api
                : undefined)
    }

    const selectPaymentMethod = (pm: typeof paymentMethods[number]) => {
        setPaymentMethod(pm);
        setCardFormComplete(false);

        if (pm.id === 'credit-card') {
            setCardFormComplete(false);
        }
    };

    const notify = (tone: ToastTone, title: string, message?: string) => {
        const id = Date.now();
        setToasts((current) => [...current, {id, tone, title, message}]);
        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, tone === 'error' ? 8000 : 5000);
    }

    const dismissToast = (id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }

    useEffect(() => {
        setFormDisabled(!(cardFormComplete || cardFieldsComplete));
    }, [cardFormComplete, cardFieldsComplete])

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const api = getActiveApi();
        if (!api) {
            notify('error', 'Payment element is not ready', 'Complete the payment details before confirming the order.');
            return;
        }

        try {
            setIsSubmitting(true);

            const tokenResult = await api.tokenise();

            await api.attach({
                token: tokenResult.token,
                select: true,
                intentId: paymentSession.paymentIntentId
            });

            const confirmResult = await api.confirm({});

            if (confirmResult.status == 'error') {
                throw new Error(confirmResult.error.message);
            } else if (confirmResult.status == 'requires_authorisation') {

                const auth = await ServerConnection.authorise(paymentSession.paymentIntentId);

                if (!auth.authorised) {
                    throw new Error("Payment not authorised");
                }

                const verifyResult: VerifyAuthResponse = await ServerConnection.verifyAuth(paymentSession.paymentIntentId)

                if (verifyResult.status === 'success') {
                    notify('success', 'Payment authorised', `Verified auth code: ${verifyResult.auth.authcode}`);
                } else {
                    throw new Error("Payment authorised but not verified")
                }
            } else {
                notify('success', 'Payment confirmed');
            }
        } catch (err) {
            notify('error', 'Payment failed', formatError(err));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="bg-gray-50">
            <ToastViewport toasts={toasts} onDismiss={dismissToast}/>
            <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <h2 className="sr-only">Checkout</h2>

                <form className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16" onSubmit={submitHandler}>
                    <div>

                        <ContactInfo/>
                        <ShippingInfo/>
                        <Delivery/>

                        {/* Payment */}
                        <div className="mt-10 border-t border-gray-200 pt-10">
                            <h2 className="text-lg font-medium text-gray-900">Payment</h2>
                            <fieldset className="mt-4">
                                <legend className="sr-only">Payment type</legend>
                                <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                    {paymentMethods.map((pm) => (
                                        <div key={pm.id} className="flex items-center">
                                            <input
                                                checked={pm.id === paymentMethod.id}
                                                id={pm.id}
                                                name="payment-type"
                                                type="radio"
                                                onChange={() => selectPaymentMethod(pm)}
                                                className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                                            />
                                            <label htmlFor={pm.id}
                                                   className="ml-3 block text-sm/6 font-medium text-gray-700">
                                                {pm.title}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </fieldset>

                        </div>

                        {paymentMethod.id === 'credit-card-form' &&
                          <>
                            <FieldsCardForm refs={fieldsRefs}/>
                            <CardFields
                              fieldReferences={fieldsRefs}
                              showCardIcon={false}
                              onChange={(c: any) => {

                                  function updateField(
                                      key: keyof typeof c,
                                      wrapId: string,
                                      labelId: string,
                                      baseLabel: string
                                  ) {
                                      const wrap = document.getElementById(wrapId);
                                      const label = document.getElementById(labelId);
                                      const field = c[key] as { message?: string; valid: boolean; requested: boolean; };
                                      const isInvalid = field && !field.valid;

                                      if (wrap) {
                                          wrap.style.borderColor = isInvalid ? "red" : "#e5e7eb";
                                      }

                                      if (label) {
                                          label.innerText = field?.message ? `${baseLabel} (${field.message})` : baseLabel;
                                          label.style.color = isInvalid ? "red" : "#64748b";
                                      }
                                  }

                                  updateField("csc", "csc-wrap", "csc-label", "CSC");
                                  updateField("expiry", "expiry-wrap", "expiry-label", "Expiry (MM/YY)");
                                  updateField("name", "name-wrap", "name-label", "Name on card");
                                  updateField("pan", "pan-wrap", "pan-label", "Card number");

                                  setCardFieldsComplete(Boolean(c.complete));
                              }}/>
                        </>
                        }
                        {paymentMethod.id === 'credit-card' && (
                            <div className="mt-4 mb-8">
                                <label htmlFor="layout-select" className="block text-sm font-medium text-gray-700">
                                    Widget Layout
                                </label>
                                <div className="mt-2 grid grid-cols-1">
                                    <select
                                        id="layout-select"
                                        value={layout}
                                        onChange={(e) => {
                                            setLayout(e.target.value as any)
                                            setCardFormComplete(false)
                                        }}
                                        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                    >
                                        <option value="stack">Stack</option>
                                        <option value="stack-compact">Stack Compact</option>
                                        <option value="row">Row</option>
                                        <option value="row-compact">Row Compact</option>
                                        <option value="row-minimal">Row Minimal</option>
                                        <option value="column">Column</option>
                                        <option value="column-compact">Column Compact</option>
                                    </select>
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                                    />
                                </div>
                            </div>
                        )}
                        {/* layout: 'stack' | 'row-minimal' | 'row-compact' | 'row' | 'column-compact' | 'column'*/}
                            <CardElement
                                identifier={cardElementId}
                                visible={paymentMethod.id === 'credit-card'}
                                key={cardElementId}
                                language={'en'}
                                layout={layout}
                                width={'100%'}
                                theme={{
                                    '--cpe-input-bg': '#ffffff',        // input bg
                                    '--cpe-fg': '#6b7280',              // labels/other text
                                    '--cpe-input-border': '#767676',    // input border
                                    '--cpe-border': '#767676',          // general border (optional)
                                    '--cpe-radius': '6px',              // widget border radius
                                }}
                                cardSchemesDisplay={'dynamic-inline'}
                                onChange={async (cs: { complete?: boolean }) => {
                                    setCardFormComplete(Boolean(cs.complete))
                                }}
                                onError={(err: unknown) => {
                                    notify('error', 'Payment element error', formatError(err))
                                }}
                            />

                        <ApplepayElement
                            visible={paymentMethod.id === 'apple'}
                            total={{
                                amount: 1,
                                label: 'GBP'
                            }}
                            appearance={{
                                type: 'buy',
                                style: 'white'
                            }}
                            onAuthoriseEnd={async () => {
                                const intentId = await elementsCtx?.getPaymentIntentId()
                                if (!intentId) throw new Error('intentId is required')
                                const v = await elementsCtx?.verifyPaymentIntentAuth()
                                if (v && v.status === 'success') {
                                    notify('success', 'Apple Pay authorised', `Verified auth code: ${v.auth.authcode}`)
                                } else {
                                    notify('error', 'Apple Pay verification failed')
                                }
                            }}
                            />
                        <GooglepayElement
                            visible={paymentMethod.id === 'google'}
                            identifier={'googlepay'}
                            total={{
                                amount: 1,
                                label: 'GBP'
                            }}
                            environment={'TEST'}
                            merchantId={'***'}
                            merchantName={'myTestMerchant'}
                            onCancel={() => notify('error', 'GooglePay Canceled', 'User cancelled')}
                            onTokeniseEnd={async () => {
                                const api = elementsInstances.get('googlepay')?.api
                                if (!api) throw new Error('No api returned')

                                await api.attach({})

                                const confirmResult = await api.confirm({});

                                if (confirmResult.status == 'error') {
                                    throw new Error(confirmResult.error.message);
                                } else if (confirmResult.status == 'requires_authorisation') {
                                    // now present for authorisation
                                    ServerConnection.authorise(paymentSession.paymentIntentId)
                                    .then(async (resp) => {

                                        if (resp.authorised) {
                                            ServerConnection.verifyAuth(paymentSession.paymentIntentId)
                                            .then(v => {

                                                if (v && v.status === 'success') {
                                                    notify('success', 'Auth succeeded', `Payment authorised on Googlepay. Verified auth: ${v.auth.authcode}`)
                                                } else {
                                                    notify('error', 'Auth failed', `Payment authorisation failed`)
                                                }
                                            })
                                        }
                                    })
                                }
                            }}
                        />
                    </div>
                    <OrderSummary formDisabled={formDisabled || isSubmitting}/>
                </form>
            </div>
        </div>
    )
}

export default function App() {

    const [paymentSession, setPaymentSession] = useState<PaymentIntentSession | undefined>()
    const [sessionError, setSessionError] = useState<string | undefined>()
    const hasCreatedSession = useRef(false)

    useEffect(() => {
        if (hasCreatedSession.current) return
        hasCreatedSession.current = true

        ServerConnection.checkServerConnection()
            .then(() => ServerConnection.getPaymentSession())
            .then(session => {
                console.log('::>> PIID ', session)
                setPaymentSession(session)
            })
            .catch(ex => {
                setSessionError(formatError(ex))
            })
    }, [])

    if (sessionError) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-sm">
                    <div className="flex gap-3">
                        <ExclamationCircleIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red-600"/>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">Unable to start checkout demo</h1>
                            <p className="mt-2 text-sm text-gray-600">{sessionError}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!paymentSession) {
        return <>loading payment session...</>
    }

    return <>

        <CityPayProvider pubKey={import.meta.env.VITE_EX_CP_PUBLIC_KEY}
                         createServerIntent={async () => {
                             return paymentSession;
                         }}
                         middleware={{
                            verifyAuth: VERIFY_AUTH_PATH
                         }}>
                <FormExample paymentSession={paymentSession} />
        </CityPayProvider>
    </>

}
