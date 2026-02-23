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

// ─── Shared Components ────────────────────────────────────────────────────────

function Input({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  maxLength,
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${className}`}
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-semibold text-red-600">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const GlobalSettingsPage = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [numbers, setNumbers] = useState([]);
  const [newNumber, setNewNumber] = useState("");
  const [newNumberError, setNewNumberError] = useState("");

  const { data: settings, isLoading } = useGetGlobals();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateGlobals();

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (
      user &&
      user.user_type !== "admin" &&
      user.user_type !== "police_officer"
    ) {
      router.push("/report");
    }
  }, [user]);

  // ── Populate from server ────────────────────────────────────────────────────
  useEffect(() => {
    if (settings?.police_mobile_alerts) {
      setNumbers(settings.police_mobile_alerts);
    }
  }, [settings]);

  // ── Handlers ────────────────────────────────────────────────────────────────
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
      <div className="bg-white container py-8 space-y-5 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-gray-900">Global Settings</h2>
          <p className="text-gray-500 text-sm">
            Manage system-wide configuration for emergency alerts and
            notifications.
          </p>
        </div>

        {/* Admin-only notice */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
          <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">
            Changes made here affect the entire system. Only authorized
            personnel should modify these settings.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* SMS Alert Numbers */}
            <SectionCard icon={Bell} title="Police SMS Alert Numbers">
              <p className="text-xs text-gray-500">
                These numbers will receive an SMS alert whenever a new emergency
                report is submitted.
              </p>

              {/* Add new number */}
              <div className="space-y-1.5">
                <Label htmlFor="newNumber">Add Phone Number</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
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
                      className={`pl-14 ${newNumberError ? "border-red-500" : ""}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="h-[38px] px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-sm flex items-center gap-2 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {newNumberError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {newNumberError}
                  </p>
                )}
              </div>

              {/* Numbers list */}
              {numbers.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center space-y-2">
                  <Phone className="w-8 h-8 text-gray-300 mx-auto" />
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
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-1.5 rounded-lg">
                          <Phone className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
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
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 text-right">
                    {numbers.length} number{numbers.length !== 1 ? "s" : ""}{" "}
                    configured
                  </p>
                </div>
              )}
            </SectionCard>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AuthenticatedWrapper>
  );
};

export default GlobalSettingsPage;
