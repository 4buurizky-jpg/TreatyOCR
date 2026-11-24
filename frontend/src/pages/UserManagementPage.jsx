import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Edit2, Shield, X, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function UserManagementPage() {
  const [users, setUsers] = useState([
    { id: 1, full_name: 'Administrator IndonesiaRe', username: 'admin', email: 'admin@indonesia-re.co.id', role: 'Admin', is_active: true },
    { id: 2, full_name: 'Abu Rizki', username: 'aburizki', email: 'abu@starcore.co.id', role: 'OCR Operator', is_active: true },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', username: '', email: '', password: '', role: 'OCR Operator' });

  // Ambil daftar user dari backend jika endpoint tersedia
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/users`, { withCredentials: true })
      .then((res) => {
        if (Array.isArray(res.data)) setUsers(res.data);
      })
      .catch(() => {
        // Tetap gunakan state default jika endpoint belum dihubungkan
      });
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/users`, formData, { withCredentials: true });
      setUsers([...users, res.data]);
    } catch {
      // Fallback update state UI lokal
      setUsers([...users, { id: Date.now(), ...formData, is_active: true }]);
    }
    setFormData({ full_name: '', username: '', email: '', password: '', role: 'OCR Operator' });
    setIsModalOpen(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Yakin ingin menghapus akun pengguna ini?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`, { withCredentials: true });
    } catch {
      // Abaikan jika mode lokal
    }
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-sm text-slate-500">Kelola hak akses operator dan administrator sistem OCR</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Akun
        </button>
      </div>

      {/* Tabel Daftar Pengguna */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3.5 px-5">Nama Lengkap</th>
                <th className="py-3.5 px-5">Username</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-5 font-medium text-slate-800">{user.full_name}</td>
                  <td className="py-3.5 px-5 text-slate-600">@{user.username}</td>
                  <td className="py-3.5 px-5 text-slate-600">{user.email}</td>
                  <td className="py-3.5 px-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Admin' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <Check className="w-3.5 h-3.5" /> Aktif
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Hapus Akun"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Akun */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Tambah Akun Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="OCR Operator">OCR Operator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}