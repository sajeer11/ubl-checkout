"use client";

import { useState } from "react";

type PaymentMethod = "ubl" | "cod" | "bank-transfer";

type CheckoutResponse = {
  success: boolean;
  orderId: string;
  transactionId: string;
  paymentPage: string;
  paymentPortal?: string;
  responseCode?: string;
  responseDescription?: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  amount: string;
};

const initialForm: FormState = {
  fullName: "Test Buyer",
  email: "buyer@example.com",
  phone: "+92-300-1234567",
  amount: "4999",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ubl");
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = Number(form.amount || 0);

  async function handleCheckout() {
    if (!form.fullName || !form.email || !form.phone) {
      setError("Please fill name, email, and phone before continuing.");
      return;
    }

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (paymentMethod !== "ubl") {
      setError("UBL is the active payment method for sandbox testing.");
      setResult(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/payments/ubl/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod,
          amount: parsedAmount,
          currency: "PKR",
          customer: {
            name: form.fullName,
            email: form.email,
            phone: form.phone,
          },
          items: [
            {
              name: "Checkout Payment",
              qty: 1,
            },
          ],
        }),
      });

      const data = (await response.json()) as CheckoutResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to start checkout.");
      }

      setResult(data);

      const formElement = document.createElement("form");
      formElement.method = "POST";
      formElement.action = data.paymentPage;

      const transactionField = document.createElement("input");
      transactionField.type = "hidden";
      transactionField.name = "TransactionID";
      transactionField.value = data.transactionId;

      formElement.appendChild(transactionField);
      document.body.appendChild(formElement);
      formElement.submit();
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Something went wrong.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_30px_80px_rgba(21,34,23,0.08)]">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-[var(--line)] p-6 md:border-r md:border-b-0 md:p-8">
            <span className="inline-flex rounded-full bg-[var(--brand-soft)] px-4 py-1 text-xs font-semibold tracking-[0.18em] text-[var(--brand)] uppercase">
              Simple UBL Checkout
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Fill the form, choose UBL, and continue to the sandbox payment page.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              This page is simplified for testing. Once the user submits the form,
              your app creates a UBL transaction and redirects to the hosted UBL
              checkout page. For live payments, replace sandbox credentials with
              your real UBL merchant account details.
            </p>

            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  placeholder="Enter customer name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  placeholder="buyer@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone number
                </label>
                <input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  placeholder="+92-300-1234567"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="amount">
                  Amount (PKR)
                </label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                  placeholder="4999"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="paymentMethod">
                  Payment method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethod)
                  }
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
                >
                  <option value="ubl">UBL Gateway</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          <aside className="bg-[#113c2b] p-6 text-white md:p-8">
            <h2 className="text-2xl font-semibold">Order summary</h2>
            <p className="mt-2 text-sm leading-6 text-white/72">
              The current checkout is configured for UBL sandbox. When you get live
              credentials from UBL, the same flow can point to your real merchant
              account by changing the environment values.
            </p>

            <div className="mt-8 rounded-[1.5rem] bg-white/6 p-5">
              <div className="flex items-center justify-between py-2 text-sm text-white/76">
                <span>Customer</span>
                <span>{form.fullName || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-sm text-white/76">
                <span>Email</span>
                <span>{form.email || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-sm text-white/76">
                <span>Phone</span>
                <span>{form.phone || "Not provided"}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-white/12 pt-4 text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(parsedAmount || 0)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/4 p-4 text-sm text-white/76">
              <p>Mode: Sandbox</p>
              <p className="mt-1">Gateway: UBL</p>
              <p className="mt-1">Currency: PKR</p>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-[#1f1808] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Opening UBL sandbox..." : "Continue to UBL"}
            </button>

            {error ? (
              <div className="mt-4 rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[rgba(166,60,56,0.18)] p-4 text-sm text-white">
                {error}
              </div>
            ) : null}

            {result ? (
              <div className="mt-4 space-y-2 rounded-2xl border border-white/14 bg-white/8 p-4 text-sm">
                <p className="font-semibold text-[var(--accent)]">
                  UBL transaction registered
                </p>
                <p className="text-white/80">Redirecting to the gateway.</p>
                <p className="text-white/72">Order ID: {result.orderId}</p>
                <p className="text-white/72">
                  Transaction ID: {result.transactionId}
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
