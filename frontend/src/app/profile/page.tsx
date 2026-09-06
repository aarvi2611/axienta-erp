"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, Camera, Shield, Briefcase, Lock, Upload } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, normalizeRole } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    dateOfBirth: user?.dateOfBirth || "",
    bio: user?.bio || "",
  });

  const userRole = normalizeRole(user?.role);
  const canEditPhoto = userRole === "ceo" || userRole === "admin" || userRole === "hr";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      try {
        await updateDoc(doc(db, "users", user.uid), {
          avatar: dataUrl,
          updatedAt: new Date().toISOString(),
        });
        user.avatar = dataUrl;
        setEditing(false);
      } catch (err) {
        console.error("Failed to update avatar:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <PageHeader
        title="My Profile"
        description="View and edit your profile information"
        icon={User}
        actions={
          editing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4 mr-1" /> Edit Profile
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-3">
                <Avatar name={user.displayName} src={user.avatar} size="xl" className="w-24 h-24 text-2xl mx-auto border-2 border-[#D4A843]/60 shadow-lg" />
                {canEditPhoto ? (
                  <>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      title="Upload Official Biometric Photo (Authorized Admin/CEO/HR)"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#D4A843] text-slate-950 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform font-bold cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </>
                ) : (
                  <div
                    title="Profile image locked: Only CEO, Admin, or HR can change official biometric photos."
                    className="absolute bottom-0 right-0 w-8 h-8 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-full flex items-center justify-center shadow-md border border-slate-300 dark:border-slate-600"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                )}
              </div>

              {!canEditPhoto && (
                <div className="mb-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 font-semibold">
                  <Lock className="w-2.5 h-2.5 text-amber-500" /> Photo Locked (HR / Admin Managed)
                </div>
              )}

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.displayName}</h2>
              <Badge variant="gold" className="mt-2">{ROLE_LABELS[user.role] || user.role || "Executive"}</Badge>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{user.email}</p>
              <p className="text-xs text-slate-400 mt-1">ID: {user.employeeId}</p>

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{user.department || "Not assigned"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{user.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{user.address || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">Joined: {formatDate(user.joiningDate || user.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                  <Input
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <Input value={user.email} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editing}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                <Input
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                  placeholder="Full address"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!editing}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Read-only fields */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Account Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Employee ID</p>
                    <p className="text-sm font-semibold text-[#0F2557] dark:text-[#D4A843]">{user.employeeId}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Role</p>
                    <p className="text-sm font-semibold dark:text-white">{ROLE_LABELS[user.role] || user.role || "Executive"}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Department</p>
                    <p className="text-sm font-semibold dark:text-white">{user.department || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
