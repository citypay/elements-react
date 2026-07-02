import {NextRequest, NextResponse} from "next/server";
import {initCitypay} from "@/app/api/citypay";

function getRequestOrigin(request: NextRequest) {
    const origin = request.headers.get("origin");
    if (origin) return origin;

    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;

    return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {

    const citypay = await initCitypay();
    const mid = process.env.CITYPAY_MERCHANT_ID;

    try {

        const checkoutContext =  citypay.checkoutContexts.create({
            merchantId: Number(mid),
            origin: getRequestOrigin(request),
            currency: "GBP",
            country: "GB",
            requestedCapabilities: ["card", "apple_pay", "google_pay"],
        })

        return NextResponse.json(checkoutContext, {status: 200});
    } catch (e) {
        console.error("Error creating checkout context:", e, (e as {meta?: unknown})?.meta);
        return NextResponse.json({error: "Failed to create checkout context"}, {status: 500});
    }
}

export const POST = GET;
