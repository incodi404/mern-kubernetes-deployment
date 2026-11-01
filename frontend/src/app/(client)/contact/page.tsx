"use client";

import { useState } from "react";
import axios from "axios";
import {
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";
import ContactCTA from "@/components/client/ContactCTA";
import { SERVER_URL } from "@/constant";
import { motion } from "framer-motion";

// --- Types ---
interface FormData {
  name: string;
  mobile: string;
  email: string;
  query: string;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  name: "",
  mobile: "",
  email: "",
  query: "",
};

const MAX_QUERY_LENGTH = 1000;

const GOOGLE_PLACE_ID = "ChIJk5p_XApB5DkRZ84Fm1TLB-8"; // replace with your actual Place ID
const GOOGLE_REVIEW_LINK = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

const inputClass = (hasError: boolean) =>
  `w-full pl-10 pr-4 py-2.5 bg-slate-50/50 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
      : "border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
  } outline-none transition-all duration-200`;

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- Handle input changes ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[+]?[\d\s-]{8,15}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    // email is optional, but must be valid if provided
    if (
      formData.email.trim() &&
      !/^\S+@\S+\.\S+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.query.trim()) {
      newErrors.query = "Please tell us how we can help";
    } else if (formData.query.trim().length < 10) {
      newErrors.query = "Please write at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Submit handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim().toLowerCase(),
        query: formData.query.trim(),
      };

      const response = await axios.post(`${SERVER_URL}/contact`, payload);

      if (
        response.data?.success === true ||
        response.data?.status === "SUCCESS"
      ) {
        setSuccessMessage(
          "Thank you! Your message has been sent successfully. Our team will reach out to you shortly.",
        );
        setFormData(initialFormData);
        setErrors({});
      } else {
        setErrorMessage(
          response.data?.message || "Something went wrong. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Contact form error:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          "Failed to send your message. Please check your network and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-purple-500 selection:text-white">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-linear-to-br">
        <ContactCTA isContact={true} />
      </section>

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 -mt-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* SIDEBAR: INFO & CONTACT DETAILS (4 cols) */}
          <div className="reveal-1 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Get in touch
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Our location
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Deshbandhu Para NJP Main Rd, Opposite to ICICI BANK, Ward
                      30, Deshbandhu Para, Siliguri, West Bengal 734004
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Call us
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      +91-9007035528
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Mon–Sat, 9am–7pm IST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Email us
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      info.thegaallery@gmail.com
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Response within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Instant response guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>100% secure &amp; confidential</span>
                </div>
              </div>
            </div>
          </div>

          {/* FORM CARD (8 cols) */}
          <div className="reveal-2 lg:col-span-8 bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-10">
            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-8 bg-purple-50 border border-purple-200/80 text-purple-900 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="mb-8 bg-red-50 border border-red-200/80 text-red-900 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* --- SECTION 1: Your details --- */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Your details
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={inputClass(!!errors.name)}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Mobile number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={inputClass(!!errors.mobile)}
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Email (optional) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Email address{" "}
                      <span className="text-slate-400 font-normal">
                        (optional)
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={inputClass(!!errors.email)}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: Your message --- */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Your message
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    How can we help you? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      name="query"
                      value={formData.query}
                      onChange={handleChange}
                      rows={5}
                      maxLength={MAX_QUERY_LENGTH}
                      placeholder="Tell us about your trip plans, questions or anything else you'd like to know..."
                      className={`${inputClass(!!errors.query)} resize-none`}
                    />
                  </div>
                  <div className="flex items-start justify-between mt-1.5 gap-3">
                    {errors.query ? (
                      <p className="text-red-500 text-xs font-medium">
                        {errors.query}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formData.query.length}/{MAX_QUERY_LENGTH}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- Submit Button --- */}
              <div className="pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg shadow-purple-600/20 hover:shadow-xl hover:shadow-purple-600/30 active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send message</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  By clicking send, your message will go directly to our team.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ===== MAP SECTION ===== */}
      <section className="relative bg-gradient-to-b from-purple-50/60 via-white to-white py-20 sm:py-24 overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300/60 rounded-full px-4 py-1.5 text-xs font-semibold text-amber-700 mb-5 tracking-wide uppercase">
              <MapPin className="w-3.5 h-3.5" />
              Find us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Visit our <span className="text-amber-600">office</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-10">
              Drop by for a coffee and let&apos;s plan your trip in person, or
              simply explore where we&apos;re based.
            </p>
          </motion.div>

          {/* Map frame */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/70 bg-white">
              {/* Thin gold accent bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-purple-400 to-amber-400" />

              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.420785363216!2d88.4343258!3d26.6962437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e4417dcf1d70c5%3A0xd0cf134d4bac821a!2sTHE%20GALLERY!5e1!3m2!1sen!2sin!4v1793361987783!5m2!1sen!2sin"
                width="100%"
                height="420"
                style={{ border: 0, display: "block" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* Live location badge */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              Live location · Siliguri, West Bengal
            </div>

            {/* Review CTA */}
            {/* <motion.a
              href={GOOGLE_REVIEW_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 bg-purple-900 hover:bg-purple-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-purple-900/20 transition-colors group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>
                Loved your trip?{" "}
                <span className="text-amber-400">Leave us a review</span>
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a> */}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
