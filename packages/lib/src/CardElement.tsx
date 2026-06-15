'use client';

import {createElement, CreateElementComponentProps} from './createElement';
import {type CardElementOptions, CityPayElements} from "@citypay/sdk";
import {useElementsStatus} from "@/CityPayProvider";
import React from "react";

export type CardElementProps = CreateElementComponentProps<CardElementOptions>

export const CardElement: React.FC<CardElementProps> = (props: CardElementProps) => {
    const {containerRef, idSafe} = createElement(props, {
        defaultName: 'cardelement',
        elementFactory: (opts: CardElementOptions, elements: CityPayElements) => elements.cardElement(opts),
    });
    const {status, error} = useElementsStatus();

    const idDom = `cpe-${idSafe}`;
    const visible = props.visible !== false && status === 'cpp:ready';

    return (
        <>
            {status === 'cpp:initialising' && <>init...</>}
            {status === 'cpp:idle' && <>idle...</>}

            {status === 'cpp:error' && (
                <p className="text-sm">
                    <span>Unable to render CityPay PaymentElement:</span>
                    <span className="text-gray-700">{' ' + error}</span>
                </p>
            )}

            <div
                id={idDom}
                ref={containerRef}
                style={{
                    width: '100%',
                    display: visible ? 'block' : 'none',
                }}
            />
        </>
    );
};