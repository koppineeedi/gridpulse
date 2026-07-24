import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, Eye, X, CheckCircle, AlertTriangle, 
  User, Check, Clock, Phone, Mail, MapPin, Award, Power, Key, Sparkles, RefreshCw
} from "lucide-react";
import API from "../services/api";

const TechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);

  
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [skillCategory, setSkillCategory] = useState("Junior Technician");
  const [address, setAddress] = useState("");
  const [availability, setAvailability] = useState("AVAILABLE");

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await API.get("/technicians");
      setTechnicians(res.data);
      setError("");
    } catch (err) {
      console.error("Failed to load technicians list", err);
      setError("Failed to fetch technicians. Please make sure you are logged in as Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const resetForm = () => {
    setFullName("");
    setEmployeeId("");
    setEmail("");
    setPhone("");
    setSpecialization("");
    setExperience("");
    setSkillCategory("Junior Technician");
    setAddress("");
    setAvailability("AVAILABLE");
  };

  const handleAddTechnician = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName,
        employeeId,
        email,
        phone,
        specialization,
        experience: parseInt(experience) || 0,
        skillCategory,
        address,
        availability
      };
      const res = await API.post("/technicians", payload);
      setActionMsg(`Technician ${res.data.fullName} created successfully. Username & temporary credentials printed to console/email.`);
      setAddModalOpen(false);
      resetForm();
      fetchTechnicians();
      setTimeout(() => setActionMsg(""), 6000);
    } catch (err) {
      console.error("Failed to create technician", err);
      setError(err.response?.data?.message || "Failed to create technician profile.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleEditTechnician = async (e) => {
    e.preventDefault();
    if (!selectedTech) return;
    try {
      const payload = {
        fullName,
        employeeId,
        email,
        phone,
        specialization,
        experience: parseInt(experience) || 0,
        skillCategory,
        address,
        availability
      };
      await API.put(`/technicians/${selectedTech.id}`, payload);
      setActionMsg(`Profile for ${fullName} updated successfully.`);
      setEditModalOpen(false);
      setSelectedTech(null);
      resetForm();
      fetchTechnicians();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("Failed to edit technician", err);
      setError("Failed to update technician details.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const openEditModal = (tech) => {
    setSelectedTech(tech);
    setFullName(tech.fullName || "");
    setEmployeeId(tech.employeeId || "");
    setEmail(tech.email || "");
    setPhone(tech.phone || "");
    setSpecialization(tech.specialization || "");
    setExperience(tech.experience ? tech.experience.toString() : "");
    setSkillCategory(tech.skillCategory || "Junior Technician");
    setAddress(tech.address || "");
    setAvailability(tech.availability || "AVAILABLE");
    setEditModalOpen(true);
  };

  const handleToggleStatus = async (tech) => {
    const nextEnabled = !tech.user?.enabled;
    try {
      await API.put(`/technicians/${tech.id}/toggle?enabled=${nextEnabled}`);
      setActionMsg(`Technician login access ${nextEnabled ? "ENABLED" : "DISABLED"} for ${tech.fullName}.`);
      fetchTechnicians();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("Failed to toggle technician status", err);
      setError("Failed to change account status.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleResetPassword = async (tech) => {
    if (!window.confirm(`Are you sure you want to reset password for ${tech.fullName}? A new temporary credentials package will be generated and emailed.`)) return;
    try {
      await API.post(`/technicians/${tech.id}/reset-password`);
      setActionMsg(`Temporary password successfully reset for ${tech.fullName}. Checked email/console logs for credentials.`);
      fetchTechnicians();
      setTimeout(() => setActionMsg(""), 6000);
    } catch (err) {
      console.error("Failed to reset password", err);
      setError("Failed to reset password.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleDeleteTechnician = async (id) => {
    if (!window.confirm("Are you sure you want to delete this technician? This will remove their credentials and link records permanently.")) return;
    try {
      await API.delete(`/technicians/${id}`);
      setActionMsg("Technician profile deleted successfully.");
      fetchTechnicians();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("Failed to delete technician", err);
    }
  };

  const filteredTechs = technicians.filter(t => {
    const name = t.fullName || "";
    const empId = t.employeeId || "";
    const spec = t.specialization || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           empId.toLowerCase().includes(searchQuery.toLowerCase()) || 
           spec.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-bold tracking-tight text-white">Technician Management</h1>
          <p className="text-slate-400 text-sm mt-1">Register, configure credentials, and manage state logs for the field workforce.</p>
        </div>
        <button
          onClick={() => { resetForm(); setAddModalOpen(true); }}
          className="bg-brandBlue hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-brandBlue/10 transition-all self-start sm:self-center"
        >
          <Plus size={16} /> Add Technician
        </button>
      </div>

      {}
      {actionMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {actionMsg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {}
      <div className="glass-panel bg-cardBg border border-cardBorder/60 rounded-3xl p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, employee ID, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-cardBorder rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue/20 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="animate-spin text-brandBlue mr-2" size={20} />
            <span className="text-xs text-slate-500">Loading technician records...</span>
          </div>
        ) : filteredTechs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-8 text-center">No technicians found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead>
                <tr className="border-b border-cardBorder text-slate-500 text-left">
                  <th className="pb-3 font-semibold">Employee ID</th>
                  <th className="pb-3 font-semibold">Full Name</th>
                  <th className="pb-3 font-semibold">Specialization</th>
                  <th className="pb-3 font-semibold">Experience</th>
                  <th className="pb-3 font-semibold">Username</th>
                  <th className="pb-3 font-semibold">Login Status</th>
                  <th className="pb-3 font-semibold">Availability</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBorder/40">
                {filteredTechs.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-3.5 font-bold text-slate-400">{t.employeeId}</td>
                    <td className="py-3.5 font-bold text-slate-200">{t.fullName}</td>
                    <td className="py-3.5">{t.specialization}</td>
                    <td className="py-3.5">{t.experience} Years</td>
                    <td className="py-3.5 text-slate-400 font-mono">{t.user?.username || "unlinked"}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.user?.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {t.user?.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        {
                          AVAILABLE: "bg-emerald-500/15 text-emerald-400",
                          BUSY: "bg-amber-500/15 text-amber-400",
                          OFFLINE: "bg-slate-800 text-slate-500",
                          ON_LEAVE: "bg-red-500/15 text-red-400"
                        }[t.availability] || "bg-slate-800 text-slate-400"
                      }`}>
                        {t.availability}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => { setSelectedTech(t); setDetailsModalOpen(true); }}
                        className="p-1.5 text-slate-450 hover:text-white hover:bg-slate-800 rounded"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 text-brandBlue hover:text-blue-400 hover:bg-slate-800 rounded"
                        title="Edit profile"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className={`p-1.5 rounded ${t.user?.enabled ? "text-red-400 hover:bg-red-500/10" : "text-emerald-400 hover:bg-emerald-500/10"}`}
                        title={t.user?.enabled ? "Disable Login Account" : "Enable Login Account"}
                      >
                        <Power size={14} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(t)}
                        className="p-1.5 text-amber-400 hover:text-amber-305 hover:bg-slate-800 rounded"
                        title="Reset Credentials"
                      >
                        <Key size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTechnician(t.id)}
                        className="p-1.5 text-red-400 hover:text-red-305 hover:bg-slate-800 rounded"
                        title="Delete Profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddTechnician} className="glass-panel w-full max-w-lg p-6 bg-cardBg shadow-2xl space-y-4 rounded-3xl max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-cardBorder pb-3">
              <h3 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-1.5">
                <Plus size={18} className="text-brandBlue" /> Add Technician Account
              </h3>
              <button type="button" onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Employee ID</label>
                <input type="text" required placeholder="e.g. TECH-025" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Mobile Number</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Specialization</label>
                <input type="text" required placeholder="e.g. Transformer Specialist" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Experience (Years)</label>
                <input type="number" required value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Skill Category</label>
                <select value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none">
                  <option value="Senior Specialist">Senior Specialist</option>
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="Junior Technician">Junior Technician</option>
                  <option value="Assistant Technician">Assistant Technician</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Availability Status</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none">
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-400 font-bold">Home Address</label>
                <textarea required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl p-3 h-16 focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button type="button" onClick={() => setAddModalOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold px-4.5 py-2.5 rounded-xl">Cancel</button>
              <button type="submit" className="bg-brandBlue hover:bg-blue-600 text-white font-bold px-4.5 py-2.5 rounded-xl">Generate Login & Save</button>
            </div>
          </form>
        </div>
      )}

      {}
      {editModalOpen && selectedTech && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditTechnician} className="glass-panel w-full max-w-lg p-6 bg-cardBg shadow-2xl space-y-4 rounded-3xl max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-cardBorder pb-3">
              <h3 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-1.5">
                <Edit2 size={18} className="text-brandBlue" /> Edit Technician Profile
              </h3>
              <button type="button" onClick={() => { setEditModalOpen(false); setSelectedTech(null); }} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Full Name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Employee ID</label>
                <input type="text" disabled value={employeeId} className="w-full bg-slate-900/60 border border-cardBorder text-slate-500 rounded-xl px-3 py-2.5 focus:outline-none cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Mobile Number</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Specialization</label>
                <input type="text" required value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Experience (Years)</label>
                <input type="number" required value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Skill Category</label>
                <select value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none">
                  <option value="Senior Specialist">Senior Specialist</option>
                  <option value="Lead Engineer">Lead Engineer</option>
                  <option value="Junior Technician">Junior Technician</option>
                  <option value="Assistant Technician">Assistant Technician</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">Availability Status</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none">
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-400 font-bold">Home Address</label>
                <textarea required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl p-3 h-16 focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button type="button" onClick={() => { setEditModalOpen(false); setSelectedTech(null); }} className="bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold px-4.5 py-2.5 rounded-xl">Cancel</button>
              <button type="submit" className="bg-brandBlue hover:bg-blue-600 text-white font-bold px-4.5 py-2.5 rounded-xl">Save Changes</button>
            </div>
          </form>
        </div>
      )}

      {}
      {detailsModalOpen && selectedTech && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 bg-cardBg border border-cardBorder shadow-2xl space-y-4 rounded-3xl text-left">
            <div className="flex items-center justify-between border-b border-cardBorder pb-3">
              <h3 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-1.5">
                <User size={18} className="text-brandBlue" /> Technician Details
              </h3>
              <button onClick={() => { setDetailsModalOpen(false); setSelectedTech(null); }} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-cardBorder/30">
                <div className="w-12 h-12 rounded-xl bg-brandBlue/10 border border-brandBlue/20 text-brandBlue flex items-center justify-center font-bold text-lg font-outfit uppercase">
                  {(selectedTech.fullName || "T").charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{selectedTech.fullName || "N/A"}</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Emp ID: {selectedTech.employeeId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[9px] block">Username</span>
                  <span className="font-mono text-slate-350 text-[11px]">{selectedTech.user?.username || "N/A"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[9px] block">Email</span>
                  <span className="text-slate-350 text-[11px] flex items-center gap-1"><Mail size={11} /> {selectedTech.email || "N/A"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[9px] block">Phone</span>
                  <span className="text-slate-350 text-[11px] flex items-center gap-1"><Phone size={11} /> {selectedTech.phone || "N/A"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[9px] block">Specialization</span>
                  <span className="text-slate-350 text-[11px]">{selectedTech.specialization}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[9px] block">Category</span>
                  <span className="text-slate-350 text-[11px]">{selectedTech.skillCategory || "Junior Technician"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[9px] block">Experience</span>
                  <span className="text-slate-350 text-[11px] flex items-center gap-1"><Award size={11} /> {selectedTech.experience} Years</span>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-slate-500 font-bold uppercase text-[9px] block">Address</span>
                  <span className="text-slate-355 text-[11px] flex items-center gap-1"><MapPin size={11} /> {selectedTech.address || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => { setDetailsModalOpen(false); setSelectedTech(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianManagement;
