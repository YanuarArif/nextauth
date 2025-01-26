import { Navbar } from "@/components/layout/navbar";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-blue-500">
      <div className="absolute top-0 w-full">
        <Navbar />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
