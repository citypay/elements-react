import {NextRequest, NextResponse} from "next/server";
import {
    CardOnFileBehaviours,
    CityPay,
    ConsentCaptureModes,
} from "@citypay/sdk";
import {
    CHECKOUT_CURRENCY,
    CHECKOUT_TOTAL_MINOR_UNITS,
} from "@/components/checkout/constants";

function futureUtcDateOnly(daysFromToday: number): Date {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + daysFromToday);
    // The SDK request type is Date, but this API field requires a date-only JSON value.
    date.toJSON = () => date.toISOString().substring(0, 10);
    return date;
}

type IntentMode = 'card-payment' | 'flow-payment' | 'verify';

export async function POST(request: NextRequest) {

    const body: unknown = await request.json().catch(() => null);
    const requestedMode = body && typeof body === 'object' && 'mode' in body
        ? (body as {mode?: unknown}).mode
        : undefined;

    if (
        requestedMode !== undefined
        && requestedMode !== 'card-payment'
        && requestedMode !== 'flow-payment'
        && requestedMode !== 'verify'
    ) {
        return NextResponse.json({error: "Invalid payment intent mode"}, {status: 400});
    }

    const mode: IntentMode = requestedMode ?? 'card-payment';
    const isVerification = mode === 'verify';
    const includesStoredCardDetails = mode !== 'card-payment';

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
        const result = await citypay.paymentIntents.create({
            merchantid: Number(mid),
            amount: isVerification ? 0 : CHECKOUT_TOTAL_MINOR_UNITS,
            currency: CHECKOUT_CURRENCY,
            identifier: `cart-id-${crypto.randomUUID()}`,
            billTo: {
                title: "Mr",
                firstname: "N",
                lastname: "Person",
                email: "n.person@example.com",
                address1: "123 Example Street",
                address2: "Example City",
                address3: "Example County",
                country: "GB",
                postcode: "JE3 3QA"
            },
            ...(includesStoredCardDetails ? {
                // Demo-only account. Production integrations should use the authenticated customer's stable account id.
                accountId: `demo-account-${crypto.randomUUID()}`,
                cardHolderAccount: {
                    storeCard: true,
                    consentCaptureMode: ConsentCaptureModes.CityPayOptIn,
                    cardOnFileBehaviour: CardOnFileBehaviours.SetDefault,
                },
                recurringIntent: {
                    count: 12,
                    endDate: futureUtcDateOnly(365),
                    fixedAmount: true,
                    fixedSchedule: true,
                    intervalDays: 30,
                    nextDate: futureUtcDateOnly(30),
                    recurringAmount: 999
                }
            } : {})
        }, {
            // idempotencyKey: "unique-idempotency-key"
        })

        return NextResponse.json(result, {status: 200})
    } catch {
        console.error("Payment intent creation failed");
        return NextResponse.json({error: "Failed to create payment intent"}, {status: 500});
    }


}
