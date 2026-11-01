"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SERVER_URL } from "@/constant";
import axios from "axios";
import { setUserData } from "@/redux/slices/user.slice";

interface RequestBookingProps {
  travel: any;
  variantId: string;
  quantity: number;
  children: React.ReactElement;
}

function RequestBooking({
  children,
  travel,
  quantity,
  variantId,
}: RequestBookingProps) {
  const userData = useSelector((state: any) => state?.user);
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setName(userData?.name || "");
    setPhone(userData?.phoneNumber || "");
  }, [userData]);

  // TODO: wire this up to the real booking-request API once it's available.
  // For now this only demonstrates the loading state on the button/inputs.
  async function submitBookingRequest() {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    dispatch(
      setUserData({
        name: name,
        phoneNumber: phone,
      }),
    );

    try {
      setLoading(true);
      const fieldData = {
        userName: name,
        userPhone: phone,
        productId: travel?._id,
        totalQuantity: quantity,
        variantId: variantId,
      };
      const res = await axios.post(
        `${SERVER_URL}/product/interested`,
        fieldData,
      );
      setIsSuccess(true);

      setTimeout(() => {
        setOpenDialog(false);
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <form onSubmit={submitBookingRequest}>
          <DialogTrigger render={children} />
          <DialogContent className="sm:max-w-sm">
            {isSuccess ? (
              <div className="">
                <section className="flex flex-col justify-center items-center gap-1">
                  <CheckCircle2
                    size={25}
                    className="text-emerald-600 shrink-0 mt-0.5"
                  />
                  <p className="text-lg font-medium leading-relaxed">Success</p>
                  <p className="text-center text-slate-500">
                    Thank you for your interest in our package. We will contact
                    you as soon as possible.
                  </p>
                </section>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Welcome, Gift Lover! 🎁</DialogTitle>
                  <DialogDescription>
                    Please share your name and phone number so we can assist you
                    with your gifting needs and keep you updated on your order.
                  </DialogDescription>
                </DialogHeader>
                <section className="space-y-5">
                  <section className="space-y-2">
                    <Label htmlFor="name-1">Name</Label>
                    <Input
                      id="name-1"
                      name="name"
                      value={name}
                      onChange={(eve) => setName(eve?.target?.value)}
                      placeholder="E.g, Pankaj Tripathi"
                      disabled={loading}
                    />
                  </section>
                  <section className="space-y-2">
                    <Label htmlFor="username-1">Phone Number</Label>
                    <Input
                      id="username-1"
                      name="username"
                      value={phone}
                      onChange={(eve) => setPhone(eve?.target?.value)}
                      placeholder="E.g, 87965245677"
                      disabled={loading}
                    />
                  </section>
                </section>
                <DialogFooter>
                  <DialogClose
                    render={
                      <Button variant="outline" disabled={loading}>
                        Cancel
                      </Button>
                    }
                  />
                  <Button disabled={loading} onClick={submitBookingRequest}>
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    Save changes
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}

export default RequestBooking;
