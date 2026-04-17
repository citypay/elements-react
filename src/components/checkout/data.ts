import type {ChakraLayout, PaymentMethod, WidgetLayout} from '@/components/checkout/types';

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
    {id: 'chakra', title: 'Chakra'},
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

export const chakraLayouts: Array<{value: ChakraLayout; label: string}> = [
    {value: 'add', label: 'Add'},
    {value: 'pay', label: 'Pay'},
];

export const chakraLayoutDescriptions: Record<ChakraLayout, {title: string; body: string}> = {
    add: {
        title: 'Add element',
        body: 'Use this flow to collect and store payment details for later use or to save a card before checkout, and the user can set the card as the default for future use.',
    },
    pay: {
        title: 'Pay element',
        body: 'Use this flow to collect payment details for an immediate payment while also saving the card for future use. It is suited to direct checkout, and the user can set the card as the default for future use.',
    },
};
