"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Check, HandHeart, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelClaim, claimListing, confirmCollected, type ClaimState } from "./claim-actions";

function Feedback({ state }: { state: ClaimState }) {
  return (
    <>
      <p role="status" className="sr-only">
        {state.message ?? ""}
      </p>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
    </>
  );
}

export function ClaimButton({ listingId }: { listingId: string }) {
  const [state, setState] = useState<ClaimState>({});
  const [pending, startTransition] = useTransition();

  function claim() {
    startTransition(async () => {
      setState(await claimListing(listingId));
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={claim} disabled={pending} className="h-12 w-fit rounded-full px-6 text-base">
        <HandHeart className="size-5" aria-hidden="true" />
        {pending ? "Claiming..." : "Claim this food"}
      </Button>
      <Feedback state={state} />
    </div>
  );
}

type ConfirmProps = {
  claimId: string;
  action: "cancel" | "collect";
  label: string;
  question: string;
  confirmLabel: string;
  pendingLabel: string;
  icon: ReactNode;
  destructive?: boolean;
};

// A two-step button: the first press asks, the second does it. Focus moves into the question
// and returns to the first button if the person backs out.
function ConfirmClaimAction({
  claimId,
  action,
  label,
  question,
  confirmLabel,
  pendingLabel,
  icon,
  destructive,
}: ConfirmProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, setState] = useState<ClaimState>({});
  const [pending, startTransition] = useTransition();
  const trigger = useRef<HTMLButtonElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (confirming) {
      opened.current = true;
      group.current?.focus();
    } else if (opened.current) {
      trigger.current?.focus();
    }
  }, [confirming]);

  function run() {
    startTransition(async () => {
      const result = action === "cancel" ? await cancelClaim(claimId) : await confirmCollected(claimId);
      setState(result);
      if (result.error) setConfirming(false);
    });
  }

  if (!confirming) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          ref={trigger}
          type="button"
          variant="outline"
          onClick={() => {
            setState({});
            setConfirming(true);
          }}
          className="h-11 w-fit rounded-full px-5"
        >
          {icon}
          {label}
        </Button>
        <Feedback state={state} />
      </div>
    );
  }

  return (
    <div
      ref={group}
      tabIndex={-1}
      role="group"
      aria-label={label}
      className="flex flex-col gap-3 rounded-2xl border border-destructive/40 p-4 outline-none"
    >
      <p className="font-semibold">{question}</p>
      <Feedback state={state} />
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={run}
          disabled={pending}
          className={
            destructive
              ? "h-11 rounded-full bg-destructive px-5 text-white hover:bg-destructive/90"
              : "h-11 rounded-full px-5"
          }
        >
          {pending ? pendingLabel : confirmLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="h-11 rounded-full px-5"
        >
          Back
        </Button>
      </div>
    </div>
  );
}

export function CancelClaim({ claimId }: { claimId: string }) {
  return (
    <ConfirmClaimAction
      claimId={claimId}
      action="cancel"
      label="Cancel claim"
      question="Cancel your claim? The food goes back on the feed."
      confirmLabel="Yes, cancel claim"
      pendingLabel="Cancelling..."
      icon={<Undo2 className="size-4" aria-hidden="true" />}
      destructive
    />
  );
}

export function ReleaseClaim({ claimId }: { claimId: string }) {
  return (
    <ConfirmClaimAction
      claimId={claimId}
      action="cancel"
      label="Release claim"
      question="Release this claim? The claimer is told, and the food goes back on the feed if it is still within its time."
      confirmLabel="Yes, release claim"
      pendingLabel="Releasing..."
      icon={<Undo2 className="size-4" aria-hidden="true" />}
      destructive
    />
  );
}

export function MarkCollected({ claimId }: { claimId: string }) {
  return (
    <ConfirmClaimAction
      claimId={claimId}
      action="collect"
      label="Mark collected"
      question="Confirm the food was handed over? This cannot be undone."
      confirmLabel="Yes, mark collected"
      pendingLabel="Saving..."
      icon={<Check className="size-4" aria-hidden="true" />}
    />
  );
}
