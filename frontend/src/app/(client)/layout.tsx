import ClientHeader from "@/components/client/ClientHeader";
import ClientFooter from "@/components/client/ClientFooter";
import WhatsAppButton from "@/components/client/WhatsAppButton";
import AnnouncementBar from "@/components/client/Announcement";
import { Suspense } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Suspense fallback={null}>
        <ClientHeader />
        {children}
        <ClientFooter />
      </Suspense>
    </>
  );
}
