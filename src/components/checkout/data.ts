import type {FlowType, PaymentMethod, WidgetLayout} from '@/components/checkout/types';

export const products = [
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
];

export const deliveryMethods = [
    {id: 1, title: 'Standard', turnaround: '4-10 business days', price: '£5.00'},
    {id: 2, title: 'Express', turnaround: '2-5 business days', price: '£16.00'},
];

export const paymentMethods: PaymentMethod[] = [
    {id: 'credit-card', title: 'CCWidget'},
    {id: 'credit-card-form', title: 'CCForm'},
    {id: 'apple', title: 'ApplePay'},
    {id: 'google', title: 'GooglePay'},
    {id: 'flow', title: 'Flows'},
];

export const widgetLayoutOptions: Array<{value: WidgetLayout; label: string}> = [
    {value: 'stack', label: 'Stack'},
    {value: 'stack-compact', label: 'Stack Compact'},
    {value: 'row', label: 'Row'},
    {value: 'row-compact', label: 'Row Compact'},
    {value: 'row-minimal', label: 'Row Minimal'},
    {value: 'column', label: 'Column'},
    {value: 'column-compact', label: 'Column Compact'},
];

export const flowTypes: Array<{value: FlowType; label: string}> = [
    {value: 'verify', label: 'Verify'},
    {value: 'payment', label: 'Payment'},
];

export const flowTypeDescriptions: Record<FlowType, {title: string; body: string}> = {
    verify: {
        title: 'Verify flow',
        body: 'Use this flow to collect and verify payment details for later use before checkout, and the user can set the card as the default for future use.',
    },
    payment: {
        title: 'Pay flow',
        body: 'Use this flow to collect payment details for an immediate payment while also verifying and saving the card for future use. It is suited to direct checkout, and the user can set the card as the default for future use.',
    },
};
