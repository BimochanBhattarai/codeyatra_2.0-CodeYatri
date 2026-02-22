"use client";

import { FileText, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/report",
    icon: FileText,
    label: "Report",
    sublabel: "Report an Emergency",
  },
  {
    href: "/login",
    icon: LogIn,
    label: "Login",
    sublabel: "User Login",
  },
  {
    href: "/register",
    icon: UserPlus,
    label: "Register",
    sublabel: "New User Registration",
  },
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    sublabel: "View Your Dashboard",
  },
];

const Footer = () => {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <div className="bg-red-600 w-full py-8">
        <div className="container flex flex-col items-center gap-6">
          {/* Title */}
          <div className="text-center">
            <p className="text-white font-black text-base uppercase tracking-[0.2em]">
              ⚡ Quick Navigation
            </p>
            <p className="text-red-200 text-xs mt-1 font-medium">
              Jump to any section of the platform
            </p>
          </div>

          <div className="w-16 h-0.5 bg-red-400 rounded-full" />

          {/* 
            Mobile:  2×2 grid
            sm:      4 columns in a row
          */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl px-4 py-5 text-center transition-all w-full
                    ${
                      isActive
                        ? "bg-white shadow-lg border-b-4 border-red-300"
                        : "bg-red-700 hover:bg-red-800 border-b-4 border-red-800 hover:border-red-900"
                    }
                  `}
                >
                  <Icon
                    size={22}
                    className={isActive ? "text-red-600" : "text-red-200"}
                  />
                  <span
                    className={`text-[11px] font-black uppercase tracking-widest leading-tight ${
                      isActive ? "text-red-600" : "text-red-100"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-[10px] font-medium leading-tight ${
                      isActive ? "text-red-400" : "text-red-300"
                    }`}
                  >
                    {item.sublabel}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* White Bottom Strip */}
      <div className="w-full bg-white py-5 px-4 border-t border-gray-100">
        <div className="container flex items-center justify-center flex-col gap-1">
          <p className="text-sm font-medium tracking-wide text-center text-black">
            <span className="text-red-500 font-black">Uddhar</span> Emergency
            Response Network
          </p>
          <p className="text-xs text-black font-normal">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
