import { Navbar } from "@/components/layout/navbar";
import ThemeSwitcher from "@/components/ui/theme-switcher";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative h-full w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="absolute top-0 z-10 w-full">
        <Navbar />
      </div>
      <div className="absolute bottom-10 left-10 z-10">
        <ThemeSwitcher />
      </div>
      {/* Background Radial */}
      <div
        className="absolute h-full w-full 
    bg-[radial-gradient(#e5e7eb_1px,transparent_1.5px)]
    [background-size:15px_15px]
    [mask-image:radial-gradient(ellipse_65%_65%_at_50%_50%,#000_70%,transparent_100%)]
    
    dark:top-0 
    dark:h-screen 
    dark:w-screen 
    dark:bg-[#000000] 
    dark:bg-[radial-gradient(#ffffff33_1px,#00091d_1.5px)]
    dark:bg-[size:15px_15px]
    dark:[mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_50%,transparent_100%)]"
      >
        <div className="h-full flex flex-col items-center justify-center ">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
