"use client"

import {CityPayProvider, PaymentIntentSession, CardElement, VerifyAuthResponse, useElementInstances} from "@citypay/elements-react";
import {useEffect, useState} from "react";
import {ServerConnection} from "@/server-conn/serverConnection";

export default function Page() {

    const [paymentSession, setPaymentSession] = useState<PaymentIntentSession | undefined>()

    useEffect(() => {
        ServerConnection.checkServerConnection()
            .then(() => {
                return ServerConnection.getPaymentSession()
            }).then(session => {
            setPaymentSession(session)
        }).catch(ex => {
            console.error(ex)
        })
    }, []);

    if (!paymentSession) {
        return <>loading payment session...</>
    }

    return <>

        <CityPayProvider pubKey={process.env.NEXT_PUBLIC_EX_CP_PUBLIC_KEY}
                         createServerIntent={async () => {
                             return paymentSession;
                         }}>

            <CardElementWithSubmit paymentSession={paymentSession} />

        </CityPayProvider>
    </>
}

function CardElementWithSubmit({paymentSession}: { paymentSession: PaymentIntentSession }) {

    const elementsInstances = useElementInstances()

    const submitHandler = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const api = elementsInstances?.get('card-element')?.api

        if (!api) { console.warn(`Aborting submit as instances not ready`); return; }

        try {
            // 1) Create a token from the mounted card element
            console.log("[cp-demo] Tokenising card")
            const tokenResult = await api.tokenise();

            if (tokenResult.status == 'error') { console.error(tokenResult); return; }

            // 2) Attach token to an intent (if your flow uses intents)
            console.log("[cp-demo] Attaching token")
            await api.attach({
                token: tokenResult.data.token,
                select: true,
                intentId: paymentSession.paymentIntentId
            });

            // 3) Confirm the payment (3DS may happen here)
            const confirmResult = await api.confirm({});

            if (confirmResult.status == 'requires_authorisation') {

                ServerConnection.authorise(paymentSession.paymentIntentId)
                    .then(async (auth) => {

                        if (auth.authorised) {
                            return ServerConnection.verifyAuth(paymentSession.paymentIntentId)

                        } else {
                            throw new Error("Payment not authorised")
                        }
                    }).then((verifyResult: VerifyAuthResponse) => {
                    if (verifyResult.status === 'success') {
                        console.log(`[cp-demo] Payment authorised on card. Verified authcode: ${verifyResult.auth.authcode}`)
                    } else {
                        throw new Error("Payment authorised but not verified")
                    }
                }).catch((ex) => {
                    console.error(ex)
                })
            }
        } catch (err) {
            console.error('>>> Error during payment processing:', err);
        }
    }

    return (
        <>
            <CardElement
                identifier={"card-element"}
                visible={true}
            />

            <button onClick={submitHandler}>Submit</button>
        </>
    )
}