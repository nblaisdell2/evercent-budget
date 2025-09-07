"use client";

import React, { useState } from "react";

type Category = {
  id: string;
  name: string;
  budgeted: number;
  activity: number;
  available: number;
};

type CategoryGroup = {
  id: string;
  name: string;
  budgeted: number;
  activity: number;
  available: number;
  categories: Category[];
};

const sampleData: CategoryGroup[] = [
  {
    id: "g1",
    name: "Reporting",
    budgeted: 1000,
    activity: 1000,
    available: 1000,
    categories: [
      {
        id: "c1",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 1000,
      },
      {
        id: "c2",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 1000,
      },
      {
        id: "c3",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
    ],
  },
  {
    id: "g2",
    name: "Reporting",
    budgeted: 1000,
    activity: 1000,
    available: 1000,
    categories: [
      {
        id: "c4",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
      {
        id: "c5",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
    ],
  },
  {
    id: "g2",
    name: "Reporting",
    budgeted: 1000,
    activity: 1000,
    available: 1000,
    categories: [
      {
        id: "c4",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
      {
        id: "c5",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
    ],
  },
  {
    id: "g2",
    name: "Reporting",
    budgeted: 1000,
    activity: 1000,
    available: 1000,
    categories: [
      {
        id: "c4",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
      {
        id: "c5",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
    ],
  },
  {
    id: "g2",
    name: "Reporting",
    budgeted: 1000,
    activity: 1000,
    available: 1000,
    categories: [
      {
        id: "c4",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
      {
        id: "c5",
        name: "Reporting",
        budgeted: 1000,
        activity: 1000,
        available: 0,
      },
    ],
  },
];

const BudgetTable: React.FC = () => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div className="overflow-y-auto">
      <table className="w-full text-sm border-collapse">
        <thead className="top-0 sticky bg-gray-900 text-gray-300">
          <tr>
            <th className="p-2 text-left">Group / Category</th>
            <th className="p-2 text-right">Budgeted</th>
            <th className="p-2 text-right">Activity</th>
            <th className="p-2 text-right">Available</th>
          </tr>
        </thead>
        <tbody>
          {sampleData.map((group) => {
            const isExpanded = expandedGroups[group.id] ?? true;
            return (
              <React.Fragment key={group.id}>
                {/* Group Row */}
                <tr
                  className="bg-gray-800 hover:bg-gray-700 font-bold cursor-pointer"
                  onClick={() => toggleGroup(group.id)}
                >
                  <td className="flex items-center gap-2 p-2">
                    <span>{isExpanded ? "▾" : "▸"}</span>
                    {group.name}
                  </td>
                  <td className="p-2 text-right">
                    ${group.budgeted.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    ${group.activity.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    ${group.available.toFixed(2)}
                  </td>
                </tr>

                {/* Category Rows */}
                {isExpanded &&
                  group.categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="bg-gray-900 hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-2 pl-8">{cat.name}</td>
                      <td className="p-2 text-right">
                        ${cat.budgeted.toFixed(2)}
                      </td>
                      <td className="p-2 text-right">
                        ${cat.activity.toFixed(2)}
                      </td>
                      <td
                        className={`text-right p-2 font-semibold ${
                          cat.available < 0
                            ? "text-red-400"
                            : cat.available === 0
                            ? "text-gray-500"
                            : "text-green-400"
                        }`}
                      >
                        ${cat.available.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BudgetTable;
