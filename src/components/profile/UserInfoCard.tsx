"use client";

import { User } from "@/context/AuthContext";

export default function UserInfoCard({ user }: { user: User }) {
  return (
    <div className="p-5 border rounded-2xl">
      <h4 className="text-lg font-semibold mb-6">Informations personnelles</h4>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-gray-500">Prénom</p>
          <p className="text-sm font-medium">{user.first_name || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Nom</p>
          <p className="text-sm font-medium">{user.last_name || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Téléphone</p>
          <p className="text-sm font-medium">{user.phone || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Rôle</p>
          <p className="text-sm font-medium">{user.role}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Date de naissance</p>
          <p className="text-sm font-medium">{user.birth_date || "-"}</p>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs text-gray-500">Dernière connexion</p>
          <p className="text-sm font-medium">{user.last_login_at || "-"}</p>
        </div>
      </div>
    </div>
  );
}