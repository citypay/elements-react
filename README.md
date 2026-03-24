# CityPay Elements React (elements-react)

A lightweight React wrapper and example app for CityPay Elements. It shows how to securely capture and process card payments in a React/Next.js application using CityPay's Payment Intent APIs. It covers tokenisation, attach, confirmation, and optional authorisation (including 3‑D Secure when required).

This repository contains an example Next.js app and reusable components/hooks you can mirror in your own React project.

## What is inside

- Next.js example application showing a typical payment flow
- Reusable building blocks:
  - CityPayProvider component to initialise Elements and provide context
  - CardElement component to collect card details via a secure iframe
  - Hooks to access and control the Elements instance (useElement, useCardElement)
- Serverless API route example for creating a Payment Intent session
- Environment-based configuration for your CityPay account

## Prerequisites

- React 18+ (this repo uses React 19) with Next.js 15/16 App Router
- A CityPay account with API credentials
- Server capability to create Payment Intent sessions (Next.js route example included)

## Installation

This repository is a working example. If you’re integrating into your own app, install the CityPay SDK for your server logic:

```bash
pnpm add @citypay/sdk
# or
npm install @citypay/sdk
```

The Elements UI is initialised by the components in src/components of this repository (no separate npm package required here).

## Quick start

1) Configure environment variables (server-side)

Create a .env.local with your CityPay credentials for the server route:

```
CITYPAY_CLIENT_ID=your_client_id
CITYPAY_LICENCE_KEY=your_licence_key
CITYPAY_MERCHANT_ID=12345678
```

2) Create an API route to create a Payment Session (Next.js App Router)

File: src/app/api/payment-session/route.ts

```ts
import { NextResponse } from 'next/server';
import { CityPay } from '@citypay/sdk';

export async function POST() {
  const clientId = process.env.CITYPAY_CLIENT_ID;
  const licenceKey = process.env.CITYPAY_LICENCE_KEY;
  const mid = process.env.CITYPAY_MERCHANT_ID;

  if (!clientId || !licenceKey || !mid) {
    return NextResponse.json({ error: 'Missing required environment variables' }, { status: 500 });
  }

  const citypay = new CityPay(clientId, licenceKey, { sandbox: true });

  try {
    const result = await citypay.paymentIntents.create({
      merchantid: Number(mid),
      amount: 1001, // minor units
      currency: 'GBP',
      identifier: 'your-cart-ref',
      billTo: {
        title: 'Mr',
        firstname: 'N',
        lastname: 'Person',
        email: 'n.person@example.com',
        address1: '123 Example Street',
        address2: 'Example City',
        address3: 'Example County',
        country: 'GB',
        postcode: 'JE3 3QA',
      },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    // @ts-ignore
    console.error('Error creating payment intent:', e, e?.meta);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}
```

3) Provide CityPay Elements in your app

Use the CityPayProvider to initialise Elements. You pass a public key (pubKey) for the Elements UI and a function that fetches a new Payment Intent session from your server route.

Example (wrapping a page/component):

```tsx
'use client'
import { CityPayProvider } from '@/components/CityPayProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CityPayProvider
      pubKey={process.env.NEXT_PUBLIC_CITYPAY_PUBLIC_KEY}
      createServerIntent={async () => {
        const resp = await fetch('/api/payment-session', { method: 'POST' })
        if (!resp.ok) throw new Error('Failed to create payment session')
        return resp.json()
      }}
    >
      {children}
    </CityPayProvider>
  )
}
```

4) Collect card details and complete the payment flow (React)

Use the CardElement and the Elements API methods tokenise → attach → confirm. If confirm returns requires_authorisation, call your server to authorise.

```tsx
'use client'
import { useState, useEffect } from 'react'
import { useElement } from '@/components/CityPayProvider'
import { CardElement } from '@/components/CardElement'
import type { PaymentIntentSession } from '@citypay/sdk'

export function Checkout({ paymentSession }: { paymentSession: PaymentIntentSession }) {
  const elements = useElement('default')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  useEffect(() => {
    if (elements) {
      elements.onError((err: any) => console.error('Elements error:', err))
    }
  }, [elements])

  const pay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!elements) return
    setError(undefined)
    setIsSubmitting(true)
    try {
      const { token } = await elements.tokenise()
      await elements.attach({ token, select: true, intentId: paymentSession.paymentIntentId })
      const confirm = await elements.confirm({})

      if (confirm.status === 'error') {
        setError(confirm.error.message)
      } else if (confirm.status === 'requires_authorisation') {
        const resp = await fetch('/api/auth', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intentId: paymentSession.paymentIntentId })
        })
        const auth = await resp.json()
        if (auth.authorised) setSuccess(`Payment authorised: ${auth.auth_code}`)
        else setError(`Payment authorisation failed: ${auth.result_code}: ${auth.result_message}`)
      } else if (confirm.status === 'succeeded') {
        setSuccess('Payment complete')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={pay}>
      <CardElement id="card" />
      <button type="submit" disabled={isSubmitting}>Pay</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  )
}
```

## API overview

- CityPayProvider
  - Props: pubKey, createServerIntent
  - Provides the Elements context to child components and manages Element instances
- CardElement
  - Mounts a secure iframe-based card entry field
  - Props include id and style/options passed through to Elements
- useElement(key?: string)
  - Access the Elements instance by key ("default" if omitted)
  - Methods: tokenise(), attach({ token, intentId, select }), confirm(options), onError(handler)
- useCardElement(id, options, handlers)
  - Lower-level hook that gives you a containerRef to mount a specific card form and subscribe to change/ready events

## Development scripts

- Install dependencies: pnpm install
- Run the example app (HTTPS dev server): pnpm dev
- Build for production: pnpm build
- Start production server: pnpm start

## Notes

- Always create intents on your server. Never expose secret credentials on the client.
- Handle 3DS redirects/popups that confirm() may trigger.
- Use your own returnUrl when confirming if your flow requires navigation after 3DS.

## CityPay Elements flow

This diagram shows how a payment session is created on the server,
passed to the client, and used by CityPay Elements to securely collect
and authorise card details.

### Diagram
![CityPay Elements flow](public/CityPay%20CardElement%20Flow.png)
