"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useGetAllDriverApplications } from "@/hooks/admin/useGetAllDriverApplications";
import { useGetPendingDriverApplications } from "@/hooks/admin/useGetPendingDriverApplications";
import {
  AlertCircle,
  Ambulance,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Phone,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    icon: Clock,
  },
  verified: {
    label: "Verified",
    className: "bg-green-100 text-green-700 border border-green-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border border-red-200",
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function ApplicationCard({ application }) {
  return (
    <Link href={`/manage_driver_applications/details?driver_id=${application._id}`}>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-red-200 hover:bg-red-50/30 sm:rounded-xl sm:shadow-none">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <div className="shrink-0 rounded-xl bg-red-100 p-2.5 sm:rounded-lg sm:p-2">
                <Ambulance className="h-4 w-4 text-red-600" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {application.full_name || "Unnamed Applicant"}
                </p>
                <p className="truncate font-mono text-xs text-gray-400">
                  {application._id}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <StatusBadge status={application.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-2 sm:gap-3">
            <span className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">{application.phone_number || "N/A"}</span>
            </span>

            <span className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
              <FileText className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">
                {application.ambulance_type || "N/A"}
              </span>
            </span>

            <span className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
              <ShieldAlert className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">
                {application.license_number || "N/A"}
              </span>
            </span>

            <span className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 sm:rounded-none sm:bg-transparent sm:px-0 sm:py-0">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span className="truncate">
                {application.hospital_name || "N/A"}
              </span>
            </span>
          </div>

          <p className="border-t border-gray-100 pt-2 text-[11px] text-gray-400">
            Submitted on {new Date(application.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:rounded-xl sm:shadow-none">
      <FileText className="mx-auto h-10 w-10 text-gray-400" />
      <p className="text-sm font-semibold text-gray-700">
        No applications found
      </p>
      <p className="text-xs text-gray-500">
        There are no driver applications in this section right now.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-center sm:rounded-xl">
      <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
      <p className="text-sm font-semibold text-red-700">
        Failed to load applications
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm sm:rounded-xl sm:shadow-none">
      <Loader2 className="h-5 w-5 animate-spin" />
      Loading applications...
    </div>
  );
}

export default function ManageDriverApplicationsPage() {
  const [tab, setTab] = useState("pending");
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const {
    data: pendingApplications = [],
    isLoading: isPendingLoading,
    isError: pendingError,
  } = useGetPendingDriverApplications();

  const {
    data: allApplications = [],
    isLoading: isAllLoading,
    isError: allError,
  } = useGetAllDriverApplications();

  const applications = useMemo(() => {
    return tab === "pending" ? pendingApplications : allApplications;
  }, [tab, pendingApplications, allApplications]);

  const isLoading = tab === "pending" ? isPendingLoading : isAllLoading;
  const isError = tab === "pending" ? pendingError : allError;

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
    if (user && user.user_type !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="container space-y-5 px-4 py-4 pb-28 sm:space-y-8 sm:px-0 sm:py-8 sm:pb-8">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Manage Driver Applications
          </h1>
          <p className="text-sm text-gray-500">
            Review ambulance driver applications, inspect submitted documents,
            and approve or reject requests.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors sm:h-auto sm:rounded-full sm:py-2 ${
              tab === "pending"
                ? "border-red-600 bg-red-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50"
            }`}
          >
            Pending ({pendingApplications.length})
          </button>

          <button
            type="button"
            onClick={() => setTab("all")}
            className={`flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors sm:h-auto sm:rounded-full sm:py-2 ${
              tab === "all"
                ? "border-red-600 bg-red-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50"
            }`}
          >
            All ({allApplications.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : applications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}