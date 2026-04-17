import type {ComponentProps} from 'react';
import type {CityPayProvider} from '@/components/CityPayProvider';

export type SharedProviderProps = Pick<
    ComponentProps<typeof CityPayProvider>,
    'pubKey' | 'createServerIntent'
>;

export type ChakraLayout = 'add' | 'pay';

export type WidgetLayout =
    | 'stack'
    | 'stack-compact'
    | 'row-minimal'
    | 'row-compact'
    | 'row'
    | 'column-compact'
    | 'column';

export type PaymentMethodId =
    | 'credit-card'
    | 'credit-card-form'
    | 'apple'
    | 'google'
    | 'chakra';

export type PaymentMethod = {
    id: PaymentMethodId;
    title: string;
};
