"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import {
  ClipboardClock,
  FileText,
  LayoutDashboard,
  LogIn,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";

const navItems = [
  {
    href: "/report",
    icon: FileText,
    label: "Report",
    sublabel: "Report an Emergency",
  },
  {
    href: "/track_report",
    icon: ClipboardClock,
    label: "Track Report",
    sublabel: "Track Your Report Status",
  },
  {
    href: "/login",
    icon: LogIn,
    label: "Login",
    sublabel: "User Login",
    hidden_when_authenticated: true,
  },
  {
    href: "/register",
    icon: UserPlus,
    label: "Register",
    sublabel: "New User Registration",
    hidden_when_authenticated: true,
  },
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    sublabel: "View Your Dashboard",
    hidden_when_unauthenticated: true,
  },
];

const Footer = () => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const visibleItems = navItems.filter((item) => {
    return !(
      (isAuthenticated && item.hidden_when_authenticated) ||
      (!isAuthenticated && item.hidden_when_unauthenticated)
    );
  });

  const mobileItems = visibleItems.slice(0, 4);

  const gridCols =
    visibleItems.length <= 2
      ? "grid-cols-2"
      : visibleItems.length === 3
        ? "grid-cols-3"
        : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="w-full">
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur sm:hidden">
        <div
          className={`grid ${
            mobileItems.length <= 2
              ? "grid-cols-2"
              : mobileItems.length === 3
                ? "grid-cols-3"
                : "grid-cols-4"
          } px-2 py-2`}
        >
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center transition-all ${
                  isActive
                    ? "bg-red-50 text-red-600"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-red-600" : "text-gray-400"}
                />
                <span className="text-[10px] font-semibold leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="w-full bg-red-600 py-8">
          <div className="container flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-base font-black uppercase tracking-[0.2em] text-white">
                ⚡ Quick Navigation
              </p>
              <p className="mt-1 text-xs font-medium text-red-200">
                Jump to any section of the platform
              </p>
            </div>

            <div className="h-0.5 w-16 rounded-full bg-red-400" />

            <div className={`grid ${gridCols} w-full max-w-2xl gap-3`}>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl px-4 py-5 text-center transition-all ${
                      isActive
                        ? "border-b-4 border-red-300 bg-white shadow-lg"
                        : "border-b-4 border-red-800 bg-red-700 hover:bg-red-800 hover:border-red-900"
                    }`}
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

        <div className="w-full border-t border-gray-100 bg-white px-4 py-5">
          <div className="container flex flex-col items-center justify-center gap-1">
            <p className="text-center text-sm font-medium tracking-wide text-black">
              <span className="font-black text-red-500">Uddhar</span> Emergency
              Response Network
            </p>
            <p className="text-xs font-normal text-black">
              © {new Date().getFullYear()} All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;