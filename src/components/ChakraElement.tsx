'use client';

import React from 'react';
import {type ChakraElementOptions} from "@citypay/sdk";
import {useElementsStatus} from "@/components/CityPayProvider";
import {type CpeFormHandlers} from "@/components/useCardElement";
import {useChakraElement} from "@/components/useChakraElement";

export type ChakraElementProps = {
    elementId?: string;
    options?: Omit<ChakraElementOptions, 'identifier' | 'element'>;
    visible?: boolean;
} & CpeFormHandlers;

export const ChakraElement: React.FC<ChakraElementProps> = ({
    elementId,
    options,
    onChange,
    onReady,
    onError,
    visible = true,
}: ChakraElementProps) => {
    const id = elementId ?? 'default';
    const {containerRef} = useChakraElement(id, options, {onChange, onReady, onError})
    const {status, error} = useElementsStatus()

    if (status == 'cpp:initialising') {
        return <>init...</>
    }

    if (status == 'cpp:idle') {
        return <>idle...</>
    }

    if (status == 'cpp:error') {
        return <>️<p className={"text-sm"}>

            <span>Unable to render CityPay ChakraElement:</span>
            <span className={"text-gray-700"}>{' ' + error}</span>

        </p> </>
    }

    return <div style={{
        display: visible ? 'block' : 'none',
        width: '100%',
        padding:' 1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        color: '#4b5563',
    }} id={`cp-form-${id}`} ref={containerRef}>
    </div>
}
