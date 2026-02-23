"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useGetActiveReports } from "@/hooks/report/useGetActiveReports";
import { useGetAllReports } from "@/hooks/report/useGetAllReports";
import { useGetUserReports } from "@/hooks/report/useGetUserReports";
import { useGetUserTypeChangeApplications } from "@/hooks/user/useGetUserTypeChangeApplications";
import {
  AlertCircle,
  AlertTriangle,
  Ambulance,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  MapPin,
  Siren,
} from "lucide-react";
import Link from "next/link";
import { useContext } from "react";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-700 border border-gray-200",
    icon: AlertCircle,
  },
  verified: {
    label: "Verified",
    className: "bg-green-100 text-green-700 border border-green-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border border-red-200",
    icon: AlertCircle,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: Siren,
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-700 border border-green-200",
    icon: FileText,
  },
};

const INCIDENT_TYPES = [
  {
    value: "accident",
    label: "Accident",
    icon: Car,
    description: "Vehicle collision or crash",
  },
  {
    value: "fight",
    label: "Fight/Assault",
    icon: AlertTriangle,
    description: "Physical altercation",
  },
  {
    value: "fire",
    label: "Fire/Disaster",
    icon: Flame,
    description: "Fire or natural disaster",
  },
  {
    value: "medical",
    label: "Medical Emergency",
    icon: Siren,
    description: "Health emergency",
  },
  {
    value: "other",
    label: "Other",
    icon: AlertTriangle,
    description: "Other emergency type",
  },
];

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
    <Link href={`/track_report?report_id=${report.report_id}`}>
      <div className="border border-gray-200 rounded-xl p-4 space-y-3 hover:border-red-200 hover:bg-red-50/30 transition-all">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-2 rounded-lg shrink-0">
              {(() => {
                const incident = INCIDENT_TYPES.find(
                  (type) => type.value === report.incident_type,
                );
                const Icon = incident ? incident.icon : AlertCircle;
                return <Icon className="w-4 h-4 text-red-600" />;
              })()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {INCIDENT_TYPES.find(
                  (type) => type.value === report.incident_type,
                )?.label ?? "Emergency"}{" "}
                Report
              </p>
              <p className="text-xs text-gray-400 font-mono">{report.id}</p>
            </div>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <button
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}`,
                  "_blank",
                );
              }}
              className="underline hover:text-red-600 transition-colors cursor-pointer"
            >
              {report.location.latitude.toFixed(4)},{" "}
              {report.location.longitude.toFixed(4)}
            </button>
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
    </Link>
  );
}

const Hero = () => {
  const { user } = useContext(AuthContext);

  const { data: userReports } = useGetUserReports();

  const { data: userTypeChangeApplications } =
    useGetUserTypeChangeApplications();

  const isPoliceOrAdmin = !!(
    user &&
    (user.user_type === "police" || user.user_type === "admin")
  );

  const { data: allReports } = useGetAllReports({ enabled: isPoliceOrAdmin });

  const { data: activeReports } = useGetActiveReports({
    enabled: isPoliceOrAdmin,
  });

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
          <span className="font-bold text-red-600">
            {user.user_type.split("_").join(" ")}
          </span>
          . Here&apos;s your activity overview.
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

      {user &&
        (user.user_type === "police_officer" || user.user_type === "admin") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Active Reports
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {activeReports?.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No active reports at the moment.
                </p>
              ) : (
                activeReports?.map((report) => (
                  <ReportCard key={report._id} report={report} />
                ))
              )}
            </div>
          </div>
        )}

      {user &&
        (user.user_type === "police_officer" || user.user_type === "admin") && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                All Reports
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {allReports?.length === 0 ? (
                <p className="text-sm text-gray-500">No reports found.</p>
              ) : (
                allReports?.map((report) => (
                  <ReportCard key={report._id} report={report} />
                ))
              )}
            </div>
          </div>
        )}

      {user && user.type_conversion_lock && userTypeChangeApplications && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              My Applications
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {userTypeChangeApplications.length === 0 ? (
              <p className="text-sm text-gray-500">No applications found.</p>
            ) : (
              userTypeChangeApplications.map((application) => (
                <div
                  key={application._id}
                  className="border border-gray-200 rounded-xl p-4 space-y-3 hover:border-red-200 hover:bg-red-50/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg shrink-0">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                          Application to become{" "}
                          {application.applied_role === "hospital"
                            ? "Hospital"
                            : "Ambulance Driver"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(application.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>

                  <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-2">
                    Submitted on{" "}
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
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
        <div className="flex flex-col gap-3">
          {userReports?.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
          {userReports?.length === 0 && (
            <p className="text-sm text-gray-500">
              You have not submitted any reports yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
