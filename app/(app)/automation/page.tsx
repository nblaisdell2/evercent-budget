import { StubScreen } from "@/components/layout/stub-screen";

/* Reads the signed-in user and the database on every request. */
export const dynamic = "force-dynamic";

export default function AutomationPage() {
  return (
    <StubScreen
      title="Automation"
      blurb="Rules that fund future months off your pay schedule. Not built yet — this route exists so the nav doesn't 404."
    />
  );
}
