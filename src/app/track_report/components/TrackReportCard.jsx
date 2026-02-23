"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useAcceptAmbulanceOffer } from "@/hooks/ambulance_driver/useAcceptAmbulanceOffer";
import { useRejectAmbulanceOffer } from "@/hooks/ambulance_driver/useRejectAmbulanceOffer";
import { useCancelReport } from "@/hooks/report/useCancelReport";
import { useGetReportById } from "@/hooks/report/useGetReportById";
import { useRejectReport } from "@/hooks/report/useRejectReport";
import { useVerifyReport } from "@/hooks/report/useVerifyReport";
// import { useVerifyReport } from "@/hooks/report/useVerifyReport";
import {
  AlertCircle,
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  Flame,
  Hash,
  Loader2,
  MapPin,
  Phone,
  Search,
  Shield,
  Siren,
  User,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Clock,
  },
  verified: {
    label: "Verified",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: Siren,
  },
  resolved: {
    label: "Resolved",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: X,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ─── Incident Icons ───────────────────────────────────────────────────────────

const INCIDENT_ICONS = {
  accident: Car,
  fight: AlertTriangle,
  fire: Flame,
  medical: Siren,
  other: AlertCircle,
};

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-red-50 p-2 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-red-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 capitalize">{label}</p>
        <p className="text-sm font-medium text-gray-800 capitalize">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ events = [] }) {
  if (!events.length) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Timeline
      </h4>
      <div className="relative pl-5 space-y-4">
        <div className="absolute left-2.75 top-1.5 bottom-1 w-px bg-gray-200" />
        {events.map((event, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className="absolute -left-3.25 top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white ring-1 ring-red-200 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-700">
                {event.action} by {event.performed_by?.full_name ?? "system"}.
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {new Date(event.date).toLocaleString("en-NP", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Action Buttons ───────────────────────────────────────────────────────────

function ActionButtons({ report, user, onAction, isActing }) {
  if (!user || !report) return null;

  const isOwner =
    user._id === report.reporter_user?._id || user._id === report.reporter_user;
  const isPoliceAdmin =
    user.user_type === "police_officer" || user.user_type === "admin";
  const isPending = report.status === "pending";

  const showCancel = isOwner && isPending;
  const showAdminActions = isPoliceAdmin && isPending;

  const showAmbulanceActions =
    user.user_type === "ambulance_driver" &&
    report.status === "verified" &&
    !report.offered_to_ambulance_drivers?.some(
      (offer) => offer?.driver?._id === user?._id,
    );

  if (!showCancel && !showAdminActions && !showAmbulanceActions) return null;

  return (
    <div className="space-y-3">
      {showAdminActions && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onAction("verify")}
            disabled={isActing}
            className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Verify
          </button>
          <button
            type="button"
            onClick={() => onAction("reject")}
            disabled={isActing}
            className="flex-1 h-11 border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject
          </button>
        </div>
      )}
      {showCancel && (
        <button
          type="button"
          onClick={() => onAction("cancel")}
          disabled={isActing}
          className="w-full h-11 border-2 border-red-600 bg-red-600 hover:bg-red-700 hover:border-red-700 text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isActing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          Cancel Request
        </button>
      )}
      {showAmbulanceActions && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onAction("accept_ambulance")}
            disabled={isActing}
            className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Accept Request
          </button>
          <button
            type="button"
            onClick={() => onAction("reject_ambulance")}
            disabled={isActing}
            className="flex-1 h-11 border-2 border-gray-400 text-gray-600 hover:bg-gray-100 font-medium rounded-lg transition all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Reject Request
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TrackReportCard() {
  const { user } = useContext(AuthContext);
  const query = useSearchParams();

  const [reportId, setReportId] = useState("");
  // searchedId is what actually drives the useQuery key — only set on Search press
  const [searchedId, setSearchedId] = useState("");

  const {
    data: report,
    isFetching: isSearching,
    isError,
    refetch,
  } = useGetReportById(searchedId);

  const notFound = isError && !!searchedId;

  // Pre-fill from query param
  useEffect(() => {
    const idFromQuery = query.get("report_id");
    if (idFromQuery) setReportId(idFromQuery);
  }, [query]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!reportId.trim()) return toast.error("Please enter a Report ID.");
    if (reportId.trim() === searchedId) {
      // same ID — just refetch without changing the key
      refetch();
    } else {
      // new ID — update key, useQuery fires automatically via enabled:false + refetch below
      setSearchedId(reportId.trim());
    }
  };

  // When searchedId changes refetch is stale, so fire it in an effect
  useEffect(() => {
    if (searchedId) refetch();
  }, [searchedId]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const { mutate: cancelReport, isPending: isCancelling } = useCancelReport();
  const { mutate: rejectReport, isPending: isRejecting } = useRejectReport();
  const { mutate: verifyReport, isPending: isVerifying } = useVerifyReport();
  const { mutate: acceptAmbulanceOffer, isPending: isAcceptingAmbulanceOffer } =
    useAcceptAmbulanceOffer();

  const { mutate: rejectAmbulanceOffer, isPending: isRejectingAmbulanceOffer } =
    useRejectAmbulanceOffer();

  const isActing =
    isCancelling ||
    isRejecting ||
    isVerifying ||
    isAcceptingAmbulanceOffer ||
    isRejectingAmbulanceOffer;

  const invalidateReport = () => refetch();

  const handleAction = (action) => {
    if (!report) return;

    if (action === "cancel") {
      cancelReport(report._id, {
        onSuccess: () => {
          toast.success("Report cancelled successfully.");
          invalidateReport();
        },
        onError: () =>
          toast.error("Failed to cancel report. Please try again."),
      });
    }

    if (action === "reject") {
      rejectReport(report._id, {
        onSuccess: () => {
          toast.success("Report rejected successfully.");
          invalidateReport();
        },
        onError: () =>
          toast.error("Failed to reject report. Please try again."),
      });
    }

    if (action === "verify") {
      verifyReport(report._id, {
        onSuccess: () => {
          toast.success("Report verified successfully.");
          invalidateReport();
        },
        onError: () =>
          toast.error("Failed to verify report. Please try again."),
      });
    }

    if (action === "accept_ambulance") {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser.");
        return;
      }

      toast.info("Waiting for location access…");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          acceptAmbulanceOffer(
            {
              report_id: report._id,
              response_location: JSON.stringify(currentLocation),
            },
            {
              onSuccess: () => {
                toast.success("Ambulance request accepted.");
                invalidateReport();
              },
              onError: () =>
                toast.error(
                  "Failed to accept ambulance request. Please try again.",
                ),
            },
          );
        },
        (error) => {
          const messages = {
            1: "Location access denied. Please allow location access and try again.",
            2: "Location unavailable. Please check your GPS and try again.",
            3: "Location request timed out. Please try again.",
          };
          toast.error(messages[error.code] ?? "Failed to get location.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }

    if (action === "reject_ambulance") {
      rejectAmbulanceOffer(
        { report_id: report._id },
        {
          onSuccess: () => {
            toast.success("Ambulance request rejected.");
            invalidateReport();
          },
          onError: () =>
            toast.error(
              "Failed to reject ambulance request. Please try again.",
            ),
        },
      );
    }
  };

  const IncidentIcon = INCIDENT_ICONS[report?.incident_type] ?? AlertCircle;

  return (
    <div className="bg-white container py-8 space-y-5 max-w-4xl">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Track Your Report</h2>
        <p className="text-gray-500 text-sm">
          Enter your Report ID to see the current status and details.
        </p>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <Label htmlFor="reportId">Report ID</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="reportId"
              placeholder="e.g. RPT-20250223-001"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              className="pl-10"
              // also allow pressing Enter to search
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="h-9.5 px-5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm flex items-center gap-2 shrink-0"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isSearching ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-2">
          <XCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-sm font-semibold text-red-700">Report not found</p>
          <p className="text-xs text-gray-500">
            Double check the Report ID and try again.
          </p>
        </div>
      )}

      {/* Report Card */}
      {report && (
        <div className="space-y-5">
          {/* ID + Status strip */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <IncidentIcon className="w-5 h-5 text-red-500" />
              <span className="font-mono text-sm font-bold text-gray-800">
                {report.report_id}
              </span>
            </div>
            <StatusBadge status={report.status} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <InfoRow
              icon={AlertCircle}
              label="Incident Type"
              value={report.incident_type?.replace(/_/g, " ")}
            />
            <InfoRow
              icon={Siren}
              label="Estimated Casualties"
              value={report.estimated_number_of_casualties}
            />
            <div className="flex items-start gap-3">
              <div className="bg-red-50 p-2 rounded-lg shrink-0">
                <MapPin className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Location</p>
                {report.location?.latitude ? (
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}`}
                    target="_blank"
                    className="text-sm font-medium text-gray-800 underline hover:text-red-600 transition-all ease-in-out duration-300"
                  >
                    {report.location.latitude.toFixed(5)},{" "}
                    {report.location.longitude.toFixed(5)}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-gray-800">—</p>
                )}
              </div>
            </div>
            <InfoRow
              icon={Phone}
              label="Contact Number"
              value={report.phone_number}
            />
            {report.reporter_user && (
              <InfoRow
                icon={User}
                label="Reported By"
                value={
                  typeof report.reporter_user === "object"
                    ? (report.reporter_user.full_name ?? "Anonymous")
                    : "Anonymous"
                }
              />
            )}
            <InfoRow
              icon={Clock}
              label="Submitted At"
              value={new Date(report.createdAt).toLocaleString("en-NP", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            />
          </div>

          {/* Description */}
          {report.description && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.description}
              </p>
            </div>
          )}

          <Timeline events={report.timeline} />

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Log in</span> to manage this
                report or take action on it if you're concerned authority.
              </p>
            </div>
          )}

          <ActionButtons
            report={report}
            user={user}
            onAction={handleAction}
            isActing={isActing}
          />
        </div>
      )}
    </div>
  );
}
