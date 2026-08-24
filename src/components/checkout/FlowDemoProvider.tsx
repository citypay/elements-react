'use client'

import type {PaymentIntentSession} from '@citypay/sdk';
import {FlowElement} from '@/components/FlowElement';
import {FlowElementProvider} from '@/components/FlowElementProvider';
import {CityPayProvider} from '@/components/CityPayProvider';
import type {FlowType, SharedProviderProps} from '@/components/checkout/types';

type Props = {
    providerProps: SharedProviderProps;
    flowElementId: string;
    flowType: FlowType;
};

export function FlowDemoProvider({
    providerProps,
    flowElementId,
    flowType,
}: Props) {

    const createServerIntent = async (): Promise<PaymentIntentSession> => {
        const response = await fetch('/api/payment-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: flowType === 'verify' ? 'verify' : 'flow-payment',
            }),
        });

        if (!response.ok) {
            throw new Error(`Unable to create ${flowType} payment intent`);
        }

        return await response.json() as PaymentIntentSession;
    };

    return (
        <CityPayProvider
            key={flowType}
            pubKey={providerProps.pubKey}
            createServerIntent={createServerIntent}
            middleware={{
                authorise: '/api/auth',
                verifyAuth: '/api/verify-auth',
            }}
        >
            <FlowElementProvider id="flowform">
                <FlowElement
                    key={flowElementId}
                    elementId={flowElementId}
                    flowType={flowType}
                    options={{
                        language: 'en',
                        width: '100%',
                    }}
                />
            </FlowElementProvider>
        </CityPayProvider>
    );
}
