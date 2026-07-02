import {NextRequest, NextResponse} from "next/server";
import {initCitypay} from "@/app/api/citypay";

export async function POST(request: NextRequest) {

    const { intentId } = await request.json()

    const citypay = await initCitypay();
    const result = await citypay.paymentIntents.authorise({
        payment_intent_id: intentId,
    })

    console.log(result)

    return NextResponse.json(result, {status: 200})

}
