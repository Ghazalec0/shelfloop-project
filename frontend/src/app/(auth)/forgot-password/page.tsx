"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPage() {
  const [step, setStep] = useState<1|2|3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    try { await api.post("/auth/forgot-password", { email }); toast.success(`OTP sent to ${email} (check terminal too)`); setStep(2); }
    catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  };
  const verifyOtp = async () => {
    setLoading(true);
    try { await api.post("/auth/verify-otp", { email, otp }); toast.success("OTP Verified"); setStep(3); }
    catch (e: any) { toast.error("Invalid OTP"); }
    finally { setLoading(false); }
  };
  const resetPass = async () => {
    setLoading(true);
    try { await api.post("/auth/reset-password-otp", { email, otp, newPassword }); toast.success("Password reset! Login now"); window.location.href = "/login"; }
    catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  };

  return (
    <Card className="w-full max-w- shadow-2xl border-0">
      <CardHeader><CardTitle>Reset Password</CardTitle><CardDescription>{step === 1 ? "Enter your email to get OTP" : step === 2 ? `Enter OTP sent to ${email}` : "Set new password"}</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && <><div className="space-y-2"><Label>Email</Label><Input value={email} onChange={e=>setEmail(e.target.value)} /></div><Button className="w-full bg-black" onClick={sendOtp} disabled={loading}>Send OTP</Button></>}
        {step === 2 && <><div className="space-y-2"><Label>6-Digit OTP</Label><Input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="123456" className="text-center text-2xl tracking-[0.5em]" maxLength={6} /></div><Button className="w-full bg-black" onClick={verifyOtp} disabled={loading}>Verify OTP</Button><Button variant="ghost" className="w-full" onClick={()=>setStep(1)}>Back</Button></>}
        {step === 3 && <><div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} /></div><Button className="w-full bg-black" onClick={resetPass} disabled={loading}>Reset Password</Button></>}
      </CardContent>
    </Card>
  );
}