"use client";

import { SERVER_URL } from "@/constant";
import { adminLogin, adminLogout } from "@/redux/slices/admin.slice";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Logo from "@/assets/logo.png";
import Image from "next/image";

function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  async function getAdminData() {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/admin/me`, {
        withCredentials: true,
      });
      // console.log("Admin data: ", res);
      const adminData = res?.data?.data || null;
      if (adminData) {
        dispatch(adminLogin({ adminData }));
      }
    } catch (error) {
      console.log("ERROR: ", error);
      dispatch(adminLogout());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAdminData();
  }, []);

  return (
    <>
      {loading && (
        <>
          <div className="flex flex-col justify-center items-center gap-5 min-h-screen">
            <section className="w-[5rem] h-[5rem]">
              <Image
                src={Logo}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </section>
            <p className="text-md font-medium text-center">Loading...</p>
          </div>
        </>
      )}

      {!loading && children}
    </>
  );
}

export default AdminAuthProvider;
