# @citypay/elements-react

React components and hooks for CityPay Elements.

This package wraps `@citypay/sdk` so React applications can mount CityPay hosted payment elements, collect payment
details securely, and complete Payment Intent flows without handling sensitive card data directly.

## Installation

```bash
npm install @citypay/elements-react
```

```bash
pnpm add @citypay/elements-react
```

The package expects React 18 or 19:

```json
{
  "react": ">=18 <20",
  "react-dom": ">=18 <20"
}
```

## Secure Backend Requirement

Your frontend must not contain CityPay client credentials, licence keys, or merchant credentials.

A typical integration has:

- a React frontend using your CityPay public key
- a secure backend that creates Payment Intent sessions
- backend routes for authorisation and verification where required

The demo app in this repository keeps those server-side operations in `packages/demo-server`.

## Basic Card Element Example

```tsx
import {
  CardElement,
  CityPayProvider,
  type PaymentIntentSession,
  useElementInstances,
} from "@citypay/elements-react";

function Checkout({paymentSession}: {paymentSession: PaymentIntentSession}) {
  return (
    <CityPayProvider
      pubKey={import.meta.env.VITE_EX_CP_PUBLIC_KEY}
      createServerIntent={async () => paymentSession}
      middleware={{verifyAuth: "/verify-auth"}}
    >
      <CardPaymentForm intentId={paymentSession.paymentIntentId}/>
    </CityPayProvider>
  );
}

function CardPaymentForm({intentId}: {intentId: string}) {
  const elementInstances = useElementInstances();

  async function submitPayment() {
    const api = elementInstances.get("checkout-card")?.api;
    if (!api) {
      throw new Error("Card element is not ready");
    }

    const tokenResult = await api.tokenise();

    await api.attach({
      token: tokenResult.token,
      select: true,
      intentId,
    });

    const confirmResult = await api.confirm({});

    if (confirmResult.status === "error") {
      throw new Error(confirmResult.error.message);
    }
  }

  return (
    <>
      <CardElement identifier="checkout-card" visible={true}/>
      <button type="button" onClick={submitPayment}>
        Pay now
      </button>
    </>
  );
}
```

## Middleware Routes

Middleware endpoints passed to `CityPayProvider` must be relative paths:

```tsx
<CityPayProvider
  pubKey={publicKey}
  createServerIntent={createServerIntent}
  middleware={{
    verifyAuth: "/verify-auth",
  }}
>
  {children}
</CityPayProvider>
```

If your backend is on another local port during development, use your dev server proxy rather than passing an absolute
URL to the provider.

## Components

- `CityPayProvider` initialises CityPay Elements and provides context to child components.
- `CardElement` mounts the hosted card payment element.
- `CardFieldsProvider` and `CardFields` support host-controlled card field layouts.
- `ApplepayElement` mounts the Apple Pay element when browser and merchant setup allow it.

## Hooks

- `useElements()` returns the underlying CityPay Elements instance.
- `useElementInstances()` returns mounted element API instances keyed by identifier.
- `useElementsStatus()` returns provider status and error information.

## Debugging

Pass `debug` to `CityPayProvider` to enable SDK-level debugging:

```tsx
<CityPayProvider debug pubKey={publicKey} createServerIntent={createServerIntent}>
  {children}
</CityPayProvider>
```

Do not enable debug output in production checkouts unless you have a specific support reason.

## Version Compatibility

| Package | Compatibility |
| --- | --- |
| `@citypay/elements-react` `0.1.x` | React `>=18 <20` |
| `@citypay/sdk` | `^2.1.7` |

## Release Checks

Before publishing this package, run:

```bash
pnpm --filter '@citypay/elements-react' lint
pnpm --filter '@citypay/elements-react' build
pnpm --filter '@citypay/elements-react' pack --dry-run
```

The npm package should contain `dist`, `README.md`, `LICENSE`, and the package root `package.json`.

## Documentation

See the [CityPay Elements documentation](https://docs.citypay.com/elements) for broader platform guidance.
