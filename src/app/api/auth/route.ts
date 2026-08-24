import {NextRequest, NextResponse} from "next/server";
import {CityPay} from "@citypay/sdk";

function isUuidV4(value: string | null): value is string {
    return value !== null
        && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {

    const body: unknown = await request.json().catch(() => null)
    const requestBody = body && typeof body === 'object'
        ? body as {intentId?: unknown; payment_intent_id?: unknown; verify?: unknown}
        : undefined;
    const intentId = requestBody
        ? requestBody.intentId ?? requestBody.payment_intent_id
        : undefined
    const verify = requestBody?.verify === true;

    const clientId = process.env.CITYPAY_CLIENT_ID
    const licenceKey = process.env.CITYPAY_LICENCE_KEY
    const mid = process.env.CITYPAY_MERCHANT_ID

    if (!clientId || !licenceKey || !mid) {
        return NextResponse.json({error: "Missing required environment variables"}, {status: 500});
    }

    if (typeof intentId !== 'string' || intentId.length === 0) {
        return NextResponse.json({error: "Missing payment intent id"}, {status: 400});
    }

    const citypay = new CityPay(clientId, licenceKey, {
        sandbox: true,
    })

    const suppliedIdempotencyKey = request.headers.get('Idempotency-Key');
    const idempotencyKey = isUuidV4(suppliedIdempotencyKey)
        ? suppliedIdempotencyKey
        : crypto.randomUUID();
    const requestOptions = {idempotencyKey};

    try {
        const result = await citypay.paymentIntents.authorise({
            payment_intent_id: intentId,
            ...(verify ? {verify: true} : {}),
        }, requestOptions)

        const authorised = result.authorised === true || result.result === 1 || (verify && result.result === 18);
        if (authorised) {
            if (!verify && !result.authcode) {
                return NextResponse.json({
                    status: 'error',
                    error: {
                        code: 'bad_response',
                        message: 'Missing authcode in successful response',
                        retriable: false,
                    },
                }, {status: 502});
            }

            return NextResponse.json({
                status: 'success',
                auth_code: result.authcode ?? '',
                auth_ref: result.transno && result.transno > 0
                    ? String(result.transno)
                    : (result.identifier ?? ''),
            }, {status: 200})
        }

        return NextResponse.json({
            status: 'declined',
            reason_code: result.resultCode || `result_${result.result}`,
            message: result.resultMessage || 'Declined',
        }, {status: 200})
    } catch {
        console.error('Payment authorisation failed', {intentId});
        return NextResponse.json({
            status: 'error',
            error: {
                code: 'authorise_failed',
                message: 'Payment authorisation failed',
                retriable: true,
            },
        }, {status: 502});
    }

}
