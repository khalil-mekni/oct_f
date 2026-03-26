"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuth } from "@/context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
    await logout();
    closeDropdown();
    router.push("/signin");
  };

  const displayName = user?.name || "Utilisateur";
  const displayEmail = user?.email || "";
  const displayRole = user?.role || "GESTION";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition hover:border-[#00A09D]/30 hover:bg-gray-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A09D]/10 text-sm font-black uppercase text-[#00A09D]">
          {displayName?.charAt(0) || "U"}
        </div>

        <div className="hidden text-left sm:block">
          <p className="text-sm font-bold text-gray-900">
            {loading ? "Chargement..." : displayName}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {displayRole}
          </p>
        </div>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 6.75L9 11.25L13.5 6.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-xl"
      >
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-900">{displayName}</p>
          <p className="mt-1 text-xs text-gray-500">{displayEmail}</p>
          <span className="mt-3 inline-flex rounded-full bg-[#00A09D]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#00A09D]">
            {displayRole}
          </span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-100 py-3">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#00A09D]/5 hover:text-[#00A09D]"
            >
              Mon profil
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-[#00A09D]/5 hover:text-[#00A09D]"
            >
              Paramètres
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          className="mt-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-500 transition hover:bg-red-50"
        >
          Déconnexion
        </button>
      </Dropdown>
    </div>
  );
}