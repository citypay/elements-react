'use client';

import React from 'react';
import {FlowElementOptions} from '@citypay/sdk';
import {useElementsStatus} from "@/components/CityPayProvider";
import {type CpeFormHandlers} from "@/components/useCardElement";
import {useFlowElement} from "@/components/useFlowElement";

export type FlowElementProps = {
    elementId?: string;
    options?: Omit<FlowElementOptions, 'identifier' | 'element'>;
    visible?: boolean;
} & CpeFormHandlers;

export const FlowElement: React.FC<FlowElementProps> = ({
    elementId,
    options,
    onChange,
    onReady,
    onError,
    visible = true,
}: FlowElementProps) => {
    const id = elementId ?? 'default';
    const {containerRef} = useFlowElement(id, options, {onChange, onReady, onError})
    const {status, error} = useElementsStatus()

    if (status == 'cpp:initialising') {
        return <>init...</>
    }

    if (status == 'cpp:idle') {
        return <>idle...</>
    }

    if (status == 'cpp:error') {
        return <>️<p className={"text-sm"}>

            <span>Unable to render CityPay FlowElement:</span>
            <span className={"text-gray-700"}>{' ' + error}</span>

        </p> </>
    }

    return <div style={{
        display: visible ? 'block' : 'none',
        height: '100%',
        width: '100%',
        padding:' 1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
        color: '#4b5563',
    }} id={`cp-form-${id}`} ref={containerRef}>
    </div>
}
