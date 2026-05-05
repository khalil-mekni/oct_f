"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/context/AuthContext";

const roleColors: Record<string, { bg: string; text: string }> = {
  ADMIN:                        { bg: "rgba(239,68,68,0.1)",   text: "#ef4444" },
  MANAGER:                      { bg: "rgba(0,160,157,0.1)",   text: "#00A09D" },
  GESTION:                      { bg: "rgba(99,102,241,0.1)",  text: "#6366f1" },
  RESPONSABLE_APPROVISIONNEMENT:{ bg: "rgba(234,179,8,0.1)",   text: "#b45309" },
  USER:                         { bg: "rgba(100,116,139,0.1)", text: "#64748b" },
};

function getRoleStyle(role: string) {
  return roleColors[role?.toUpperCase()] ?? roleColors.USER;
}

function formatRole(role: string) {
  return role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function AvatarCircle({ name, size = 36 }: { name: string; size?: number }) {
  const letter = name?.charAt(0)?.toUpperCase() || "U";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "linear-gradient(135deg, #00A09D 0%, #00C9C5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 600,
        fontSize: Math.round(size * 0.38),
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

const menuItems = [
  {
    href: "/profile",
    label: "Mon profil",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM3.5 18a6.5 6.5 0 0113 0"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          stroke="currentColor" strokeWidth="1.5" />
        <path d="M17.5 10a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
          stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const displayName  = user?.name  || "Utilisateur";
  const displayEmail = user?.email || "";
  const displayRole  = user?.role  || "USER";
  const roleStyle    = getRoleStyle(displayRole);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  const handleLogout = async () => {
    await logout();
    closeDropdown();
    router.push("/signin");
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={toggleDropdown}
        aria-label="Menu utilisateur"
        className="dropdown-toggle flex items-center gap-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-transparent px-3 py-1.5 transition-all duration-200 hover:border-[#00A09D]/30 hover:bg-[#00A09D]/[0.04] dark:hover:border-[#00A09D]/40 dark:hover:bg-[#00A09D]/[0.06]"
      >
        <AvatarCircle name={displayName} size={30} />

        <div className="hidden sm:block text-left">
          <p className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">
            {loading ? "…" : displayName}
          </p>
          <p className="text-[11px] leading-tight mt-0.5 truncate max-w-[120px]" style={{ color: roleStyle.text }}>
            {formatRole(displayRole)}
          </p>
        </div>

        <svg
          className={`transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
          width="13" height="13" viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-[300px] flex flex-col rounded-2xl bg-white dark:bg-gray-900 overflow-hidden"
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px -4px rgba(0,0,0,0.12)",
        }}
      >
        {/* Profile header */}
        <div className="px-4 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex items-center gap-3">
            <AvatarCircle name={displayName} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-gray-900 dark:text-white truncate">
                {displayName}
              </p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {displayEmail}
              </p>
              {/* Badge role — wraps si trop long */}
              <span
                className="mt-1.5 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium max-w-full"
                style={{
                  background: roleStyle.bg,
                  color: roleStyle.text,
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  lineHeight: "1.4",
                }}
              >
                {formatRole(displayRole)}
              </span>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-1.5 border-b border-black/[0.05] dark:border-white/[0.05]">
          {menuItems.map((item) => (
            <DropdownItem
              key={item.href}
              tag="a"
              href={item.href}
              onItemClick={closeDropdown}
              baseClassName="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg w-full text-[13.5px] text-gray-700 dark:text-gray-300 transition-colors duration-150 cursor-pointer hover:bg-[#00A09D]/[0.07] hover:text-[#00A09D] dark:hover:bg-[#00A09D]/10 dark:hover:text-[#00C9C5]"
              className=""
            >
              <span className="flex items-center justify-center w-[30px] h-[30px] rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex-shrink-0">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </DropdownItem>
          ))}
        </div>

        {/* Logout */}
        <div className="p-1.5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-2.5 w-full rounded-lg text-[13.5px] font-medium text-red-500 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-500/[0.08]"
          >
            <span className="flex items-center justify-center w-[30px] h-[30px] rounded-lg bg-red-50 dark:bg-red-500/10 flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6"
                  stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Déconnexion
          </button>
        </div>
      </Dropdown>
    </div>
  );
}