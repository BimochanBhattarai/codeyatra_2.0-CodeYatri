"use client";

import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";
import { useCreateReport } from "@/hooks/report/useCreateReport";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  Camera,
  Car,
  CheckCircle2,
  Flame,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Shield,
  Siren,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function MapPicker({ latitude, longitude, onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
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
        zoom: latitude ? 15 : 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      if (latitude && longitude) {
        markerRef.current = L.marker([latitude, longitude]).addTo(map);
      }

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
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
      }
      if (mapRef.current) {
        delete mapRef.current._leaflet_id;
      }
    };
  }, []);

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !leafletRef.current ||
      !latitude ||
      !longitude
    )
      return;

    const L = leafletRef.current;
    mapInstanceRef.current.setView([latitude, longitude], 15);

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude]).addTo(
        mapInstanceRef.current,
      );
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div
        className="map-shell relative isolate w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:rounded-xl sm:border-2 sm:shadow-none"
        style={{ height: "256px" }}
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
        Tap anywhere on the map to pin the incident location
      </p>
    </div>
  );
}

function Input({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  min,
  maxLength,
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      maxLength={maxLength}
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 sm:rounded-lg sm:px-3 sm:py-2 ${className}`}
    />
  );
}

function Textarea({
  id,
  placeholder,
  value,
  onChange,
  rows = 4,
  className = "",
}) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 sm:rounded-lg sm:px-3 sm:py-2 ${className}`}
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

const STEPS = [
  { id: 1, title: "Incident Details", description: "Location and type" },
  { id: 2, title: "Evidence", description: "Photo and description" },
  { id: 3, title: "Contact", description: "Phone number" },
];

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

function MobileSection({ children }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
      {children}
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
    throw new Error("Geolocation is not supported by your browser.");
  }

  return await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
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

function IncidentDetailsStep({ formData, updateFormData, onNext, toast }) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { latitude, longitude } = await getCurrentLocationForPlatform();

      updateFormData({
        location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        latitude,
        longitude,
      });
    } catch (error) {
      toast.error(error?.message || "Unable to get location.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapClick = (lat, lng) => {
    updateFormData({
      latitude: lat,
      longitude: lng,
      location: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    });
  };

  const handleNext = () => {
    if (!formData.latitude || !formData.longitude)
      return toast.error("Please provide the incident location.");
    if (!formData.casualties.trim())
      return toast.error("Please estimate the number of casualties.");
    if (parseInt(formData.casualties) < 0)
      return toast.error("Please enter a valid number of casualties.");
    if (parseInt(formData.casualties) > 100)
      return toast.error("Please enter a realistic number of casualties.");
    if (!formData.incidentType)
      return toast.error("Please select the incident type.");
    onNext();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <MobileSection>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>
              Incident Location <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-400">
              Use GPS or click on the map to mark the incident location
            </p>

            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-600 text-sm font-medium text-red-600 transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:rounded-lg"
            >
              {isLoadingLocation ? (
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
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationSelect={handleMapClick}
              />
            )}

            {formData.latitude && formData.longitude && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 sm:rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                <p className="text-xs font-medium text-green-800">
                  Location pinned successfully.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="casualties">
              Estimated Number of Casualties{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="casualties"
              type="number"
              min="0"
              placeholder="e.g., 2"
              value={formData.casualties}
              onChange={(e) => updateFormData({ casualties: e.target.value })}
            />
            <p className="text-xs text-gray-400">
              Approximate number of injured or affected individuals
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              Incident Type <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {INCIDENT_TYPES.map((type) => {
                const Icon = type.icon;
                const selected = formData.incidentType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateFormData({ incidentType: type.value })}
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
                        <Icon className="h-5 w-5" />
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
          </div>
        </div>
      </MobileSection>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 sm:rounded-lg">
        <h4 className="mb-2 text-sm font-semibold text-red-600">
          Critical Information
        </h4>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Precise location helps dispatch the nearest emergency services</li>
          <li>• Casualty count helps prepare adequate medical resources</li>
          <li>• Incident type determines the right response team</li>
          <li>• All information is shared with police and ambulance services</li>
        </ul>
      </div>

      <div className="sticky bottom-22 z-20 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
        <button
          type="button"
          onClick={handleNext}
          className="h-12 w-full rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 sm:rounded-lg"
        >
          Continue to Evidence Upload
        </button>
      </div>
    </div>
  );
}

function PhotoDescriptionStep({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  toast,
}) {
  const cameraInputRef = useRef(null);

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Captured file is not an image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image exceeds 10MB limit");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      updateFormData({
        images: [...(formData.images || []), file],
        imagePreviews: [...(formData.imagePreviews || []), reader.result],
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    updateFormData({
      images: (formData.images || []).filter((_, i) => i !== index),
      imagePreviews: (formData.imagePreviews || []).filter(
        (_, i) => i !== index,
      ),
    });
  };

  const previews = formData.imagePreviews || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <MobileSection>
        <div className="space-y-6">
          <div className="space-y-1">
            <Label>
              Incident Photos <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-400">
              Take photos of the scene using your camera. Add as many as needed.
            </p>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />

          {previews.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center sm:rounded-xl sm:p-10">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-red-100 p-5">
                  <Camera className="h-12 w-12 text-red-400" />
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-gray-700">
                    No photos yet
                  </p>
                  <p className="mb-4 text-xs text-gray-400">
                    Use your camera to capture the incident scene
                  </p>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-700 sm:rounded-lg"
                  >
                    <Camera className="h-5 w-5" /> Open Camera
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  JPG, PNG • Max 10MB per photo
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-2xl border-2 border-red-100 bg-gray-50 sm:rounded-xl"
                  >
                    <img
                      src={preview}
                      alt={`Incident photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 transition-all hover:border-red-400 hover:bg-red-50/30 hover:text-red-500 sm:rounded-xl"
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs font-medium">Add Photo</span>
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 sm:rounded-lg">
                <ImageIcon className="h-4 w-4 shrink-0 text-green-600" />
                <p className="flex-1 text-xs font-medium text-green-800">
                  {previews.length} photo{previews.length > 1 ? "s" : ""} captured
                </p>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-700"
                >
                  <Camera className="h-3.5 w-3.5" /> Take More
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Incident Description</Label>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
                Optional
              </span>
            </div>
            <Textarea
              id="description"
              placeholder="Describe what happened, what you saw, and any other relevant details..."
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-gray-400">
              Additional details help emergency responders prepare
            </p>
          </div>
        </div>
      </MobileSection>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 sm:rounded-lg">
        <h4 className="mb-2 text-sm font-semibold text-red-600">
          Evidence Guidelines
        </h4>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Capture the overall scene from a safe distance</li>
          <li>• Include visible landmarks or street signs if possible</li>
          <li>• Multiple angles help responders assess severity</li>
          <li>• Never put yourself at risk to take photos</li>
        </ul>
      </div>

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
          onClick={() => {
            if (!formData.images || formData.images.length === 0)
              return toast.error(
                "Please take at least one photo of the incident.",
              );
            onNext();
          }}
          className="h-12 rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 sm:rounded-lg"
        >
          Continue to Contact Info
        </button>
      </div>
    </div>
  );
}

function PhoneSubmitStep({
  formData,
  updateFormData,
  onSubmit,
  onPrevious,
  toast,
  isSubmitting,
}) {
  const handleSubmit = async () => {
    if (!formData.phone.trim())
      return toast.error("Please enter your phone number.");
    if (formData.phone.length < 10)
      return toast.error("Please enter a valid phone number.");
    if (formData.phone.length > 10)
      return toast.error("Please enter a valid phone number.");
    onSubmit();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <MobileSection>
        <div className="space-y-6">
          <div className="space-y-2 pb-2 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-100 p-5">
                <Phone className="h-12 w-12 text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Contact Information
            </h3>
            <p className="mx-auto max-w-sm text-sm text-gray-500">
              Provide your phone number so responders can reach you for
              additional details.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) =>
                  updateFormData({ phone: e.target.value.replace(/\D/g, "") })
                }
                maxLength={15}
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 sm:rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-400">
              Used only for emergency response communication
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700">
              Report Summary
            </h4>
            <div className="mt-3 space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Incident Type</span>
                <span className="font-medium capitalize">
                  {formData.incidentType || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Casualties</span>
                <span className="font-medium">{formData.casualties || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Location Pinned</span>
                <span
                  className={`font-medium ${
                    formData.latitude ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {formData.latitude ? "Yes ✓" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Photos</span>
                <span className="font-medium">
                  {(formData.images || []).length} attached
                </span>
              </div>
            </div>
          </div>
        </div>
      </MobileSection>

      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 sm:rounded-lg">
        <h4 className="mb-2 text-sm font-semibold text-red-600">
          Why We Need Your Number
        </h4>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Allow responders to contact you for additional information</li>
          <li>• Keep you updated on the response status</li>
          <li>• Create accountability for emergency system integrity</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 sm:rounded-lg">
        <strong>Privacy Notice:</strong> Your phone number is only used for
        emergency response purposes and will be handled according to our privacy
        policy.
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
            "Submit Emergency Report"
          )}
        </button>
      </div>
    </div>
  );
}

export default function AccidentReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [reportId, setReportId] = useState();
  const [formData, setFormData] = useState({
    location: "",
    latitude: null,
    longitude: null,
    casualties: "2",
    incidentType: "accident",
    images: [],
    imagePreviews: [],
    description: "",
    phone: "",
  });

  const { mutate: createReport, isPending: isCreatingReport } =
    useCreateReport();

  const updateFormData = (data) =>
    setFormData((prev) => ({ ...prev, ...data }));

  const handleNext = () => {
    window?.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((p) => Math.min(p + 1, STEPS.length));
  };

  const handlePrevious = () => {
    window?.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const handleSubmit = () => {
    createReport(
      {
        location: {
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        estimated_number_of_casualties: parseInt(formData.casualties, 10),
        incident_type: formData.incidentType,
        description: formData.description,
        phone_number: formData.phone,
        photos: formData.images,
      },
      {
        onSuccess: (data) => {
          toast.success("Emergency report submitted successfully.");
          setIsComplete(true);
          setReportId(data?.data?.report_id);
        },
        onError: () => {
          toast.error("Failed to submit report. Please try again.");
          setCurrentStep(3);
        },
      },
    );
  };

  const handleReset = () => {
    setIsComplete(false);
    setCurrentStep(1);
    setFormData({
      location: "",
      latitude: null,
      longitude: null,
      casualties: "2",
      incidentType: "accident",
      images: [],
      imagePreviews: [],
      description: "",
      phone: "",
    });
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
          {isComplete ? (
            <div className="rounded-2xl bg-white p-5 text-center shadow-sm sm:rounded-none sm:p-0 sm:shadow-none">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-5">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                Report Submitted Successfully!
              </h3>
              <p className="mx-auto mb-8 max-w-md text-sm text-gray-500">
                Your emergency report has been received and dispatched to nearby
                responders. Help is on the way.
              </p>
              <div className="mx-auto mb-4 max-w-xs rounded-xl border border-red-100 bg-red-50 p-4 sm:rounded-lg">
                <p className="mb-1 text-sm text-gray-600">
                  Report ID:{" "}
                  <Link
                    href={`/track_report?report_id=${reportId}`}
                    className="font-mono font-bold text-red-600"
                  >
                    {reportId}
                  </Link>
                </p>
                <p className="text-xs text-gray-400">Save this ID for tracking</p>
              </div>
              <div className="mb-8 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="h-3.5 w-3.5" />
                <span>Emergency services have been notified.</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:rounded-lg"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
                <div className="text-center">
                  <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Report an Emergency
                  </h2>
                  <p className="text-sm text-gray-500">
                    Your quick action can save lives. Please provide accurate
                    information about the incident.
                  </p>
                </div>
              </div>

              <StepProgressBar currentStep={currentStep} />

              <div className="relative z-0 bg-white">
                {currentStep === 1 && (
                  <IncidentDetailsStep
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={handleNext}
                    toast={toast}
                  />
                )}
                {currentStep === 2 && (
                  <PhotoDescriptionStep
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    toast={toast}
                  />
                )}
                {currentStep === 3 && (
                  <PhoneSubmitStep
                    formData={formData}
                    updateFormData={updateFormData}
                    onSubmit={handleSubmit}
                    onPrevious={handlePrevious}
                    toast={toast}
                    isSubmitting={isCreatingReport}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}