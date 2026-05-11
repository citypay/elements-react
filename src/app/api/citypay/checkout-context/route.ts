import {NextRequest, NextResponse} from "next/server";
import {CityPay} from "@citypay/sdk";

type CheckoutContextRequest = {
    merchantId: number;
    origin: string;
    currency: "GBP";
    country: "GB";
    requestedCapabilities: Array<"card" | "apple_pay" | "google_pay">;
};

type CityPayWithCheckoutContext = CityPay & {
    createCheckoutContext: (request: CheckoutContextRequest) => Promise<unknown>;
};

function getRequestOrigin(request: NextRequest) {
    const origin = request.headers.get("origin");
    if (origin) return origin;

    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

    return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
    const clientId = process.env.CITYPAY_CLIENT_ID;
    const licenceKey = process.env.CITYPAY_LICENCE_KEY;
    const merchantId = process.env.CITYPAY_MERCHANT_ID;

    if (!clientId || !licenceKey || !merchantId) {
        return NextResponse.json({error: "Missing required CityPay environment variables"}, {status: 500});
    }

    const citypay = new CityPay(clientId, licenceKey, {sandbox: true}) as CityPayWithCheckoutContext;

    try {
        const checkoutContext = await citypay.createCheckoutContext({
            merchantId: Number(merchantId),
            origin: getRequestOrigin(request),
            currency: "GBP",
            country: "GB",
            requestedCapabilities: ["card", "apple_pay", "google_pay"],
        });

        return NextResponse.json(checkoutContext, {status: 200});
    } catch (e) {
        console.error("Error creating checkout context:", e, (e as {meta?: unknown})?.meta);
        return NextResponse.json({error: "Failed to create checkout context"}, {status: 500});
    }
}

export const POST = GET;
