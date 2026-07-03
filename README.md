# CityPay Elements React (@citypay/elements-react) and Associated Demo

A lightweight React wrapper and example app for CityPay Elements. It shows how to securely capture and process card 
payments in a React/Next.js application using CityPay's Payment Intent APIs. It covers tokenisation, attach, 
confirmation, and optional authorisation (including 3‑D Secure when required).

This repository contains the source for the @citypay/elements-react React components, and an example Next.js app.

## Demo QuickStart

From the repository root:

1. Initialise the demo:
   ```bash
   pnpm citypay-init
   ```

2. Start the demo:
   ```bash
   pnpm demo:dev
   ```

3. Open:
   ```text
   https://localhost:3000
   ```

If `pnpm` is not available yet, enable it through Corepack first:

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
```

## What is inside

- Next.js example application showing a simple checkout page and the available payment options.
- Node Express HTTPS server to support the secure server-side functionality required by the example application.
- Environment-based configuration for your CityPay account.
- Source code for the referenced @citypay/elements-react components.

## Prerequisites

- React 18+ (this repo uses React 19) with Next.js 15/16 App Router
- Node 22.13+ for pnpm 11
- pnpm v11+ (this repo is configured and tested as a pnpm workspace)
- A CityPay account with API credentials

## Detailed Setup

This repository is packaged as a pnpm workspace. Use pnpm for installing dependencies and running the root workspace
scripts.

### Baseline pnpm setup

1. From the repository root, enable pnpm through Corepack if pnpm is not already available:
   ```bash
   corepack enable
   corepack prepare pnpm@11.9.0 --activate
   ```

2. Initialise the local demo:
   ```bash
   pnpm citypay-init
   ```

   This installs workspace dependencies, builds the local `@citypay/elements-react` package, generates local HTTPS
   certificates for both the React app and secure server, then prompts for the CityPay credentials used to create the
   package `.env.local` files. The initializer detects Windows vs macOS/Linux and runs the appropriate certificate and
   environment setup commands.

   You can rerun `pnpm citypay-init` safely. Existing certificates are kept unless you choose to regenerate them, and
   existing environment values are shown as defaults. The licence key is displayed only as a masked value.

**Note:** Payment flows require HTTPS throughout, and that HTTPS certificates are derived from a trusted root CA.
The certificate scripts use `mkcert` when it is available. If `mkcert` is not installed, they fall back to OpenSSL and
generate self-signed certificates, which your browser may require you to manually trust or accept.

3. Start the demo:
   ```bash
   pnpm demo:dev
   ```

4. Open https://localhost:3000.

### Manual setup commands

If you prefer to run the init steps separately, use:

```bash
pnpm install
pnpm demo:certs:bash
./setup-env.sh
```

On Windows PowerShell, use:

```powershell
pnpm install
pnpm demo:certs:win
Set-ExecutionPolicy -Scope Process Bypass
.\setup-env.ps1
```

### npm or yarn

Use pnpm for this repository even if you normally prefer npm or yarn. The workspace is defined in
`pnpm-workspace.yaml`, package links use `workspace:*`, and the root scripts call pnpm workspace commands such as
`pnpm -r` and `pnpm --filter`.

Do not mix package managers in the same checkout. Running npm or yarn install commands can create different lockfiles
and dependency layouts that are not covered by this demo setup.

If your machine has a global `@citypay` registry configured for CodeArtifact, a repo-local `.npmrc` can override that
for this checkout. This is useful when the demo server must resolve `@citypay/sdk` from the public npm registry rather
than CodeArtifact.

## Running the Demo

From the repository root, run ```pnpm demo:dev``` to start the demo application. It is usually available at https://localhost:3000

## Notes

- All payments will be sent to the CityPay sandbox API servers. No payments will be taken.
- Although this demo includes ApplePay, no ApplePay visuals or functions will be available until you complete a domain 
  registration and verification with Apple. See [CityPay's Online Documentation](https://docs.citypay.com/elements)
- You will be limited to the products and services that you possess licences for with CityPay.

## Troubleshooting

This section covers common issues encountered when setting up and running the demo application.

### Setup & Environment Issues

#### Setup script fails or does not run

If `setup-env.sh` or `setup-env.ps1` fails:

- Ensure the script is executable (macOS/Linux):
  ```bash
  chmod +x ./setup-env.sh
  ```

- On macOS/Linux, ensure you are using a compatible shell (bash/zsh)

- On Windows, ensure PowerShell execution is enabled:
  ```powershell
  Set-ExecutionPolicy -Scope Process Bypass
  ```

- As a fallback, create the `.env.local` files manually:

**packages/demo-server/.env.local**
```
EX_CP_CLIENT_ID=PCxxxxxx
EX_CP_LICENSE_KEY=xxxxxxx
EX_CP_MID=xxxxxxx
```

**packages/demo-react/.env.local**
```
NEXT_PUBLIC_EX_CP_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Environment variables not being picked up

