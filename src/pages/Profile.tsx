import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { notifySuccess, notifyError } from "../utils/notify";
import { Loader2, Save, Lock } from "lucide-react";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    contact_number: "",
    emergency_contact: "",
    address: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🌿 Load current user + profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error("User not found");

        setEmail(user.email ?? "");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, contact_number, emergency_contact, address")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setProfile({
          full_name: profileData.full_name ?? "",
          contact_number: profileData.contact_number ?? "",
          emergency_contact: profileData.emergency_contact ?? "",
          address: profileData.address ?? "",
        });
      } catch (err: unknown) {
        notifyError(getErrorMessage(err) || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  // 🌿 Save profile updates
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          contact_number: profile.contact_number,
          emergency_contact: profile.emergency_contact,
          address: profile.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      notifySuccess("🌿 Profile updated successfully!");
    } catch (err: unknown) {
      notifyError(getErrorMessage(err) || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // 🌿 Change password (requires old password)
  const handleChangePassword = async () => {
    if (!oldPassword) {
      notifyError("Please enter your old password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      notifyError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      notifyError("Passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User not found");

      // Verify old password first
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });
      if (verifyError) throw new Error("Old password is incorrect.");

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notifySuccess("🔒 Password updated successfully!");
    } catch (err: unknown) {
      notifyError(getErrorMessage(err) || "Error changing password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-hemp-forest">
        Loading profile...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-hemp-forest mb-2">My Profile</h1>

      {/* 🌿 Account Info */}
      <div className="rounded-xl border border-hemp-sage/40 bg-white/80 shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-hemp-forest">
          Personal Information
        </h2>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-gray-100 cursor-not-allowed text-gray-600"
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={profile.full_name}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
            placeholder="Enter your full name"
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            Contact Number
          </label>
          <input
            type="text"
            value={profile.contact_number}
            onChange={(e) =>
              setProfile({ ...profile, contact_number: e.target.value })
            }
            placeholder="Enter contact number"
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
          />
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            Emergency Contact
          </label>
          <input
            type="text"
            value={profile.emergency_contact}
            onChange={(e) =>
              setProfile({ ...profile, emergency_contact: e.target.value })
            }
            placeholder="Enter emergency contact"
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            Address
          </label>
          <textarea
            value={profile.address}
            onChange={(e) =>
              setProfile({ ...profile, address: e.target.value })
            }
            placeholder="Enter address"
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="mt-4 flex items-center justify-center gap-2 bg-hemp-green text-white font-medium px-5 py-2 rounded-md hover:bg-hemp-forest transition disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* 🌿 Password Change */}
      <div className="rounded-xl border border-hemp-sage/40 bg-white/80 shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-hemp-forest flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h2>

        {/* Old Password */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            Current Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter your current password"
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            New Password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-hemp-forest mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            autoComplete="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
          />
        </div>

        <button
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="mt-4 flex items-center justify-center gap-2 bg-hemp-green text-white font-medium px-5 py-2 rounded-md hover:bg-hemp-forest transition disabled:opacity-50"
        >
          {changingPassword ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Lock size={18} />
          )}
          {changingPassword ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
