import Link from "next/link";

type ResultPageProps = {
  searchParams: Promise<{
    account?: string;
    amount?: string;
    approvalCode?: string;
    cardBrand?: string;
    cardNumber?: string;
    message?: string;
    orderId?: string;
    responseCode?: string;
    status?: string;
    transactionId?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const isSuccess = params.status === "success";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <section className="w-full rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_24px_80px_rgba(21,34,23,0.08)]">
        <span
          className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold tracking-[0.18em] uppercase ${
            isSuccess
              ? "bg-[var(--brand-soft)] text-[var(--brand)]"
              : "bg-[rgba(166,60,56,0.12)] text-[var(--danger)]"
          }`}
        >
          {isSuccess ? "UBL Payment Success" : "UBL Payment Result"}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          {isSuccess ? "Sandbox payment completed" : "Sandbox payment needs review"}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          {params.message ??
            "The gateway returned to your checkout app, but no detailed message was provided."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">Transaction ID</p>
            <p className="mt-2 font-semibold">
              {params.transactionId || "Unavailable"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">Gateway Code</p>
            <p className="mt-2 font-semibold">{params.responseCode || "Unavailable"}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">Order ID</p>
            <p className="mt-2 font-semibold">{params.orderId || "Unavailable"}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">Approval Code</p>
            <p className="mt-2 font-semibold">
              {params.approvalCode || "Unavailable"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">Card</p>
            <p className="mt-2 font-semibold">
              {[params.cardBrand, params.cardNumber].filter(Boolean).join(" ") ||
                "Unavailable"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
            <p className="text-sm font-medium text-[var(--muted)]">Gateway Account</p>
            <p className="mt-2 font-semibold">{params.account || "Unavailable"}</p>
          </div>
        </div>

        <p className="mt-6 text-sm text-[var(--muted)]">
          Finalized amount: {params.amount || "Unavailable"}
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
        >
          Back to checkout
        </Link>
      </section>
    </main>
  );
}
