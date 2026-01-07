'use client';

import React, {RefObject, useEffect, useId, useRef} from 'react';
import {type CpeFormHandlers, useCardElement} from './useCardElement';
import {type CardElementOptions, CardFieldsElementOptions} from "@citypay/sdk";
import {useElementsStatus} from "@/components/CityPayProvider";
import {FieldsReferences, useCardFields} from "@/components/useCardFields";

type Props = {
    refs: FieldsReferences;
    options: CardFieldsElementOptions;
} & CpeFormHandlers;


export const CardFields: React.FC<Props> = ({
                                                    refs,
                                                    options,
                                                    onChange,
                                                    onReady,
                                                    onError,
                                                }: Props) => {

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
