"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useLogoutUser } from "@/hooks/user/useLogoutUser";
import { LogOut, Settings, FileUser } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const Header = () => {
  const { user, dispatch } = useContext(AuthContext);
  const { mutate: logoutUser, isPending: isLoggingOut } = useLogoutUser();

  const [servicesActive, setServicesActive] = useState(true);

  useEffect(() => {
    const checkServicesStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/status`, {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setServicesActive(data.servicesActive);
        } else {
          setServicesActive(false);
        }
      } catch (error) {
        setServicesActive(false);
      }
    };

    checkServicesStatus();

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        if (response.ok) {
          setServicesActive(data.servicesActive);
        } else {
          setServicesActive(false);
        }
      } catch (error) {
        setServicesActive(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur sm:border-b-2 sm:bg-white sm:backdrop-blur-0">
      <div className="container flex items-center justify-between px-4 py-3 sm:px-0 sm:py-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="uddhar logo"
            width={104}
            height={104}
            className="max-h-10 w-auto sm:h-auto"
          />
        </Link>

        <div className="flex items-center justify-start gap-2 sm:gap-6">
          <div
            className={`hidden text-xs font-bold uppercase sm:flex sm:flex-col sm:items-end ${
              servicesActive ? "text-green-500" : "text-red-500"
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <span className="animate-pulse text-xl leading-0">●</span>
              <span>
                emergency services {servicesActive ? "active" : "inactive"}
              </span>
            </div>
            <div className="font-medium text-black">
              {new Date().toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
              {" | "}
              {new Date().toLocaleString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <div
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:hidden ${
              servicesActive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {servicesActive ? "Services Active" : "Services Down"}
          </div>

          {user && user.user_type === "admin" && (
            <Link
              href="/manage_driver_applications"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-red-50 hover:text-red-600 sm:h-auto sm:w-auto sm:rounded-none sm:hover:bg-transparent"
            >
              <FileUser size={20} />
            </Link>
          )}

          {user &&
            (user.user_type === "admin" ||
              user.user_type === "police_officer") && (
              <Link
                href="/settings"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-red-50 hover:text-red-600 sm:h-auto sm:w-auto sm:rounded-none sm:hover:bg-transparent"
              >
                <Settings size={20} />
              </Link>
            )}

          {user && (
            <button
              onClick={() => {
                logoutUser();
                dispatch({ type: "LOGOUT" });
                toast.success("Logged out successfully.");
              }}
              disabled={isLoggingOut}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ease-in-out hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:h-auto sm:w-auto sm:rounded-none sm:hover:bg-transparent"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;