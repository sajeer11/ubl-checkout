import { NextResponse } from "next/server";
import { finalizeTransaction } from "@/lib/ubl";

function buildRedirectUrl(request: Request, params: URLSearchParams) {
  const url = new URL("/checkout/result", request.url);
  url.search = params.toString();
  return url;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const transactionId = formData.get("TransactionID")?.toString();

  if (!transactionId) {
    const params = new URLSearchParams({
      status: "error",
      message: "UBL callback did not include a TransactionID.",
    });

    return NextResponse.redirect(buildRedirectUrl(request, params));
  }

  try {
    const transaction = await finalizeTransaction(transactionId);
    const success = transaction.ResponseCode === "0";

    const params = new URLSearchParams({
      status: success ? "success" : "failed",
      message:
        transaction.ResponseDescription ??
        (success ? "Transaction completed." : "Transaction failed."),
      transactionId,
      responseCode: transaction.ResponseCode ?? "",
      orderId: transaction.OrderID ?? "",
      approvalCode: transaction.ApprovalCode ?? "",
      amount: transaction.Amount?.Value ?? "",
      cardBrand: transaction.CardBrand ?? "",
      cardNumber: transaction.CardNumber ?? "",
      account: transaction.Account ?? "",
    });

    return NextResponse.redirect(buildRedirectUrl(request, params));
  } catch (error) {
    const params = new URLSearchParams({
      status: "error",
      transactionId,
      message:
        error instanceof Error
          ? error.message
          : "Unable to finalize UBL transaction.",
    });

    return NextResponse.redirect(buildRedirectUrl(request, params));
  }
}
