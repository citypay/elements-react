'use client';

import React from 'react';
import {type CpeFormHandlers} from './useCardElement';
import {CardFieldsElementOptions} from "@citypay/sdk";
import {useElementsStatus} from "@/components/CityPayProvider";
import {FieldsReferences, useCardFields} from "@/components/useCardFields";

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

    if (status == 'cpp:error') {
        return <>️<p className={"text-sm"}>

            <span>Unable to render CityPay PaymentElement:</span>
            <span className={"text-gray-700"}>{' ' + error}</span>

        </p> </>
    }

    return null
}
