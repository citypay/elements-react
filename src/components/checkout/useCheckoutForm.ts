'use client'

import {useRef, useState} from 'react';
import type {PaymentIntentSession, VerifyAuthResponse} from '@citypay/sdk';
import {useElements} from '@/components/CityPayProvider';
import {useCardElementContext} from '@/components/CardElementProvider';
import {useCardFieldsContext} from '@/components/CardFieldsProvider';
import type {FieldsReferences} from '@/components/useCardFields';
import type {ChangeState} from '@/components/useCardElement';
import {paymentMethods} from '@/components/checkout/data';
import {updateCardFieldFeedback} from '@/components/checkout/cardFieldFeedback';
import type {FlowType, PaymentMethod, WidgetLayout} from '@/components/checkout/types';

export function useCheckoutForm(paymentSession: PaymentIntentSession) {
    const cardElementContext = useCardElementContext();
    const cardFieldsContext = useCardFieldsContext();
    const elements = useElements();

    const [cardFormComplete, setCardFormComplete] = useState(false);
    const [cardFieldsComplete, setCardFieldsComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);
    const [layout, setLayout] = useState<WidgetLayout>('stack');
    const [flowType, setFlowType] = useState<FlowType>('verify');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState<string | undefined>();
    const [paymentComplete, setPaymentComplete] = useState<string | undefined>();
    const [cardElementNonce, setCardElementNonce] = useState(0);
    const [flowElementNonce, setFlowElementNonce] = useState(0);

    const fieldsRefs: FieldsReferences = {
        csc: useRef(null),
        expiry: useRef(null),
        name: useRef(null),
        pan: useRef(null),
    };

    const cardElementId = `cardform-${layout}-${cardElementNonce}`;
    const flowElementId = `flowform-${flowType}-${flowElementNonce}`;
    const formDisabled = paymentMethod.id === 'flow' || !(cardFormComplete || cardFieldsComplete);

    const getActiveApi = () =>
        paymentMethod.id === 'credit-card'
            ? cardElementContext.getElement()?.api
            : paymentMethod.id === 'credit-card-form'
                ? cardFieldsContext.getElement()?.api
                : undefined;

    const resetMessages = () => {
        setPaymentError(undefined);
        setPaymentComplete(undefined);
    };

    const selectPaymentMethod = (nextPaymentMethod: PaymentMethod) => {
        setPaymentMethod(nextPaymentMethod);
        setCardFormComplete(false);
        setCardFieldsComplete(false);
        resetMessages();

        if (nextPaymentMethod.id === 'credit-card') {
            setCardElementNonce((currentNonce) => currentNonce + 1);
        }

        if (nextPaymentMethod.id === 'flow') {
            setFlowType('verify');
            setFlowElementNonce((currentNonce) => currentNonce + 1);
        }
    };

    const handleWidgetLayoutChange = (nextLayout: WidgetLayout) => {
        setLayout(nextLayout);
        setCardFormComplete(false);
        setCardElementNonce((currentNonce) => currentNonce + 1);
    };

    const handleFlowTypeChange = (nextType: FlowType) => {
        setFlowType(nextType);
        resetMessages();
        setFlowElementNonce((currentNonce) => currentNonce + 1);
    };

    const handleCardFieldsChange = (changeState: ChangeState) => {
        updateCardFieldFeedback(changeState);
        setCardFieldsComplete(changeState.complete);
    };

    const handleCardElementChange = (changeState: ChangeState) => {
        setCardFormComplete(changeState.complete);
    };

    const handleApplePayAuthoriseEnd = async () => {
        try {
            setPaymentError(undefined);
            setPaymentComplete('Payment authorised via ApplePay. Verifying...');

            const intentId = await elements?.getPaymentIntentId();
            if (!intentId) {
                throw new Error('intentId is required');
            }

            const verification = await elements?.verifyPaymentIntentAuth();
            if (verification && verification.status === 'success') {
                setPaymentComplete(`Payment authorised via ApplePay. Verified auth: ${verification.auth.authcode}`);
                return;
            }

            setPaymentError('Payment verification failed');
        } catch (error) {
            console.error('ApplePay verification failed:', error);
            setPaymentError('Payment verification failed');
        }
    };

    const submitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (paymentMethod.id === 'flow') {
            return;
        }

        const api = getActiveApi();
        if (!api) {
            console.warn('Aborting submit as instances not ready');
            return;
        }

        try {
            setIsSubmitting(true);
            setPaymentError(undefined);

            const tokenResult = await api.tokenise();

            const attachResult = await api.attach({
                token: tokenResult.token,
                select: true,
                intentId: paymentSession.paymentIntentId,
            });
            console.log('>>> attachResult:', attachResult);

            const confirmResult = await api.confirm({});
            console.log('>>> confirmResult:', confirmResult);

            if (confirmResult.status === 'error') {
                setPaymentError(confirmResult.error.message);
                return;
            }

            if (confirmResult.status !== 'requires_authorisation') {
                return;
            }

            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    intentId: paymentSession.paymentIntentId,
                }),
            });

            const auth = await response.json();
            console.log(auth);

            if (!auth.authorised) {
                setPaymentError(`Payment authorisation failed: ${auth.resultCode}: ${auth.resultMessage}`);
                return;
            }

            setPaymentComplete(`Payment authorised on card: ${auth.authcode}. Verifying auth...`);

            const intentId = await elements?.getPaymentIntentId();
            if (!intentId) {
                throw new Error('intentId is required');
            }

            const verification: VerifyAuthResponse | undefined = await elements?.verifyPaymentIntentAuth();
            console.log('Verify intent result', verification);

            if (verification?.status === 'success') {
                setPaymentComplete(
                    `Payment authorised on card: ${auth.authcode}. Verified auth: ${verification.auth.authcode}`,
                );
                return;
            }

            setPaymentError(`Payment authorisation failed: ${auth.resultCode}: ${auth.resultMessage}`);
        } catch (error) {
            console.error('>>> Error during payment processing:', error);
            setPaymentError('Error during payment processing');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        cardElementId,
        flowElementId,
        flowType,
        fieldsRefs,
        formDisabled: formDisabled || isSubmitting,
        handleApplePayAuthoriseEnd,
        handleCardElementChange,
        handleCardFieldsChange,
        handleFlowTypeChange,
        handleWidgetLayoutChange,
        layout,
        paymentComplete,
        paymentError,
        paymentMethod,
        selectPaymentMethod,
        submitHandler,
    };
}
