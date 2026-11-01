"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import Loading from "@/components/admin/Loading";

type Status = "Pending" | "Accepted" | "Rejected";

type Contact = {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  query: string;
  status: Status;
  createdAt: string;
};

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const statusVariant = (status: Status) =>
  status === "Accepted"
    ? "default"
    : status === "Rejected"
      ? "outline"
      : "secondary";

const ContactQueryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function getContact() {
    try {
      setLoading(true);
      const res = await axios.get(`${SERVER_URL}/contact/${id}`, {
        withCredentials: true,
      });
      setContact(res?.data?.data || null);
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      if ([400, 404].includes(error?.response?.status)) {
        setNotFound(true);
      }
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: "Accepted" | "Rejected") {
    try {
      setUpdating(true);
      const res = await axios.patch(
        `${SERVER_URL}/contact/${id}`,
        { status },
        { withCredentials: true },
      );

      toast.success(`Query ${status.toLowerCase()}`);
      setContact((prev) =>
        res?.data?.data ? res.data.data : prev ? { ...prev, status } : prev,
      );
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    if (id) getContact();
  }, [id]);

  const rows: { label: string; value: React.ReactNode }[] = contact
    ? [
        { label: "Name", value: contact.name },
        { label: "Mobile", value: contact.mobile },
        { label: "Email", value: contact.email || "-" },
        {
          label: "Query",
          value: <p className="whitespace-pre-wrap">{contact.query}</p>,
        },
        {
          label: "Status",
          value: (
            <Badge variant={statusVariant(contact.status)}>
              {contact.status}
            </Badge>
          ),
        },
        { label: "Received", value: formatDateTime(contact.createdAt) },
        { label: "Query ID", value: contact._id },
      ]
    : [];

  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col gap-4 p-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/contacts")}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Contact query details</CardTitle>
            {contact && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={contact.status === "Accepted" || updating}
                  onClick={() => updateStatus("Accepted")}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  disabled={contact.status === "Rejected" || updating}
                  onClick={() => updateStatus("Rejected")}
                >
                  Reject
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {contact ? (
              <Table>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="w-40 font-medium">
                        {row.label}
                      </TableCell>
                      <TableCell className="wrap-break-word whitespace-normal">
                        {row.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              !loading && (
                <p className="py-10 text-center text-muted-foreground">
                  {notFound ? "Contact query not found." : "No data to show."}
                </p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContactQueryDetails;