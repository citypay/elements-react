'use client';

import {createElementComponent, CreateElementComponentProps} from './createElement';
import {type CardElementOptions, CityPayElements} from "@citypay/sdk";
import React from "react";

export type CardElementProps = CreateElementComponentProps<CardElementOptions>

export const CardElement: React.FC<CardElementProps> = (props: CardElementProps) => {
    return createElementComponent(props, {
        defaultName: 'cardelement',
        elementFactory: (opts: CardElementOptions, elements: CityPayElements) => elements.cardElement(opts),
    });
};