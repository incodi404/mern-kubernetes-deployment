import React, { MouseEventHandler } from "react";

interface ChildrenProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function GhostButton({ children, onClick, ...props }: ChildrenProps) {
  return (
    <button
      onClick={onClick}
      {...props}
      className="bg-white hover:shadow hover:border-white hover:bg-slate-50 cursor-pointer text-sm py-3 rounded-full text-black border border-slate-200 font-semibold w-full flex justify-center items-center gap-2"
    >
      {children}
    </button>
  );
}

export default GhostButton;
