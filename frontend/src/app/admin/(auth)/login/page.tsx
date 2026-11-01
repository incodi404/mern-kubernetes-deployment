"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/assets/logo.png";

import React, { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import Loading from "@/components/admin/Loading";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { adminLogin } from "@/redux/slices/admin.slice";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function adminLoginFunc() {
    try {
      setLoading(true);
      const fieldData = {
        email: username,
        password: password,
      };
      const res = await axios.post(`${SERVER_URL}/admin/login`, fieldData, {
        withCredentials: true,
      });
      dispatch(adminLogin({}));
      router.push("/admin");
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <Loading />}
      <div className="flex h-screen items-center justify-center flex-col">
        <div>
          <section className="w-[5rem] h-[5rem]">
            <Image
              src={Logo}
              alt=""
              className="w-full h-full object-cover rounded-full"
            />
          </section>
        </div>
        <Card className="w-full max-w-sm mt-10">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email below to login to Depcom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    onChange={(eve) => setUsername(eve?.target?.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="/admin/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      onChange={(eve) => setPassword(eve?.target?.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" onClick={adminLoginFunc}>
              Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Login;
