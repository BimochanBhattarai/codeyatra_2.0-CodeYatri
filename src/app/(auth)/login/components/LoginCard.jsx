"use client";

import { useLoginUser } from "@/hooks/user/useLoginUser";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ phone: "", password: "" });
  const [errors, setErrors] = useState({});

  const { mutate: loginUser, isPending: isLoggingIn } = useLoginUser();
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(form.phone))
      newErrors.phone = "Enter a valid 10-digit phone number.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters.";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    loginUser(
      { phone_number: form.phone, password: form.password },
      {
        onSuccess: () => {
          toast.success("Logged in successfully! Welcome back.");
          router.push("/dashboard");
        },
        onError: (err) => {
          toast.error(err?.message || "Invalid credentials. Please try again.");
        },
      },
    );
  };

  return (
    <div className="container max-w-4xl bg-white px-4 py-4 pb-28 sm:px-0 sm:py-8 sm:pb-8">
      <div className="mx-auto max-w-md space-y-5 rounded-2xl bg-white p-5 shadow-sm sm:max-w-none sm:space-y-5 sm:rounded-none sm:bg-transparent sm:p-0 sm:shadow-none">
        <div className="space-y-1 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500">
            Sign in to the emergency response network
          </p>
        </div>

        <div className="space-y-5">
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
                onChange={handleChange}
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
                Enter the number linked to your account
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
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
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
              <p className="text-xs text-gray-400">
                Use your account password to continue
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoggingIn}
            className="h-12 w-full rounded-xl bg-red-600 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 sm:rounded-lg"
          >
            {isLoggingIn ? "Signing in..." : "Login"}
          </button>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:hidden">
            <p className="text-center text-xs leading-5 text-gray-500">
              Secure access for emergency responders, administrators, and system
              users.
            </p>
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-red-600 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;