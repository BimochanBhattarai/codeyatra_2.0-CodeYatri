"use client";

import { AuthContext } from "@/contexts/AuthProvider";
import { useSubmitAmbulanceDriverApplication } from "@/hooks/ambulance_driver/useSubmitAmbulanceDriverApplication";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import "leaflet/dist/leaflet.css";
import {
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

const STEPS = [
  { id: 1, title: "Personal Profile", description: "Who you are" },
  { id: 2, title: "Vehicle & Affiliation", description: "Your ambulance" },
  { id: 3, title: "Digital Vault", description: "Verification docs" },
];

function Input({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  maxLength,
  min,
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
      min={min}
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 sm:rounded-lg sm:px-3 sm:py-2 ${className}`}
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-red-100">
      <div
        className="h-2 rounded-full bg-red-600 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-red-500">{message}</p>;
}

function MobileSection({ children }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
      {children}
    </div>
  );
}

function StepProgressBar({ currentStep }) {
  const progressValue = ((currentStep - 1) / STEPS.length) * 100;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-white sm:p-0 sm:shadow-none">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm font-medium text-red-600">
            {Math.round(progressValue)}% Complete
          </span>
        </div>
        <Progress value={progressValue} />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex flex-col items-center justify-center rounded-xl px-2 py-3 text-center transition-all sm:rounded-lg ${
              step.id === currentStep
                ? "bg-red-600 text-white"
                : step.id < currentStep
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            <div
              className={`mb-1 flex size-7 items-center justify-center rounded-full text-xs font-bold sm:size-8 sm:text-sm ${
                step.id === currentStep
                  ? "bg-white text-red-600"
                  : step.id < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"
              }`}
            >
              {step.id < currentStep ? (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                step.id
              )}
            </div>

            <p className="line-clamp-1 text-[11px] font-medium leading-tight sm:text-sm sm:font-semibold">
              {step.title}
            </p>
            <p className="mt-0.5 hidden text-xs opacity-75 sm:block">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

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

      if (latitude != null && longitude != null) {
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
  }, []);

  useEffect(() => {
    if (!circleRef.current || !radius) return;
    circleRef.current.setRadius(radius * 1000);
  }, [radius]);

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !leafletRef.current ||
      latitude == null ||
      longitude == null
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
  }, [latitude, longitude, radius]);

  return (
    <div className="space-y-2">
      <div
        className="map-shell relative isolate w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:rounded-xl sm:border-2 sm:shadow-none"
        style={{ height: "280px" }}
      >
        {!isMapReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              <p className="text-xs text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
      </div>

      <p className="flex items-center gap-1 text-xs text-gray-400">
        <MapPin className="h-3 w-3" />
        Tap anywhere on the map to pin your ambulance base location
      </p>
    </div>
  );
}

function PhotoUploadBox({ label, preview, onFileChange, error }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-red-500">*</span>
      </Label>

      <div className="flex justify-center sm:justify-start">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`relative aspect-square w-40 overflow-hidden rounded-2xl border-2 border-dashed transition-all sm:rounded-xl ${
            error
              ? "border-red-400 bg-red-50"
              : preview
                ? "border-green-400 bg-green-50"
                : "border-gray-200 hover:border-red-400 hover:bg-red-50/30"
          }`}
        >
          {preview ? (
            <>
              <img
                src={preview}
                alt="Driver photo"
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                <span className="text-xs font-medium text-white">
                  Tap to replace
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3">
              <div className="rounded-full bg-red-100 p-3">
                <User className="h-8 w-8 text-red-400" />
              </div>
              <span className="text-center text-xs font-medium leading-tight text-red-500">
                Upload Photo
              </span>
              <span className="text-center text-[10px] leading-tight text-gray-400">
                Passport size · JPG, PNG
              </span>
            </div>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Use a clear, front-facing passport-style photo
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (!f) return onFileChange(null, null);
          const reader = new FileReader();
          reader.onloadend = () => onFileChange(f, reader.result);
          reader.readAsDataURL(f);
        }}
      />

      <FieldError message={error} />
    </div>
  );
}

function FileUploadBox({ label, file, onFileChange, error, accept = "image/*" }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-red-500">*</span>
      </Label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-2xl border-2 border-dashed p-5 transition-all sm:rounded-xl ${
          error
            ? "border-red-400 bg-red-50"
            : file
              ? "border-green-400 bg-green-50"
              : "border-gray-200 hover:border-red-400 hover:bg-red-50/30"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          {file ? (
            <>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <span className="line-clamp-1 max-w-full px-2 text-center text-xs font-medium text-green-700">
                {file.name}
              </span>
              <span className="text-[10px] text-green-500">Tap to replace</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-red-400" />
              <span className="text-xs font-medium text-red-500">{label}</span>
              <span className="text-[10px] text-gray-400">JPG, PNG · Max 5MB</span>
            </>
          )}
        </div>
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

async function getCurrentLocationForPlatform() {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    const permission = await Geolocation.requestPermissions();

    if (
      permission?.location === "denied" ||
      permission?.coarseLocation === "denied"
    ) {
      throw new Error("Location permission denied.");
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  }

  if (!navigator.geolocation) {
    throw new Error("Geolocation not supported.");
  }

  return await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () =>
        reject(
          new Error(
            "Unable to get location. Please enable location services.",
          ),
        ),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

function PersonalProfileStep({ form, errors, onChange, onFieldChange, onNext }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleGps = async () => {
    try {
      setIsLoadingGps(true);
      const { latitude, longitude } = await getCurrentLocationForPlatform();
      onFieldChange("latitude", latitude);
      onFieldChange("longitude", longitude);
    } catch (error) {
      toast.error(error?.message || "Unable to get location.");
    } finally {
      setIsLoadingGps(false);
    }
  };

  const handleNext = () => {
    if (!form.driverPhoto) return toast.error("Driver photo is required.");
    if (!form.fullName.trim()) return toast.error("Full name is required.");
    if (!form.phone.trim()) return toast.error("Phone number is required.");
    if (!/^\d{10}$/.test(form.phone))
      return toast.error("Enter a valid 10-digit phone number.");
    if (!form.nidNumber.trim()) return toast.error("NID number is required.");
    if (!/^\d{10,14}$/.test(form.nidNumber))
      return toast.error("Enter a valid NID number.");
    if (!form.experience) return toast.error("Experience is required.");
    if (Number(form.experience) < 0)
      return toast.error("Experience cannot be negative.");
    if (form.latitude == null || form.longitude == null)
      return toast.error("Please pin your base location.");
    onNext();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <MobileSection>
        <div className="space-y-6">
          <PhotoUploadBox
            label="Driver Photo"
            preview={form.driverPhotoPreview}
            onFileChange={(file, preview) => {
              onFieldChange("driverPhoto", file);
              onFieldChange("driverPhotoPreview", preview);
            }}
            error={errors.driverPhoto}
          />

          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
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

          <div className="space-y-2">
            <Label htmlFor="nidNumber">
              National ID (NID) Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

          <div className="space-y-2">
            <Label htmlFor="experience">
              Driving Experience (years) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="experience"
                name="experience"
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={form.experience}
                onChange={onChange}
                className={`pl-10 ${errors.experience ? "border-red-500" : ""}`}
              />
            </div>
            <FieldError message={errors.experience} />
          </div>

          <div className="space-y-2">
            <Label>
              Working Area <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-400">
              Use GPS or tap on the map to mark your base location
            </p>

            <button
              type="button"
              onClick={handleGps}
              disabled={isLoadingGps}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-600 text-sm font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:rounded-lg"
            >
              {isLoadingGps ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Detecting
                  Location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" /> Use My Current Location
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

            {form.latitude != null && form.longitude != null && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 sm:rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                <p className="text-xs font-medium text-green-800">
                  Base location pinned successfully.
                </p>
              </div>
            )}

            <FieldError message={errors.latitude} />

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
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
        </div>
      </MobileSection>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 sm:rounded-lg">
        <h4 className="mb-2 text-sm font-semibold text-red-600">
          Why we need this
        </h4>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Your profile is verified before joining the dispatch network</li>
          <li>• NID is used strictly for identity verification and legal records</li>
          <li>• Phone number is used for emergency dispatch alerts</li>
          <li>• Working area ensures you only get nearby incident requests</li>
        </ul>
      </div>

      <div className="sticky bottom-22 z-20 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
        <button
          type="button"
          onClick={handleNext}
          className="h-12 w-full rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 sm:rounded-lg"
        >
          Continue to Vehicle Details
        </button>
      </div>
    </div>
  );
}

function VehicleAffiliationStep({
  form,
  errors,
  onChange,
  onFieldChange,
  onNext,
  onPrevious,
}) {
  const handleNext = () => {
    if (!form.ambulanceType)
      return toast.error("Please select an ambulance type.");
    if (!form.vehicleNumber.trim())
      return toast.error("Vehicle number is required.");
    if (!form.vehicleModel.trim())
      return toast.error("Vehicle model is required.");
    if (!form.vehicleYear) return toast.error("Vehicle year is required.");
    if (!form.hospitalName.trim())
      return toast.error("Hospital name is required.");
    if (!form.hospitalPhone.trim())
      return toast.error("Hospital contact number is required.");
    onNext();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <MobileSection>
        <div className="space-y-6">
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
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all sm:rounded-lg ${
                      selected
                        ? "border-red-600 bg-red-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`shrink-0 rounded-lg p-2 ${
                          selected
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Ambulance className="h-5 w-5" />
                      </div>

                      <div>
                        <p
                          className={`text-sm font-medium ${
                            selected ? "text-red-700" : "text-gray-700"
                          }`}
                        >
                          {type.label}
                        </p>
                        <p className="text-xs text-gray-400">
                          {type.description}
                        </p>
                      </div>

                      <div
                        className={`ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-red-600 bg-red-600"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.ambulanceType} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">
              Vehicle Registration Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

          <div className="space-y-2">
            <Label htmlFor="vehicleYear">
              Vehicle Year <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

          <div className="space-y-2">
            <Label htmlFor="hospitalName">
              Affiliated Hospital <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
      </MobileSection>

      <div className="sticky bottom-[76px] z-20 grid grid-cols-2 gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
        <button
          type="button"
          onClick={onPrevious}
          className="h-12 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 sm:rounded-lg"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="h-12 rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 sm:rounded-lg"
        >
          Continue to Documents
        </button>
      </div>
    </div>
  );
}

function DigitalVaultStep({
  form,
  errors,
  onFieldChange,
  onSubmit,
  onPrevious,
  isSubmitting,
}) {
  const handleSubmit = () => {
    if (!form.licenseNumber.trim())
      return toast.error("License number is required.");
    if (!form.licenseExpiry)
      return toast.error("License expiry date is required.");
    if (!form.licenseFront)
      return toast.error("License front side is required.");
    if (!form.licenseBack)
      return toast.error("License back side is required.");
    if (!form.bluebookNumber.trim())
      return toast.error("Bluebook number is required.");
    if (!form.bluebookExpiry)
      return toast.error("Bluebook expiry date is required.");
    if (!form.bluebookPhoto)
      return toast.error("Bluebook photo is required.");
    onSubmit();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <MobileSection>
        <div className="space-y-6">
          <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 sm:rounded-lg">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <p className="text-xs text-green-800">
              All documents are encrypted and stored securely. These are required
              for legal compliance and verification.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">
              License Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              placeholder="e.g. 012-345-6789"
              value={form.licenseNumber}
              onChange={(e) => onFieldChange("licenseNumber", e.target.value)}
              className={errors.licenseNumber ? "border-red-500" : ""}
            />
            <FieldError message={errors.licenseNumber} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseExpiry">
              License Expiry Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="licenseExpiry"
              name="licenseExpiry"
              type="date"
              value={form.licenseExpiry}
              onChange={(e) => onFieldChange("licenseExpiry", e.target.value)}
              className={errors.licenseExpiry ? "border-red-500" : ""}
            />
            <FieldError message={errors.licenseExpiry} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FileUploadBox
              label="License Front Side"
              file={form.licenseFront}
              onFileChange={(f) => onFieldChange("licenseFront", f)}
              error={errors.licenseFront}
            />
            <FileUploadBox
              label="License Back Side"
              file={form.licenseBack}
              onFileChange={(f) => onFieldChange("licenseBack", f)}
              error={errors.licenseBack}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bluebookNumber">
              Bluebook Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bluebookNumber"
              name="bluebookNumber"
              placeholder="e.g. BB-2023-12345"
              value={form.bluebookNumber}
              onChange={(e) => onFieldChange("bluebookNumber", e.target.value)}
              className={errors.bluebookNumber ? "border-red-500" : ""}
            />
            <FieldError message={errors.bluebookNumber} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bluebookExpiry">
              Bluebook Expiry Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bluebookExpiry"
              name="bluebookExpiry"
              type="date"
              value={form.bluebookExpiry}
              onChange={(e) => onFieldChange("bluebookExpiry", e.target.value)}
              className={errors.bluebookExpiry ? "border-red-500" : ""}
            />
            <FieldError message={errors.bluebookExpiry} />
          </div>

          <FileUploadBox
            label="Bluebook Ownership Page"
            file={form.bluebookPhoto}
            onFileChange={(f) => onFieldChange("bluebookPhoto", f)}
            error={errors.bluebookPhoto}
          />
        </div>
      </MobileSection>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 sm:rounded-lg">
        <h4 className="mb-2 text-sm font-semibold text-red-600">
          Document Guidelines
        </h4>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Upload clear, readable images with no glare or blur</li>
          <li>• Make sure expiry dates are visible and valid</li>
          <li>• Use the ownership page from the bluebook</li>
          <li>• Incomplete documents will delay verification</li>
        </ul>
      </div>

      <div className="sticky bottom-[76px] z-20 grid grid-cols-2 gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="h-12 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 sm:rounded-lg"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </button>
      </div>
    </div>
  );
}

export default function DriverRegisterCard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    nidNumber: "",
    driverPhoto: null,
    driverPhotoPreview: null,
    latitude: null,
    longitude: null,
    workingRadius: 10,
    experience: "",
    ambulanceType: "",
    vehicleNumber: "",
    vehicleModel: "",
    vehicleYear: "",
    hospitalName: "",
    hospitalPhone: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseFront: null,
    licenseBack: null,
    bluebookNumber: "",
    bluebookExpiry: "",
    bluebookPhoto: null,
  });
  const [errors, setErrors] = useState({});

  const { mutate: submitApplication, isPending: isSubmitting } =
    useSubmitAmbulanceDriverApplication();
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      fullName: user?.full_name || "",
      phone: user?.phone_number || "",
    }));
  }, [user]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleChange = (e) => {
    updateField(e.target.name, e.target.value);
  };

  const handleNext = () => {
    window?.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((p) => Math.min(p + 1, STEPS.length));
  };

  const handlePrevious = () => {
    window?.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = () => {
    submitApplication(
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
            "Application submitted successfully. We’ll review it shortly.",
          );
          router.push("/dashboard");
        },
        onError: () => {
          toast.error("Failed to submit application. Please try again.");
          setCurrentStep(3);
        },
      },
    );
  };

  return (
    <>
      <style jsx global>{`
        .map-shell,
        .map-shell .leaflet-container {
          position: relative;
          z-index: 0;
          overflow: hidden;
        }

        .map-shell .leaflet-pane,
        .map-shell .leaflet-top,
        .map-shell .leaflet-bottom,
        .map-shell .leaflet-control,
        .map-shell .leaflet-control-container,
        .map-shell .leaflet-map-pane,
        .map-shell .leaflet-popup-pane {
          z-index: 1 !important;
        }
      `}</style>

      <div className="container max-w-4xl space-y-8 bg-white px-4 py-4 pb-24 sm:px-0 sm:py-8 sm:pb-8">
        <main className="space-y-5">
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
            <div className="text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                Ambulance Driver Registration
              </h2>
              <p className="text-sm text-gray-500">
                Complete your profile to join the emergency dispatch network.
              </p>
            </div>
          </div>

          <StepProgressBar currentStep={currentStep} />

          <div className="relative z-0 bg-white">
            {currentStep === 1 && (
              <PersonalProfileStep
                form={form}
                errors={errors}
                onChange={handleChange}
                onFieldChange={updateField}
                onNext={handleNext}
              />
            )}

            {currentStep === 2 && (
              <VehicleAffiliationStep
                form={form}
                errors={errors}
                onChange={handleChange}
                onFieldChange={updateField}
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}

            {currentStep === 3 && (
              <DigitalVaultStep
                form={form}
                errors={errors}
                onFieldChange={updateField}
                onSubmit={handleSubmit}
                onPrevious={handlePrevious}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}