"use client";

import React, { useState } from "react";
import Logo from "@/assets/logo.png";
import Image from "next/image";
import {
  MdFlightTakeoff,
  MdOutlineBook,
  MdOutlineHome,
  MdOutlineImage,
  MdOutlineMessage,
  MdOutlinePinEnd,
  MdLogout,
  MdOutlineCategory,
} from "react-icons/md";
import Link from "next/link";
import { FaListAlt, FaShoppingBag } from "react-icons/fa";
import { BiSolidCategory, BiSolidCategoryAlt } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { adminLogout } from "@/redux/slices/admin.slice";
import Loading from "@/components/admin/Loading";
import { FiSend } from "react-icons/fi";
import { ShoppingBagIcon } from "lucide-react";
import { BsStars } from "react-icons/bs";
import { FaComment, FaImages, FaPlus } from "react-icons/fa6";

function AdminHeader() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const navData = [
    {
      title: "Home",
      link: "",
      icon: <MdOutlineHome className="text-md" />,
    },
    {
      title: "Configurations",
      link: "/config",
      icon: <IoMdSettings className="text-md" />,
    },
    {
      title: "Categories",
      link: "/categories",
      icon: <BiSolidCategory className="text-md" />,
    },
    {
      title: "Subcategories",
      link: "/subcategories",
      icon: <BiSolidCategory className="text-md" />,
    },
    {
      title: "Add New Product",
      link: "/products/create",
      icon: <FaPlus className="text-md" />,
    },
    {
      title: "All Products",
      link: "/products",
      icon: <FaListAlt className="text-md" />,
    },
    {
      title: "Interested Products",
      link: "/products/interested",
      icon: <FiSend className="text-md" />,
    },
    {
      title: "Banners",
      link: "/banner",
      icon: <FaImages className="text-md" />,
    },
    {
      title: "Reels",
      link: "/reels",
      icon: <FaImages className="text-md" />,
    },
    {
      title: "Contact Queries",
      link: "/contacts",
      icon: <FaComment className="text-md" />,
    },
  ];

  async function adminLogoutFunc() {
    try {
      setLoading(true);

      const res = await axios.post(
        `${SERVER_URL}/admin/logout`,
        {},
        {
          withCredentials: true,
        },
      );

      dispatch(adminLogout());

      toast.success(res?.data?.message || "Logged out successfully");
      router.push("/admin/login");
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

      <header className="bg-brand-green-hero border-b-none py-[13px] flex justify-between flex-row-reverse px-5 mb-0 z-[1000] fixed top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <p className="font-medium text-slate-950">Depcom</p>

          <section>
            <Image
              src={Logo}
              className="w-[2rem] h-[2rem] rounded-full"
              alt=""
            />
          </section>
        </div>

        <div></div>
      </header>

      <div
        className="h-screen bg-linear-to-tr from-purple-900 to-purple-950 w-[14rem] fixed top-0 left-0 pt-18 pb-0 px-2 flex flex-col justify-between overflow-y-scroll"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="space-y-1">
          {navData.map((nav, i) => {
            const fullPath = `/admin${nav.link}`;

            // Exact match
            const isActive = pathname === fullPath;

            return (
              <Link
                href={fullPath}
                key={i}
                className={`flex gap-3 transition px-3 py-3 rounded-xl items-center cursor-pointer ${
                  isActive ? "bg-white" : "hover:bg-white/10 text-white/70"
                }`}
              >
                <span
                  className={isActive ? "text-purple-950" : "text-white/70"}
                >
                  {nav.icon}
                </span>

                <p
                  className={`text-sm ${
                    isActive ? "text-purple-950 font-medium" : "text-white/80"
                  }`}
                >
                  {nav.title}
                </p>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={adminLogoutFunc}
          className="flex gap-3 hover:bg-red-500/10 bg-red-500 shadow-lg transition px-3 py-3 rounded-xl items-center cursor-pointer mb-4 w-full"
        >
          <MdLogout className="text-white text-md" />
          <p className="text-white text-sm font-semibold">Logout</p>
        </button>
      </div>
    </>
  );
}

export default AdminHeader;
