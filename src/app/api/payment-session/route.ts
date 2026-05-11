import {NextResponse} from "next/server";
import {CityPay} from "@citypay/sdk";

export async function POST() {

    // if (true) {
    //     return NextResponse.json( {
    //         "exp": 1763495582468,
    //         "opaqueKey": "9DffP7K3TKPATERMafCtcNAAwnjHLGPScLHp4HHE7bZL",
    //         "paymentIntentId": "pi_1imft4ryd2a9f0g8p1qvquzvjj2",
    //         "sessionToken": "sandbox_VBBUp74iUkPFne3x9acXbs4xnpoMoT1hXLJqufEK5aVvs6pP8xQUF1ezh6WZWaL1kQBAcQHzHhVsePWHZ7bgwe6MkQhLGNnya7pxiAFvc2fm9ZMhBgrSSsFuzY66uDky2yMKuA1iw7SswgQt7stFHqpixpAvCck6gfYpfDhDdFaWyjw1w331R9thktv9TTT1AXBdZtPMAgGtjdz2mDiT6ggLmq1MgB2RM9dqd5XyLPqVPUeJvNGr8qykNMi2ix.78VJqrkksdEg8BeEhaHm68qCSAY81UK24ZuD7MKU75p8"
    //     }, {status: 200});
    // }

    const clientId = process.env.CITYPAY_CLIENT_ID
    const licenceKey = process.env.CITYPAY_LICENCE_KEY
    const mid = process.env.CITYPAY_MERCHANT_ID

    if (!clientId || !licenceKey || !mid) {
        return NextResponse.json({error: "Missing required environment variables"}, {status: 500});
    }

    const citypay = new CityPay(clientId, licenceKey, {
        // sandbox: true,
    })



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
