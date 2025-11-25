"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from 'next-auth/react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Upload, X, Trash2, Lock } from "lucide-react";

import { useSession } from "next-auth/react";
import Api from "../../components/Api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/********************************
 * Helpers
 ********************************/
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid w-full items-center gap-2">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function Banner({
  kind = "neutral",
  message,
}: {
  kind?: "neutral" | "success" | "error";
  message: string;
}) {
  const cls =
    kind === "success"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : kind === "error"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : "bg-zinc-100 text-zinc-800 border-zinc-200";
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${cls}`}>
      {message}
    </div>
  );
}

/********************************
 * Account Page (Name, Photo, Password, Delete)
 ********************************/
export default function AccountPage() {  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [banner, setBanner] = useState<{
    kind: "success" | "error" | "neutral";
    text: string;
  } | null>(null);

  const { data: session } = useSession();
  const api = useMemo(() => {
    const accessToken = (session as {accessToken?: string})?.accessToken;

    return accessToken ? new Api(accessToken): null;
  }, [session]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const initials = useMemo(
    () =>
      (name || email || "?")
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [name, email]
  );

  // Password modal state
  const [pwOpen, setPwOpen] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const pwValid = pw.length >= 8 && pw === pwConfirm;

  // Delete account modal state
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!api) return;
    (async () => {
      try {
        const me = await api.get_user_info();
        setName(me.name || "");
        setEmail(me.email);
        setAvatarUrl(me.avatar || "");
      } catch (e) {
        setBanner({
          kind: "error",
          text: "Failed to load your profile. Please refresh.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  const refreshUserInfo = async () => {
    if (!api) return;
    setLoading(true);
    
    try {
      const me = await api.get_user_info();
      setName(me.name || "");
      setEmail(me.email);
      setAvatarUrl(me.avatar || "");
    } catch (e) {
      setBanner({
        kind: "error",
        text: "Failed to refresh your profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPickFile = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setBanner({ kind: "error", text: "Only JPEG, PNG, GIF, and WebP images are allowed." });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setBanner({ kind: "error", text: "Image must be less than 5MB." });
      return;
    }

    if (!ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      setBanner({ kind: "error", text: "File extension not allowed. Please use JPEG, PNG, GIF, or WebP." });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setSelectedFile(file);
      setAvatarUrl(objectUrl);
      setBanner({
        kind: "success",
        text: "Profile photo updated (not yet saved).",
      });
      if (fileRef.current) fileRef.current.value = "";
    }
    img.onerror = () => {
      setBanner({ kind: "error", text: "The selected file is not a valid image." });
      URL.revokeObjectURL(objectUrl);
    };
    
    
    img.src = objectUrl;
    
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSave = async () => {
    if (!api) return;
    setSaving(true);
    selectedFile && setUploading(true);
    selectedFile && setUploadPct(0);
    setBanner(null);
    try {
      const result = await api.update_profile({ name: name.trim(), avatar: selectedFile || undefined }, selectedFile ? setUploadPct : undefined);
      setBanner({ kind: "success", text: "Profile saved." });
      setAvatarUrl(result.avatar || avatarUrl);
      setSelectedFile(null);
    } catch (e: any) {
      setBanner({ kind: "error", text: e?.message || "Save failed." });
    } finally {
      setSaving(false);
      selectedFile && setUploading(false);
    }
  };

  const onChangePassword = async () => {
    if (!api) return;
    setPwBusy(true);
    setPwError(null);
    try {
      if (!pwValid)
        throw new Error("Passwords must match and be at least 8 characters.");
      
      await api.change_password({ old_password: oldPw, new_password: pw, confirm_new_password: pwConfirm });
      
      setPw("");
      setPwConfirm("");
      setOldPw("");
      setPwOpen(false);
      setBanner({ kind: "success", text: "Password changed successfully." });
    } catch (err: any) {
      setPwError(err?.response?.data?.message || err?.message || "Unable to change password.");
    } finally {
      setPwBusy(false);
    }
  };

  const onDelete = async () => {
    if (!api) return;
    setDeleting(true);
    setBanner(null);
    try {
      await api.delete_account();
      setOpenDelete(false);
      setBanner({ kind: "success", text: "Your account was removed." });
      // TODO: redirect or sign-out
      await signOut({ callbackUrl: "/auth/login"});
    } catch (e) {
      setBanner({
        kind: "error",
        text: "Could not delete account. Try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage your profile, password, and account settings.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <div className="text-lg font-medium">{name || "Your Name"}</div>
              <div className="text-xs text-zinc-500">
                {email || "you@example.com"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onPickFile}
              disabled={uploading || loading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…{" "}
                  {uploadPct}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Change photo
                </>
              )}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 p-6">
          {banner && <Banner kind={banner.kind} message={banner.text} />}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Name" htmlFor="name">
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Email (read-only)" htmlFor="email">
                <Input id="email" value={email} disabled />
              </Field>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-zinc-500">
            Make sure to save your changes.
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={refreshUserInfo}
              disabled={saving || loading}
            >
              <X className="mr-2 h-4 w-4" /> Reset
            </Button>
            <Button onClick={onSave} disabled={saving || loading}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="my-8" />

      {/* Password */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Password</div>
            <div className="text-xs text-zinc-500">
              Change your password. You must confirm in the modal.
            </div>
          </div>
          <Button onClick={() => setPwOpen(true)} variant="secondary">
            <Lock className="mr-2 h-4 w-4" /> Change password
          </Button>
        </CardHeader>
      </Card>

      <div className="my-8" />

      {/* Danger Zone */}
      <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950">
        <CardHeader>
          <div className="text-lg font-semibold text-rose-700 dark:text-rose-300">
            Danger zone
          </div>
          <div className="text-sm text-rose-600 dark:text-rose-400">
            Permanently remove your account and all data.
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setOpenDelete(true)}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Remove my account
          </Button>
        </CardContent>
      </Card>

      {/* Password Modal */}
      <Dialog open={pwOpen} onOpenChange={(o) => !pwBusy && setPwOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter your new password and confirm. Password must be at least 8
              characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Current password" htmlFor="current-password">
              <Input
                id="current-password"
                type="password"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                placeholder="********"
              />
            </Field>
            <Field label="New password" htmlFor="new-password">
              <Input
                id="new-password"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="********"
              />
            </Field>
            <Field label="Confirm password" htmlFor="confirm-password">
              <Input
                id="confirm-password"
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="********"
              />
            </Field>
            {pwError ? <Banner kind="error" message={pwError} /> : null}
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setPwOpen(false)}
              disabled={pwBusy}
            >
              Cancel
            </Button>
            <Button onClick={onChangePassword} disabled={!pwValid || pwBusy}>
              {pwBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {pwBusy ? "Updating…" : "Update password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete account?</DialogTitle>
            <DialogDescription>
              This action is permanent. It will remove your account and
              associated data. You can’t undo this. Are you sure you want to
              continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
