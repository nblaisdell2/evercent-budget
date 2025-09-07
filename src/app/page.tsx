import Link from "next/link";
import { api, HydrateClient } from "~/trpc/server";
import BudgetTable from "./(budget)/_components/BudgetTable";
import Calendar, { type Event } from "./(budget)/_components/Calendar";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex bg-brand-primary min-h-screen text-white">
        {/* Left nav */}
        <div className="p-2 w-1/5">
          {/* Budget menu */}
          <div></div>

          <hr />

          {/* Navigation Buttons (Budget/Automation/Reporting) */}
          <div>
            <Link href="/budget">Budget</Link>
            <Link href="/auto">Automation</Link>
            <Link href="/reports">Reporting</Link>
          </div>

          <hr />

          <div>
            {/* Month Selector */}
            <div></div>

            {/* To Be Budgeted */}
            <div></div>
          </div>

          <hr />

          <div>
            {/* Accounts */}
            <div></div>

            {/* Debts */}
            <div></div>

            {/* Add account button */}
            <button></button>
          </div>

          {/* Evercent footnote */}
          <div></div>
        </div>

        {/* Budget Section */}
        <div className="flex flex-col flex-grow bg-brand-primary-dark h-screen">
          {/* Actions */}
          <div>
            {/* Buttons */}
            <div></div>

            {/* Undo/Redo */}
            <div>
              <button></button>
              <button></button>
            </div>
          </div>

          <hr />

          {/* Budget Table */}
          <BudgetTable />
        </div>

        {/* Right nav */}
        <div className="flex flex-col gap-y-2 p-2 w-1/5 h-screen">
          <div className="flex-grow overflow-y-auto no-scrollbar">
            {/* Actions */}
            <div className="bg-opacity-25 mb-2 border-2 border-brand-secondary rounded-xl h-[200px]">
              <div className="flex bg-brand-secondary">
                {/* Icon */}
                <div></div>
                <h3>Actions</h3>
              </div>

              {/* Section content */}
              <div></div>
            </div>

            {/* Activity */}
            <div className="bg-opacity-25 my-2 border-2 border-brand-secondary rounded-xl h-[200px]">
              <div className="flex bg-brand-secondary">
                {/* Icon */}
                <div></div>
                <h3>Activity</h3>
              </div>

              {/* Section content */}
              <div></div>
            </div>

            {/* Future Money */}
            <div className="bg-opacity-25 mt-2 border-2 border-brand-secondary rounded-xl h-[200px]">
              <div className="flex bg-brand-secondary">
                {/* Icon */}
                <div></div>
                <h3>Future Money</h3>
              </div>

              {/* Section content */}
              <div></div>
            </div>
          </div>

          <hr className="text-brand-secondary" />

          {/* Calendar */}
          <Calendar
            allowMonthSelection={true}
            month={new Date(2025, 8, 1)}
            events={
              [
                {
                  date: new Date(),
                  label: "Payday",
                  type: "payday",
                },
                {
                  date: new Date(),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 8, 9),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 8, 9),
                  label: "Groceries",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 8, 9),
                  label: "Insurance",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 8, 11),
                  label: "Payday",
                  type: "payday",
                },
                {
                  date: new Date(2025, 8, 13),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 8, 16),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 8, 23),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 8, 30),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 5, 15),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 6, 30),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
                {
                  date: new Date(2025, 5, 1),
                  label: "Rent",
                  type: "expense",
                  amount: 1200,
                },
              ] as Event[]
            }
          />
        </div>
      </main>
    </HydrateClient>
  );
}
