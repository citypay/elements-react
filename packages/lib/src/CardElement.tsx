'use client';

import React, {useMemo} from 'react';
import {useCardElement} from './useCardElement';
import {type CardElementOptions, ElementsApiListeners} from "@citypay/sdk";
import {useElementsStatus} from "@/CityPayProvider";
import {useCardElementContext} from "@/CardElementProvider";

export type CardElementProps = {
    visible?: boolean;
} & Omit<CardElementOptions, 'element' | 'identifier'> & ElementsApiListeners


export const CardElement: React.FC<CardElementProps> = (props: CardElementProps) => {

    const idCtx = useCardElementContext().identifier

    const idDom = `cpe-${idCtx}`

    const fullOptions: CardElementOptions = useMemo(() => {
        return {
            ...props,
            element: idDom,
            identifier: idCtx
        }
    }, [idCtx, props])

    const {containerRef} = useCardElement(fullOptions)
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

    return <div style={{width: '100%', display: props.visible ? 'block' : 'none'}} id={idDom} ref={containerRef}></div>
}
