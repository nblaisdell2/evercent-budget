"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import InfoSection from "~/components/InfoSection";
import Calendar, { type Event } from "./Calendar";
import BudgetTable from "./BudgetTable";

type Props = {};

function Main({}: Props) {
  const [leftWidth, setLeftWidth] = useState(200);
  const [rightWidth, setRightWidth] = useState(200);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeResize = useRef<"left" | "right" | null>(null);

  function startResizing(side: "left" | "right") {
    activeResize.current = side;

    function handleMouseMove(e: MouseEvent) {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      if (activeResize.current === "left") {
        console.log({ containerRect });
        const newWidth = e.clientX - containerRect.left;
        if (newWidth > 150 && newWidth < containerRect.right / 5)
          setLeftWidth(newWidth);
        if (newWidth <= 150) setLeftWidth(50);
      }

      if (activeResize.current === "right") {
        const newWidth = containerRect.right - e.clientX;
        if (newWidth > 150 && newWidth < containerRect.right / 5)
          setRightWidth(newWidth);
        if (newWidth <= 150) setRightWidth(50);
      }
    }

    function handleMouseUp() {
      activeResize.current = null;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div
      ref={containerRef}
      className="flex bg-brand-primary min-h-screen text-white"
    >
      {/* Left nav */}
      <div className="p-2 w-1/5" style={{ width: leftWidth }}>
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

      {/* Left resizer */}
      <div
        onMouseDown={() => startResizing("left")}
        className="z-10 bg-transparent hover:bg-gray-400 w-1 transition delay-300 hover:cursor-col-resize"
      />

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

      {/* Right resizer */}
      <div
        onMouseDown={() => startResizing("right")}
        className="z-10 bg-transparent hover:bg-gray-400 w-1 transition delay-300 hover:cursor-col-resize"
      />

      {/* Right nav */}
      <div
        className="flex flex-col gap-y-2 p-2 w-1/5 h-screen"
        style={{ width: rightWidth }}
      >
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {/* Actions */}
          <InfoSection sectionName="Actions" className="p-2">
            <button className="flex items-center gap-x-2 bg-brand-secondary hover:bg-brand-secondary/80 mb-2 px-2 py-1 rounded w-full cursor-pointer">
              Reset All Budget Amounts
            </button>
            <button className="flex items-center gap-x-2 bg-brand-secondary hover:bg-brand-secondary/80 mb-2 px-2 py-1 rounded w-full cursor-pointer">
              Reset Budgeted Amounts
            </button>
          </InfoSection>

          {/* Activity */}
          <InfoSection sectionName="Activity">
            <div className="flex-grow overflow-y-auto no-scrollbar">
              <table className="w-full text-left">
                <tbody>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td
                      className="line-clamp-1"
                      title={
                        "Something really really really really really long"
                      }
                    >
                      Something really really really really really long
                    </td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Paycheck"}>Paycheck</td>
                    <td className="pr-1 pl-2 font-bold text-brand-green text-right">
                      $1000.00
                    </td>
                  </tr>
                  <tr className="bg-brand-primary">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary-dark">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                  <tr className="bg-brand-primary">
                    <td className="pr-2 pl-2">24th</td>
                    <td title={"Domino's"}>Domino's</td>
                    <td className="pr-1 pl-2 font-bold text-brand-red text-right">
                      $35.24
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </InfoSection>

          {/* Future Money */}
          <InfoSection sectionName="Future Money" className="p-2">
            <div className="flex items-baseline">
              <p className="m-0">March</p>
              <div className="flex-grow mx-0.5 border-b border-dotted"></div>
              <p className="m-0">$1000.00</p>
            </div>
            <div className="flex items-baseline">
              <p className="m-0">April</p>
              <div className="flex-grow mx-0.5 border-b border-dotted"></div>
              <p className="m-0">$1000.00</p>
            </div>
            <div className="flex items-baseline">
              <p className="m-0">May</p>
              <div className="flex-grow mx-0.5 border-b border-dotted"></div>
              <p className="m-0">$950.00</p>
            </div>
            <div className="flex items-baseline">
              <p className="m-0">June</p>
              <div className="flex-grow mx-0.5 border-b border-dotted"></div>
              <p className="m-0">$1000.00</p>
            </div>
          </InfoSection>
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
    </div>
  );
}

export default Main;
