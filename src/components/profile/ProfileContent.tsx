"use client";

import { useAuth } from "@/context/AuthContext";
import UserMetaCard from "@/components/profile/UserMetaCard";
import UserInfoCard from "@/components/profile/UserInfoCard";
import UserAddressCard from "@/components/profile/UserAddressCard";

export default function ProfileContent() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <UserMetaCard user={user} />
      <UserInfoCard user={user} />
      <UserAddressCard user={user} />
    </div>
  );
}