**Symptoms:**
- API calls failing with authentication errors
- Undefined environment variables in logs

**Checks:**
- Restart the dev app and server
- Ensure `.env.local` files are present in packages/demo-server and packages/demo-react
- Confirm no `.env` or similar file are overriding the `.env.local` files
- Verify there are no trailing spaces or quotes in values in `.env.local` files


### Dependency Issues

#### `pnpm install` fails

- Ensure pnpm is installed:
  ```bash
  pnpm -v
  ```

- Recommended: pnpm v11+

- Clear cache and retry:
  ```bash
  pnpm store prune
  pnpm install
  ```

- Delete lockfile and node_modules if needed:
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

#### Using npm or yarn instead of pnpm

This repo uses pnpm workspaces and is not tested with npm or yarn. Use pnpm inside this checkout, even if npm or yarn
is your default package manager elsewhere.

### HTTPS & Certificate Issues

#### Browser shows “Not Secure” or blocks requests

- Ensure `pnpm demo:certs:*` was run successfully
- Restart your browser after certificate installation
- Ensure mkcert root CA is installed and trusted

#### mkcert not installed

Install mkcert:

- macOS (Homebrew):
  ```bash
  brew install mkcert
  brew install nss
  ```

- Then run:
  ```bash
  mkcert -install
  ```

### Runtime / Server Issues

#### App does not start on https://localhost:3000

- Check if port 3000 is already in use:
  ```bash
  lsof -i :3000
  ```

- Kill the conflicting process or change port

#### API calls failing from frontend

- Confirm demo server is running
- Check server logs in `packages/demo-server`
- Verify environment variables are correct


#### CORS errors

- Ensure frontend and backend are both running over HTTPS
- Confirm both are using matching localhost origins

### Payment Flow Issues

#### Payment fails immediately

- Verify API credentials
- Ensure sandbox environment is being used
- Confirm MID and licence key are valid

#### 3-D Secure not triggering when expected

- Not all test cards trigger 3DS
- Use appropriate test card numbers per CityPay documentation

#### Tokenisation or attach step fails

- Inspect network requests in browser DevTools
- Confirm Payment Intent was successfully created
- Ensure client is using correct public key

### Apple Pay Issues

Apple Pay requires additional setup beyond this demo:

- Domain verification
- Apple Merchant ID
- Payment processing certificate

If Apple Pay does not appear:

- Ensure you are using Safari
- Confirm domain is properly verified with Apple

### Antivirus / Security Software Interference

#### Local HTTPS server blocked

- Ensure Node.js is allowed by your security software
- Whitelist the project directory if necessary

#### Repeated “suspicious activity” warnings

- Some antivirus tools (e.g. Avast) may block:
   - local HTTPS servers
   - Node processes
   - development tooling

Fix:
- Add exclusions for your project directory
- Ensure Node.js is allowed
- Consider disabling behaviour/ransomware shields for development

### Build / Framework Issues

#### Next.js errors or hydration issues

- Ensure Node version is compatible (Node 22.13+ is recommended for pnpm 11)
- Delete `.next` and rebuild:
  ```bash
  rm -rf .next
  pnpm demo:dev
  ```

#### Changes not reflecting in browser

- Clear browser cache
- Restart dev server
- Check for multiple running instances

### General Debugging Tips

- Use browser DevTools → Network tab to inspect API calls
- Check server logs for backend errors
- Validate all credentials independently
- Restart everything after config changes:
   - dev server
   - browser
   - certificate trust (if changed)

### Still Stuck?

If you continue to experience issues:

- Verify each step of the QuickStart was completed
- Check logs on both client and server
- Cross-reference with CityPay API documentation:  
  https://docs.citypay.com/elements

Include the following when seeking support:

- Error messages (full text)
- Browser + OS
- Node + pnpm versions
- Relevant log output


## CityPay Elements flow

This diagram shows how a payment session is created on the server,
passed to the client, and used by CityPay Elements to securely collect
and authorise card details.

### Diagram
![CityPay Elements flow](public/CityPay%20CardElement%20Flow.png)
