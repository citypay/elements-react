'use client';

import React from 'react';
import {type CpeFormHandlers} from '@/useCardElement';
import {CardFieldsElementOptions} from "@citypay/sdk";
import {useElementsStatus} from "@/CityPayProvider";
import {FieldsReferences, useCardFields} from "@/useCardFields";

export type CardFieldsProps = {
    refs: FieldsReferences;
    options: CardFieldsElementOptions;
} & CpeFormHandlers;


export const CardFields: React.FC<CardFieldsProps> = ({
                                                    refs,
                                                    options,
                                                    onChange,
                                                    onReady,
                                                    onError,
                                                }: CardFieldsProps) => {

    useCardFields(refs, options, {onChange, onReady, onError})
    const {status, error}  = useElementsStatus()

    if (status == 'cpp:initialising') {
        return <>init...</>
    }

    if (status == 'cpp:idle') {
        return <>idle...</>
    }

    if (status === 'cpp:error') {
        return (
            <>
                <p style={{ fontSize: '0.875rem' }}>
                    <span>Unable to render CityPay PaymentElement:</span>
                    <span style={{ color: '#374151' }}>{' ' + error}</span>
                </p>
            </>
        );
    }

    return null
}
