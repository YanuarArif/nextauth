import DashboardScreen from "@/components/layout/dashboard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <main className="flex flex-col h-full items-center justify-center bg-blue-500">
      <DashboardScreen />
    </main>
  );
};

export default DashboardPage;
