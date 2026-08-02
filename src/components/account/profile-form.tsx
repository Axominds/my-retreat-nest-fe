"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateUser as updateUserApi } from "@/lib/api/users";
import type { User } from "@/types/user";
import { toast } from "sonner";
import { User as UserIcon, Mail, Phone, Save, RotateCcw, Check } from "lucide-react";

interface ProfileFormProps {
  user: User;
  onSaved?: (user: User) => void;
}

export function ProfileForm({ user, onSaved }: ProfileFormProps) {
  const { updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges =
    name !== user.name ||
    email !== user.email ||
    phone !== (user.phone ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateUserApi(user.user_id, {
        name,
        email,
        phone: phone || null,
      });
      updateUser({ ...updated, login_type: user.login_type });
      onSaved?.(updated);
      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl"
                placeholder="Enter your full name"
              />
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl"
                placeholder="your@email.com"
              />
            </div>

            <Separator />

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="gap-2 rounded-xl px-6 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-shadow"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
