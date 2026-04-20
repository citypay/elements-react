'use client'

import {useEffect, useState} from 'react';
import type {PaymentIntentSession} from '@citypay/sdk';
import {ApplepayElementProvider} from '@/components/ApplepayProvider';
import {CardElementProvider} from '@/components/CardElementProvider';
import {CardFieldsProvider} from '@/components/CardFieldsProvider';
import {CityPayProvider} from '@/components/CityPayProvider';
import {CheckoutForm} from '@/components/checkout/CheckoutForm';
import type {SharedProviderProps} from '@/components/checkout/types';

export function CheckoutPage() {
    const [paymentSession, setPaymentSession] = useState<PaymentIntentSession>();
    const [applepayIdentifier] = useState(() => `applepay-${Math.random().toPrecision(5)}`);

    useEffect(() => {
        fetch('/api/payment-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: 0,
                currency: 'GBP',
            }),
        }).then(async (response) => {
            if (response.status !== 200) {
                return;
            }

            const data = await response.json();
            setPaymentSession(data);
        });
    }, []);

    if (!paymentSession) {
        return <>loading payment session...</>;
    }

    const sharedProviderProps: SharedProviderProps = {
        pubKey: process.env.NEXT_PUBLIC_CITYPAY_PUB_KEY,
        createServerIntent: async () => paymentSession,
    };

    return (
        <CityPayProvider
            {...sharedProviderProps}
            middleware={{
                authorise: '/api/auth',
                verifyAuth: '/api/verify-auth',
            }}
        >
            <ApplepayElementProvider id={applepayIdentifier}>
                <CardElementProvider id="cardform">
                    <CardFieldsProvider id="cardfields">
                        <CheckoutForm
                            paymentSession={paymentSession}
                            flowProviderProps={sharedProviderProps}
                        />
                    </CardFieldsProvider>
                </CardElementProvider>
            </ApplepayElementProvider>
        </CityPayProvider>
    );
}
