'use client';

import React from 'react';
import {CardFieldsElementOptions, ElementsApiListeners} from "@citypay/sdk";
import {useElementsStatus} from "@/CityPayProvider";
import {FieldsReferences, useCardFields} from "@/useCardFields";

export type CardFieldsProps = {
    refs: FieldsReferences;
} & Omit<CardFieldsElementOptions, 'identifier'> & ElementsApiListeners;


export const CardFields: React.FC<CardFieldsProps> = (props: CardFieldsProps) => {

    useCardFields(props)
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
