'use client';

import {type GooglePaymentOptions, CityPayElements} from "@citypay/sdk";
import {CreateElementComponentProps, ElementComponent} from "@/createElement";
import React from "react";

export type GooglepayElementProps = CreateElementComponentProps<GooglePaymentOptions>

export const GooglepayElement: React.FC<GooglepayElementProps> = (props: GooglepayElementProps) => {

    return ElementComponent(props, {
        defaultName: 'googlepay',
        elementFactory: (opts: GooglePaymentOptions, elements: CityPayElements) => elements.googlePay(opts)
    })
}
