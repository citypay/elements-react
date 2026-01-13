'use client'
import {ChevronDownIcon} from '@heroicons/react/16/solid'
import {CheckCircleIcon, TrashIcon} from '@heroicons/react/20/solid'
import {useEffect, useRef, useState} from "react";
import {CityPayProvider, useElements} from "@/components/CityPayProvider";
import {CardElement} from "@/components/CardElement";
import {PaymentIntentSession, VerifyAuthResponse} from "@citypay/sdk";
import {CardElementProvider, useCardElementContext} from "@/components/CardElementProvider";
import {CardFieldsProvider, useCardFieldsContext} from "@/components/CardFieldsProvider";
import {FieldsReferences} from "@/components/useCardFields";
import {CardFields} from "@/components/CardFields";
import {CardForm} from "@/app/FieldsCardForm";

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
    {id: 'credit-card', title: 'CCWidget'},
    {id: 'credit-card-form', title: 'CCForm'},
    {id: 'apple', title: 'ApplePay'},
    {id: 'google', title: 'GooglePay'},
]


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

    const cardElCtx = useCardElementContext();
    const cardFieldsCtx = useCardFieldsContext();
    const elementsCtx = useElements()
    const [cardFormComplete, setCardFormComplete] = useState(false);
    const [cardFieldsComplete, setCardFieldsComplete] = useState(false);
    const [formDisabled, setFormDisabled] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0])
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState<string | undefined>();
    const [paymentComplete, setPaymentComplete] = useState<string | undefined>();
    const fieldsRefs: FieldsReferences = {
        csc: useRef(null),
        expiry: useRef(null),
        name: useRef(null),
        pan: useRef(null)

    }

    const getActiveApi = () =>
        paymentMethod.id === "credit-card"
            ? cardElCtx.getElement()?.api
            : paymentMethod.id === "credit-card-form"
                ? cardFieldsCtx.getElement()?.api
                : undefined;

    useEffect(() => {
        setFormDisabled(!(cardFormComplete || cardFieldsComplete));
    }, [cardFormComplete, cardFieldsComplete])

    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const api = getActiveApi();
        if (!api) {
            console.warn(`Aborting submit as instances not ready`);
            return;
        } // not ready yet

        try {
            setIsSubmitting(true);

            // 1) Create a token from the mounted card element(s)
            const tokenResult = await api.tokenise();
            // console.log('>>> tokenResult:', tokenResult);

            // 2) Attach token to an intent (if your flow uses intents)
            const attachResult = await api.attach({
                token: tokenResult.token,
                select: true,
                intentId: paymentSession.paymentIntentId
            });
            console.log('>>> attachResult:', attachResult);

            // 3) Confirm the payment (3DS may happen here)
            const confirmResult = await api.confirm({
                // intentId: attachResult.intentId, returnUrl: ...
            });
            console.log('>>> confirmResult:', confirmResult);

            if (confirmResult.status == 'error') {
                setPaymentError(confirmResult.error.message);
            } else if (confirmResult.status == 'requires_authorisation') {
                // now present for authorisation
                fetch('/api/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        intentId: paymentSession.paymentIntentId
                    })
                }).then(async (resp) => {

                    const auth = await resp.json()
                    console.log(auth);

                    if (auth.authorised) {
                        setPaymentComplete(`Payment authorised on card: ${auth.auth_code}. Verifying auth...`)

                        const intentId = await elementsCtx?.getPaymentIntentId()
                        if (!intentId) throw new Error('intentId is required')
                        console.log('Verifying intent ', intentId)
                        const v: VerifyAuthResponse | undefined = await elementsCtx?.verifyPaymentIntentAuth()
                        console.log('Verify intent result ', v)

                        if (v && v.status === 'success') {
                            setPaymentComplete(`Payment authorised on card: ${auth.auth_code}. Verified auth: ${v.auth.authcode}`)
                        } else {
                            setPaymentError(`Payment authorisation failed: ${auth.result_code}: ${auth.result_message}`)
                        }

                        setPaymentComplete(`Payment authorised on card: ${auth.auth_code}. Auth verification failed.`)

                    } else {
                        setPaymentError(`Payment authorisation failed: ${auth.result_code}: ${auth.result_message}`)
                    }


                })
            }

            // Handle success UI...
        } catch (err) {
            // Show error UI...
            // 2. or by catching the error on the elements function calls
            console.error('>>> Error during payment processing:', err);
            setPaymentError('Error during payment processing')
        } finally {
            setIsSubmitting(false);
        }
    }

    function ButtonToggle() {
        return (<button onClick={async () => {
            setFormDisabled((e) => !e)
        }}>
            Toggle Mount 2...
        </button>)
    }

    return (
        <div className="bg-gray-50">
            <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <h2 className="sr-only">Checkout</h2>

                <form className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16" onSubmit={submitHandler}>
                    <div>

                        <Delivery/>

                        {/* Payment */}
                        <div className="mt-10 border-t border-gray-200 pt-10">
                            <h2 className="text-lg font-medium text-gray-900">Payment {formDisabled ? "DIS" : "EN"}</h2>
                            <fieldset className="mt-4">
                                <legend className="sr-only">Payment type</legend>
                                <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                                    {paymentMethods.map((pm) => (
                                        <div key={pm.id} className="flex items-center">
                                            <input
                                                defaultChecked={pm.id === paymentMethod.id}
                                                id={pm.id}
                                                name="payment-type"
                                                type="radio"
                                                onChange={() => setPaymentMethod(pm)}
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
                            <CardForm refs={fieldsRefs}/>
                            <CardFields refs={fieldsRefs} options={{id: 'cardfields', cscElement: '#cf-csc', expiryElement: '#cf-expiry', nameElement: '#cf-name', panElement: '#cf-pan'}}
                            onChange={(c) => {

                                function updateField(
                                    key: keyof typeof c,
                                    wrapId: string,
                                    labelId: string,
                                    baseLabel: string
                                ) {
                                    const wrap = document.getElementById(wrapId)
                                    const label = document.getElementById(labelId)
                                    const field = c[key] as { message?: string; valid: boolean; requested: boolean; }
                                    const isInvalid = field && !field.valid

                                    if (wrap) {
                                        wrap.style.borderColor = isInvalid ? "red" : "#e5e7eb"
                                    }

                                    if (label) {
                                        label.innerText = field?.message ? `${baseLabel} (${field.message})` : baseLabel
                                        label.style.color = isInvalid ? "red" : "#64748b"
                                    }
                                }

                                updateField("csc", "csc-wrap", "csc-label", "CSC")
                                updateField("expiry", "expiry-wrap", "expiry-label", "Expiry (MM/YY)")
                                updateField("name", "name-wrap", "name-label", "Name on card")
                                updateField("pan", "pan-wrap", "pan-label", "Card number")


                                if (c.complete) {
                                    console.log('CardFields complete')
                                    setCardFieldsComplete(true)
                                } else {
                                    setCardFieldsComplete(false)
                                }
                            }}/>
                        </>
                        }
                        <CardElement
                            elementId={'cardform'}
                            visible={paymentMethod.id === 'credit-card'}
                            options={{language: 'en', layout: 'stack'}}
                            onChange={async (cs) => {
                                console.log('>>>onChange', cs)
                                if (cs.complete) {
                                    console.log('>>>complete')
                                    setCardFormComplete(true)
                                } else {
                                    setCardFormComplete(false)
                                }
                            }}
                        />



                        <div className={"text-green-800"}>{ paymentComplete }</div>
                        <div className={"text-red-800"}>{ paymentError }</div>
                        {paymentMethod.id === 'apple' && <p>Apple TODO</p>}
                        {paymentMethod.id === 'google' && <p>Google TODO</p>}


                    </div>
                    <OrderSummary formDisabled={formDisabled}/>
                </form>
            </div>
        </div>
    )
}

export default function ExamplePage() {

    const [paymentSession, setPaymentSession] = useState<PaymentIntentSession | undefined>()

    useEffect(() => {
        fetch('/api/payment-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 1000,
                currency: 'GBP'
            })
        }).then(async (resp) => {
            if (resp.status === 200) {
                const data = await resp.json()
                setPaymentSession(data)
            }
        })
    }, []);

    if (!paymentSession) {
        return <>loading payment session...</>
    }

    return <>

        <CityPayProvider pubKey={process.env.NEXT_PUBLIC_CITYPAY_PUB_KEY}
                         createServerIntent={async () => {
                             return paymentSession;
                         }}
                         middleware={{
                            verifyAuth: '/api/verify-auth'
                         }}>
            <CardElementProvider id={'cardform'} >
            <CardFieldsProvider id={'cardfields'}>
                <FormExample paymentSession={paymentSession} />
            </CardFieldsProvider>
            </CardElementProvider>
        </CityPayProvider>
    </>

}
