import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../Button";
import { notifyError, notifySuccess } from "../../utils/notify";
import { confirmAction } from "../../utils/confirm";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Power,
  ActivitySquare,
  ListOrdered,
} from "lucide-react";
import CctvForm from "./CCTVForm";

interface Camera {
  id: string;
  camera_name: string;
  battery_type: string;
  battery_percentage: number;
  status: string;
  notes?: string | null;
  updated_by?: string | null;
  updated_by_name?: string | null; // 👈 add this
  updated_at?: string | null;
  created_at?: string | null;
}



export default function CctvTab() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Current user & role
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Local staged values for sliders & notes edits
  const [stagedBattery, setStagedBattery] = useState<Record<string, number>>({});
  const [updatingRow, setUpdatingRow] = useState<Record<string, boolean>>({});

  const fetchMe = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id || null;
    setCurrentUserId(uid);
    if (!uid) return;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();

    if (error) {
      notifyError(`Error loading profile: ${error.message}`);
      return;
    }

    setIsAdmin(profile?.role === "admin");
  };

  const fetchCameras = async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from("v_cctv_cameras") // 👈 Use the view instead
        .select("*")
        .order("camera_name", { ascending: true });


    if (error) notifyError(`Error loading cameras: ${error.message}`);
    else {
      const list = (data as Camera[]) || [];
      setCameras(list);
      // Initialize staged values
      const staged: Record<string, number> = {};
      list.forEach((c) => (staged[c.id] = c.battery_percentage ?? 0));
      setStagedBattery(staged);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMe();
    fetchCameras();
  }, []);

  const highlightMatch = (text?: string | null) => {
    const t = text || "";
    if (!searchTerm.trim()) return t;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return t.replace(
      regex,
      `<mark class='bg-hemp-sage/40 text-hemp-forest font-semibold'>$1</mark>`
    );
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return cameras;
    const q = searchTerm.toLowerCase();
    return cameras.filter(
      (c) =>
        c.camera_name.toLowerCase().includes(q) ||
        (c.notes || "").toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q) ||
        c.battery_type.toLowerCase().includes(q)
    );
  }, [cameras, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openAdd = () => {
    setSelectedCamera(null);
    setIsFormOpen(true);
  };

  const openEdit = (cam: Camera) => {
    setSelectedCamera(cam);
    setIsFormOpen(true);
  };

  const onDelete = (id: string) => {
    if (!isAdmin) return notifyError("Only admins can delete cameras.");
    confirmAction("Delete this camera? This cannot be undone.", async () => {
      const { error } = await supabase.from("cctv_cameras").delete().eq("id", id);
      if (error) notifyError(`Error deleting camera: ${error.message}`);
      else {
        notifySuccess("🗑️ Camera deleted.");
        setCameras((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  const rowBg = (pct: number) => {
    if (pct <= 20) return "bg-red-50";
    if (pct < 50) return "bg-yellow-50";
    return "bg-white";
  };

  const labelBadge = (pct: number) => {
    if (pct <= 20) return "text-red-700 bg-red-100";
    if (pct < 50) return "text-yellow-700 bg-yellow-100";
    return "text-green-700 bg-green-100";
  };

  const updateBattery = async (cam: Camera) => {
    const pct = stagedBattery[cam.id] ?? cam.battery_percentage ?? 0;
    if (pct < 0 || pct > 100) {
      return notifyError("Battery % must be between 0 and 100.");
    }
    if (!currentUserId) return notifyError("No logged-in user.");

    setUpdatingRow((s) => ({ ...s, [cam.id]: true }));

    const payload = {
      battery_percentage: pct,
      updated_by: currentUserId,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("cctv_cameras").update(payload).eq("id", cam.id);
    if (error) {
      notifyError(`Update failed: ${error.message}`);
      setUpdatingRow((s) => ({ ...s, [cam.id]: false }));
      return;
    }

    // Insert log row for history
    await supabase.from("cctv_logs").insert({
      camera_id: cam.id,
      battery_percentage: pct,
      updated_by: currentUserId,
      created_at: new Date().toISOString(),
      note: "Battery updated via slider",
    });

    // Optimistic UI
    setCameras((prev) =>
      prev.map((c) => (c.id === cam.id ? { ...c, battery_percentage: pct, updated_by: currentUserId, updated_at: new Date().toISOString() } : c))
    );

    setUpdatingRow((s) => ({ ...s, [cam.id]: false }));
    notifySuccess("🔋 Battery updated.");
  };

  const toggleStatus = async (cam: Camera) => {
    if (!isAdmin) return notifyError("Only admins can change status.");
    const next = cam.status === "active" ? "disabled" : "active";
    const { error } = await supabase
      .from("cctv_cameras")
      .update({ status: next, updated_by: currentUserId, updated_at: new Date().toISOString() })
      .eq("id", cam.id);
    if (error) return notifyError(`Failed to update status: ${error.message}`);
    setCameras((prev) => prev.map((c) => (c.id === cam.id ? { ...c, status: next } : c)));
    notifySuccess(`⚙️ Camera ${next === "active" ? "enabled" : "disabled"}.`);
  };

  const gotoLogs = (cam: Camera) => {
    // Adjust this path to your router
    window.location.href = `/security/cctv/${cam.id}/logs`;
  };

  return (
    <section className="animate-fadeInUp text-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <ActivitySquare size={22} className="text-hemp-forest" />
          <h2 className="text-xl font-bold text-hemp-forest">CCTV Cameras</h2>
        </div>
        <div className="flex gap-2">
          <div className="hidden sm:flex items-center text-xs text-gray-500 gap-2">
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">≥ 50%</span>
            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">21–49%</span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">≤ 20%</span>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-hemp-green hover:bg-hemp-forest text-white font-semibold rounded-lg px-4 py-2 transition-all shadow-card inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add Camera
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 bg-white/70 backdrop-blur-md border border-hemp-sage/40 rounded-xl p-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name, notes, type or status…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hemp-sage/50 bg-white/60 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-hemp-green focus:border-hemp-green transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-hemp-sage rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500 inline-flex items-center gap-2 justify-center">
            <Loader2 className="animate-spin" /> Loading cameras...
          </div>
        ) : pageItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No cameras found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-hemp-sage/40 text-gray-800 font-semibold uppercase tracking-wide text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Battery</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Updated</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((cam) => {
                  const pct = stagedBattery[cam.id] ?? cam.battery_percentage ?? 0;
                  return (
                    <tr
                      key={cam.id}
                      className={`border-t border-hemp-sage/30 hover:bg-hemp-mist/50 transition-all ${rowBg(
                        pct
                      )}`}
                    >
                      <td className="px-4 py-3">
                        <div
                          className="font-medium text-gray-800"
                          dangerouslySetInnerHTML={{ __html: highlightMatch(cam.camera_name) }}
                        />
                      </td>

                      {/* Battery slider */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={pct}
                            onChange={(e) =>
                              setStagedBattery((s) => ({ ...s, [cam.id]: parseInt(e.target.value, 10) }))
                            }
                            className="w-44 accent-hemp-green"
                          />
                          <div className="flex items-center justify-between w-44">
                            <span className={`px-2 py-0.5 rounded text-xs ${labelBadge(pct)}`}>{pct}%</span>
                            <Button
                              onClick={() => updateBattery(cam)}
                              disabled={!!updatingRow[cam.id]}
                              className="px-2 py-1 text-xs bg-hemp-green hover:bg-hemp-forest text-white rounded"
                            >
                              {updatingRow[cam.id] ? (
                                <span className="inline-flex items-center gap-1">
                                  <Loader2 className="animate-spin" size={14} /> Updating
                                </span>
                              ) : (
                                "Update"
                              )}
                            </Button>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 capitalize">{cam.battery_type}</td>

                      <td className="px-4 py-3">
                        <div
                          dangerouslySetInnerHTML={{ __html: highlightMatch(cam.notes || "") }}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              cam.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {cam.status === "active" ? "Active" : "Disabled"}
                          </span>
                          {isAdmin && (
                            <Button
                              onClick={() => toggleStatus(cam)}
                              variant="outline"
                              className="px-2 py-1 text-xs border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white inline-flex items-center gap-1"
                            >
                              <Power size={14} />
                              {cam.status === "active" ? "Disable" : "Enable"}
                            </Button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {cam.updated_at ? (
                            <>
                            <div>{new Date(cam.updated_at).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                                {cam.updated_by_name || "—"}
                            </div>
                            </>
                        ) : (
                            "-"
                        )}
                        </td>


                      <td className="px-4 py-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => gotoLogs(cam)}
                          variant="outline"
                          className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                        >
                          <ListOrdered size={15} /> View Logs
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              onClick={() => openEdit(cam)}
                              variant="outline"
                              className="border-hemp-green text-hemp-forest hover:bg-hemp-green hover:text-white transition inline-flex items-center gap-1.5"
                            >
                              <Pencil size={15} /> Edit
                            </Button>
                            <Button
                              onClick={() => onDelete(cam.id)}
                              variant="ghost"
                              className="text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
                            >
                              <Trash2 size={16} /> Delete
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === page
                  ? "bg-hemp-green text-white"
                  : "bg-white text-hemp-forest border border-hemp-sage hover:bg-hemp-mist"
              }`}
            >
              {page}
            </button>
          ))}
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm bg-hemp-sage/60 hover:bg-hemp-green hover:text-white disabled:opacity-50 rounded-lg"
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      {isFormOpen && isAdmin && (
        <CctvForm
          initial={selectedCamera}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            fetchCameras();
          }}
        />
      )}
    </section>
  );
}
