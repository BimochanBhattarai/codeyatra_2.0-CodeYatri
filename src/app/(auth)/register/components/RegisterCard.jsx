"use client";

import { useRegisterUser } from "@/hooks/user/useRegisterUser";
import { useResendOtp } from "@/hooks/user/useResendOtp";
import { useVerifyPhone } from "@/hooks/user/useVerifyPhone";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Shield,
    User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Shared Components ────────────────────────────────────────────────────────

function Input({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  maxLength,
  name,
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

// ─── Step Progress Bar ────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Account Details", description: "Your info & password" },
  { id: 2, title: "Verify OTP", description: "Confirm your number" },
];

function StepProgressBar({ currentStep }) {
  const progressValue = ((currentStep - 1) / STEPS.length) * 100;
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
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
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

// ─── Step 1: Account Details ──────────────────────────────────────────────────

function AccountDetailsStep({
  form,
  errors,
  onChange,
  onSubmit,
  isSubmitting,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-5">
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
            className={`pl-10 ${errors.fullName ? "border-red-500 focus:ring-red-500" : ""}`}
          />
        </div>
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName}</p>
        )}
      </div>

      {/* Phone Number */}
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
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={onChange}
            maxLength={10}
            className={`pl-14 ${errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
          />
        </div>
        {errors.phone ? (
          <p className="text-xs text-red-500">{errors.phone}</p>
        ) : (
          <p className="text-xs text-gray-400">
            An OTP will be sent to this number
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={form.password}
            onChange={onChange}
            className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-xs text-red-500">{errors.password}</p>
        ) : (
          <p className="text-xs text-gray-400">Minimum 6 characters</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm Password <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={onChange}
            className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm"
      >
        {isSubmitting ? "Sending OTP..." : "Send OTP"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-red-600 font-medium hover:underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}

// ─── Step 2: OTP Verification ─────────────────────────────────────────────────

function OtpVerifyStep({
  phone,
  fullName,
  user_id,
  onVerify,
  onBack,
  isVerifying,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  // ✅ Fixed: useEffect with proper cleanup, stops when timer hits 0
  useEffect(() => {
    if (resendTimer === 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    onVerify(code);
  };

  const handleResend = () => {
    resendOtp(
      { user_id },
      {
        onSuccess: () => {
          setResendTimer(60);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          toast.success("OTP resent successfully! Please check your phone.");
        },
        onError: (err) => {
          toast.error(
            err?.message || "Failed to resend OTP. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="bg-red-100 rounded-full p-4">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          Verify Your Number
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          We sent a 6-digit OTP to{" "}
          <span className="font-semibold text-gray-800">+977 {phone}</span>.
          Enter it below to complete registration.
        </p>
      </div>

      {/* OTP inputs */}
      <div className="space-y-3">
        <Label className="text-center block">
          Enter OTP <span className="text-red-500">*</span>
        </Label>
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-11 h-12 text-center text-lg font-bold border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition
                ${error ? "border-red-500" : "border-gray-300"}
                ${digit ? "border-red-400 bg-red-50 text-red-700" : ""}
              `}
            />
          ))}
        </div>
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </div>

      {/* Resend */}
      <p className="text-center text-sm text-gray-500">
        Didn&apos;t receive it?{" "}
        {resendTimer > 0 ? (
          <span className="text-gray-400">Resend in {resendTimer}s</span>
        ) : (
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="text-red-600 disabled:text-red-400 disabled:cursor-not-allowed font-medium hover:underline"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        )}
      </p>

      {/* Registration summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">
          Registration Summary
        </h4>
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex justify-between">
            <span className="text-gray-400">Name</span>
            <span className="font-medium capitalize">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Phone</span>
            <span className="font-medium">+977 {phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">OTP Status</span>
            <span
              className={`font-medium ${
                otp.join("").length === 6 ? "text-green-600" : "text-gray-400"
              }`}
            >
              {otp.join("").length === 6 ? "Entered ✓" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isVerifying}
          className="flex-1 h-12 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-all text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="flex-1 h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm"
        >
          {isVerifying ? "Verifying..." : "Verify & Register"}
        </button>
      </div>
    </div>
  );
}

// ─── Main RegisterCard ────────────────────────────────────────────────────────

const RegisterCard = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    user_id: null,
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const { mutate: registerUser, isPending: isRegistering } = useRegisterUser();
  const { mutate: verifyPhone, isPending: isVerifying } = useVerifyPhone();
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(form.phone))
      newErrors.phone = "Enter a valid 10-digit phone number.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters.";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleSendOtp = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    registerUser(
      {
        full_name: form.fullName,
        phone_number: form.phone,
        password: form.password,
      },
      {
        onSuccess: (data) => {
          setForm((prev) => ({ ...prev, user_id: data?.data?.user_id }));
          toast.success("OTP sent successfully! Please check your phone.");
          setStep(2);
          setTimeout(() => {
            const firstOtpInput = document.querySelector(
              'input[inputmode="numeric"]',
            );
            firstOtpInput?.focus();
          }, 100);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to send OTP. Please try again.");
        },
      },
    );
  };

  const handleVerify = (code) => {
    verifyPhone(
      { user_id: form.user_id, verification_code: code },
      {
        onSuccess: () => {
          toast.success("Phone number verified! Your account is ready.");
          router.push("/login");
        },
        onError: (err) => {
          toast.error(
            err?.message ||
              "Failed to verify OTP. Please check the code and try again.",
          );
        },
      },
    );
  };

  return (
    <div className="bg-white container py-8 space-y-5 max-w-4xl">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-sm">
          Join the emergency response network
        </p>
      </div>

      <StepProgressBar currentStep={step} />

      {step === 1 && (
        <AccountDetailsStep
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSendOtp}
          isSubmitting={isRegistering}
        />
      )}

      {step === 2 && (
        <OtpVerifyStep
          phone={form.phone}
          fullName={form.fullName}
          user_id={form.user_id}
          onVerify={handleVerify}
          isVerifying={isVerifying}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
};

export default RegisterCard;
