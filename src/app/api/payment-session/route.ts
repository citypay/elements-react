import {NextResponse} from "next/server";
import {initCitypay} from "@/app/api/citypay";

export async function POST() {

    const mid = process.env.CITYPAY_MERCHANT_ID;
    const citypay = await initCitypay();

    try {
        const result = await citypay.paymentIntents.create({
            merchantid: Number(mid),
            amount: 1,
            currency: "GBP",
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
            }
        }, {
            // idempotencyKey: "unique-idempotency-key"
        })

        console.log("Payment intent created:", result);
        return NextResponse.json(result, {status: 200})
    } catch (e) {
        // @ts-ignore
        console.error("Error creating payment intent:", e, e?.meta);
        return NextResponse.json({error: "Failed to create payment intent"}, {status: 500});
    }


}
