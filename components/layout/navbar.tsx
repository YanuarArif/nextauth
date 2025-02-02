"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState } from "react";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="w-full text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="h-6 w-6 bg-blue-500 rounded-full" />
            <span className="text-xl font-bold text-gray-900">YourBrand</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-4">
            <Button asChild variant="default">
              <Link href="/login">Login</Link>
            </Button>

            <Button asChild variant="default">
              <Link href="/register">Registrasi</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
