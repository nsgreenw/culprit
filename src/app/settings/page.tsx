"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button, Card, Loading, PageTitle } from "@/components/ui";
import { demoData } from "@/lib/demo";
import { actions, useAppData, type AppData } from "@/lib/store";

export default function SettingsPage() {
  const data = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

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
        lead="Your log stays in this browser only. Make a backup file from time to time, or you can lose it when you clear your browser."
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

        {message && <p className="text-sm text-accent" role="status">{message}</p>}
      </div>
    </>
  );
}
