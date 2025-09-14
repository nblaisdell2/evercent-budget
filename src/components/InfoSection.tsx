"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { Icons } from "~/lib/icons";

type Props = {
  sectionName: string;
  children?: React.ReactNode;
  className?: string;
};

function InfoSection({ sectionName, children, className }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const arrowIcon = isExpanded ? (
    <Icons.downArrow className="mr-2 w-6 h-6 font-extrabold text-lg" />
  ) : (
    <Icons.rightArrow className="mr-2 w-6 h-6" />
  );

  return (
    <div className="bg-opacity-25 mb-2 rounded-xl">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center bg-brand-secondary p-2 ${
          isExpanded ? "rounded-t-md" : "rounded-md"
        } cursor-pointer`}
      >
        {/* Icon */}
        {arrowIcon}
        <h3 className="font-extrabold text-xl tracking-wide">{sectionName}</h3>
      </div>

      {/* Section content */}
      {isExpanded && (
        <div
          className={`flex flex-col bg-[#19196E] border-2 border-brand-secondary rounded-b-md h-[200px] ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default InfoSection;
