'use client';

import React from 'react';
import {type CpeFormHandlers, useCardElement} from './useCardElement';
import {type CardElementOptions} from "@citypay/sdk";
import {useElementsStatus} from "@/CityPayProvider";

export type CardElementProps = {
    elementId?: string;
    options?: Omit<CardElementOptions, 'id' | 'element'>;
    visible?: boolean;
} & CpeFormHandlers;


export const CardElement: React.FC<CardElementProps> = ({
                                                    elementId,
                                                    options,
                                                    onChange,
                                                    onReady,
                                                    onError,
                                                    visible = true,
                                                }: CardElementProps) => {
    const id = elementId ?? 'default';
    const {containerRef} = useCardElement(id, options, {onChange, onReady, onError})
    const {status, error}  = useElementsStatus()

    if (status == 'cpp:initialising') {
        return <>init...</>
    }

    if (status == 'cpp:idle') {
        return <>idle...</>
    }

    if (status == 'cpp:error') {
        return <>️<p className={"text-sm"}>

            <span>Unable to render CityPay PaymentElement:</span>
            <span className={"text-gray-700"}>{' ' + error}</span>

        </p> </>
    }

    return <div style={{width: '100%'}} id={`cp-form-${id}`} ref={containerRef}></div>
}
