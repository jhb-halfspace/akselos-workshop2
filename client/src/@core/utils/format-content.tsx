import React, { ReactNode } from "react";

export const formatTooltipContent = (content?: string): ReactNode => {
  return (
    content &&
    content.split("\n").map((item: string, index: number) => {
      return (
        <span key={index}>
          {item}
          <br />
        </span>
      );
    })
  );
};
