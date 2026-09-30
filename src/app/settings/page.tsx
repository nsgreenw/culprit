"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Card, Loading, PageTitle } from "@/components/ui";
import { demoData } from "@/lib/demo";
import { persistState, requestPersistence, type PersistState } from "@/lib/persist";
import { REPO_URL } from "@/lib/site";
import { actions, useAppData, type AppData } from "@/lib/store";

const PERSIST_TEXT: Record<PersistState, string> = {
  persisted: "Protected. The browser will not delete your data to free space.",
  "best-effort":
    "Not protected. The browser can delete your data when the device is low on space. Make regular backups.",
  unsupported: "This browser cannot protect stored data. Make regular backups.",
};

export default function SettingsPage() {
  const data = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [persist, setPersist] = useState<PersistState | null>(null);

  useEffect(() => {
    persistState().then(setPersist, () => setPersist("unsupported"));
  }, []);

  if (!data) return <Loading />;

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elimination-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    actions.markBackedUp();
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as AppData;
      if (parsed.version !== 1 || !Array.isArray(parsed.meals))
        throw new Error("not a backup file");
      actions.replaceAll(parsed);
      setMessage(`Imported ${parsed.meals.length} meals and ${parsed.symptoms.length} symptoms.`);
    } catch {
      setMessage("This file is not a valid backup.");
    }
  };

  return (
    <>
      <PageTitle
        title="Your data"
        lead="Your log stays on this device, in this browser. It never goes to a server. Make a backup file from time to time."
      />
      <div className="space-y-3">
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Doctor report</p>
            <p className="text-sm text-muted">A one-page summary to print or save as PDF.</p>
          </div>
          <Link href="/report" className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-paper">
            Open report
          </Link>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Backup</p>
            <p className="text-sm text-muted">
              {data.meals.length} meals · {data.symptoms.length} symptoms ·{" "}
              {data.experiments.length} experiments
            </p>
            <p className="text-xs text-muted">
              {data.lastBackupAt
                ? `Last backup: ${new Date(data.lastBackupAt).toLocaleDateString()}`
                : "No backup yet"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportData}>
              Export
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Import
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
            />
          </div>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Sample data</p>
            <p className="text-sm text-muted">
              Replace your log with 4 weeks of sample data to try the app.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              actions.replaceAll(demoData());
              setMessage("Sample data loaded.");
            }}
          >
            Load sample
          </Button>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium">Delete everything</p>
            <p className="text-sm text-muted">You cannot undo this.</p>
          </div>
          {confirmClear ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  actions.clearAll();
                  setConfirmClear(false);
                  setMessage("All data deleted.");
                }}
              >
                Yes, delete all
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmClear(true)}>
              Delete all
            </Button>
          )}
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-md">
            <p className="font-medium">Storage protection</p>
            <p className="text-sm text-muted">
              {persist ? PERSIST_TEXT[persist] : "Checking…"}
            </p>
          </div>
          {persist === "best-effort" && (
            <Button
              variant="secondary"
              onClick={() => requestPersistence().then(setPersist)}
            >
              Ask again
            </Button>
          )}
        </Card>

        <Card>
          <p className="font-medium">Privacy & source code</p>
          <p className="mt-1 text-sm text-muted">
            This app has no accounts, no analytics, and no server. After the
            page loads, it makes no network requests. It is open source under
            the AGPL-3.0 license. The compound data is under CC BY-SA 4.0.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-accent underline"
          >
            View the source code and report errors
          </a>
        </Card>

        {message && <p className="text-sm text-accent" role="status">{message}</p>}
      </div>
    </>
  );
}
