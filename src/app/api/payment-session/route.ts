import {NextResponse} from "next/server";
import {
    CardOnFileBehaviours,
    CityPay,
    ConsentCaptureModes,
} from "@citypay/sdk";

function futureUtcDateOnly(daysFromToday: number): Date {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + daysFromToday);
    // The SDK request type is Date, but this API field requires a date-only JSON value.
    date.toJSON = () => date.toISOString().substring(0, 10);
    return date;
}

export async function POST() {

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
        const nextDate = futureUtcDateOnly(30);
        const endDate = futureUtcDateOnly(365);
        const result = await citypay.paymentIntents.create({
            merchantid: Number(mid),
            // Demo-only account. Production integrations should use the authenticated customer's stable account id.
            accountId: `demo-account-${crypto.randomUUID()}`,
            amount: 0,
            currency: "GBP",
            identifier: `cart-id-${crypto.randomUUID()}`,
            cardHolderAccount: {
                storeCard: true,
                consentCaptureMode: ConsentCaptureModes.CityPayOptIn,
                cardOnFileBehaviour: CardOnFileBehaviours.SetDefault,
            },
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
            recurringIntent: {
                count: 12,
                endDate,
                fixedAmount: true,
                fixedSchedule: true,
                intervalDays: 30,
                nextDate,
                recurringAmount: 999
            }
        }, {
            // idempotencyKey: "unique-idempotency-key"
        })

        return NextResponse.json(result, {status: 200})
    } catch {
        console.error("Payment intent creation failed");
        return NextResponse.json({error: "Failed to create payment intent"}, {status: 500});
    }


}
