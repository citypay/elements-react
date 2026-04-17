'use client'

import {ChakraElement} from '@/components/ChakraElement';
import {ChakraElementProvider} from '@/components/ChakraElementProvider';
import {CityPayProvider} from '@/components/CityPayProvider';
import type {ChakraLayout, SharedProviderProps} from '@/components/checkout/types';

type Props = {
    providerProps: SharedProviderProps;
    chakraElementId: string;
    chakraLayout: ChakraLayout;
};

export function ChakraDemoProvider({
    providerProps,
    chakraElementId,
    chakraLayout,
}: Props) {
    return (
        <CityPayProvider {...providerProps}>
            <ChakraElementProvider id="chakraform">
                <ChakraElement
                    key={chakraElementId}
                    elementId={chakraElementId}
                    options={{
                        language: 'en',
                        layout: chakraLayout,
                        width: '100%',
                        showDefaultCardOption: true,
                        defaultCardChecked: false,
                        defaultCardSelected: false,
                    }}
                />
            </ChakraElementProvider>
        </CityPayProvider>
    );
}
