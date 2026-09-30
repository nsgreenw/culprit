"use client";

import { Timeline } from "@/components/timeline";
import { Loading, PageTitle } from "@/components/ui";
import { useAppData } from "@/lib/store";

export default function HistoryPage() {
  const data = useAppData();
  return (
    <>
      <PageTitle
        title="History"
        lead="Every meal and symptom you logged. Green dots are food. Red dots are symptoms."
      />
      {data ? <Timeline data={data} /> : <Loading />}
    </>
  );
}
