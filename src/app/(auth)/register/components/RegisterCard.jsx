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
  User,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
      className={`w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 sm:rounded-lg sm:py-2 ${className}`}
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
  { id: 1, title: "Account Details", description: "Your info & password" },
  { id: 2, title: "Verify OTP", description: "Confirm your number" },
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

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="space-y-5">
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
                className={`pl-10 ${
                  errors.fullName ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:hidden" />
              <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-400 sm:left-3">
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
                className={`pl-20 sm:pl-14 ${
                  errors.phone ? "border-red-500 focus:ring-red-500" : ""
                }`}
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

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={onChange}
                className={`pl-10 pr-12 ${
                  errors.password ? "border-red-500 focus:ring-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:h-8 sm:w-8"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={onChange}
                className={`pl-10 pr-12 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:h-8 sm:w-8"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:hidden">
        <p className="text-center text-xs leading-5 text-gray-500">
          Your phone number is used for OTP verification and secure account
          recovery.
        </p>
      </div>

      <div className="sticky bottom-22 z-20 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:rounded-lg"
        >
          {isSubmitting ? "Sending OTP..." : "Send OTP"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-red-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}

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

    const joined = updated.join("");
    if (joined.length === 6 && !updated.includes("")) {
      setTimeout(() => onVerify(joined), 120);
    }
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
      const split = pasted.split("");
      setOtp(split);
      setError("");
      inputRefs.current[5]?.focus();
      setTimeout(() => onVerify(pasted), 120);
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
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <Shield className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Verify Your Number
            </h3>
            <p className="mx-auto max-w-xs text-sm text-gray-500">
              We sent a 6-digit OTP to{" "}
              <span className="font-semibold text-gray-800">+977 {phone}</span>.
              Enter it below to complete registration.
            </p>
          </div>

          <div className="space-y-3">
            <Label className="block text-center">
              Enter OTP <span className="text-red-500">*</span>
            </Label>

            <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`h-12 w-11 rounded-xl border text-center text-lg font-bold transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 sm:h-12 sm:w-11 sm:rounded-lg
                    ${error ? "border-red-500" : "border-gray-300"}
                    ${digit ? "border-red-400 bg-red-50 text-red-700" : "bg-white"}
                  `}
                />
              ))}
            </div>

            {error && <p className="text-center text-xs text-red-500">{error}</p>}
          </div>

          <p className="text-center text-sm text-gray-500">
            Didn&apos;t receive it?{" "}
            {resendTimer > 0 ? (
              <span className="text-gray-400">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                disabled={isResending}
                onClick={handleResend}
                className="font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-red-400"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
            )}
          </p>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700">
              Registration Summary
            </h4>
            <div className="mt-2 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Name</span>
                <span className="truncate font-medium capitalize">
                  {fullName}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-400">Phone</span>
                <span className="font-medium">+977 {phone}</span>
              </div>
              <div className="flex justify-between gap-3">
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
        </div>
      </div>

      <div className="sticky bottom-22 z-20 grid grid-cols-2 gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur sm:static sm:bg-transparent sm:p-0 sm:shadow-none">
        <button
          type="button"
          onClick={onBack}
          disabled={isVerifying}
          className="h-12 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-lg"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
          className="h-12 rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:rounded-lg"
        >
          {isVerifying ? "Verifying..." : "Verify & Register"}
        </button>
      </div>
    </div>
  );
}

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
    <div className="container max-w-4xl bg-white px-4 py-4 pb-28 sm:px-0 sm:py-8 sm:pb-8">
      <div className="mx-auto space-y-5 sm:max-w-none">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500">
              Join the emergency response network
            </p>
          </div>
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
    </div>
  );
};

export default RegisterCard;