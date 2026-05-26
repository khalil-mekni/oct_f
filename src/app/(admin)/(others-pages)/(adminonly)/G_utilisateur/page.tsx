"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  UserCircle,
  Mail,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/lib/auth.api";
import { getUsers, updateUserRole, updateUserStatus } from "@/lib/users.api";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = "all" | "active" | "inactive" | "verified" | "unverified";

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "PENDING",                       label: "En attente" },
  { value: "ADMIN",                         label: "Administrateur" },
  { value: "RESPONSABLE_APPROVISIONNEMENT", label: "Responsable Appro." },
  { value: "RESPONSABLE_STOCKAGE",          label: "Responsable Stockage" },
];

const ROLE_STYLES: Record<string, string> = {
  PENDING:                       "bg-slate-50 text-slate-500 border-slate-200 shadow-sm",
  ADMIN:                         "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100/50",
  RESPONSABLE_APPROVISIONNEMENT: "bg-cyan-50 text-cyan-700 border-cyan-200 shadow-sm shadow-cyan-100/50",
  RESPONSABLE_STOCKAGE:          "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100/50",
};

const KPI_CONFIG = [
  { key: "total",   label: "Utilisateurs", icon: <Users size={16} />,       color: "text-[#006D6A]",   bg: "bg-[#E6F4F1]",   border: "border-[#CDEAE5]" },
  { key: "active",  label: "Comptes Actifs",    icon: <CheckCircle2 size={16} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { key: "verified",label: "E-mails Vérifiés",  icon: <Shield size={16} />,      color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
  { key: "pending", label: "En Attente",        icon: <AlertCircle size={16} />, color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(u: User) {
  const first = u.first_name?.trim() || "";
  const last = u.last_name?.trim() || "";
  if (!first && !last) return "U";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function AdminUsersContent() {
  const { token } = useAuth();

  const [users,      setUsers]      = useState<User[]>([]);
  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers(token ?? undefined);
      setUsers(data);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadUsers(); }, [token]);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      setUpdatingId(id);
      const updated = await updateUserRole(id, role, token ?? undefined);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors de la modification du rôle.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      setUpdatingId(user.id);
      const updated = await updateUserStatus(user.id, !user.is_active, token ?? undefined);
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors de la modification du statut.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase();
      const matchSearch =
        name.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q);
      const matchFilter =
        filterType === "all"      ? true
        : filterType === "active"   ? !!u.is_active
        : filterType === "inactive" ? !u.is_active
        : filterType === "verified" ? !!u.email_verified_at
        : /* unverified */            !u.email_verified_at;
      return matchSearch && matchFilter;
    });
  }, [users, search, filterType]);

  const stats = {
    total:    users.length,
    active:   users.filter(u => u.is_active).length,
    verified: users.filter(u => u.email_verified_at).length,
    pending:  users.filter(u => u.role === "PENDING").length,
  };

  return (
    <div className="p-8 min-h-screen bg-[#F4F7F6]">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              Utilisateurs<span className="text-[#008080]">.</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Gestion de la main-d'œuvre et des accès au système d'emballage.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {KPI_CONFIG.map(({ key, label, icon, color, bg, border }) => (
              <div
                key={key}
                className={`bg-white border ${border} rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-1 duration-300 min-w-[170px]`}
              >
                <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                  {icon}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none">
                    {label}
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1 leading-none">
                    {stats[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-5 bg-white p-5 rounded-3xl border border-slate-200/50 shadow-sm">
          <div className="relative flex-1 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#008080] transition-colors" />
            <input
              className="w-full bg-[#F9FAFB] border border-slate-100 rounded-2xl pl-12 pr-5 h-12 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[#008080]/5 focus:border-[#008080] transition-all"
              placeholder="Rechercher par identité ou contact..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as FilterType)}
              className="bg-[#F9FAFB] border border-slate-100 text-slate-600 h-12 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider outline-none focus:border-[#008080] transition-all cursor-pointer min-w-[180px]"
            >
              <option value="all">Tous les profils</option>
              <option value="active">Actifs</option>
              <option value="inactive">Suspendus</option>
              <option value="verified">Vérifiés</option>
              <option value="unverified">Non vérifiés</option>
            </select>
            <button 
              onClick={loadUsers}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-[#008080] hover:bg-[#E6F4F1] rounded-2xl transition-all duration-300"
              title="Actualiser les données"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Table Container ── */}
        <div className="bg-white border border-slate-200/60 rounded-[2rem] shadow-sm overflow-hidden relative">
          
          {loading && !users.length && (
            <div className="py-32 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#008080]/10 border-t-[#008080] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-[#008080]">
                   <Users size={20} />
                </div>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Mise à jour...</p>
            </div>
          )}

          {error && (
            <div className="m-8 p-5 rounded-3xl bg-rose-50 border border-rose-100 flex items-center gap-4 text-rose-800">
              <div className="p-2 bg-white rounded-full shadow-sm text-rose-500">
                <AlertCircle size={20} />
              </div>
              <p className="text-sm font-bold tracking-tight">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-slate-100">
                    <th className="pl-8 pr-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profil Utilisateur</th>
                    <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vérification</th>
                    <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Disponibilité</th>
                    <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Permission</th>
                    <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dernière Activité</th>
                    <th className="pl-4 pr-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Gestion</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100/50">
                  {filteredUsers.map(user => {
                    const busy = updatingId === user.id;
                    return (
                      <tr key={user.id} className="group even:bg-[#F9FAFB]/40 hover:bg-[#E6F4F1]/40 transition-all duration-300 ease-out">

                        {/* Utilisateur - Card Style */}
                        <td className="pl-6 pr-4 py-4">
                          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100/50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-[#008080]/20 group-hover:translate-x-1">
                            <div className="relative flex-shrink-0">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#008080] via-[#006D6A] to-[#004D4B] flex items-center justify-center text-white text-lg font-black shadow-lg shadow-[#008080]/20 ring-4 ring-[#E6F4F1] transition-transform duration-500 group-hover:rotate-[360deg]">
                                {getInitials(user)}
                              </div>
                              {user.is_active && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] border-2 border-white rounded-full shadow-sm animate-pulse" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-black text-slate-900 group-hover:text-[#008080] transition-colors truncate">
                                {user.first_name} {user.last_name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                                <div className="p-1 rounded-md bg-slate-50">
                                  <Mail size={10} className="text-slate-400" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Vérification */}
                        <td className="px-4 py-5">
                          {user.email_verified_at ? (
                            <Pill className="bg-blue-50 text-blue-600 border-blue-100/50">
                              <CheckCircle size={12} /> E-mail Vérifié
                            </Pill>
                          ) : (
                            <Pill className="bg-amber-50 text-amber-600 border-amber-100/50">
                              <XCircle size={12} /> Non vérifié
                            </Pill>
                          )}
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-5">
                          <Pill
                            className={
                              user.is_active
                                ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]/50"
                                : "bg-rose-50 text-rose-700 border-rose-100/50"
                            }
                          >
                            <span className={`w-2 h-2 rounded-full ${user.is_active ? "bg-[#22C55E] shadow-[0_0_8px_#22C55E]" : "bg-rose-500"}`} />
                            {user.is_active ? "Opérationnel" : "Suspendu"}
                          </Pill>
                        </td>

                        {/* Rôle */}
                        <td className="px-4 py-5">
                          <div className="relative group/select">
                            <select
                              value={user.role}
                              disabled={busy}
                              onChange={e => handleRoleChange(user.id, e.target.value)}
                              className={`
                                w-full min-w-[160px] appearance-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border
                                outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                                transition-all hover:shadow-md
                                ${ROLE_STYLES[user.role] ?? "bg-slate-50 text-slate-500 border-slate-200"}
                              `}
                            >
                              {ROLE_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-white text-slate-900 font-bold lowercase first-letter:uppercase">{o.label}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover/select:opacity-100 transition-opacity">
                              <RefreshCw size={11} className={busy ? "animate-spin" : ""} />
                            </div>
                          </div>
                        </td>

                        {/* Dernière connexion */}
                        <td className="px-4 py-5 text-slate-500">
                          <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-tight text-slate-700">
                              {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' }) : "Jamais connecté"}
                            </p>
                            {user.last_login_at && (
                              <p className="text-[10px] font-bold opacity-60">
                                {new Date(user.last_login_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="pl-4 pr-8 py-5 text-center">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={busy}
                            className={`
                              inline-flex items-center justify-center gap-2.5
                              h-10 px-5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.1em]
                              transition-all duration-300 hover:scale-105 active:scale-95
                              disabled:opacity-40 disabled:cursor-not-allowed
                              ${user.is_active
                                ? "bg-white border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm"
                                : "bg-white border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm"
                              }
                            `}
                          >
                            <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
                            {user.is_active ? "Désactiver" : "Activer"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-40 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-[#F4F7F6] mb-6">
                          <Users className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                          Aucun Profil Correspondant
                        </p>
                        <button 
                          onClick={() => { setSearch(""); setFilterType("all"); }}
                          className="mt-6 px-6 py-2 rounded-xl bg-[#E6F4F1] text-[#008080] text-[10px] font-black uppercase tracking-widest hover:bg-[#008080] hover:text-white transition-all"
                        >
                          Réinitialiser la vue
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 bg-[#F9FAFB]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#008080]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Contrôle : <span className="text-slate-900">{filteredUsers.length}</span> sur <span className="text-slate-900 font-medium">{users.length}</span> profils chargés
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
