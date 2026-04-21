'use client';

import React, {useMemo} from 'react';
import {type AltPaymentOptions, ElementsApiListeners} from "@citypay/sdk";
import {useApplepayElementContext} from "@/ApplepayProvider";
import {useApplepayElement} from "@/useApplePay";
import {useElementsStatus} from "@/CityPayProvider";

export type ApplepayElementProps = {
    visible?: boolean;
} & Omit<AltPaymentOptions, 'identifier' | 'element'> & ElementsApiListeners


export const ApplepayElement: React.FC<ApplepayElementProps> = (props: ApplepayElementProps) => {

    const idCtx = useApplepayElementContext().identifier

    const idDom = `cpe-${idCtx}`

    // Rebuild options with a normalised id string
    const normalisedProps = useMemo<ApplepayElementProps>(() => ({
        ...props,
        identifier: idCtx,
        element: idDom,
    }), [props, idDom]);

    const {containerRef, state} = useApplepayElement(normalisedProps)
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

    return <div style={{display: props.visible ? 'block' : 'none'}} id={idDom} ref={containerRef}></div>
}
