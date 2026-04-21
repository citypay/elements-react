'use client'

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

    return (
        <CityPayProvider
            {...providerProps}
            middleware={{
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
                        showDefaultCardOption: true,
                        defaultCardChecked: false,
                        defaultCardSelected: false,
                    }}
                />
            </FlowElementProvider>
        </CityPayProvider>
    );
}
