"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useAcceptAmbulanceOffer } from "@/hooks/ambulance_driver/useAcceptAmbulanceOffer";
import { usePickedUpPatient } from "@/hooks/ambulance_driver/usePickedUpPatient";
import { useRejectAmbulanceOffer } from "@/hooks/ambulance_driver/useRejectAmbulanceOffer";
import { useResolveAmbulanceReport } from "@/hooks/ambulance_driver/useResolveAmbulanceReport";
import { useCancelReport } from "@/hooks/report/useCancelReport";
import { useGetReportById } from "@/hooks/report/useGetReportById";
import { useRejectReport } from "@/hooks/report/useRejectReport";
import { useVerifyReport } from "@/hooks/report/useVerifyReport";
import {
  AlertCircle,
  AlertTriangle,
  Ambulance,
  Car,
  CheckCircle2,
  Clock,
  Download,
  FileImage,
  Flame,
  Hash,
  Loader2,
  Lock,
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
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcETA(driverLoc, reportLoc, acceptedAt) {
  const AVG_SPEED_KMH = 40;
  const distKm = haversineDistanceKm(
    Number(driverLoc.latitude),
    Number(driverLoc.longitude),
    Number(reportLoc.latitude),
    Number(reportLoc.longitude),
  );
  const totalMins = (distKm / AVG_SPEED_KMH) * 60;
  const elapsedMins = (Date.now() - new Date(acceptedAt).getTime()) / 60000;
  const remainingMins = Math.max(0, totalMins - elapsedMins);
  return {
    distKm: distKm.toFixed(2),
    remainingMins: Math.round(remainingMins),
  };
}

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

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Clock,
  },
  halted: {
    label: "Halted",
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: X,
  },
  picked_up: {
    label: "Picked Up",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: Ambulance,
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

const INCIDENT_ICONS = {
  accident: Car,
  fight: AlertTriangle,
  fire: Flame,
  medical: Siren,
  other: AlertCircle,
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
      <div className="shrink-0 rounded-xl bg-red-50 p-2 sm:rounded-lg">
        <Icon className="h-4 w-4 text-red-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs capitalize text-gray-400">{label}</p>
        <p className="break-words text-sm font-medium capitalize text-gray-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function EvidenceFiles({ photos = [], user, report_id }) {
  const isAdmin =
    user?.user_type === "admin" || user?.user_type === "police_officer";

  const [downloading, setDownloading] = useState(null);

  if (!photos.length) return null;

  const handleDownload = async (filename) => {
    setDownloading(filename);
    try {
      const res = await fetch(
        `/api/report/download_evidence/${report_id}/${filename}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Unauthorized or file not found.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file. You may not have access.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Evidence Files
        </p>
        <span className="text-xs text-gray-400">
          {photos.length} file{photos.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {photos.map((filepath, i) => {
          const filename = filepath.split("/").pop();
          const isThisDownloading = downloading === filename;

          return (
            <div
              key={i}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-all sm:rounded-xl ${
                isAdmin
                  ? "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                  : "border-gray-200 bg-gray-50 opacity-75"
              }`}
            >
              <div className="min-w-0 flex items-center gap-3">
                <div
                  className={`shrink-0 rounded-xl p-2 ${
                    isAdmin ? "bg-blue-50" : "bg-gray-100"
                  }`}
                >
                  <FileImage className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {isAdmin ? filename : `Evidence ${i + 1}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isAdmin ? "Click to download" : "Restricted access"}
                  </p>
                </div>
              </div>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => handleDownload(filename)}
                  disabled={!!downloading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isThisDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Lock className="h-4 w-4 text-black" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isAdmin && (
        <div className="flex items-start gap-2 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
          <p className="text-xs text-yellow-800">
            Evidence files are restricted and only accessible to authorized
            personnel.
          </p>
        </div>
      )}
    </div>
  );
}

function Timeline({ events = [] }) {
  if (!events.length) return null;

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-red-600">
        <Clock className="h-4 w-4" /> Timeline
      </h4>

      <div className="relative space-y-4 pl-5">
        <div className="absolute bottom-1 left-[10px] top-1.5 w-px bg-gray-200" />
        {events.map((event, i) => (
          <div key={i} className="relative flex items-start gap-3">
            <div className="absolute left-[-12px] top-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white bg-red-500 ring-1 ring-red-200" />
            <div className="rounded-xl bg-gray-50 px-3 py-2 sm:bg-transparent sm:px-0 sm:py-0">
              <p className="text-xs font-medium text-gray-700">
                {event.action} by {event.performed_by?.full_name ?? "system"}.
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">
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

function AmbulanceETACard({ report }) {
  const accepted = report.offered_to_ambulance_drivers?.find(
    (o) => o.status === "accepted",
  );

  if (
    !accepted ||
    !report.location?.latitude ||
    !report.location?.longitude ||
    !accepted.response_location?.latitude ||
    !accepted.response_location?.longitude ||
    !accepted.response_date
  ) {
    return null;
  }

  const { distKm, remainingMins } = calcETA(
    accepted.response_location,
    report.location,
    accepted.response_date,
  );

  return (
    <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-xl">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-orange-700">
        <Siren className="h-4 w-4" /> Ambulance Dispatched
      </h4>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-2xl bg-orange-50/50 p-3 sm:rounded-xl sm:bg-transparent sm:p-0">
          <div className="shrink-0 rounded-xl bg-orange-100 p-2">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Driver</p>
            <p className="text-sm font-medium text-gray-800">
              {accepted.driver?.full_name ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-orange-50/50 p-3 sm:rounded-xl sm:bg-transparent sm:p-0">
          <div className="shrink-0 rounded-xl bg-orange-100 p-2">
            <Phone className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Contact</p>
            <p className="text-sm font-medium text-gray-800">
              {accepted.driver?.phone_number ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl bg-orange-50/50 p-3 sm:rounded-xl sm:bg-transparent sm:p-0">
          <div className="shrink-0 rounded-xl bg-orange-100 p-2">
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Est. Arrival</p>
            <p className="text-sm font-semibold text-orange-700">
              {remainingMins <= 0
                ? "Arrived / Very close"
                : `~${remainingMins} min${remainingMins !== 1 ? "s" : ""} away`}
            </p>
            <p className="text-[11px] text-gray-400">
              {distKm} km straight-line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizePhone(phone) {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "");
}

function getOfferDriverMeta(offer) {
  const driverObj =
    typeof offer?.driver === "object" && offer?.driver !== null
      ? offer.driver
      : null;

  return {
    ambulanceDriverId: driverObj?._id?.toString?.() ?? null,
    ambulanceDriverPhone: normalizePhone(driverObj?.phone_number),
    ambulanceDriverUserId: driverObj?.user_id?.toString?.() ?? null,
  };
}

function ActionButtons({ report, user, onAction, isActing }) {
  if (!user || !report) return null;

  const reporterUserId =
    typeof report.reporter_user === "object"
      ? report.reporter_user?._id
      : report.reporter_user;

  const isOwner =
    user?._id?.toString() === reporterUserId?.toString() ||
    normalizePhone(user?.phone_number) === normalizePhone(report?.phone_number);

  const isPoliceAdmin =
    user?.user_type === "police_officer" || user?.user_type === "admin";

  const isAmbulanceDriver = user?.user_type === "ambulance_driver";
  const isPending = report.status === "pending";

  const normalizedUserPhone = normalizePhone(user?.phone_number);
  const currentUserId = user?._id?.toString?.() ?? null;

  const currentAmbulanceOffer = isAmbulanceDriver
    ? (report?.offered_to_ambulance_drivers?.find((offer) => {
        const meta = getOfferDriverMeta(offer);

        const matchedByPhone =
          !!normalizedUserPhone &&
          !!meta.ambulanceDriverPhone &&
          normalizedUserPhone === meta.ambulanceDriverPhone;

        const matchedByUserId =
          !!currentUserId &&
          !!meta.ambulanceDriverUserId &&
          currentUserId === meta.ambulanceDriverUserId;

        return matchedByPhone || matchedByUserId;
      }) ?? null)
    : null;

  const isAssignedAcceptedDriver =
    isAmbulanceDriver && currentAmbulanceOffer?.status === "accepted";

  const showCancel = isOwner && isPending;
  const showAdminActions = isPoliceAdmin && isPending;

  const showAmbulanceOfferActions =
    isAmbulanceDriver &&
    report?.status === "verified" &&
    currentAmbulanceOffer?.status === "pending";

  const showPickedUpAction =
    isAssignedAcceptedDriver && report?.status === "in_progress";

  const showResolvedAction =
    isAssignedAcceptedDriver && report?.status === "picked_up";

  if (
    !showCancel &&
    !showAdminActions &&
    !showAmbulanceOfferActions &&
    !showPickedUpAction &&
    !showResolvedAction
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
      <div className="space-y-3">
        {showAdminActions && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onAction("verify")}
              disabled={isActing}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
            >
              {isActing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Verify
            </button>

            <button
              type="button"
              onClick={() => onAction("reject")}
              disabled={isActing}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-500 text-sm font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
            >
              {isActing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
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
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-red-600 bg-red-600 text-sm font-medium text-white transition-all hover:border-red-700 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
          >
            {isActing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Cancel Request
          </button>
        )}

        {showAmbulanceOfferActions && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onAction("accept_ambulance")}
              disabled={isActing}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
            >
              {isActing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Accept Request
            </button>

            <button
              type="button"
              onClick={() => onAction("reject_ambulance")}
              disabled={isActing}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-gray-400 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
            >
              {isActing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject Request
            </button>
          </div>
        )}

        {showPickedUpAction && (
          <button
            type="button"
            onClick={() => onAction("picked_up")}
            disabled={isActing}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-sm font-medium text-white transition-all hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
          >
            {isActing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ambulance className="h-4 w-4" />
            )}
            Mark as Picked Up
          </button>
        )}

        {showResolvedAction && (
          <button
            type="button"
            onClick={() => onAction("resolve")}
            disabled={isActing}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
          >
            {isActing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Mark as Resolved
          </button>
        )}
      </div>
    </div>
  );
}

export default function TrackReportCard() {
  const { user } = useContext(AuthContext);
  const query = useSearchParams();

  const [reportId, setReportId] = useState("");
  const [searchedId, setSearchedId] = useState("");

  const {
    data: report,
    isFetching: isSearching,
    isError,
    refetch,
  } = useGetReportById(searchedId);

  const notFound = isError && !!searchedId;

  useEffect(() => {
    const idFromQuery = query.get("report_id");
    const autoSearch = query.get("auto") === "true";
    if (idFromQuery) setReportId(idFromQuery);
    if (autoSearch && idFromQuery) {
      setSearchedId(idFromQuery);
    }
  }, [query]);

  useEffect(() => {
    if (searchedId) refetch();
  }, [searchedId, refetch]);

  const handleSearch = () => {
    if (!reportId.trim()) return toast.error("Please enter a Report ID.");
    if (reportId.trim() === searchedId) {
      refetch();
    } else {
      setSearchedId(reportId.trim());
    }
  };

  const { mutate: cancelReport, isPending: isCancelling } = useCancelReport();
  const { mutate: rejectReport, isPending: isRejecting } = useRejectReport();
  const { mutate: verifyReport, isPending: isVerifying } = useVerifyReport();
  const { mutate: acceptAmbulanceOffer, isPending: isAcceptingAmbulanceOffer } =
    useAcceptAmbulanceOffer();
  const { mutate: rejectAmbulanceOffer, isPending: isRejectingAmbulanceOffer } =
    useRejectAmbulanceOffer();
  const { mutate: pickedUpPatient, isPending: isPickingUpPatient } =
    usePickedUpPatient();
  const { mutate: resolveAmbulanceReport, isPending: isResolvingReport } =
    useResolveAmbulanceReport();

  const isActing =
    isCancelling ||
    isRejecting ||
    isVerifying ||
    isAcceptingAmbulanceOffer ||
    isRejectingAmbulanceOffer ||
    isPickingUpPatient ||
    isResolvingReport;

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
      acceptAmbulanceOffer(
        {
          report_id: report._id,
          response_location: JSON.stringify({
            latitude: 27.67689,
            longitude: 85.33315,
          }),
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

    if (action === "picked_up") {
      pickedUpPatient(
        { report_id: report._id },
        {
          onSuccess: () => {
            toast.success("Patient marked as picked up.");
            invalidateReport();
          },
          onError: () => toast.error("Failed to mark patient as picked up."),
        },
      );
    }

    if (action === "resolve") {
      resolveAmbulanceReport(
        { report_id: report._id },
        {
          onSuccess: () => {
            toast.success("Report marked as resolved.");
            invalidateReport();
          },
          onError: () => toast.error("Failed to mark report as resolved."),
        },
      );
    }
  };

  const IncidentIcon = useMemo(
    () => INCIDENT_ICONS[report?.incident_type] ?? AlertCircle,
    [report?.incident_type],
  );

  return (
    <div className="container max-w-4xl bg-white px-4 py-4 pb-32 sm:px-0 sm:py-8 sm:pb-8">
      <div className="space-y-5">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-gray-900">
              Track Your Report
            </h2>
            <p className="text-sm text-gray-500">
              Enter your Report ID to see the current status and details.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="space-y-2">
            <Label htmlFor="reportId">Report ID</Label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="reportId"
                  placeholder="e.g. RE-1234567890-123"
                  value={reportId}
                  onChange={(e) => setReportId(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={isSearching}
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:h-[38px] sm:rounded-lg"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isSearching ? "Searching…" : "Search"}
              </button>
            </div>
          </div>
        </div>

        {notFound && (
          <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-center sm:rounded-xl">
            <XCircle className="mx-auto h-10 w-10 text-red-400" />
            <p className="text-sm font-semibold text-red-700">
              Report not found
            </p>
            <p className="text-xs text-gray-500">
              Double check the Report ID and try again.
            </p>
          </div>
        )}

        {report && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm sm:rounded-xl sm:shadow-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex items-center gap-2">
                  <IncidentIcon className="h-5 w-5 shrink-0 text-red-500" />
                  <span className="truncate font-mono text-sm font-bold text-gray-800">
                    {report.report_id}
                  </span>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={report.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 sm:gap-4 sm:rounded-xl">
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

              <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
                <div className="shrink-0 rounded-xl bg-red-50 p-2 sm:rounded-lg">
                  <MapPin className="h-4 w-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Location</p>
                  {report.location?.latitude ? (
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}`}
                      target="_blank"
                      className="text-sm font-medium text-gray-800 underline transition-all duration-300 ease-in-out hover:text-red-600"
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

            {report.description && (
              <div className="space-y-1 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm sm:rounded-xl sm:shadow-none">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                  {report.description}
                </p>
              </div>
            )}

            {report.photos?.length > 0 && (
              <EvidenceFiles
                photos={report.photos}
                user={user}
                report_id={report._id}
              />
            )}

            <AmbulanceETACard report={report} />

            <Timeline events={report.timeline} />

            {!user && (
              <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Log in</span> to manage this
                  report or take action on it if you&apos;re concerned
                  authority.
                </p>
              </div>
            )}

            <div className="sticky bottom-22 z-20 bg-transparent sm:static">
              <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
                <ActionButtons
                  report={report}
                  user={user}
                  onAction={handleAction}
                  isActing={isActing}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
