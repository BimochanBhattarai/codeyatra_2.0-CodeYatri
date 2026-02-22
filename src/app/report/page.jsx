"use client";

import { useCreateReport } from "@/hooks/useCreateReport";
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
import { useEffect, useRef, useState } from "react";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="relative w-full rounded-xl overflow-hidden border-2 border-gray-200"
        style={{ height: "256px" }}
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
        Click anywhere on the map to pin the incident location
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
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${className}`}
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
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none ${className}`}
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

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm text-white font-medium pointer-events-auto max-w-xs
            ${t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-gray-800"}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );

  return { toast, ToastContainer };
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgressBar({ currentStep }) {
  const progressValue = (currentStep / STEPS.length) * 100;
  return (
    <div className="bg-white">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm text-red-600 font-medium">
            {Math.round(progressValue)}% Complete
          </span>
        </div>
        <Progress value={progressValue} />
      </div>
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
                <CheckCircle2 className="w-5 h-5" />
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

// ─── Step 1: Incident Details ─────────────────────────────────────────────────

function IncidentDetailsStep({ formData, updateFormData, onNext, toast }) {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateFormData({
          location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          latitude,
          longitude,
        });
        toast.success("Location detected successfully");
        setIsLoadingLocation(false);
      },
      () => {
        toast.error("Unable to get location. Please enable location services.");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
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
      return toast.error("Please pin the incident location on the map");
    if (!formData.casualties.trim())
      return toast.error("Please estimate the number of casualties");
    if (!formData.incidentType)
      return toast.error("Please select the incident type");
    onNext();
  };

  return (
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
          className="w-full h-10 flex items-center justify-center gap-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Detecting Location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" /> Use My Current Location
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-xs text-green-800 font-medium">
              Location pinned successfully.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="casualties">
          Estimated Number of Casualties <span className="text-red-500">*</span>
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
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all hover:bg-gray-50 ${
                  selected ? "border-red-600 bg-red-50" : "border-gray-200"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${selected ? "bg-red-600 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${selected ? "text-red-700" : "text-gray-700"}`}
                  >
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-400">{type.description}</p>
                </div>
                <div
                  className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected ? "border-red-600 bg-red-600" : "border-gray-300"
                  }`}
                >
                  {selected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-red-600 mb-2">
          Critical Information
        </h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>
            • Precise location helps dispatch the nearest emergency services
          </li>
          <li>• Casualty count helps prepare adequate medical resources</li>
          <li>• Incident type determines the right response team</li>
          <li>
            • All information is shared with police and ambulance services
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-sm"
      >
        Continue to Evidence Upload
      </button>
    </div>
  );
}

// ─── Step 2: Photo & Description ──────────────────────────────────────────────

function PhotoDescriptionStep({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  toast,
}) {
  const cameraInputRef = useRef(null);

  // Each tap of the camera button adds one photo
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
      toast.success("Photo added");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Label>
          Incident Photos <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-400">
          Take photos of the scene using your camera. Add as many as needed.
        </p>
      </div>

      {/* Camera capture input — always hidden, triggered by button */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Empty state — big camera CTA */}
      {previews.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-red-100 rounded-full p-5">
              <Camera className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                No photos yet
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Use your camera to capture the incident scene
              </p>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all text-sm"
              >
                <Camera className="w-5 h-5" /> Open Camera
              </button>
            </div>
            <p className="text-xs text-gray-400">
              JPG, PNG • Max 10MB per photo
            </p>
          </div>
        </div>
      ) : (
        /* Photo grid with add more button */
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative rounded-xl overflow-hidden border-2 border-red-100 bg-gray-50 aspect-square"
              >
                <img
                  src={preview}
                  alt={`Incident photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add more — tapping opens camera again */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50/30 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-red-500 transition-all"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">Add Photo</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <ImageIcon className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-xs text-green-800 font-medium flex-1">
              {previews.length} photo{previews.length > 1 ? "s" : ""} captured
            </p>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            >
              <Camera className="w-3.5 h-3.5" /> Take More
            </button>
          </div>
        </div>
      )}

      {/* Description — Optional */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Incident Description</Label>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
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

      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-red-600 mb-2">
          Evidence Guidelines
        </h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Capture the overall scene from a safe distance</li>
          <li>• Include visible landmarks or street signs if possible</li>
          <li>• Multiple angles help responders assess severity</li>
          <li>• Never put yourself at risk to take photos</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="flex-1 h-12 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg transition-all text-sm"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => {
            if (!formData.images || formData.images.length === 0)
              return toast.error(
                "Please take at least one photo of the incident",
              );
            onNext();
          }}
          className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all text-sm"
        >
          Continue to Contact Info
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Phone + Submit ───────────────────────────────────────────────────

function PhoneSubmitStep({
  formData,
  updateFormData,
  onSubmit,
  onPrevious,
  toast,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.phone.trim())
      return toast.error("Please enter your phone number");
    if (formData.phone.length < 10)
      return toast.error("Please enter a valid phone number");

    setIsSubmitting(true);
    // TODO: Submit formData to backend API here
    await new Promise((r) => setTimeout(r, 1200)); // simulate API call
    setIsSubmitting(false);
    toast.success("Emergency report submitted!");
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 pb-2">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-5">
            <Phone className="w-12 h-12 text-red-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Contact Information
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Provide your phone number so responders can reach you for additional
          details.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) =>
              updateFormData({ phone: e.target.value.replace(/\D/g, "") })
            }
            maxLength={15}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
          />
        </div>
        <p className="text-xs text-gray-400">
          Used only for emergency response communication
        </p>
      </div>

      {/* Report summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Report Summary</h4>
        <div className="space-y-2 text-xs text-gray-600">
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
              className={`font-medium ${formData.latitude ? "text-green-600" : "text-red-500"}`}
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

      <div className="bg-red-50 border border-red-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-red-600 mb-2">
          Why We Need Your Number
        </h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Allow responders to contact you for additional information</li>
          <li>• Keep you updated on the response status</li>
          <li>• Create accountability for emergency system integrity</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <strong>Privacy Notice:</strong> Your phone number is only used for
        emergency response purposes and will be handled according to our privacy
        policy.
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex-1 h-12 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg transition-all text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 h-12 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Emergency Report"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccidentReportPage() {
  const { toast, ToastContainer } = useToast();
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
  const handleNext = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length));
  const handlePrevious = () => setCurrentStep((p) => Math.max(p - 1, 1));
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
        phone: formData.phone,
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
    <div className="bg-white container py-8 space-y-8 max-w-4xl">
      <ToastContainer />

      <main className="space-y-5">
        {isComplete ? (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-5">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Report Submitted Successfully!
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
              Your emergency report has been received and dispatched to nearby
              responders. Help is on the way.
            </p>
            <div className="bg-red-50 p-4 rounded-lg max-w-xs mx-auto border border-red-100 mb-4">
              <p className="text-sm text-gray-600 mb-1">
                Report ID:{" "}
                <span className="font-mono font-bold text-red-600">
                  {reportId}
                </span>
              </p>
              <p className="text-xs text-gray-400">Save this ID for tracking</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-8">
              <Shield className="w-3.5 h-3.5" />
              <span>Emergency services have been notified.</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Report an Emergency
              </h2>
              <p className="text-gray-500 text-sm">
                Your quick action can save lives. Please provide accurate
                information about the incident.
              </p>
            </div>
            <StepProgressBar currentStep={currentStep} />
            <div className="bg-white">
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
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
