"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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

const LIMIT = 10;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const statusVariant = (status: Status) =>
  status === "Accepted"
    ? "default"
    : status === "Rejected"
      ? "outline"
      : "secondary";

const ContactQueries = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const hasFilters =
    debouncedSearch !== "" ||
    statusFilter !== "" ||
    startDate !== "" ||
    endDate !== "";

  async function getContacts() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      // the API only applies the date range when both ends are present;
      // the end date is pushed to the end of that day so it is included
      if (startDate && endDate) {
        params.startDate = new Date(`${startDate}T00:00:00`).toISOString();
        params.endDate = new Date(`${endDate}T23:59:59.999`).toISOString();
      }

      const res = await axios.get(`${SERVER_URL}/contact/${page}/${LIMIT}`, {
        params,
        withCredentials: true,
      });

      // the API returns either { totalPages, currentPage, data: [...] } or,
      // when there are no results, a plain empty array
      const responseData = res?.data?.data;
      if (Array.isArray(responseData)) {
        setContacts([]);
        setTotalPages(1);
      } else {
        setContacts(responseData?.data || []);
        setTotalPages(responseData?.totalPages || 1);
      }
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: "Accepted" | "Rejected") {
    try {
      setUpdatingId(id);
      await axios.patch(
        `${SERVER_URL}/contact/${id}`,
        { status },
        { withCredentials: true },
      );

      toast.success(`Query ${status.toLowerCase()}`);

      setContacts((prev) =>
        prev
          .map((item) => (item._id === id ? { ...item, status } : item))
          // drop the row if it no longer matches the active status filter
          .filter((item) => !statusFilter || item.status === statusFilter),
      );
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  }

  // wait for the user to stop typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    getContacts();
  }, [page, debouncedSearch, statusFilter, startDate, endDate]);

  return (
    <>
      {loading && <Loading />}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact queries</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Filters */}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Label htmlFor="search" className="mb-2 block">
                  Search
                </Label>
                <Search className="absolute left-3 top-1/2 size-4 translate-y-[0.2rem] text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, mobile, email or query"
                  className="max-w-md pl-9"
                  value={search}
                  onChange={(eve) => setSearch(eve?.target?.value)}
                />
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div>
                  <Label htmlFor="status" className="mb-2 block">
                    Status
                  </Label>
                  <select
                    id="status"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:w-40"
                    value={statusFilter}
                    onChange={(eve) => {
                      setStatusFilter(eve?.target?.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block">Received between</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      aria-label="Received from"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(eve) => {
                        setStartDate(eve?.target?.value);
                        setPage(1);
                      }}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      aria-label="Received to"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(eve) => {
                        setEndDate(eve?.target?.value);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>

                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>

              {((startDate && !endDate) || (!startDate && endDate)) && (
                <p className="text-sm text-muted-foreground">
                  Fill in both ends of the date range to apply it.
                </p>
              )}
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      {hasFilters
                        ? "No queries match your search or filter."
                        : "No contact queries yet."}
                    </TableCell>
                  </TableRow>
                )}
                {contacts.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span>{item.mobile}</span>
                        <span className="text-muted-foreground">
                          {item.email || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={item.query}>
                      {item.query}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/contacts/${item._id}`)
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            item.status === "Accepted" ||
                            updatingId === item._id
                          }
                          onClick={() => updateStatus(item._id, "Accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            item.status === "Rejected" ||
                            updatingId === item._id
                          }
                          onClick={() => updateStatus(item._id, "Rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContactQueries;