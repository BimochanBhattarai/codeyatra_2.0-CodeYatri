"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useSubmitAmbulanceDriverApplication } from "@/hooks/ambulance_driver/useSubmitAmbulanceDriverApplication";
// import { useRegisterDriver } from "@/hooks/driver/useRegisterDriver";
import "leaflet/dist/leaflet.css";
import {
  AlertCircle,
  Ambulance,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Shield,
  Upload,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Shared Components ────────────────────────────────────────────────────────

function Input({
  id,
  name,
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
      name={name}
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

function Progress({ value = 0 }) {
  return (
    <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden">
      <div
        className="bg-red-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

// ─── Ambulance Types ──────────────────────────────────────────────────────────

const AMBULANCE_TYPES = [
  {
    value: "basic_life_support",
    label: "Basic Life Support (BLS)",
    description: "Standard emergency transport",
  },
  {
    value: "advanced_life_support",
    label: "Advanced Life Support (ALS)",
    description: "Equipped with advanced medical gear",
  },
  {
    value: "patient_transport",
    label: "Patient Transport",
    description: "Non-emergency patient transfer",
  },
  {
    value: "neonatal",
    label: "Neonatal Ambulance",
    description: "Specialized for newborns & infants",
  },
  {
    value: "mobile_icu",
    label: "Mobile ICU",
    description: "Intensive care during transport",
  },
];

// ─── Map Picker ───────────────────────────────────────────────────────────────

function MapPicker({ latitude, longitude, radius, onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const leafletRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (mapRef.current._leaflet_id) return;

    let destroyed = false;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      if (destroyed || !mapRef.current || mapRef.current._leaflet_id) return;

      leafletRef.current = L;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      });

      const defaultLat = latitude || 27.7172;
      const defaultLng = longitude || 85.324;

      const map = L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: latitude ? 13 : 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      if (latitude && longitude) {
        markerRef.current = L.marker([latitude, longitude]).addTo(map);
        circleRef.current = L.circle([latitude, longitude], {
          radius: (radius || 10) * 1000,
          color: "#dc2626",
          fillColor: "#dc2626",
          fillOpacity: 0.08,
          weight: 2,
        }).addTo(map);
      }

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lng]);
        } else {
          circleRef.current = L.circle([lat, lng], {
            radius: (radius || 10) * 1000,
            color: "#dc2626",
            fillColor: "#dc2626",
            fillOpacity: 0.08,
            weight: 2,
          }).addTo(map);
        }
        onLocationSelect(lat, lng);
      });

      mapInstanceRef.current = map;
      if (!destroyed) {
        setIsMapReady(true);
        setTimeout(() => map.invalidateSize(), 0);
      }
    };

    initMap();

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
      if (mapRef.current) delete mapRef.current._leaflet_id;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!circleRef.current || !radius) return;
    circleRef.current.setRadius(radius * 1000);
  }, [radius]);

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !leafletRef.current ||
      !latitude ||
      !longitude
    )
      return;
    const L = leafletRef.current;
    mapInstanceRef.current.setView([latitude, longitude], 13);
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude]).addTo(
        mapInstanceRef.current,
      );
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([latitude, longitude]);
    } else {
      circleRef.current = L.circle([latitude, longitude], {
        radius: (radius || 10) * 1000,
        color: "#dc2626",
        fillColor: "#dc2626",
        fillOpacity: 0.08,
        weight: 2,
      }).addTo(mapInstanceRef.current);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div
        className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200"
        style={{ height: "280px" }}
      >
        {!isMapReady && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              <p className="text-xs text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        Click the map to set your base location. The red circle shows your
        working radius.
      </p>
    </div>
  );
}

// ─── Photo Upload Box (square passport style) ─────────────────────────────────

