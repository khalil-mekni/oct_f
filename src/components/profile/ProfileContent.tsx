"use client";

import { useAuth } from "@/context/AuthContext";
import UserMetaCard from "@/components/profile/UserMetaCard";
import UserInfoCard from "@/components/profile/UserInfoCard";
import UserAddressCard from "@/components/profile/UserAddressCard";

export default function ProfileContent() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-sky-100 rounded-full animate-spin border-t-sky-400"></div>
        <p className="mt-4 text-sm text-gray-500">Chargement...</p>
      </div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-6">
      <UserMetaCard user={user} />
      <UserInfoCard user={user} />
      <UserAddressCard user={user} />
    </div>
  );
}