'use client';

import React, {useMemo} from 'react';
import {CardFieldsElementOptions, ElementsApiListeners} from "@citypay/sdk";
import {useElementsStatus} from "@/CityPayProvider";
import {FieldsReferences, useCardFields} from "@/useCardFields";
import {useCardFieldsContext} from "@/CardFieldsProvider";

export type CardFieldsProps = {
    refs: FieldsReferences;
} & Omit<CardFieldsElementOptions, 'identifier'> & ElementsApiListeners;


export const CardFields: React.FC<CardFieldsProps> = ({refs, ...props}: CardFieldsProps) => {

    const idCtx = useCardFieldsContext().identifier

    // Defer adding the field refs as they may not exist yet
    const propsWithId: CardFieldsElementOptions = useMemo(() => {
        return {
            ...props,
            identifier: idCtx
        }
    }, [idCtx, props])

    useCardFields(refs, propsWithId)
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
