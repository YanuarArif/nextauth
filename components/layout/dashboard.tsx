"use client";

import { logout } from "@/actions/logout";
import { Button } from "../ui/button";
import { useTransition } from "react";

const DashboardScreen = () => {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(() => {
      logout();
    });
  };

  return (
    <div>
      <div>Dashboard</div>
      <Button disabled={isPending} onClick={handleLogout}>
        {isPending ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
};

export default DashboardScreen;
