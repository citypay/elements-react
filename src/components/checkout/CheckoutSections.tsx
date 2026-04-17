'use client'

import {ChevronDownIcon} from '@heroicons/react/16/solid';
import {CheckCircleIcon, TrashIcon} from '@heroicons/react/20/solid';
import {deliveryMethods, paymentMethods, products} from '@/components/checkout/data';
import type {PaymentMethod, PaymentMethodId} from '@/components/checkout/types';

type SelectOption = {
    value: string;
    label: string;
};

type SelectFieldProps = {
    id: string;
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
};

type PaymentMethodSelectorProps = {
    selectedPaymentMethodId: PaymentMethodId;
    onSelect: (paymentMethod: PaymentMethod) => void;
};

type OrderSummaryProps = {
    formDisabled: boolean;
};

type PaymentStatusProps = {
    paymentComplete?: string;
    paymentError?: string;
};

export function DeliverySection() {
    return (
        <div className="mt-10 border-t border-gray-200 pt-10">
            <fieldset>
                <legend className="text-lg font-medium text-gray-900">Delivery method</legend>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    {deliveryMethods.map((deliveryMethod) => (
                        <label
                            key={deliveryMethod.id}
                            aria-label={deliveryMethod.title}
                            aria-description={`${deliveryMethod.turnaround} for ${deliveryMethod.price}`}
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
                                <span className="block text-sm font-medium text-gray-900">
                                    {deliveryMethod.title}
                                </span>
                                <span className="mt-1 block text-sm text-gray-500">
                                    {deliveryMethod.turnaround}
                                </span>
                                <span className="mt-6 block text-sm font-medium text-gray-900">
                                    {deliveryMethod.price}
                                </span>
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
    );
}

export function PaymentMethodSelector({
    selectedPaymentMethodId,
    onSelect,
}: PaymentMethodSelectorProps) {
    return (
        <fieldset className="mt-4">
            <legend className="sr-only">Payment type</legend>
            <div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
                {paymentMethods.map((paymentMethod) => (
                    <div key={paymentMethod.id} className="flex items-center">
                        <input
                            checked={paymentMethod.id === selectedPaymentMethodId}
                            id={paymentMethod.id}
                            name="payment-type"
                            type="radio"
                            onChange={() => onSelect(paymentMethod)}
                            className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                        />
                        <label
                            htmlFor={paymentMethod.id}
                            className="ml-3 block text-sm/6 font-medium text-gray-700"
                        >
                            {paymentMethod.title}
                        </label>
                    </div>
                ))}
            </div>
        </fieldset>
    );
}

export function SelectField({
    id,
    label,
    value,
    options,
    onChange,
}: SelectFieldProps) {
    return (
        <div className="mt-4 mb-8">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="mt-2 grid grid-cols-1">
                <select
                    id={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                />
            </div>
        </div>
    );
}

export function PaymentStatus({paymentComplete, paymentError}: PaymentStatusProps) {
    return (
        <>
            <div className="text-green-800">{paymentComplete}</div>
            <div className="text-red-800">{paymentError}</div>
        </>
    );
}

export function OrderSummary({formDisabled}: OrderSummaryProps) {
    return (
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
                                            <a href={product.href} className="font-medium text-gray-700 hover:text-gray-800">
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
    );
}
