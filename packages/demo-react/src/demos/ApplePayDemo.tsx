import {CityPayProvider, PaymentIntentSession, ApplepayElement} from "@citypay/elements-react";
import {useEffect, useState} from "react";
import {ServerConnection} from "@/server-conn/serverConnection";

export default function ApplePayDemo() {

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

        <CityPayProvider pubKey={import.meta.env.VITE_EX_CP_PUBLIC_KEY}
                         createServerIntent={async () => {
                             return paymentSession;
                         }}>

            <ApplepayElement
                visible={true}
                total={{
                    amount: 1,
                    label: 'GBP'
                }}
                appearance={{
                    type: 'donate',
                    style: 'white-outline',
                }}
                onAuthoriseEnd={async () => { console.log("[cp-demo] ApplePay payment session complete. Payment must be authorised on your secure server") }}
                onCancel={async () => { console.log("[cp-demo] ApplePay payment session cancelled by user") }}
                onError={async (error: unknown) => { console.log("[cp-demo] ApplePay payment session error: " + error) }}
            />

        </CityPayProvider>
    </>


}
