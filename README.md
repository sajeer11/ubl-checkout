# UBL Checkout Demo

This is a Next.js checkout project wired to the published UBL sandbox flow:

- checkout page
- UBL selected as the payment method
- real registration call to the sandbox gateway
- hosted payment page redirect
- callback handling
- finalization call after return

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment setup

Copy `.env.example` to `.env.local`:

```bash
UBL_BASE_URL=https://demo-ipg.ctdev.comtrust.ae:2443
UBL_CUSTOMER_ID=Demo Merchant
UBL_USERNAME=Demo_fY9c
UBL_PASSWORD=Comtrust@20182018
UBL_STORE=0000
UBL_TERMINAL=0000
UBL_CHANNEL=Web
UBL_TRANSACTION_HINT=CPT:Y;VCC:Y;
```

## Flow

1. `POST /api/payments/ubl/register` sends the Registration request to the sandbox gateway.
2. The browser posts `TransactionID` to the hosted payment page from the gateway response.
3. The gateway returns to `/api/payments/ubl/callback`.
4. The callback route performs the Finalization call.
5. The app redirects to `/checkout/result`.

## Sandbox cards

- Visa success: `4111111111111111`
- MasterCard success: `5555555555554444`
- Expiry: any future month and year
- CVV: `123`

## Production note

For production go-live, UBL should issue separate live credentials and may require different customer, store, terminal, certificate, or callback settings.
