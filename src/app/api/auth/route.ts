import {NextRequest, NextResponse} from "next/server";
import {CityPay} from "@citypay/sdk";

export async function POST(request: NextRequest) {

    const { intentId } = await request.json()

    const clientId = process.env.CITYPAY_CLIENT_ID
    const licenceKey = process.env.CITYPAY_LICENCE_KEY
    const mid = process.env.CITYPAY_MERCHANT_ID

    if (!clientId || !licenceKey || !mid) {
        return NextResponse.json({error: "Missing required environment variables"}, {status: 500});
    }

    const citypay = new CityPay(clientId, licenceKey, {
        sandbox: true,
    })

    const result = await citypay.paymentIntents.authorise({
        payment_intent_id: intentId,
    })

    console.log(result)

    return NextResponse.json(result, {status: 200})

}
