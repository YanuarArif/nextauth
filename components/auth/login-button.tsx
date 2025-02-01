"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export const LoginButton = () => {
  const router = useRouter();
  const onClick = () => {
    router.push("/login");
  };

  return <Button onClick={onClick}>Login</Button>;
};
