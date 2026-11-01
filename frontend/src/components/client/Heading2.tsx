import React, { useState } from "react";

interface Heading2Props {
  children: React.ReactNode;
}

function Heading2({ children }: Heading2Props) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-center text-black md:text-6xl">
        {children}
      </h1>
    </>
  );
}

export default Heading2;
