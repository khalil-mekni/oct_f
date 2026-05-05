"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  RefreshCw,
} from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/lib/auth.api";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "@/lib/users.api";

type FilterType = "all" | "active" | "inactive" | "verified" | "unverified";

const roleLabels: Record<string, string> = {
  PENDING: "En attente",
  ADMIN: "Administrateur",
  RESPONSABLE_APPROVISIONNEMENT: "Responsable approvisionnement",
  RESPONSABLE_STOCKAGE: "Responsable stockage",
};

const roleColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ADMIN: "bg-red-100 text-red-700",
  RESPONSABLE_APPROVISIONNEMENT: "bg-blue-100 text-blue-700",
  RESPONSABLE_STOCKAGE: "bg-purple-100 text-purple-700",
};

function AdminUsersContent() {
  const { token } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUsers(token || undefined);
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      setUpdatingId(id);

      const updatedUser = await updateUserRole(id, role, token || undefined);

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la modification du rôle.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      setUpdatingId(user.id);

      const updatedUser = await updateUserStatus(
        user.id,
        !user.is_active,
        token || undefined
      );

      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? updatedUser : item))
      );
    } catch (err: any) {
      alert(err?.message || "Erreur lors de la modification du statut.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();

      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.toLowerCase().includes(search.toLowerCase());

      let matchesFilter = true;

      if (filterType === "active") matchesFilter = !!user.is_active;
      if (filterType === "inactive") matchesFilter = !user.is_active;
      if (filterType === "verified") matchesFilter = !!user.email_verified_at;
      if (filterType === "unverified") matchesFilter = !user.email_verified_at;

      return matchesSearch && matchesFilter;
    });
  }, [users, search, filterType]);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    verified: users.filter((u) => u.email_verified_at).length,
    pending: users.filter((u) => u.role === "PENDING").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-500 mt-2">
            Validez les emails, attribuez les rôles et bloquez ou débloquez les comptes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <p className="text-gray-500 text-sm">Total utilisateurs</p>
            <p className="text-2xl font-black text-gray-800">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <p className="text-gray-500 text-sm">Comptes actifs</p>
            <p className="text-2xl font-black text-green-600">{stats.active}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <p className="text-gray-500 text-sm">Emails vérifiés</p>
            <p className="text-2xl font-black text-blue-600">{stats.verified}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <p className="text-gray-500 text-sm">En attente rôle</p>
            <p className="text-2xl font-black text-yellow-600">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-[#00A09D]"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#00A09D]"
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="active">Actifs</option>
                <option value="inactive">Bloqués</option>
                <option value="verified">Email vérifié</option>
                <option value="unverified">Email non vérifié</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="p-10 text-center text-gray-500 font-bold">
              Chargement des utilisateurs...
            </div>
          )}

          {error && (
            <div className="p-6 text-red-600 font-bold bg-red-50">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">
                      Dernière connexion
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredUsers.map((user) => {
                    const firstName = user.first_name || "";
                    const lastName = user.last_name || "";
                    const initials =
                      `${firstName.charAt(0)}${lastName.charAt(0)}` || "U";

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#00A09D] rounded-full w-10 h-10 flex items-center justify-center text-white font-black">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {firstName} {lastName}
                              </p>
                              <p className="text-xs text-gray-400">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>

                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}

                            {user.address && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MapPin className="w-3 h-3" />
                                {user.address}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {user.email_verified_at ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                              <CheckCircle className="w-3 h-3" />
                              Vérifié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                              <XCircle className="w-3 h-3" />
                              Non vérifié
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              user.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.is_active ? "Actif" : "Bloqué"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {user.last_login_at ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3 h-3" />
                              {new Date(user.last_login_at).toLocaleString("fr-FR")}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Jamais</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            disabled={updatingId === user.id}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            className={`px-3 py-2 rounded-xl text-xs font-bold border outline-none ${
                              roleColors[user.role] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <option value="PENDING">En attente</option>
                            <option value="ADMIN">Administrateur</option>
                            <option value="RESPONSABLE_APPROVISIONNEMENT">
                              Responsable approvisionnement
                            </option>
                            <option value="RESPONSABLE_STOCKAGE">
                              Responsable stockage
                            </option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={updatingId === user.id}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                              user.is_active
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            <RefreshCw className="w-4 h-4" />
                            {user.is_active ? "Bloquer" : "Débloquer"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <UserCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-bold text-gray-400">
                          Aucun utilisateur trouvé
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-600">
            Affichage de <strong>{filteredUsers.length}</strong> sur{" "}
            <strong>{users.length}</strong> utilisateurs.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}