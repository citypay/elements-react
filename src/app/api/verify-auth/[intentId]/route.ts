import {NextResponse} from "next/server";
import {initCitypay} from "@/app/api/citypay";

export async function GET(_req: Request, { params }:{params: Promise<{ intentId: string }>}) {

    console.log('<> verify-auth')

    const { intentId } = await params
    const citypay = await initCitypay();
    const result = await citypay.paymentIntents.verifyAuthorised({
        payment_intent_id: intentId,
        unmask_fields: []
    })

    console.log(result)

    return NextResponse.json(result, {status: 200})

}
