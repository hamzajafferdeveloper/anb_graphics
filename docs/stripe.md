Stripe Integration
==================

Setup
-----

- Add your Stripe keys to `.env`:

  STRIPE_KEY=pk_live_...
  STRIPE_SECRET=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  VITE_STRIPE_KEY=pk_live_...

- Install dependencies (already done by this change):

```
composer require stripe/stripe-php
npm install @stripe/stripe-js
```

Routes
------

- POST `/cart/checkout` (authenticated): creates a Stripe Checkout Session.
- GET `/cart/checkout/success`: shown after successful payment.
- GET `/cart/checkout/cancel`: shown if payment is cancelled.
- POST `/stripe/webhook`: Stripe webhook endpoint (no CSRF required).

Notes
-----

- Configure a webhook in your Stripe dashboard to point to `/stripe/webhook`.
- The webhook handler currently clears the user's cart on `checkout.session.completed`.
