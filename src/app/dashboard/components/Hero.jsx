"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useGetActiveReports } from "@/hooks/report/useGetActiveReports";
import { useGetAllReports } from "@/hooks/report/useGetAllReports";
import { useGetAmbulanceOfferedReports } from "@/hooks/report/useGetAmbulanceOfferedReports";
import { useGetAmbulanceAcceptedReports } from "@/hooks/report/useGetAmbulanceAcceptedReports";
import { useGetUserReports } from "@/hooks/report/useGetUserReports";
import { useGetUserTypeChangeApplications } from "@/hooks/user/useGetUserTypeChangeApplications";
import {
  AlertCircle,
  AlertTriangle,
  Ambulance,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Flame,
  MapPin,
  Siren,
} from "lucide-react";
import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    icon: Clock,
  },
  halted: {
    label: "Halted",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
    icon: AlertCircle,
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: Ambulance,
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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
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

  const incident = INCIDENT_TYPES.find(
    (type) => type.value === report.incident_type,
  );
  const Icon = incident ? incident.icon : AlertCircle;

  return (
    <Link href={`/track_report?report_id=${report.report_id}&auto=true`}>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-red-200 hover:bg-red-50/30 sm:rounded-xl sm:shadow-none">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <div className="shrink-0 rounded-xl bg-red-100 p-2.5 sm:rounded-lg sm:p-2">
                <Icon className="h-4 w-4 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {incident?.label ?? "Emergency"} Report
                </p>
                <p className="truncate font-mono text-xs text-gray-400">
                  {report.report_id}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={report.status} />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:flex-wrap sm:gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gray-400" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${report.location.latitude},${report.location.longitude}`,
                    "_blank",
                  );
                }}
                className="truncate underline transition-colors hover:text-red-600"
              >
                {report.location.latitude.toFixed(4)},{" "}
                {report.location.longitude.toFixed(4)}
              </button>
            </span>

            <span className="flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
              {report.estimated_number_of_casualties}{" "}
              {report.estimated_number_of_casualties === 1
                ? "casualty"
                : "casualties"}
            </span>
          </div>

          <p className="border-t border-gray-100 pt-2 text-[11px] text-gray-400">
            Reported on {date}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ApplicationCard({ application }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-red-200 hover:bg-red-50/30 sm:rounded-xl sm:shadow-none">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <div className="shrink-0 rounded-xl bg-green-100 p-2.5 sm:rounded-lg sm:p-2">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-gray-800">
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
          <div className="shrink-0">
            <StatusBadge status={application.status} />
          </div>
        </div>

        <p className="border-t border-gray-100 pt-2 text-[11px] text-gray-400">
          Submitted on {new Date(application.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500 sm:rounded-xl">
      {text}
    </div>
  );
}

function CollapsibleSection({
  id,
  title,
  count,
  isOpen,
  onToggle,
  children,
  rightContent = null,
}) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl text-left transition-all sm:min-h-0"
        >
          <div className="min-w-0 flex items-center gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              {title}
            </h3>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-600">
              {count}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {rightContent}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 sm:h-auto sm:w-auto sm:bg-transparent">
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </button>

        {isOpen && <div className="space-y-3">{children}</div>}
      </div>
    </section>
  );
}

