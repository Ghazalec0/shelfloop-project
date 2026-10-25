"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogin = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });
      const payload = data?.data ?? data;
      if (payload?.access_token) {
        localStorage.setItem("access_token", payload.access_token);
        localStorage.setItem("user", JSON.stringify(payload.user));
      }
      toast.success("Welcome back to ShelfLoop!");
      router.push("/");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Login failed");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md p-8 rounded-3xl bg-stone-950/70 border border-amber-500/20 backdrop-blur-2xl shadow-2xl relative z-10">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30 text-stone-950 font-black text-xl">
          S
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign In</h2>
        <p className="text-xs text-stone-400 mt-1">Access your cyber library universe</p>
      </div>

      <form onSubmit={onLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="dev.ghazaleco@gmail.com" required className="w-full h-11 rounded-xl bg-stone-900 border border-stone-800 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-stone-300">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-amber-500 hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" className="w-full h-11 rounded-xl bg-stone-900 border border-stone-800 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <button disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
          <span>{loading ? "Signing in..." : "Sign In"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-stone-400">
        Don't have an account? <Link href="/register" className="text-amber-500 font-bold hover:underline">Register now</Link>
      </p>
    </motion.div>
  );
}