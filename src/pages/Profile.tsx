import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { notifySuccess, notifyError } from "../utils/notify";
import { Loader2, Save, Lock, UserCog } from "lucide-react";

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [employeeType, setEmployeeType] = useState<"VA" | "Store">("VA");
  const [profile, setProfile] = useState({
    full_name: "",
    contact_number: "",
    emergency_contact: "",
    emergency_contact_phone: "",
    address: "",
    position: "",
    acronym: "",
    nickname: "",
    wise_tag: "",
    wise_email: "",
    bank_name: "",
    account_number: "",
    ssn_last4: "",
    driver_license_no: "",
    start_date: "",
    pay_rate: "",
    shirt_size: "",
    hoodie_size: "",
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

        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            full_name, contact_number, emergency_contact, emergency_contact_phone, address,
            position, acronym, nickname,
            wise_tag, wise_email, bank_name, account_number,
            employee_type, ssn_last4, driver_license_no, start_date, pay_rate, shirt_size, hoodie_size
          `
          )
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setEmployeeType(data.employee_type || "VA");
        setProfile({
          full_name: data.full_name ?? "",
          contact_number: data.contact_number ?? "",
          emergency_contact: data.emergency_contact ?? "",
          emergency_contact_phone: data.emergency_contact_phone ?? "",
          address: data.address ?? "",
          position: data.position ?? "",
          acronym: data.acronym ?? "",
          nickname: data.nickname ?? "",
          wise_tag: data.wise_tag ?? "",
          wise_email: data.wise_email ?? "",
          bank_name: data.bank_name ?? "",
          account_number: data.account_number ?? "",
          ssn_last4: data.ssn_last4 ?? "",
          driver_license_no: data.driver_license_no ?? "",
          start_date: data.start_date ?? "",
          pay_rate: data.pay_rate ?? "",
          shirt_size: data.shirt_size ?? "",
          hoodie_size: data.hoodie_size ?? "",
        });
      } catch (err) {
        notifyError(getErrorMessage(err) || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, []);

  // 🌿 Save editable fields
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
          emergency_contact_phone: profile.emergency_contact_phone,
          address: profile.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      notifySuccess("🌿 Profile updated successfully!");
    } catch (err) {
      notifyError(getErrorMessage(err) || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // 🌿 Change password (requires old password)
  const handleChangePassword = async () => {
    if (!oldPassword) return notifyError("Please enter your old password.");
    if (!newPassword || newPassword.length < 6)
      return notifyError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword)
      return notifyError("Passwords do not match.");

    try {
      setChangingPassword(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User not found");

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });
      if (verifyError) throw new Error("Old password is incorrect.");

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notifySuccess("🔒 Password updated successfully!");
    } catch (err) {
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

  const isStore = employeeType === "Store";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-hemp-forest flex items-center gap-2">
          <UserCog size={22} /> My Profile
        </h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isStore
              ? "bg-hemp-green/20 text-hemp-forest border border-hemp-green/30"
              : "bg-hemp-sage/30 text-hemp-forest border border-hemp-sage/50"
          }`}
        >
          {isStore ? "🛍️ Store Staff" : "💻 Virtual Assistant"}
        </span>
      </div>

      {/* 🌿 Editable Section */}
      <div className="rounded-xl border border-hemp-sage/40 bg-white/80 shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-hemp-forest">
          Personal Information
        </h2>

        <ReadOnlyField label="Email" value={email} />
        <EditableField
          label="Full Name"
          value={profile.full_name}
          onChange={(v) => setProfile({ ...profile, full_name: v })}
        />
        <EditableField
          label="Contact Number"
          value={profile.contact_number}
          onChange={(v) => setProfile({ ...profile, contact_number: v })}
        />
        <EditableField
          label="Emergency Contact"
          value={profile.emergency_contact}
          onChange={(v) => setProfile({ ...profile, emergency_contact: v })}
        />
        <EditableField
          label="Emergency Contact Phone"
          value={profile.emergency_contact_phone}
          onChange={(v) =>
            setProfile({ ...profile, emergency_contact_phone: v })
          }
        />
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
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* 🌿 Admin Details */}
      <div className="rounded-xl border border-hemp-sage/40 bg-white/80 shadow p-6 space-y-3">
        <h2 className="text-lg font-semibold text-hemp-forest">
          Admin-Managed Details
        </h2>
        <ReadOnlyField label="Position / Title" value={profile.position} />
        <ReadOnlyField label="Acronym" value={profile.acronym} />
        <ReadOnlyField label="Nickname" value={profile.nickname} />
        <ReadOnlyField label="Wise Tag" value={profile.wise_tag} />
        <ReadOnlyField label="Wise Email" value={profile.wise_email} />
        <ReadOnlyField label="Bank Name" value={profile.bank_name} />
        <ReadOnlyField label="Account Number" value={profile.account_number} />
      </div>

      {/* 🌿 Store-only section */}
      {isStore && (
        <div className="rounded-xl border border-hemp-green/40 bg-hemp-green/5 shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-hemp-forest">
            Store Employee Details
          </h2>
          <ReadOnlyField label="SSN (Last 4)" value={profile.ssn_last4} />
          <ReadOnlyField
            label="Driver’s License No."
            value={profile.driver_license_no}
          />
          <ReadOnlyField label="Start Date" value={profile.start_date} />
          <ReadOnlyField label="Pay Rate ($/hr)" value={profile.pay_rate} />
          <ReadOnlyField label="Shirt Size" value={profile.shirt_size} />
          <ReadOnlyField label="Hoodie Size" value={profile.hoodie_size} />
        </div>
      )}

      {/* 🌿 Password Change */}
      <PasswordSection
        oldPassword={oldPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        setOldPassword={setOldPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
        handleChangePassword={handleChangePassword}
        changingPassword={changingPassword}
      />
    </div>
  );
}

// helper components remain identical
function EditableField({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-hemp-forest mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-hemp-forest mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value || "—"}
        readOnly
        className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
      />
    </div>
  );
}

function PasswordSection({
  oldPassword,
  newPassword,
  confirmPassword,
  setOldPassword,
  setNewPassword,
  setConfirmPassword,
  handleChangePassword,
  changingPassword,
}: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  setOldPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  handleChangePassword: () => void;
  changingPassword: boolean;
}) {
  return (
    <div className="rounded-xl border border-hemp-sage/40 bg-white/80 shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-hemp-forest flex items-center gap-2">
        <Lock size={18} /> Change Password
      </h2>

      <PasswordField
        label="Current Password"
        value={oldPassword}
        onChange={setOldPassword}
      />
      <PasswordField
        label="New Password"
        value={newPassword}
        onChange={setNewPassword}
      />
      <PasswordField
        label="Confirm Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
      />

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
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-hemp-forest mb-1">
        {label}
      </label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-hemp-sage/50 rounded-md px-4 py-2 bg-white/60 focus:ring-2 focus:ring-hemp-green outline-none"
      />
    </div>
  );
}
