"use client";

import { User } from "@/context/AuthContext";

export default function UserAddressCard({ user }: { user: User }) {
  return (
    <div className="p-5 border rounded-2xl">
      <h4 className="text-lg font-semibold mb-6">Adresse</h4>

      <div>
        <p className="text-xs text-gray-500">Adresse</p>
        <p className="text-sm font-medium">{user.address || "-"}</p>
      </div>
    </div>
  );
}