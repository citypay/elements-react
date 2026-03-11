'use client';

import React from "react";
import { CardFieldsElementOptions } from "@citypay/sdk";
import { useElementsStatus } from "@/components/CityPayProvider";
import { CpeApiEventListeners } from "@/components/Common";
import { FieldsReferences, useCardFields } from "@/components/useCardFields";

export type CardFieldsProps = {
    refs: FieldsReferences;
    options: CardFieldsElementOptions;
} & CpeApiEventListeners;

export const CardFields: React.FC<CardFieldsProps> = (props: CardFieldsProps) => {
    const { refs, options, ...resthandlers } = props;

    const { status, error: providerError } = useElementsStatus();

    const { state: elementState, error: elementError } = useCardFields(refs, options, resthandlers);

    if (status === "cpp:initialising") {
        return <>init...</>;
    }

    if (status === "cpp:idle") {
        return <>idle...</>;
    }

    if (status === "cpp:error") {
        return (
            <p className="text-sm">
                <span>Unable to render CityPay PaymentElement:</span>
                <span className="text-gray-700">{" " + providerError}</span>
            </p>
        );
    }

    if (elementState === "el:error") {
        return (
            <p className="text-sm">
                <span>Unable to render CityPay PaymentElement:</span>
                <span className="text-gray-700">{" " + elementError}</span>
            </p>
        );
    }

    return null;
};