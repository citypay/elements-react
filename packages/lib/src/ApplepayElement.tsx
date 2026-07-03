'use client';

import {type AltPaymentOptions, CityPayElements} from "@citypay/sdk";
import {CreateElementComponentProps, ElementComponent} from "@/createElement";
import React from "react";

export type ApplepayElementProps = CreateElementComponentProps<AltPaymentOptions>

export const ApplepayElement: React.FC<ApplepayElementProps> = (props: ApplepayElementProps) => {

    return ElementComponent(props, {
        defaultName: 'applepay',
        elementFactory: (opts: AltPaymentOptions, elements: CityPayElements) => elements.applePay(opts),
    })
}
