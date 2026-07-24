import React, { useState, useEffect } from "react";
import { 
  UserPlus, Edit2, Trash2, Users, Mail, Phone, MapPin, Hash, Activity, X 
} from "lucide-react";
import API from "../services/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCust, setCurrentCust] = useState(null); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    accountNumber: "",
    status: "ACTIVE",
    averageConsumptionKwh: 0,
  });
  const [actionMsg, setActionMsg] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (currentCust) {
        
        await API.put(`/customers/${currentCust.id}`, formData);
        setActionMsg("Customer account successfully updated.");
      } else {
        
        await API.post("/customers", formData);
        setActionMsg("Customer account successfully created.");
      }
      setModalOpen(false);
      fetchCustomers();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("Failed to save customer", err);
      setActionMsg("Failed to save customer account. Account number must be unique.");
    }
  };

  const handleEdit = (cust) => {
    setCurrentCust(cust);
    setFormData({
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      address: cust.address,
      accountNumber: cust.accountNumber,
      status: cust.status,
      averageConsumptionKwh: cust.averageConsumptionKwh || 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (custId) => {
    if (!window.confirm("Are you sure you want to remove this customer account?")) return;
    try {
      await API.delete(`/customers/${custId}`);
      setActionMsg("Customer profile deleted.");
      fetchCustomers();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  const openAddModal = () => {
    setCurrentCust(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      accountNumber: `GP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "ACTIVE",
      averageConsumptionKwh: 0,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-bold tracking-tight text-white">Customers Account Database</h1>
          <p className="text-slate-400 text-sm mt-1">Manage grid utility subscribers, billing credentials, and consumption data.</p>
        </div>
        <button
          onClick={openAddModal}
          className="self-start bg-brandBlue hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brandBlue/15 flex items-center gap-1.5"
        >
          <UserPlus size={15} /> Add Customer Account
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-brandBlue/10 border border-brandBlue/20 rounded-xl text-xs text-brandBlue font-semibold">
          {actionMsg}
        </div>
      )}

      {}
      <div className="glass-panel p-6">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading customer profiles...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No customers registered in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-cardBorder text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Avg Consumption</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBorder/50">
                {customers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-800/10 transition-all">
                    <td className="py-4 px-4 font-bold font-outfit text-brandBlue">{cust.accountNumber}</td>
                    <td className="py-4 px-4 font-bold text-slate-200">{cust.name}</td>
                    <td className="py-4 px-4 text-xs space-y-0.5 text-slate-300">
                      <p className="flex items-center gap-1"><Mail size={12} className="text-slate-500" /> {cust.email}</p>
                      <p className="flex items-center gap-1"><Phone size={12} className="text-slate-500" /> {cust.phone}</p>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 truncate max-w-[150px]">{cust.address}</td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-300">{cust.averageConsumptionKwh} kWh/m</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        cust.status === "ACTIVE" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(cust)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all inline-flex border border-slate-700/60"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(cust.id)}
                        className="p-2 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl transition-all inline-flex border border-red-500/15"
                      >
                        <Trash2 size={13} />
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
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 bg-cardBg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-cardBorder pb-3">
              <h3 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-1.5">
                <Users size={18} className="text-brandBlue" />
                {currentCust ? "Edit Customer Details" : "Register New Subscriber"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddOrUpdate} className="space-y-3.5 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block" htmlFor="accountNumber">Account ID</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Hash size={13} />
                    </span>
                    <input
                      id="accountNumber"
                      type="text"
                      required
                      readOnly={!!currentCust}
                      placeholder="GP-XXXX"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-cardBorder rounded-xl py-2 pl-8 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none read-only:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter customer name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-cardBorder rounded-xl py-2 px-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail size={13} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="customer@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-cardBorder rounded-xl py-2 pl-8 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Phone size={13} />
                  </span>
                  <input
                    id="phone"
                    type="text"
                    required
                    placeholder="+91-9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-cardBorder rounded-xl py-2 pl-8 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block" htmlFor="address">Service Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <MapPin size={13} />
                  </span>
                  <input
                    id="address"
                    type="text"
                    required
                    placeholder="Enter service location address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-cardBorder rounded-xl py-2 pl-8 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block" htmlFor="averageConsumptionKwh">Avg Cons. (kWh/m)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Activity size={13} />
                    </span>
                    <input
                      id="averageConsumptionKwh"
                      type="number"
                      required
                      placeholder="e.g. 350"
                      value={formData.averageConsumptionKwh}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-cardBorder rounded-xl py-2 pl-8 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block" htmlFor="status">Account Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-cardBorder rounded-xl py-2 px-3 text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brandBlue hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-xl"
                >
                  {currentCust ? "Save Changes" : "Register Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
