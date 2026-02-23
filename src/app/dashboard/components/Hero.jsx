"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useGetUserReports } from "@/hooks/report/useGetUserReports";
import {
  AlertCircle,
  Ambulance,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useContext } from "react";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    icon: Clock,
  },
  dispatched: {
    label: "Dispatched",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: AlertCircle,
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-700 border border-green-200",
    icon: CheckCircle2,
  },
};

const INCIDENT_LABELS = {
  accident: "Accident",
  medical: "Medical Emergency",
  fire: "Fire / Disaster",
  fight: "Fight / Assault",
  other: "Other",
};

function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function ReportCard({ report }) {
  const date = new Date(report.createdAt).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 hover:border-red-200 hover:bg-red-50/30 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-lg shrink-0">
            <FileText className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {INCIDENT_LABELS[report.incident_type] ?? "Emergency"} Report
            </p>
            <p className="text-xs text-gray-400 font-mono">{report.id}</p>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}`}
            target="_blank"
            className="underline hover:text-red-600 transition-colors"
          >
            {report.location.latitude.toFixed(4)},{" "}
            {report.location.longitude.toFixed(4)}
          </Link>
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-gray-400" />
          {report.estimated_number_of_casualties}{" "}
          {report.estimated_number_of_casualties === 1
            ? "casualty"
            : "casualties"}
        </span>
      </div>

      <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-2">
        Reported on {date}
      </p>
    </div>
  );
}

const Hero = () => {
  const { user } = useContext(AuthContext);

  const {
    data: userReports,
    isLoading: userReportsLoading,
    isError: userReportsError,
  } = useGetUserReports();

  if (!user) return null;

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back,{" "}
          <span className="text-red-600">{user.full_name ?? "Responder"}</span>
        </h2>
        <p className="text-gray-500 text-sm">
          You are signed in as a{" "}
          <span className="font-bold text-red-600">{user.user_type}</span>.
          Here&apos;s your activity overview.
        </p>
      </div>

      {user.user_type === "user" && !user.type_conversion_lock && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Expand Your Role
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/dashboard/register/hospital"
              className="flex items-center gap-4 border-2 border-gray-200 hover:border-red-500 hover:bg-red-50/40 rounded-xl p-4 transition-all ease-in-out duration-300 group"
            >
              <div className="bg-red-100 group-hover:bg-red-200 p-3 rounded-lg shrink-0 transition-colors ease-in-out duration-300">
                <Building2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-red-700 transition-colors ease-in-out duration-300">
                  Register as Hospital
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage incoming ambulances & emergency alerts.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/register/driver"
              className="flex items-center gap-4 border-2 border-gray-200 hover:border-red-500 hover:bg-red-50/40 rounded-xl p-4 transition-all group"
            >
              <div className="bg-red-100 group-hover:bg-red-200 p-3 rounded-lg shrink-0 transition-colors">
                <Ambulance className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-red-700 transition-colors">
                  Register as Ambulance Driver
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Join the ambulance dispatch network.
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            My Reports
          </h3>
          <Link
            href="/report"
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
          >
            <FileText className="w-3 h-3" />
            New Report
          </Link>
        </div>
        <div className="space-y-3">
          {userReports?.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
