import {NextResponse} from "next/server";
import {CityPay} from "@citypay/sdk";

export async function GET(_req: Request, { params }:{params: Promise<{ intentId: string }>}) {

    const { intentId } = await params

    const clientId = process.env.CITYPAY_CLIENT_ID
    const licenceKey = process.env.CITYPAY_LICENCE_KEY
    const mid = process.env.CITYPAY_MERCHANT_ID

    if (!clientId || !licenceKey || !mid) {
        return NextResponse.json({error: "Missing required environment variables"}, {status: 500});
    }

    const citypay = new CityPay(clientId, licenceKey, {
        sandbox: true,
    })

    try {
        const result = await citypay.paymentIntents.verifyAuthorised({
            payment_intent_id: intentId,
            unmask_fields: []
        })

        return NextResponse.json(result, {status: 200})
    } catch {
        console.error('Payment authorisation verification failed', {intentId});
        return NextResponse.json({error: 'Payment authorisation verification failed'}, {status: 502});
    }

}
