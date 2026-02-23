"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useLogoutUser } from "@/hooks/user/useLogoutUser";
import { LogOut } from "lucide-react";
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
    <div className="p-4 border-b-2 border-b-gray-100 w-full bg-white flex items-center justify-center">
      <div className="container flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="uddhar logo" width={104} height={104} />
        </Link>
        <div className="flex items-center justify-start gap-6">
          <div
            className={`text-xs ${servicesActive ? "text-green-500" : "text-red-500"} font-bold uppercase hidden sm:flex flex-col items-end`}
          >
            <div className="flex items-center justify-center gap-1">
              <span className="animate-pulse text-xl leading-0">●</span>
              <span>
                emergency services {servicesActive ? "active" : "inactive"}
              </span>
            </div>
            <div className="text-black font-medium">
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
          {user && (
            <button
              onClick={() => {
                logoutUser();
                dispatch({ type: "LOGOUT" });
                toast.success("Logged out successfully.");
              }}
              disabled={isLoggingOut}
              className="hover:text-red-600 disabled:opacity-50 transition-all ease-in-out duration-300 cursor-pointer"
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
