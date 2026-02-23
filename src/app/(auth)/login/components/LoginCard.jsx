"use client";

import { useLoginUser } from "@/hooks/user/useLoginUser";
import { Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    <div className="bg-white container py-8 space-y-5 max-w-4xl">
      {/* Heading */}
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 text-sm">
          Sign in to the emergency response network
        </p>
      </div>

      <div className="space-y-5">
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
              onChange={handleChange}
              maxLength={10}
              className={`pl-14 ${errors.phone ? "border-red-500 focus:ring-red-500" : ""}`}
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
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
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
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoggingIn}
          className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all text-sm"
        >
          {isLoggingIn ? "Signing in..." : "Login"}
        </button>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-red-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
