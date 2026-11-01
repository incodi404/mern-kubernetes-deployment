"use client";

import Loading from "@/components/admin/Loading";
import React, { useState } from "react";
import Logo from "@/assets/logo.png";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SERVER_URL } from "@/constant";

interface ResetProps {
  email?: string;
  setEmail?: Function;
  verifiedToken?: string;
  setVerifiedToken?: Function;
  setLoading: Function;
  loading?: boolean;
  setCurrentState?: Function;
}

function ChangePassword({ verifiedToken, setLoading, loading }: ResetProps) {
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function sendVerificationOtp() {
    if (password.trim() === "") {
      toast.error("Password is required");
    }
    try {
      setLoading(true);
      const data = {
        password: password,
        verifiedToken: verifiedToken,
      };
      const res = await axios.post(`${SERVER_URL}/admin/forgot-password`, data);
      toast.info("Password has been changed. Redirecting in 3 seconds.");
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="email">Password</Label>
          <Input
            onChange={(eve) => setPassword(eve?.target?.value)}
            placeholder="New Password"
          />
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button>Please Wait...</Button>
          ) : (
            <Button onClick={sendVerificationOtp}>Reset</Button>
          )}
        </div>
      </div>
    </>
  );
}

function VerifyOtp({
  email,
  setVerifiedToken,
  setLoading,
  loading,
  setCurrentState,
}: ResetProps) {
  const [givenOtp, setGivenOtp] = useState("");

  async function sendVerificationOtp() {
    if (givenOtp.trim() === "") {
      toast.error("OTP is required");
    }
    try {
      setLoading(true);
      const data = {
        email: email,
        givenOtp: givenOtp,
      };
      const res = await axios.post(`${SERVER_URL}/admin/verify-otp`, data);
      setVerifiedToken?.(res?.data?.data);
      setCurrentState?.("CP");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="email">OTP</Label>
          <Input
            onChange={(eve) => setGivenOtp(eve?.target?.value)}
            placeholder="X - X - X - X"
          />
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button>Please Wait...</Button>
          ) : (
            <Button onClick={sendVerificationOtp}>Verify</Button>
          )}
        </div>
      </div>
    </>
  );
}

function GenerateOtp({
  setEmail,
  setLoading,
  loading,
  setCurrentState,
}: ResetProps) {
  const [userEmail, setUserEmail] = useState("");

  async function sendVerificationOtp() {
    if (userEmail.trim() === "") {
      toast.error("Email is required");
    }
    try {
      setLoading(true);
      const data = {
        email: userEmail,
      };
      const res = await axios.post(`${SERVER_URL}/admin/generate-otp`, data);
      setEmail?.(userEmail);
      setCurrentState?.("VO");
    } catch (error: any) {
      console.log(error?.response);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input onChange={(eve) => setUserEmail(eve?.target?.value)} />
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button>Please Wait...</Button>
          ) : (
            <Button onClick={sendVerificationOtp}>Submit</Button>
          )}
        </div>
      </div>
    </>
  );
}

function page() {
  const [loading, setLoading] = useState(false);
  const [currentState, setCurrentState] = useState("OG");
  const [email, setEmail] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  return (
    <>
      {loading && <Loading />}
      <div className="w-full flex justify-center items-center h-[100vh] bg-[#fff] flex-col">
        <div className="w-full h-full flex justify-center items-center place-items-center gap-3">
          <div className="w-full flex items-center justify-center h-full flex-col gap-[2rem] z-[10]">
            <div className="flex w-full justify-center items-center mb-3">
              <Image
                src={Logo}
                className="w-[5rem] rounded-full w-[5rem] h-[5rem]"
                alt=""
              />
            </div>
            <div className="w-[28rem] border p-5 rounded-2xl border-slate-300">
              <h1 className="text-center text-xl font-bold">
                {currentState === "OG"
                  ? "Generate OTP"
                  : currentState === "VO"
                    ? "Verify OTP"
                    : "Reset Password"}
              </h1>
              <p className="text-center text-slate-500 text-sm">
                Reset your forgotten password from here
              </p>
              <div className="w-full mt-10">
                {currentState === "OG" ? (
                  <GenerateOtp
                    setEmail={setEmail}
                    setCurrentState={setCurrentState}
                    setLoading={setLoading}
                    loading={loading}
                  />
                ) : currentState === "VO" ? (
                  <VerifyOtp
                    email={email}
                    setVerifiedToken={setVerifiedToken}
                    setCurrentState={setCurrentState}
                    setLoading={setLoading}
                  />
                ) : (
                  <ChangePassword
                    email={email}
                    verifiedToken={verifiedToken}
                    setLoading={setLoading}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default page;
