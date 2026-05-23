"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useApproveDriverApplication } from "@/hooks/admin/useApproveDriverApplication";
import { useGetDriverApplicationDetails } from "@/hooks/admin/useGetDriverApplicationDetails";
import { useRejectDriverApplication } from "@/hooks/admin/useRejectDriverApplication";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileImage,
  FileText,
  IdCard,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect } from "react";
import { toast } from "sonner";

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

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
      <div className="shrink-0 rounded-xl bg-red-50 p-2 sm:rounded-lg">
        <Icon className="h-4 w-4 text-red-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="break-words text-sm font-medium text-gray-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function WorkingAreaItem({ workingArea }) {
  const latitude = workingArea?.latitude;
  const longitude = workingArea?.longitude;
  const radius = workingArea?.working_radius_km;

  const hasCoordinates =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
      <div className="shrink-0 rounded-xl bg-red-50 p-2 sm:rounded-lg">
        <MapPin className="h-4 w-4 text-red-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">Working Area</p>

        {hasCoordinates ? (
          <>
            <button
              type="button"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                  "_blank",
                )
              }
              className="cursor-pointer text-left text-sm font-medium text-gray-800 underline transition-colors hover:text-red-600"
            >
              {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
            </button>
            <p className="mt-1 text-xs text-gray-500">
              Radius: {radius ?? "—"} km
            </p>
          </>
        ) : (
          <p className="text-sm font-medium text-gray-800">—</p>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ title, url }) {
  if (!url) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fullUrl = `${baseUrl}${url}`;

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-red-200 hover:bg-red-50/30 sm:rounded-xl"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={fullUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex items-center gap-3">
          <div className="shrink-0 rounded-xl bg-red-100 p-2 sm:rounded-lg">
            <FileImage className="h-4 w-4 text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {title}
            </p>
            <p className="truncate text-xs text-gray-400">
              {url.split("/").pop()}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-red-600">
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}

export default function DriverApplicationDetailsPage() {
  const searchParams = useSearchParams();
  const driverId = searchParams.get("driver_id");
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const {
    data: application,
    isLoading,
    isError,
  } = useGetDriverApplicationDetails(driverId);

  const { mutate: approveApplication, isPending: isApproving } =
    useApproveDriverApplication();

  const { mutate: rejectApplication, isPending: isRejecting } =
    useRejectDriverApplication();

  const isActing = isApproving || isRejecting;

  const handleApprove = () => {
    approveApplication(driverId, {
      onSuccess: () => {
        toast.success("Driver application approved.");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to approve application.");
      },
    });
  };

  const handleReject = () => {
    rejectApplication(driverId, {
      onSuccess: () => {
        toast.success("Driver application rejected.");
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to reject application.");
      },
    });
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
    if (user && user.user_type !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="container space-y-5 px-4 py-4 pb-32 sm:space-y-6 sm:px-0 sm:py-8 sm:pb-8">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link
              href="/manage_driver_applications"
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to applications
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Driver Application Details
            </h1>
            <p className="text-sm text-gray-500">
              Review submitted driver information and uploaded documents.
            </p>
          </div>

          {application && (
            <div className="shrink-0">
              <StatusBadge status={application.status} />
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500 shadow-sm sm:rounded-xl sm:shadow-none">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading application details...
        </div>
      ) : isError || !application ? (
        <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-center sm:rounded-xl">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="text-sm font-semibold text-red-700">
            Failed to load application details
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-xl sm:p-5 sm:shadow-none">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
              <InfoItem
                icon={User}
                label="Full Name"
                value={application.full_name}
              />
              <InfoItem
                icon={Phone}
                label="Phone Number"
                value={application.phone_number}
              />
              <InfoItem
                icon={IdCard}
                label="NID Number"
                value={application.nid_number}
              />
              <InfoItem
                icon={ShieldCheck}
                label="Experience (Years)"
                value={application.experience_years}
              />
              <InfoItem
                icon={Truck}
                label="Ambulance Type"
                value={application.ambulance_type}
              />
              <InfoItem
                icon={Truck}
                label="Vehicle Number"
                value={application.vehicle_number}
              />
              <InfoItem
                icon={Truck}
                label="Vehicle Model"
                value={application.vehicle_model}
              />
              <InfoItem
                icon={Calendar}
                label="Vehicle Year"
                value={application.vehicle_year}
              />
              <InfoItem
                icon={Building2}
                label="Hospital Name"
                value={application.hospital_name}
              />
              <InfoItem
                icon={Phone}
                label="Hospital Phone"
                value={application.hospital_phone}
              />
              <InfoItem
                icon={FileText}
                label="License Number"
                value={application.license_number}
              />
              <InfoItem
                icon={Calendar}
                label="License Expiry"
                value={
                  application.license_expiry
                    ? new Date(application.license_expiry).toLocaleDateString()
                    : "—"
                }
              />
              <InfoItem
                icon={FileText}
                label="Bluebook Number"
                value={application.bluebook_number}
              />
              <InfoItem
                icon={Calendar}
                label="Bluebook Expiry"
                value={
                  application.bluebook_expiry
                    ? new Date(application.bluebook_expiry).toLocaleDateString()
                    : "—"
                }
              />
              <WorkingAreaItem workingArea={application.working_area} />
              <InfoItem
                icon={Clock}
                label="Submitted At"
                value={new Date(application.createdAt).toLocaleString()}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Uploaded Documents
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DocumentCard
                  title="Driver Photo"
                  url={application.driver_photo}
                />
                <DocumentCard
                  title="License Front"
                  url={application.license_front}
                />
                <DocumentCard
                  title="License Back"
                  url={application.license_back}
                />
                <DocumentCard
                  title="Bluebook Photo"
                  url={application.bluebook_photo}
                />
              </div>
            </div>
          </div>

          {application.status === "pending" && (
            <div className="sticky bottom-22 z-20 bg-transparent sm:static">
              <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isActing}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-medium text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
                  >
                    {isApproving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve Application
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isActing}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-500 text-sm font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-lg"
                  >
                    {isRejecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Reject Application
                  </button>
                </div>
              </div>
            </div>
          )}

          {application.status !== "pending" && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 sm:rounded-xl">
              This application has already been reviewed.
            </div>
          )}
        </>
      )}
    </div>
  );
}