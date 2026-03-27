type GatewayAmount = {
  Value?: string;
};

type GatewayTransaction = {
  Account?: string;
  Amount?: GatewayAmount;
  ApprovalCode?: string;
  CardBrand?: string;
  CardNumber?: string;
  OrderID?: string;
  PaymentPage?: string;
  PaymentPortal?: string;
  ResponseClass?: string;
  ResponseClassDescription?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  TransactionID?: string;
  UniqueID?: string;
};

type GatewayEnvelope = {
  Transaction?: GatewayTransaction;
};

type RegistrationInput = {
  amount: string;
  currency: string;
  orderId: string;
  orderName: string;
  orderInfo: string;
  returnPath: string;
};

function getConfig() {
  return {
    baseUrl:
      process.env.UBL_BASE_URL ?? "https://demo-ipg.ctdev.comtrust.ae:2443",
    customerId: process.env.UBL_CUSTOMER_ID ?? "Demo Merchant",
    username: process.env.UBL_USERNAME ?? "Demo_fY9c",
    password: process.env.UBL_PASSWORD ?? "Comtrust@20182018",
    store: process.env.UBL_STORE ?? "0000",
    terminal: process.env.UBL_TERMINAL ?? "0000",
    channel: process.env.UBL_CHANNEL ?? "Web",
    transactionHint:
      process.env.UBL_TRANSACTION_HINT ?? "CPT:Y;VCC:Y;",
  };
}

async function callGateway(payload: object) {
  const config = getConfig();
  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json()) as GatewayEnvelope;

  if (!response.ok) {
    throw new Error(
      data.Transaction?.ResponseDescription ??
        `UBL gateway request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function registerTransaction(input: RegistrationInput) {
  const config = getConfig();

  const payload = {
    Registration: {
      Customer: config.customerId,
      UserName: config.username,
      Password: config.password,
      Store: config.store,
      Terminal: config.terminal,
      Channel: config.channel,
      Amount: input.amount,
      Currency: input.currency,
      OrderID: input.orderId,
      OrderName: input.orderName,
      OrderInfo: input.orderInfo,
      TransactionHint: config.transactionHint,
      ReturnPath: input.returnPath,
    },
  };

  const data = await callGateway(payload);
  const transaction = data.Transaction;

  if (!transaction?.TransactionID || !transaction.PaymentPage) {
    throw new Error(
      transaction?.ResponseDescription ??
        "UBL gateway did not return a payment page.",
    );
  }

  return transaction;
}

export async function finalizeTransaction(transactionId: string) {
  const config = getConfig();

  const payload = {
    Finalization: {
      Customer: config.customerId,
      UserName: config.username,
      Password: config.password,
      TransactionID: transactionId,
    },
  };

  const data = await callGateway(payload);

  if (!data.Transaction) {
    throw new Error("UBL gateway did not return a finalization response.");
  }

  return data.Transaction;
}
