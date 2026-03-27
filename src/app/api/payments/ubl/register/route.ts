import { NextResponse } from "next/server";
import { registerTransaction } from "@/lib/ubl";

type CheckoutPayload = {
  paymentMethod?: string;
  amount?: number;
  currency?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    name: string;
    qty: number;
  }>;
};

function createOrderId() {
  // UBL sandbox expects a numeric OrderID with a maximum length of 16 digits.
  return `${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`.slice(0, 16);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutPayload;

  if (body.paymentMethod !== "ubl") {
    return NextResponse.json(
      { error: "This route only supports the UBL gateway flow." },
      { status: 400 },
    );
  }

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json(
      { error: "A valid amount is required." },
      { status: 400 },
    );
  }

  try {
    const url = new URL(request.url);
    const orderId = createOrderId();
    const customerName = body.customer?.name?.trim() || "UBL Customer";
    const orderInfo =
      [
        body.items?.map((item) => `${item.name} x${item.qty}`).join(", "),
        body.customer?.email,
        body.customer?.phone,
      ]
        .filter(Boolean)
        .join(" | ") || "Next.js checkout order";

    const transaction = await registerTransaction({
      amount: body.amount.toFixed(2),
      currency: body.currency ?? "PKR",
      orderId,
      orderName: customerName.slice(0, 30),
      orderInfo,
      returnPath: `${url.origin}/api/payments/ubl/callback`,
    });

    return NextResponse.json({
      success: transaction.ResponseCode === "0",
      orderId,
      transactionId: transaction.TransactionID,
      paymentPage: transaction.PaymentPage,
      paymentPortal: transaction.PaymentPortal,
      responseCode: transaction.ResponseCode,
      responseDescription: transaction.ResponseDescription,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to register transaction.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
