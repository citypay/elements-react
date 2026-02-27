import {NextRequest, NextResponse} from "next/server";
import {cityPayApiPost} from "@/lib/citypay-api";

export async function POST(request: NextRequest) {

    const { intentId } = await request.json()

    const clientId = process.env.CITYPAY_CLIENT_ID
    const licenceKey = process.env.CITYPAY_LICENCE_KEY
    const mid = process.env.CITYPAY_MERCHANT_ID

    if (!clientId || !licenceKey || !mid) {
        return NextResponse.json({error: "Missing required environment variables"}, {status: 500});
    }

    const result = await cityPayApiPost("intent/authorise", {
        payment_intent_id: intentId,
    }, clientId, licenceKey)

    console.log(result)

    return NextResponse.json(result, {status: 200})

}
