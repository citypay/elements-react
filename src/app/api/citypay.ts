import {CityPay} from "@citypay/sdk";
import {NextResponse} from "next/server";

export const initCitypay = async () => {

    const clientId = process.env.CITYPAY_CLIENT_ID
    const licenceKey = process.env.CITYPAY_LICENCE_KEY
    const mid = process.env.CITYPAY_MERCHANT_ID


    if (!clientId || !licenceKey || !mid) {
        throw new Error("Missing required environment variables");
    }

    return new CityPay(clientId, licenceKey, {
        sandbox: true,
    });

}

