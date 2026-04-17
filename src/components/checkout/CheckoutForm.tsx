'use client'

import type {PaymentIntentSession} from '@citypay/sdk';
import {CardElement} from '@/components/CardElement';
import {CardFields} from '@/components/CardFields';
import {ApplepayElement} from '@/components/ApplepayElement';
import {CardForm} from '@/app/FieldsCardForm';
import {chakraLayoutDescriptions, chakraLayouts, widgetLayoutOptions} from '@/components/checkout/data';
import {ChakraDemoProvider} from '@/components/checkout/ChakraDemoProvider';
import {
    DeliverySection,
    OrderSummary,
    PaymentMethodSelector,
    PaymentStatus,
    SelectField,
} from '@/components/checkout/CheckoutSections';
import {useCheckoutForm} from '@/components/checkout/useCheckoutForm';
import type {ChakraLayout, SharedProviderProps, WidgetLayout} from '@/components/checkout/types';

type Props = {
    paymentSession: PaymentIntentSession;
    chakraProviderProps: SharedProviderProps;
};

export function CheckoutForm({paymentSession, chakraProviderProps}: Props) {
    const {
        cardElementId,
        chakraElementId,
        chakraLayout,
        fieldsRefs,
        formDisabled,
        handleApplePayAuthoriseEnd,
        handleCardElementChange,
        handleCardFieldsChange,
        handleChakraLayoutChange,
        handleWidgetLayoutChange,
        layout,
        paymentComplete,
        paymentError,
        paymentMethod,
        selectPaymentMethod,
        submitHandler,
    } = useCheckoutForm(paymentSession);

    return (
        <div className="bg-gray-50">
            <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <h2 className="sr-only">Checkout</h2>

                <form className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16" onSubmit={submitHandler}>
                    <div>
                        <DeliverySection/>

                        <div className="mt-10 border-t border-gray-200 pt-10">
                            <h2 className="text-lg font-medium text-gray-900">
                                Payment {formDisabled ? 'DIS' : 'EN'}
                            </h2>
                            <PaymentMethodSelector
                                selectedPaymentMethodId={paymentMethod.id}
                                onSelect={selectPaymentMethod}
                            />
                        </div>

                        {paymentMethod.id === 'credit-card-form' && (
                            <>
                                <CardForm refs={fieldsRefs}/>
                                <CardFields
                                    refs={fieldsRefs}
                                    options={{
                                        id: 'cardfields',
                                        cscElement: '#cf-csc',
                                        expiryElement: '#cf-expiry',
                                        nameElement: '#cf-name',
                                        panElement: '#cf-pan',
                                    }}
                                    onChange={handleCardFieldsChange}
                                />
                            </>
                        )}

                        {paymentMethod.id === 'credit-card' && (
                            <SelectField
                                id="layout-select"
                                label="Widget Layout"
                                value={layout}
                                options={widgetLayoutOptions}
                                onChange={(value) => handleWidgetLayoutChange(value as WidgetLayout)}
                            />
                        )}

                        {paymentMethod.id === 'chakra' && (
                            <SelectField
                                id="chakra-layout-select"
                                label="Chakra Layout"
                                value={chakraLayout}
                                options={chakraLayouts}
                                onChange={(value) => handleChakraLayoutChange(value as ChakraLayout)}
                            />
                        )}

                        {paymentMethod.id === 'credit-card' && (
                            <CardElement
                                key={cardElementId}
                                elementId={cardElementId}
                                options={{
                                    language: 'en',
                                    layout,
                                    width: '100%',
                                    theme: {
                                        '--cpe-input-bg': '#ffffff',
                                        '--cpe-fg': '#6b7280',
                                        '--cpe-input-border': '#767676',
                                        '--cpe-border': '#767676',
                                        '--cpe-radius': '6px',
                                    },
                                }}
                                onChange={handleCardElementChange}
                            />
                        )}

                        {paymentMethod.id === 'apple' && (
                            <ApplepayElement
                                options={{element: 'applePayDiv', total: {amount: 1, label: 'GBP'}}}
                                onAuthoriseEnd={handleApplePayAuthoriseEnd}
                            />
                        )}

                        {paymentMethod.id === 'chakra' && (
                            <>
                                <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        {chakraLayoutDescriptions[chakraLayout].title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {chakraLayoutDescriptions[chakraLayout].body}
                                    </p>
                                </div>
                                <ChakraDemoProvider
                                    providerProps={chakraProviderProps}
                                    chakraElementId={chakraElementId}
                                    chakraLayout={chakraLayout}
                                />
                            </>
                        )}

                        {paymentMethod.id === 'google' && <p>Google TODO</p>}

                        <PaymentStatus paymentComplete={paymentComplete} paymentError={paymentError}/>
                    </div>

                    <OrderSummary formDisabled={formDisabled}/>
                </form>
            </div>
        </div>
    );
}
