"use client";

import React, { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isToday,
  addDays,
} from "date-fns";
import { Icons } from "~/lib/icons";

export type Event = {
  date: Date;
  label: string;
  type: "payday" | "expense";
  amount?: number;
};

interface CalendarProps {
  allowMonthSelection?: boolean;
  month: Date | undefined;
  events: Event[];
}

const Calendar: React.FC<CalendarProps> = ({
  allowMonthSelection,
  month,
  events,
}) => {
  const [currentMonth, setCurrentMonth] = useState(month ?? new Date());
  const [isSelectingYear, setIsSelectingYear] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());

  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start, end });

  console.log({ start, end });
  console.log(days);

  const numSundays = days.filter((d) => d.getDay() === 0).length;
  if (numSundays < 6) {
    const extraDays = eachDayOfInterval({
      start: addDays(end, 1),
      end: addDays(addDays(end, 1), (6 - numSundays) * 7 - 1),
    });
    days.push(...extraDays);
  }

  const monthEvents = (date: Date) =>
    events.filter(
      (e) => format(e.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

  const sampleEvents = (date: Date) => {
    // Create a new array with 2 items from "events":
    // 1. First "payday" event
    // 2. first "expense" event
    // If there are no expense events, there should just be one item in the array
    const evs: Event[] = [];
    const firstPayday = events.find(
      (e) =>
        format(e.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        e.type === "payday"
    );
    if (firstPayday) evs.push(firstPayday);
    const firstExpense = events.find(
      (e) =>
        format(e.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") &&
        e.type === "expense"
    );
    if (firstExpense) evs.push(firstExpense);

    return evs;
  };

  const paydays = events.filter(
    (e) =>
      e.type === "payday" &&
      e.date.getUTCFullYear() === currentMonth.getFullYear()
  );

  return (
    <div className="bottom-0 bg-brand-primary-dark p-2 border-2 border-brand-secondary rounded-xl w-full max-w-lg text-white">
      {/* Header */}
      {allowMonthSelection && (
        <div
          className={`flex justify-around items-center mb-2 ${
            isSelectingYear && "pb-2 border-b border-brand-secondary"
          }`}
        >
          <button
            className="mx-2"
            onClick={() => {
              if (!isSelectingYear) {
                setCurrentMonth(subMonths(currentMonth, 1));
              } else {
                setSelectedYear(selectedYear - 1);
              }
            }}
          >
            <Icons.leftArrow className="hover:bg-brand-secondary p-1 rounded-full w-6 h-6 hover:cursor-pointer" />
          </button>
          <h2
            onClick={() => {
              setSelectedYear(currentMonth.getFullYear());
              setIsSelectingYear(!isSelectingYear);
            }}
            className="flex-grow hover:bg-gray-800 rounded-lg font-bold text-lg text-center cursor-pointer"
          >
            {!isSelectingYear
              ? format(currentMonth, "MMMM yyyy")
              : selectedYear}
          </h2>
          <button
            className="mx-2"
            onClick={() => {
              if (!isSelectingYear) {
                setCurrentMonth(addMonths(currentMonth, 1));
              } else {
                setSelectedYear(selectedYear + 1);
              }
            }}
          >
            <Icons.rightArrow className="hover:bg-brand-secondary p-1 rounded-full w-6 h-6 hover:cursor-pointer" />
          </button>
        </div>
      )}

      {isSelectingYear ? (
        <div className="gap-2 grid grid-cols-3 max-h-60 overflow-y-auto font-semibold text-center uppercase no-scrollbar">
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((d, i) => (
            <div
              onClick={() => {
                setCurrentMonth(new Date(selectedYear, i, 1));
                setIsSelectingYear(false);
              }}
              className="hover:bg-gray-800 p-1 rounded-lg transition cursor-pointer"
              key={d}
            >
              {d}
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Day names */}
          <div className="grid grid-cols-7 pb-2 border-b border-brand-secondary font-semibold text-center uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="gap-y-4 grid grid-cols-7 pt-4">
            {days.map((day) => {
              const evs = monthEvents(day);
              const dotEvs = sampleEvents(day);

              return (
                <div
                  key={day.toString()}
                  className={`relative group flex flex-col gap-0.5 items-center justify-start rounded-lg ${
                    !isSameMonth(day, currentMonth)
                      ? "text-gray-500"
                      : "cursor-pointer hover:bg-gray-800 transition"
                  }`}
                >
                  {/* Event dots */}
                  {isSameMonth(day, currentMonth) && (
                    <div className="absolute flex gap-1 -mt-2.5">
                      {dotEvs.map((ev, i) => (
                        <span
                          key={i}
                          className={`${
                            ev.type == "payday"
                              ? "bg-brand-green"
                              : "bg-brand-yellow"
                          } rounded-full w-2 h-2`}
                          title={ev.label}
                        />
                      ))}
                    </div>
                  )}

                  {/* Day number */}
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(day) && isSameMonth(day, currentMonth)
                        ? "bg-brand-secondary text-white"
                        : ""
                    }`}
                  >
                    {isSameMonth(day, currentMonth) && format(day, "d")}
                  </div>

                  {/* Tooltip (could be custom) */}
                  {evs.length > 0 && (
                    <div className="hidden group-hover:block right-8 bottom-10 z-10 absolute bg-brand-primary-dark p-2 border-2 border-brand-secondary rounded-lg text-sm">
                      <strong className="text-xl">
                        {format(day, "MMMM do, yyyy")}
                      </strong>
                      <hr className="my-2 border-brand-secondary" />
                      <ul className="space-y-1 mt-2">
                        {evs.map((ev, i) => (
                          <li key={i} className="flex justify-between gap-x-32">
                            <span className="flex items-center gap-2">
                              <span
                                className={`rounded-full w-2 h-2 ${
                                  ev.type == "payday"
                                    ? "bg-brand-green"
                                    : "bg-brand-yellow"
                                }`}
                              />
                              {ev.label}
                            </span>
                            {ev.type === "expense" ? (
                              <span className="font-extrabold">
                                ${ev.amount}
                              </span>
                            ) : (
                              <>
                                <span className="font-bold whitespace-nowrap">
                                  {"#" + (paydays.indexOf(ev) + 1)}
                                  <span className="ml-1 font-normal text-xs">{`(out of ${paydays.length})`}</span>
                                </span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