const Hero = () => {
  const { user } = useContext(AuthContext);

  const { data: userReports } = useGetUserReports();
  const { data: userTypeChangeApplications } =
    useGetUserTypeChangeApplications();

  const isPoliceOrAdmin = !!(
    user &&
    (user.user_type === "police_officer" || user.user_type === "admin")
  );

  const { data: allReports } = useGetAllReports({ enabled: isPoliceOrAdmin });

  const { data: activeReports } = useGetActiveReports({
    enabled: isPoliceOrAdmin,
  });

  const { data: ambulanceOfferedReports } = useGetAmbulanceOfferedReports({
    enabled: user?.user_type === "ambulance_driver",
  });

  const { data: ambulanceAcceptedReports } = useGetAmbulanceAcceptedReports({
    enabled: user?.user_type === "ambulance_driver",
  });

  const sections = useMemo(() => {
    if (!user) return [];

    const items = [];

    if (user.user_type === "user" && !user.type_conversion_lock) {
      items.push({
        id: "expand-role",
        title: "Expand Your Role",
        count: 1,
        content: (
          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/dashboard/register/driver"
              className="group flex items-center gap-4 rounded-2xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-red-500 hover:bg-red-50/40 sm:rounded-xl"
            >
              <div className="shrink-0 rounded-xl bg-red-100 p-3 transition-colors group-hover:bg-red-200 sm:rounded-lg">
                <Ambulance className="h-6 w-6 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 transition-colors group-hover:text-red-700">
                  Register as Ambulance Driver
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  Join the ambulance dispatch network.
                </p>
              </div>
            </Link>
          </div>
        ),
      });
    }

    if (user.user_type === "ambulance_driver") {
      items.push({
        id: "offered-reports",
        title: "Offered Reports",
        count: ambulanceOfferedReports?.length ?? 0,
        content: (
          <div className="flex flex-col gap-3">
            {ambulanceOfferedReports?.length === 0 ? (
              <EmptyState text="No offered reports at the moment." />
            ) : (
              ambulanceOfferedReports?.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))
            )}
          </div>
        ),
      });

      items.push({
        id: "accepted-reports",
        title: "Accepted Reports",
        count: ambulanceAcceptedReports?.length ?? 0,
        content: (
          <div className="flex flex-col gap-3">
            {ambulanceAcceptedReports?.length === 0 ? (
              <EmptyState text="No accepted reports at the moment." />
            ) : (
              ambulanceAcceptedReports?.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))
            )}
          </div>
        ),
      });
    }

    if (user.user_type === "police_officer" || user.user_type === "admin") {
      items.push({
        id: "active-reports",
        title: "Active Reports",
        count: activeReports?.length ?? 0,
        content: (
          <div className="flex flex-col gap-3">
            {activeReports?.length === 0 ? (
              <EmptyState text="No active reports at the moment." />
            ) : (
              activeReports?.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))
            )}
          </div>
        ),
      });

      items.push({
        id: "all-reports",
        title: "All Reports",
        count: allReports?.length ?? 0,
        content: (
          <div className="flex flex-col gap-3">
            {allReports?.length === 0 ? (
              <EmptyState text="No reports found." />
            ) : (
              allReports?.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))
            )}
          </div>
        ),
      });
    }

    if (user.type_change_requested && userTypeChangeApplications) {
      items.push({
        id: "my-applications",
        title: "My Applications",
        count: userTypeChangeApplications.length,
        content: (
          <div className="flex flex-col gap-3">
            {userTypeChangeApplications.length === 0 ? (
              <EmptyState text="No applications found." />
            ) : (
              userTypeChangeApplications.map((application) => (
                <ApplicationCard
                  key={application._id}
                  application={application}
                />
              ))
            )}
          </div>
        ),
      });
    }

    items.push({
      id: "my-reports",
      title: "My Reports",
      count: userReports?.length ?? 0,
      rightContent: (
        <Link
          href="/report"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <FileText className="h-3 w-3" />
          New Report
        </Link>
      ),
      content: (
        <div className="flex flex-col gap-3">
          {userReports?.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
          {userReports?.length === 0 && (
            <EmptyState text="You have not submitted any reports yet." />
          )}
        </div>
      ),
    });

    return items;
  }, [
    user,
    ambulanceOfferedReports,
    ambulanceAcceptedReports,
    activeReports,
    allReports,
    userTypeChangeApplications,
    userReports,
  ]);

  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    if (!sections.length) return;

    setOpenSections((prev) => {
      if (Object.keys(prev).length > 0) return prev;

      return sections.reduce((acc, section, index) => {
        acc[section.id] = index === 0;
        return acc;
      }, {});
    });
  }, [sections]);

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!user) return null;

  return (
    <div className="container space-y-5 px-4 py-4 pb-28 sm:space-y-8 sm:px-0 sm:py-8 sm:pb-8">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Welcome back,{" "}
            <span className="text-red-600">{user.full_name ?? "Responder"}</span>
          </h2>
          <p className="text-sm text-gray-500">
            You are signed in as a{" "}
            <span className="font-bold text-red-600">
              {user.user_type.split("_").join(" ")}
            </span>
            . Here&apos;s your activity overview.
          </p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-8">
        {sections.map((section) => (
          <CollapsibleSection
            key={section.id}
            id={section.id}
            title={section.title}
            count={section.count}
            isOpen={!!openSections[section.id]}
            onToggle={toggleSection}
            rightContent={section.rightContent}
          >
            {section.content}
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
};

export default Hero;