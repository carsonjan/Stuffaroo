"use client";

import {
  CircleCheck,
  CircleDashed,
  ExternalLink,
  Info,
  LoaderCircle,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatDateRange, formatMoneyCents } from "@/lib/format";
import { cn } from "@/lib/utils";

type Stage =
  | "disconnected"
  | "connected"
  | "signing"
  | "submitted"
  | "simulated";

const DEMO_AMOUNT_SOL = 0.05;

const steps: { key: Stage; label: string; detail: string }[] = [
  {
    key: "connected",
    label: "Wallet connected",
    detail: "Phantom or Solflare on Devnet",
  },
  {
    key: "signing",
    label: "Transfer signed",
    detail: "You approve the transfer in your wallet",
  },
  {
    key: "submitted",
    label: "Submitted to Devnet",
    detail: "Waiting for the network to confirm",
  },
  {
    key: "simulated",
    label: "Confirmed on-chain",
    detail: "Server checks the signature with a Devnet RPC",
  },
];

const order: Stage[] = [
  "disconnected",
  "connected",
  "signing",
  "submitted",
  "simulated",
];

/**
 * Mockup of the Devnet deposit flow. No wallet is contacted and no
 * transaction is sent: every state here is simulated and labelled as such.
 */
export function DepositDemo({
  itemTitle,
  ownerName,
  depositCents,
  dates,
}: {
  itemTitle: string;
  ownerName: string;
  depositCents: number | null;
  dates: { start: string; end: string };
}) {
  const [stage, setStage] = useState<Stage>("disconnected");
  const reached = (s: Stage) => order.indexOf(stage) >= order.indexOf(s);

  const send = () => {
    setStage("signing");
    setTimeout(() => setStage("submitted"), 1000);
    setTimeout(() => setStage("simulated"), 2400);
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        {/* Summary */}
        <section className="rounded-card border bg-card p-5">
          <h2 className="text-lg font-semibold">Deposit for {itemTitle}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <Detail label="Owner" value={ownerName} />
            <Detail
              label="Dates"
              value={formatDateRange(dates.start, dates.end)}
            />
            <Detail
              label="Agreed deposit"
              value={formatMoneyCents(depositCents)}
            />
            <Detail label="Demo transfer" value={`${DEMO_AMOUNT_SOL} SOL`} />
          </dl>
          <p className="mt-4 flex gap-2 rounded-small bg-muted p-3 text-xs text-muted-foreground">
            <Info className="mt-px size-3.5 shrink-0" aria-hidden />
            The demo sends a fixed, symbolic amount of Devnet SOL. It is not
            converted from the dollar deposit.
          </p>
        </section>

        {/* Action */}
        <section className="rounded-card border bg-card p-5">
          {stage === "disconnected" ? (
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Connect a wallet</p>
                <p className="text-sm text-muted-foreground">
                  Switch your wallet to Devnet first.
                </p>
              </div>
              <Button
                size="lg"
                className="px-4"
                onClick={() => setStage("connected")}
              >
                <Wallet data-icon="inline-start" /> Connect wallet
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <span className="font-medium">7xKX…demo</span>
                  <span className="text-xs text-muted-foreground">
                    (mock wallet)
                  </span>
                </span>
                <span className="text-muted-foreground">Balance: 2.00 SOL</span>
              </div>
              {stage === "connected" && (
                <Button size="lg" className="h-11" onClick={send}>
                  Send {DEMO_AMOUNT_SOL} Devnet SOL to {ownerName.split(" ")[0]}
                </Button>
              )}
              {(stage === "signing" || stage === "submitted") && (
                <div className="flex items-center gap-2 rounded-small bg-muted p-3 text-sm">
                  <LoaderCircle
                    className="size-4 animate-spin motion-reduce:animate-none"
                    aria-hidden
                  />
                  {stage === "signing"
                    ? "Simulating wallet approval…"
                    : "Simulating Devnet confirmation…"}
                </div>
              )}
              {stage === "simulated" && (
                <div className="border-t border-dashed border-rule-2 pt-4 text-sm">
                  <p className="font-medium text-ink">
                    Simulated result: no transaction was sent
                  </p>
                  <dl className="mt-3 flex flex-col gap-2 text-ink-3">
                    <div className="flex justify-between gap-4">
                      <dt>Network</dt>
                      <dd>Devnet</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Signature</dt>
                      <dd>appears after a real transfer</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Explorer</dt>
                      <dd>
                        <a
                          href="https://explorer.solana.com/?cluster=devnet"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 underline underline-offset-2"
                        >
                          Solana Explorer{" "}
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    onClick={() => setStage("connected")}
                    className="mt-3 text-xs underline underline-offset-2"
                  >
                    Reset demo
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Status timeline */}
      <aside className="flex flex-col gap-4">
        <section className="rounded-card border bg-card p-5">
          <h2 className="font-sans text-sm font-medium tracking-normal">
            Transaction status
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {steps.map((step) => {
              const done = reached(step.key);
              const current =
                order[order.indexOf(step.key) - 1] === stage &&
                stage !== "disconnected" &&
                stage !== "simulated";
              return (
                <li key={step.key} className="flex gap-3">
                  {done ? (
                    <CircleCheck
                      className={cn("mt-0.5 size-4 shrink-0", "text-ink-3")}
                      aria-hidden
                    />
                  ) : current ? (
                    <LoaderCircle
                      className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none text-muted-foreground"
                      aria-hidden
                    />
                  ) : (
                    <CircleDashed
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground/60"
                      aria-hidden
                    />
                  )}
                  <div>
                    <p
                      className={cn(
                        "text-sm",
                        done ? "font-medium" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                      {done && (
                        <span className="ml-1.5 text-xs font-normal text-ink-3">
                          (simulated)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded-card border bg-card p-5 text-sm">
          <h2 className="font-sans text-sm font-medium tracking-normal">
            How to read statuses
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 rounded-pill bg-tint-mint px-2 py-0.5 text-xs font-medium text-ink">
                Verified
              </span>
              <span className="text-muted-foreground">
                Signature confirmed by a Devnet RPC call. Links to Explorer.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 rounded-pill border border-dashed border-rule-2 px-2 py-0.5 text-xs font-medium text-ink-3">
                Simulated
              </span>
              <span className="text-muted-foreground">
                UI-only state for demos. Nothing touched the blockchain.
              </span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
