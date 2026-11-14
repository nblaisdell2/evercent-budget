import { StubScreen } from "@/components/layout/stub-screen";

/* Reads the signed-in user and the database on every request. */
export const dynamic = "force-dynamic";

export default function ReportingPage() {
  return (
    <StubScreen
      title="Reporting"
      blurb="Spending and trend reports. Not built yet — this route exists so the nav doesn't 404."
    />
  );
}
