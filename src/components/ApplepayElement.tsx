'use client';

import React, {useMemo} from 'react';
import {type AltPaymentOptions} from "@citypay/sdk";
import {CpeApplePayHandlers, useApplepayElement} from "@/components/useApplePay";
import {useApplepayElementIdentifier} from "@/components/ApplepayProvider";
import {useElementsStatus} from "@/components/CityPayProvider";

type Props = {
    options: Omit<AltPaymentOptions, 'identifier'>;
    visible?: boolean;
} & CpeApplePayHandlers;


export const ApplepayElement: React.FC<Props> = ({
                                                    options,
                                                    onAuthoriseEnd,
                                                    onError,
                                                    visible = true,
                                                }: Props) => {

    const applepayIdentifier = useApplepayElementIdentifier()

    const elementId = useMemo(() => {
        return options.element.startsWith('#') ? options.element.slice(1) : options.element;
        }, [options.element]);

    // Rebuild options with a normalised id string
    const normalisedOptions = useMemo<AltPaymentOptions>(() => ({
        ...options,
        element: elementId,
        identifier: applepayIdentifier
    }), [options, elementId, applepayIdentifier]);

    const {containerRef, state} = useApplepayElement(normalisedOptions, {onAuthoriseEnd, onError})
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

    return <div style={{display: visible ? 'block' : 'none'}} id={elementId} ref={containerRef}></div>
}
