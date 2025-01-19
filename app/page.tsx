import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import LoginButton from "@/components/auth/login-button";

const font = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function Home() {
  return (
    <main className="flex h-full justify-center items-center bg-blue-500">
      <div className="space-y-6 text-center">
        {/* H1 WITH CUSTOM FONT */}
        <h1
          className={cn(
            "text-6xl font-semibold text-white drop-shadow-md",
            font.className
          )}
        >
          Latihan Authentication
        </h1>
        <p className="text-white drop-shadow-md">
          Setting Authentication sendiri langsung dari database, tidak
          menggunakan tools seperti supabase, clerk, firebase, dll
        </p>
        <div>
          <LoginButton>
            <Button variant="secondary" size="lg" className="">
              Login
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
