"use client";

import AdminAuthProvider from "@/components/admin/AdminAuthProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

function layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state: any) => state.admin?.isAdminAuthenticated,
  );

  useEffect(() => {
    if (isAuthenticated !== undefined && isAuthenticated === false) {
      router.push("/admin/login");
    }
  }, [isAuthenticated]);

  console.log("Layout called");
  console.log("Auth: ", isAuthenticated);

  return (
    <>
      <AdminAuthProvider>
        <AdminHeader />
        <main className="mt-14.5 ml-[14rem]">{children}</main>
      </AdminAuthProvider>
    </>
  );
}

export default layout;
