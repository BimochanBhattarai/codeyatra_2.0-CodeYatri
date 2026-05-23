"use client";

import AuthenticatedWrapper from "@/components/global/AuthenticatedWrapper";
import { AuthContext } from "@/contexts/AuthProvider";
import { useGetGlobals } from "@/hooks/global/useGetGlobals";
import { useUpdateGlobals } from "@/hooks/global/useUpdateGlobals";
import {
  AlertCircle,
  Bell,
  Loader2,
  Phone,
  Plus,
  Save,
  Shield,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

function Input({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  maxLength,
  onKeyDown,
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      onKeyDown={onKeyDown}
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 sm:rounded-lg sm:py-2 ${className}`}
    />
  );
}

function Label({ htmlFor, children, className = "" }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
    </label>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:space-y-4 sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-semibold text-red-600">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
}

const GlobalSettingsPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [numbers, setNumbers] = useState([]);
  const [newNumber, setNewNumber] = useState("");
  const [newNumberError, setNewNumberError] = useState("");

  const { data: settings, isLoading } = useGetGlobals();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateGlobals();

  useEffect(() => {
    if (
      user &&
      user.user_type !== "admin" &&
      user.user_type !== "police_officer"
    ) {
      router.push("/report");
    }
  }, [user, router]);

  useEffect(() => {
    if (settings?.police_mobile_alerts) {
      setNumbers(settings.police_mobile_alerts);
    }
  }, [settings]);

  const validateNumber = (num) => {
    if (!num.trim()) return "Phone number is required.";
    if (!/^\d{10}$/.test(num.trim())) return "Enter a valid 10-digit number.";
    if (numbers.includes(num.trim()))
      return "This number is already in the list.";
    return "";
  };

  const handleAdd = () => {
    const error = validateNumber(newNumber);
    if (error) return setNewNumberError(error);
    setNumbers((prev) => [...prev, newNumber.trim()]);
    setNewNumber("");
    setNewNumberError("");
  };

  const handleRemove = (index) => {
    setNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateSettings(
      { police_mobile_alerts: numbers },
      {
        onSuccess: () => toast.success("Settings saved successfully."),
        onError: () =>
          toast.error("Failed to save settings. Please try again."),
      },
    );
  };

  return (
    <AuthenticatedWrapper>
      <div className="container max-w-4xl bg-white px-4 py-4 pb-28 sm:px-0 sm:py-8 sm:pb-8">
        <div className="space-y-5 sm:space-y-6">
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-gray-900">
                Global Settings
              </h2>
              <p className="text-sm text-gray-500">
                Manage system-wide configuration for emergency alerts and
                notifications.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 sm:rounded-lg sm:p-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-xs leading-5 text-red-700">
              Changes made here affect the entire system. Only authorized
              personnel should modify these settings.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="space-y-6">
              <SectionCard icon={Bell} title="Police SMS Alert Numbers">
                <p className="text-xs text-gray-500">
                  These numbers will receive an SMS alert whenever a new
                  emergency report is submitted.
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="newNumber">Add Phone Number</Label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        +977
                      </span>
                      <Input
                        id="newNumber"
                        type="tel"
                        placeholder="98XXXXXXXX"
                        value={newNumber}
                        maxLength={10}
                        onChange={(e) => {
                          setNewNumber(e.target.value);
                          setNewNumberError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        className={`pl-14 ${
                          newNumberError ? "border-red-500" : ""
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAdd}
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition-all hover:bg-red-700 sm:h-[38px] sm:rounded-lg"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {newNumberError && (
                    <p className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" /> {newNumberError}
                    </p>
                  )}
                </div>

                {numbers.length === 0 ? (
                  <div className="space-y-2 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center sm:rounded-xl">
                    <Phone className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-400">
                      No numbers added yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Add at least one number to receive SMS alerts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {numbers.map((number, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 sm:rounded-lg"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="shrink-0 rounded-lg bg-red-50 p-2 sm:p-1.5">
                            <Phone className="h-4 w-4 text-red-500 sm:h-3.5 sm:w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              +977 {number}
                            </p>
                            <p className="text-xs text-gray-400">
                              SMS alerts enabled
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 sm:h-8 sm:w-8 sm:rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <p className="text-right text-xs text-gray-400">
                      {numbers.length} number{numbers.length !== 1 ? "s" : ""}{" "}
                      configured
                    </p>
                  </div>
                )}
              </SectionCard>

              <div className="sticky bottom-22 z-20 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:rounded-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedWrapper>
  );
};

export default GlobalSettingsPage;