function PhotoUploadBox({ label, file, preview, onFileChange, error }) {
  const inputRef = useRef(null);
  return (
    <div className="space-y-1.5">
      <Label>
        {label} <span className="text-red-500">*</span>
      </Label>

      <div className="flex justify-start items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all aspect-square w-40
            ${error ? "border-red-400" : preview ? "border-green-400" : "border-gray-200 hover:border-red-400"}`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Driver photo"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                <span className="text-white text-xs font-medium">
                  Tap to replace
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-3">
              <div className="bg-red-100 rounded-full p-3">
                <User className="w-8 h-8 text-red-400" />
              </div>
              <span className="text-xs font-medium text-red-500 text-center leading-tight">
                Upload Photo
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">
                Passport size · JPG, PNG
              </span>
            </div>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-start">
        Use a clear, front-facing passport-style photo
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f) {
            const reader = new FileReader();
            reader.onloadend = () => onFileChange(f, reader.result);
            reader.readAsDataURL(f);
          } else {
            onFileChange(null, null);
          }
        }}
      />
      <FieldError message={error} />
    </div>
  );
}

// ─── File Upload Box ──────────────────────────────────────────────────────────

function FileUploadBox({
  label,
  file,
  onFileChange,
  error,
  accept = "image/*",
}) {
  const inputRef = useRef(null);
  return (
    <div className="space-y-1.5">
      <Label>
        {label} <span className="text-red-500">*</span>
      </Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all
          ${error ? "border-red-400 bg-red-50" : file ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-red-400 hover:bg-red-50/30"}`}
      >
        {file ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="text-xs font-medium text-green-700 text-center line-clamp-1 max-w-full px-2">
              {file.name}
            </span>
            <span className="text-[10px] text-green-500">Tap to replace</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 text-red-400" />
            <span className="text-xs font-medium text-red-500">{label}</span>
            <span className="text-[10px] text-gray-400">
              JPG, PNG · Max 5MB
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <FieldError message={error} />
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Personal Profile", description: "Who you are" },
  { id: 2, title: "Vehicle & Affiliation", description: "Your ambulance" },
  { id: 3, title: "Digital Vault", description: "Verification docs" },
];

function StepProgressBar({ currentStep }) {
  const progressValue = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-sm text-red-600 font-medium">
          {Math.round(progressValue)}% Complete
        </span>
      </div>
      <Progress value={progressValue} />
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col items-center justify-center text-center px-2 py-3 rounded-lg transition-all ${
              step.id === currentStep
                ? "bg-red-600 text-white"
                : step.id < currentStep
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            <div
              className={`sm:size-8 size-6 rounded-full flex items-center justify-center mb-1 text-xs sm:text-sm font-bold ${
                step.id === currentStep
                  ? "bg-white text-red-600"
                  : step.id < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium sm:font-semibold leading-tight line-clamp-1">
              {step.title}
            </p>
            <p className="text-xs hidden sm:block opacity-75 mt-0.5">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────

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

// ─── Step 1: Personal Profile ─────────────────────────────────────────────────

function PersonalProfileStep({
  form,
  errors,
  onChange,
  onFieldChange,
  onNext,
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleGps = () => {
    if (!navigator.geolocation)
      return toast.error("Geolocation not supported.");
    setIsLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onFieldChange("latitude", coords.latitude);
        onFieldChange("longitude", coords.longitude);
        setIsLoadingGps(false);
      },
      () => {
        toast.error("Unable to get location. Please enable location services.");
        setIsLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  return (
    <div className="space-y-5">
      <SectionCard icon={User} title="Personal Information">
        <div className="space-y-4">
          {/* Driver Photo */}
          <PhotoUploadBox
            label="Driver Photo"
            file={form.driverPhoto}
            preview={form.driverPhotoPreview}
            onFileChange={(file, preview) => {
              onFieldChange("driverPhoto", file);
              onFieldChange("driverPhotoPreview", preview);
            }}
            error={errors.driverPhoto}
          />

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={onChange}
                className={`pl-10 ${errors.fullName ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.fullName} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                +977
              </span>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="98XXXXXXXX"
                value={form.phone}
                onChange={onChange}
                maxLength={10}
                className={`pl-14 ${errors.phone ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.phone} />
          </div>

          {/* NID Number */}
          <div className="space-y-2">
            <Label htmlFor="nidNumber">
              National ID (NID) Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="nidNumber"
                name="nidNumber"
                placeholder="e.g. 12345678901234"
                value={form.nidNumber}
                onChange={onChange}
                maxLength={14}
                className={`pl-10 ${errors.nidNumber ? "border-red-500" : ""}`}
              />
            </div>
            {errors.nidNumber ? (
              <FieldError message={errors.nidNumber} />
            ) : (
              <p className="text-xs text-gray-400">
                Stored securely and used for identity verification only
              </p>
            )}
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience">
              Driving Experience (years) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="experience"
                name="experience"
                type="number"
                placeholder="e.g. 3"
                value={form.experience}
                onChange={onChange}
                className={`pl-10 ${errors.experience ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.experience} />
          </div>
        </div>
      </SectionCard>

      {/* Working Area Map */}
      <SectionCard icon={MapPin} title="Working Area">
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Set your base location and coverage radius. You&apos;ll only receive
            dispatch alerts within this area.
          </p>

          <button
            type="button"
            onClick={handleGps}
            disabled={isLoadingGps}
            className="w-full h-10 flex items-center justify-center gap-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingGps ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Detecting
                Location...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" /> Use My Current Location
              </>
            )}
          </button>

          {isMounted && (
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              radius={form.workingRadius}
              onLocationSelect={(lat, lng) => {
                onFieldChange("latitude", lat);
                onFieldChange("longitude", lng);
              }}
            />
          )}

          {form.latitude && form.longitude && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-800 font-medium">
                Base location pinned: {form.latitude.toFixed(5)},{" "}
                {form.longitude.toFixed(5)}
              </p>
            </div>
          )}
          <FieldError message={errors.latitude} />

          {/* Radius Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Working Radius</Label>
              <span className="text-sm font-semibold text-red-600">
                {form.workingRadius} km
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={form.workingRadius}
              onChange={(e) =>
                onFieldChange("workingRadius", Number(e.target.value))
              }
              className="w-full accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-red-600 mb-2">
          Why we need this
        </h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>
            • Your profile is verified before joining the dispatch network
          </li>
          <li>
            • NID is used strictly for identity verification and legal records
          </li>
          <li>• Phone number is used for emergency dispatch alerts</li>
          <li>• Working area ensures you only get nearby incident requests</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-sm"
      >
        Continue to Vehicle Details
      </button>
    </div>
  );
}

// ─── Step 2: Vehicle & Affiliation ────────────────────────────────────────────

function VehicleAffiliationStep({
  form,
  errors,
  onChange,
  onFieldChange,
  onNext,
  onBack,
}) {
  return (
    <div className="space-y-5">
      <SectionCard icon={Ambulance} title="Vehicle Details">
        <div className="space-y-4">
          {/* Ambulance Type */}
          <div className="space-y-2">
            <Label>
              Ambulance Type <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {AMBULANCE_TYPES.map((type) => {
                const selected = form.ambulanceType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => onFieldChange("ambulanceType", type.value)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-lg border-2 text-left transition-all ${
                      selected
                        ? "border-red-600 bg-red-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${selected ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      <Ambulance className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${selected ? "text-red-700" : "text-gray-700"}`}
                      >
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {type.description}
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-red-600 bg-red-600" : "border-gray-300"}`}
                    >
                      {selected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.ambulanceType} />
          </div>

          {/* Vehicle Number */}
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">
              Vehicle Registration Number{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="vehicleNumber"
                name="vehicleNumber"
                placeholder="e.g. BA 1 KHA 1234"
                value={form.vehicleNumber}
                onChange={onChange}
                className={`pl-10 ${errors.vehicleNumber ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.vehicleNumber} />
          </div>

          {/* Vehicle Model */}
          <div className="space-y-2">
            <Label htmlFor="vehicleModel">
              Vehicle Model <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicleModel"
              name="vehicleModel"
              placeholder="e.g. Toyota HiAce Ambulance"
              value={form.vehicleModel}
              onChange={onChange}
              className={errors.vehicleModel ? "border-red-500" : ""}
            />
            <FieldError message={errors.vehicleModel} />
          </div>

          {/* Vehicle Year */}
          <div className="space-y-2">
            <Label htmlFor="vehicleYear">
              Vehicle Year <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="vehicleYear"
                name="vehicleYear"
                type="number"
                placeholder="e.g. 2020"
                value={form.vehicleYear}
                onChange={onChange}
                className={`pl-10 ${errors.vehicleYear ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.vehicleYear} />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Building2} title="Hospital Affiliation">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hospitalName">
              Affiliated Hospital <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="hospitalName"
                name="hospitalName"
                placeholder="e.g. Kathmandu Model Hospital"
                value={form.hospitalName}
                onChange={onChange}
                className={`pl-10 ${errors.hospitalName ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.hospitalName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalPhone">
              Hospital Contact Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="hospitalPhone"
                name="hospitalPhone"
                type="tel"
                placeholder="01-XXXXXXX"
                value={form.hospitalPhone}
                onChange={onChange}
                className={`pl-10 ${errors.hospitalPhone ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.hospitalPhone} />
          </div>
        </div>
      </SectionCard>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-12 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-sm"
        >
          Continue to Documents
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Digital Vault ────────────────────────────────────────────────────

function DigitalVaultStep({
  form,
  errors,
  onFileChange,
  onSubmit,
  onBack,
  isSubmitting,
}) {
  return (
    <div className="space-y-5">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
        <Shield className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
        <p className="text-xs text-green-800">
          All documents are encrypted and stored securely. These are required
          for legal compliance and verification.
        </p>
      </div>

      <SectionCard icon={CreditCard} title="Driver's License">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">
                License Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                placeholder="e.g. 012-345-6789"
                value={form.licenseNumber}
                onChange={(e) => onFileChange("licenseNumber", e.target.value)}
                className={errors.licenseNumber ? "border-red-500" : ""}
              />
              <FieldError message={errors.licenseNumber} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseExpiry">
                Expiry Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="licenseExpiry"
                name="licenseExpiry"
                type="date"
                value={form.licenseExpiry}
                onChange={(e) => onFileChange("licenseExpiry", e.target.value)}
                className={errors.licenseExpiry ? "border-red-500" : ""}
              />
              <FieldError message={errors.licenseExpiry} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FileUploadBox
              label="License Front Side"
              file={form.licenseFront}
              onFileChange={(f) => onFileChange("licenseFront", f)}
              error={errors.licenseFront}
            />
            <FileUploadBox
              label="License Back Side"
              file={form.licenseBack}
              onFileChange={(f) => onFileChange("licenseBack", f)}
              error={errors.licenseBack}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={FileText} title="Vehicle Registration (Bluebook)">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bluebookNumber">
                Bluebook Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bluebookNumber"
                name="bluebookNumber"
                placeholder="e.g. BB-2023-12345"
                value={form.bluebookNumber}
                onChange={(e) => onFileChange("bluebookNumber", e.target.value)}
                className={errors.bluebookNumber ? "border-red-500" : ""}
              />
              <FieldError message={errors.bluebookNumber} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bluebookExpiry">
                Registration Expiry <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bluebookExpiry"
                name="bluebookExpiry"
                type="date"
                value={form.bluebookExpiry}
                onChange={(e) => onFileChange("bluebookExpiry", e.target.value)}
                className={errors.bluebookExpiry ? "border-red-500" : ""}
              />
              <FieldError message={errors.bluebookExpiry} />
            </div>
          </div>
          <FileUploadBox
            label="Bluebook Ownership Page"
            file={form.bluebookPhoto}
            onFileChange={(f) => onFileChange("bluebookPhoto", f)}
            error={errors.bluebookPhoto}
          />
          <p className="text-xs text-gray-400">
            Upload page showing vehicle ownership and validity
          </p>
        </div>
      </SectionCard>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800">
          <span className="font-semibold">Important:</span> Ensure all documents
          are clear and legible. Blurry or incomplete documents will delay your
          application.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 h-12 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const DriverRegisterCard = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    // Step 1
    fullName: "",
    phone: "",
    nidNumber: "",
    driverPhoto: null,
    driverPhotoPreview: null,
    latitude: null,
    longitude: null,
    workingRadius: 10,
    experience: "",
    // Step 2
    ambulanceType: "",
    vehicleNumber: "",
    vehicleModel: "",
    vehicleYear: "",
    hospitalName: "",
    hospitalPhone: "",
    // Step 3
    licenseNumber: "",
    licenseExpiry: "",
    licenseFront: null,
    licenseBack: null,
    bluebookNumber: "",
    bluebookExpiry: "",
    bluebookPhoto: null,
  });

  const { mutate: registerDriver, isPending: isSubmitting } =
    useSubmitAmbulanceDriverApplication();

  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user?.full_name || "",
        phone: user?.phone_number || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleFieldChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.driverPhoto) e.driverPhoto = "Driver photo is required.";
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit number.";
    if (!form.nidNumber.trim()) e.nidNumber = "NID number is required.";
    else if (!/^\d{10,14}$/.test(form.nidNumber))
      e.nidNumber = "Enter a valid NID number (10–14 digits).";
    if (!form.experience) e.experience = "Experience is required.";
    else if (Number(form.experience) < 0) e.experience = "Enter a valid value.";
    if (!form.latitude || !form.longitude)
      e.latitude = "Please pin your base location on the map.";
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.ambulanceType)
      e.ambulanceType = "Please select an ambulance type.";
    if (!form.vehicleNumber.trim())
      e.vehicleNumber = "Vehicle number is required.";
    if (!form.vehicleModel.trim())
      e.vehicleModel = "Vehicle model is required.";
    if (!form.vehicleYear) e.vehicleYear = "Vehicle year is required.";
    if (!form.hospitalName.trim())
      e.hospitalName = "Hospital name is required.";
    if (!form.hospitalPhone.trim())
      e.hospitalPhone = "Hospital contact is required.";
    return e;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.licenseNumber.trim())
      e.licenseNumber = "License number is required.";
    if (!form.licenseExpiry) e.licenseExpiry = "Expiry date is required.";
    if (!form.licenseFront) e.licenseFront = "Front side is required.";
    if (!form.licenseBack) e.licenseBack = "Back side is required.";
    if (!form.bluebookNumber.trim())
      e.bluebookNumber = "Bluebook number is required.";
    if (!form.bluebookExpiry)
      e.bluebookExpiry = "Registration expiry is required.";
    if (!form.bluebookPhoto) e.bluebookPhoto = "Bluebook photo is required.";
    return e;
  };

  const handleNextStep1 = () => {
    const e = validateStep1();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    window?.scrollTo({ top: 0, behavior: "smooth" });
    setStep(2);
  };

  const handleNextStep2 = () => {
    const e = validateStep2();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    window?.scrollTo({ top: 0, behavior: "smooth" });
    setStep(3);
  };

  const handleSubmit = () => {
    const e = validateStep3();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    registerDriver(
      {
        driver_photo: form.driverPhoto,
        full_name: form.fullName,
        phone_number: form.phone,
        nid_number: form.nidNumber,
        experience_years: form.experience,
        working_area: {
          latitude: form.latitude,
          longitude: form.longitude,
          working_radius_km: form.workingRadius,
        },
        ambulance_type: form.ambulanceType,
        vehicle_number: form.vehicleNumber,
        vehicle_model: form.vehicleModel,
        vehicle_year: form.vehicleYear,
        hospital_name: form.hospitalName,
        hospital_phone: form.hospitalPhone,
        license_number: form.licenseNumber,
        license_expiry: form.licenseExpiry,
        license_front: form.licenseFront,
        license_back: form.licenseBack,
        bluebook_number: form.bluebookNumber,
        bluebook_expiry: form.bluebookExpiry,
        bluebook_photo: form.bluebookPhoto,
      },
      {
        onSuccess: () => {
          toast.success(
            "Application submitted! We'll review and contact you shortly.",
          );
          router.push("/dashboard");
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to submit. Please try again.");
        },
      },
    );
  };

  return (
    <div className="bg-white container py-8 space-y-5 max-w-4xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Ambulance Driver Registration
        </h2>
        <p className="text-gray-500 text-sm">
          Complete all steps to join the emergency dispatch network
        </p>
      </div>

      <StepProgressBar currentStep={step} />

      {step === 1 && (
        <PersonalProfileStep
          form={form}
          errors={errors}
          onChange={handleChange}
          onFieldChange={handleFieldChange}
          onNext={handleNextStep1}
        />
      )}
      {step === 2 && (
        <VehicleAffiliationStep
          form={form}
          errors={errors}
          onChange={handleChange}
          onFieldChange={handleFieldChange}
          onNext={handleNextStep2}
          onBack={() => {
            setErrors({});
            window?.scrollTo({ top: 0, behavior: "smooth" });
            setStep(1);
          }}
        />
      )}
      {step === 3 && (
        <DigitalVaultStep
          form={form}
          errors={errors}
          onFileChange={handleFieldChange}
          onSubmit={handleSubmit}
          onBack={() => {
            setErrors({});
            window?.scrollTo({ top: 0, behavior: "smooth" });
            setStep(2);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default DriverRegisterCard;
