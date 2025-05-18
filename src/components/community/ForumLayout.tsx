
import { PropsWithChildren } from "react";

export const ForumLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="min-h-screen pb-10">
      {children}
    </div>
  );
};
