"use client";

import { User } from "@/context/AuthContext";

export default function UserMetaCard({ user }: { user: User }) {
  return (
    <div className="p-5 border rounded-2xl">
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <p className="text-sm text-gray-500">{user.email}</p>
      <p className="text-sm font-semibold text-emerald-600">{user.role}</p>
    </div>
  );
}