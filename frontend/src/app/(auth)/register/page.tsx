"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const onRegister = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/register", form);
      setSuccessMessage("We have sent an OTP to your email. Please check it and enter it below.");
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (e: any) { 
      toast.error(e.response?.data?.message || "Registration failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const onVerifyOtp = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/verify-register", { email: form.email, otp });
      toast.success("Account created successfully! Please sign in.");
      router.push("/login");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-2xl shadow-2xl relative z-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {step === 1 ? "Create Account" : "Verify OTP"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {step === 1 ? "Join the ShelfLoop reader community" : `Enter the verification code sent to ${form.email}`}
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-medium">
          {successMessage}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={onRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required placeholder="Ahmed Ghazal" className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required type="email" placeholder="dev.ghazaleco@gmail.com" className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required placeholder="••••••••" className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-violet-500" />
            </div>
          </div>

          <button disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20">
            <span>{loading ? "Sending OTP..." : "Continue"}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Verification Code</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input value={otp} onChange={e=>setOtp(e.target.value)} required placeholder="123456" className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 text-center tracking-[0.5em] text-lg font-mono text-violet-400 focus:outline-none focus:border-violet-500" />
            </div>
          </div>

          <button disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20">
            <span>{loading ? "Verifying..." : "Verify & Complete Registration"}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Already have an account? <Link href="/login" className="text-violet-400 font-bold hover:underline">Sign In</Link>
      </p>
    </motion.div>
  );
}