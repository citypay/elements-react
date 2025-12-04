'use client';

import React, {useId, useRef} from 'react';
import {type CpeFormHandlers, useCardElement} from './useCardElement';
import {type CardElementOptions} from "@citypay/sdk";
import {useElementsStatus} from "@/components/CityPayProvider";

type Props = {
    elementId?: string;
    options?: Omit<CardElementOptions, 'id' | 'element'>;
    visible?: boolean;
} & CpeFormHandlers;


export const CardElement: React.FC<Props> = ({
                                                    elementId,
                                                    options,
                                                    onChange,
                                                    onReady,
                                                    onError,
                                                    visible = true,
                                                }: Props) => {
    const id = elementId ?? 'default';
    const {containerRef, state} = useCardElement(id, options, {onChange, onReady, onError})
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

    return <div style={{display: visible ? 'block' : 'none'}} id={`cp-form-${id}`} ref={containerRef}></div>
}
