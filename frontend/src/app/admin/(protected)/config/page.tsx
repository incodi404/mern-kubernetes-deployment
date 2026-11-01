"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "@/constant";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";
import Loading from "@/components/admin/Loading";

type SocialLink = {
  platform: string;
  link: string;
};

type ComparisonParameter = "Highest" | "Average" | "Lowest";

const ConfigPage = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // fields
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [comparisonParameter, setComparisonParameter] =
    useState<ComparisonParameter>("Average");
  const [notifyEmails, setNotifyEmails] = useState<string[]>([]);

  useEffect(() => {
    fetchConfigFunc();
  }, []);

  async function fetchConfigFunc() {
    try {
      setFetching(true);
      const res = await axios.get(`${SERVER_URL}/config`, {
        withCredentials: true,
      });
      const data = res?.data?.data;
      if (data) {
        setSocialLinks(data?.socialLinks || []);
        setComparisonParameter(data?.comparisonParameter || "Average");
        setNotifyEmails(data?.notifyEmails || []);
      }
    } catch (error: any) {
      // 404 just means no config exists yet, don't spam an error toast for that
      if (error?.response?.status !== 404) {
        console.log("ERROR: ", error?.response?.data?.message);
        toast.error(error?.response?.data?.message || "Something went wrong");
      }
    } finally {
      setFetching(false);
    }
  }

  async function updateConfigFunc() {
    try {
      setLoading(true);

      const cleanedSocialLinks = socialLinks.filter(
        (item) => item.platform.trim() && item.link.trim(),
      );
      const cleanedEmails = notifyEmails.filter((email) => email.trim());

      const fieldData = {
        socialLinks: cleanedSocialLinks,
        comparisonParameter,
        notifyEmails: cleanedEmails,
      };

      const res = await axios.put(`${SERVER_URL}/config`, fieldData, {
        withCredentials: true,
      });

      toast.success(res?.data?.message || "Config updated successfully");
    } catch (error: any) {
      console.log("ERROR: ", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // social links handlers
  function addSocialLink() {
    setSocialLinks((prev) => [...prev, { platform: "", link: "" }]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSocialLink(
    index: number,
    key: keyof SocialLink,
    value: string,
  ) {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }

  // notify emails handlers
  function addNotifyEmail() {
    setNotifyEmails((prev) => [...prev, ""]);
  }

  function removeNotifyEmail(index: number) {
    setNotifyEmails((prev) => prev.filter((_, i) => i !== index));
  }

  function updateNotifyEmail(index: number, value: string) {
    setNotifyEmails((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  }

  return (
    <>
      {(loading || fetching) && <Loading />}
      <div className="flex items-center justify-center py-10">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Site Configuration</CardTitle>
            <CardDescription>Manage notification emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-8">
              {/* Social Links */}
              {/* <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Social Links</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                  >
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>

                {socialLinks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No social links added yet.
                  </p>
                )}

                {socialLinks.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Platform (e.g. Twitter)"
                      value={item.platform}
                      onChange={(eve) =>
                        updateSocialLink(index, "platform", eve.target.value)
                      }
                    />
                    <Input
                      placeholder="Link (e.g. https://twitter.com/example)"
                      value={item.link}
                      onChange={(eve) =>
                        updateSocialLink(index, "link", eve.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeSocialLink(index)}
                      aria-label="Remove social link"
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div> */}

              {/* Comparison Parameter */}
              {/* <div className="grid gap-2">
                <Label>Comparison Parameter</Label>
                <Select
                  value={comparisonParameter}
                  onValueChange={(value) =>
                    setComparisonParameter(value as ComparisonParameter)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select comparison parameter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Highest</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              {/* Notify Emails */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Notify Emails</Label>
                  {Array.isArray(notifyEmails) && notifyEmails.length < 3 && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addNotifyEmail}
                      >
                        <Plus className="size-4" />
                        Add
                      </Button>
                    </>
                  )}
                </div>

                {notifyEmails.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No notify emails added yet.
                  </p>
                )}

                {notifyEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(eve) =>
                        updateNotifyEmail(index, eve.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeNotifyEmail(index)}
                      aria-label="Remove email"
                      className="flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="button" className="w-full" onClick={updateConfigFunc}>
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ConfigPage;
