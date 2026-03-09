import {useMemo, useState} from "react";
import {HookState, useElementsStatus} from "@/components/CityPayProvider";
import {AltPaymentOptions, CardElementOptions, GooglePaymentOptions, MonoFrameElementOptions} from "@citypay/sdk";
import {CpeApiEventListeners} from "@/components/Common";
import {
    ElementReactOptions,
    useApplepayElementIdentifier, useCardElementIdentifier,
    useGooglepayElementIdentifier
} from "@/components/ElementProvider";
import {useApplepayElement, useCardElement, useGooglepayElement} from "@/components/useElement";

type ElementProps<TSdkOpts extends MonoFrameElementOptions> = {

    // These options will be passed to the SDK
    options: Omit<TSdkOpts, "identifier" | "element">;

    visible?: boolean;

    /**
     * Used for the wrapper div id: `cpe-${idPrefix}-${identifier}`
     * (e.g. "googlepay", "applepay")
     */
    idPrefix: string;

    /** Function that returns the identifier string */
    identifierFn: () => string;

    /**
     * Hook that mounts/initialises the element.
     * It must accept options WITH element+identifier already injected.
     */
    useElementFn: (options: ElementReactOptions<TSdkOpts>, handlers: CpeApiEventListeners) => {state: HookState, error: string | Error | null};
} & CpeApiEventListeners;


const Element = <TSdkOpts extends MonoFrameElementOptions>(
        props: ElementProps<TSdkOpts>
    ) => {

    const {
        options,
        visible = true,
        idPrefix,
        identifierFn,
        useElementFn,
        ...restHandlers
    } = props;

    const identifier = identifierFn();
    const [containerState, setContainerState] = useState<HTMLDivElement | null>(
        null
    );

    const { status: cpStatus, error: cpError } = useElementsStatus();

    const normalisedOptions = useMemo<ElementReactOptions<TSdkOpts>>(
        () =>
            ({
                mountElement: containerState || undefined,
                adapt: () => {
                    return {
                        ...options,
                        element: containerState,
                        identifier: identifier,
                    } as unknown as TSdkOpts;
                }
            }),
        [options, containerState, identifier]
    );

    const handlers = useMemo(() => restHandlers, Object.values(restHandlers));

    // Initialise/mount the element
    const {state: elState, error: elError } = useElementFn(normalisedOptions, handlers);
    console.log('>> AltPaymentElement elState:', elState);

    if (cpStatus === "cpp:initialising") return <>init...</>;
    if (cpStatus === "cpp:idle") return <>idle...</>;
    if (cpStatus === "cpp:error")
        return (
            <>
                <p className="text-sm">
                    <span>Unable to render CityPay PaymentElement:</span>
                    <span className="text-gray-700">{" " + cpError}</span>
                </p>
            </>
        );

    if (elState === "el:error")
        return (
            <>
                <p className="text-sm">
                    <span>Unable to render CityPay PaymentElement:</span>
                    <span className="text-gray-700">{" " + elError}</span>
                </p>
            </>
        );

    return (
        <div
            style={{ display: visible ? "block" : "none" }}
            id={`cpe-${idPrefix}-${identifier}`}
            ref={setContainerState}
        />
    );
};

type GooglepayElementProps = {
    options: Omit<GooglePaymentOptions, "identifier" | "element">;
    visible?: boolean;
} & CpeApiEventListeners;

export const GooglepayElement: React.FC<GooglepayElementProps> = (props) => {
    return (
        <Element<GooglePaymentOptions>
            {...props}
            idPrefix="googlepay"
            identifierFn={useGooglepayElementIdentifier}
            useElementFn={useGooglepayElement}
        />
    );
};

type ApplepayElementProps = {
    options: Omit<AltPaymentOptions, "identifier" | "element">;
    visible?: boolean;
} & CpeApiEventListeners;

export const ApplepayElement: React.FC<ApplepayElementProps> = (props) => {
    return (
        <Element<AltPaymentOptions>
            {...props}
            idPrefix="applepay"
            identifierFn={useApplepayElementIdentifier}
            useElementFn={useApplepayElement}
        />
    );
};

type CardElementProps = {
    options: Omit<CardElementOptions, "identifier" | "element">;
    visible?: boolean;
} & CpeApiEventListeners;

export const CardElement: React.FC<CardElementProps> = (props: CardElementProps) => {
    return (
        <Element<CardElementOptions>
            {...props}
            idPrefix="cardElement"
            identifierFn={useCardElementIdentifier}
            useElementFn={useCardElement}
        />
    )
}