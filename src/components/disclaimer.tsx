"use client";

import { actions, useAppData } from "@/lib/store";
import { Button } from "./ui";

export function DisclaimerGate() {
  const data = useAppData();
  if (!data || data.acknowledgedDisclaimer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal
        aria-labelledby="disclaimer-title"
        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-xl"
      >
        <h2 id="disclaimer-title" className="font-display text-2xl font-semibold">
          Before you start
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-muted">
          <li>
            This app finds <strong className="text-ink">patterns</strong> in
            what you log. A pattern is a clue, not a diagnosis.
          </li>
          <li>
            Some conditions need a test <strong className="text-ink">before</strong>{" "}
            you change your diet. For example, a celiac test needs gluten in
            your diet to work.
          </li>
          <li>
            Swelling of the lips or throat, trouble breathing, blood in your
            stool, or weight loss you cannot explain need a doctor now.
          </li>
          <li>
            Your data stays in this browser. It does not go to a server.
          </li>
        </ul>
        <Button className="mt-6 w-full" onClick={actions.acknowledgeDisclaimer}>
          I understand
        </Button>
      </div>
    </div>
  );
}
