'use client';

import {type AltPaymentOptions, CityPayElements} from "@citypay/sdk";
import {CreateElementComponentProps, createElementComponent} from "@/createElement";
import React from "react";

export type ApplepayElementProps = CreateElementComponentProps<AltPaymentOptions>

export const ApplepayElement: React.FC<ApplepayElementProps> = (props: ApplepayElementProps) => {

    return createElementComponent(props, {
        defaultName: 'applepay',
        elementFactory: (opts: AltPaymentOptions, elements: CityPayElements) => elements.applepay(opts),
    })
}
