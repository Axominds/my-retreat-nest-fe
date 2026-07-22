"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCategories } from "@/lib/api/categories";
import { submitListingRequest } from "@/lib/api/listing-requests";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Check,
  Building2,
  DollarSign,
  Globe,
  Mail,
  Phone,
  MapPin,
  Star,
  HeartHandshake,
  Shield,
} from "lucide-react";

const LocationPicker = dynamic(
  () =>
    import("@/components/admin/location-picker").then(
      (m) => ({ default: m.LocationPicker })
    ),
  { ssr: false }
);

export default function ListYourPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    retreat_name: "",
    retreat_description: "",
    category_id: 0,
    retreat_email: "",
    retreat_phone: "",
    address: "",
    latitude: "",
    longitude: "",
    budget_min: "",
    budget_max: "",
  });

  useEffect(() => {
    getCategories({ page_size: 100 })
      .then((res) => setCategories(res.items))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const slugify = useCallback(
    (val: string) =>
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    []
  );

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.owner_name.trim()) errs.owner_name = "Required";
    if (!form.owner_email.trim()) errs.owner_email = "Required";
    if (!form.retreat_name.trim()) errs.retreat_name = "Required";
    if (!form.category_id) errs.category = "Required";
    if (!form.retreat_email.trim()) errs.retreat_email = "Required";
    if (!form.retreat_phone.trim()) errs.retreat_phone = "Required";
    if (!form.latitude || !form.longitude) errs.location = "Location is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await submitListingRequest({
        owner_name: form.owner_name,
        owner_email: form.owner_email,
        owner_phone: form.owner_phone || undefined,
        retreat_name: form.retreat_name,
        retreat_description: form.retreat_description || undefined,
        category_id: form.category_id,
        retreat_email: form.retreat_email,
        retreat_phone: form.retreat_phone,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address || undefined,
        budget_min: form.budget_min ? Number(form.budget_min) : undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : undefined,
        social_links: {},
      });
      setStep("success");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 mx-auto mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Request Submitted!</h1>
        <p className="text-muted-foreground mb-2">
          Thank you for listing your property with My Retreat Nest.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          We&apos;ll review your submission and notify you at{" "}
          <strong>{form.owner_email}</strong> within 24-48 hours.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Home
          </Button>
          <Button onClick={() => router.push("/retreats")}>
            Browse Retreats
          </Button>
        </div>
      </div>
    );
  }

  const categoryName = (id: number) =>
    categories.find((c) => c.category_id === id)?.name ?? "";

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          <Building2 className="h-3.5 w-3.5" />
          Owners
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          List Your Property
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Submit your retreat for review. Our team will verify and publish it
          within 24-48 hours.
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-primary" /> Verified listings
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="h-4 w-4 text-primary" /> Guest reviews
        </span>
        <span className="flex items-center gap-1.5">
          <HeartHandshake className="h-4 w-4 text-primary" /> Easy booking
        </span>
        <span className="flex items-center gap-1.5">
          <Check className="h-4 w-4 text-primary" /> Free to list
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Your Information
            </CardTitle>
            <CardDescription>
              Who should we contact about this listing?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="owner_name"
                value={form.owner_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner_name: e.target.value }))
                }
              />
              {errors.owner_name && (
                <p className="text-xs text-destructive">{errors.owner_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner_email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="owner_email"
                type="email"
                value={form.owner_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner_email: e.target.value }))
                }
              />
              {errors.owner_email && (
                <p className="text-xs text-destructive">{errors.owner_email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner_phone">Phone (optional)</Label>
              <Input
                id="owner_phone"
                value={form.owner_phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, owner_phone: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Retreat Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Retreat Details
            </CardTitle>
            <CardDescription>
              Tell us about your property.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="retreat_name">
                Retreat Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="retreat_name"
                value={form.retreat_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, retreat_name: e.target.value }))
                }
              />
              {errors.retreat_name && (
                <p className="text-xs text-destructive">
                  {errors.retreat_name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={String(form.category_id)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category_id: Number(v) }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category">
                    {form.category_id ? categoryName(form.category_id) : "Select category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.category_id} value={String(c.category_id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.retreat_description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    retreat_description: e.target.value,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Contact & Location
            </CardTitle>
            <CardDescription>
              How can guests reach you and where is your retreat located?
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retreat_email">
                <Mail className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                Retreat Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="retreat_email"
                type="email"
                value={form.retreat_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, retreat_email: e.target.value }))
                }
              />
              {errors.retreat_email && (
                <p className="text-xs text-destructive">
                  {errors.retreat_email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="retreat_phone">
                <Phone className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                Retreat Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="retreat_phone"
                value={form.retreat_phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, retreat_phone: e.target.value }))
                }
              />
              {errors.retreat_phone && (
                <p className="text-xs text-destructive">
                  {errors.retreat_phone}
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <LocationPicker
                address={form.address}
                latitude={form.latitude}
                longitude={form.longitude}
                required
                onChange={(data) => {
                  setErrors((e) => ({ ...e, location: "" }));
                  setForm((f) => ({ ...f, ...data }));
                }}
              />
              {errors.location && (
                <p className="text-xs text-destructive">{errors.location}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Pricing
            </CardTitle>
            <CardDescription>
              Set the expected price range for your retreat.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_min">
                <DollarSign className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                Budget Min
              </Label>
              <Input
                id="budget_min"
                type="number"
                step="0.01"
                value={form.budget_min}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget_min: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">
                <DollarSign className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                Budget Max
              </Label>
              <Input
                id="budget_max"
                type="number"
                step="0.01"
                value={form.budget_max}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget_max: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/">
            <Button variant="ghost" type="button">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
