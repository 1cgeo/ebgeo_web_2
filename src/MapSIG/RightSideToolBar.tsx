import { FC } from "react";

export default ({ tools }: { tools: Array<FC> }) => {
  return tools.map((tool: FC, index) => {
    const pos = {
      top: 90 + index * 70,
      right: 10,
    };

    return tool(pos);
  });
};
