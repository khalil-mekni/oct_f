"use client";

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,160,157,0.12)",
        boxShadow: "0 1px 0 0 rgba(0,0,0,0.04), 0 4px 16px -4px rgba(0,160,157,0.08)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, #00A09D 0%, #00C9C5 50%, #00A09D 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .header-action-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,0.08);
          background: transparent;
          color: #64748b;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .header-action-btn:hover {
          background: rgba(0,160,157,0.06);
          border-color: rgba(0,160,157,0.25);
          color: #00A09D;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,160,157,0.12);
        }
        .dark .header-action-btn {
          border-color: rgba(255,255,255,0.08);
          color: #94a3b8;
        }
        .dark .header-action-btn:hover {
          background: rgba(0,160,157,0.1);
          border-color: rgba(0,160,157,0.3);
          color: #00C9C5;
        }
        .search-wrapper input:focus {
          outline: none;
        }
        .mobile-menu-animated {
          animation: fadeSlideDown 0.2s ease;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-6">

        {/* Main row */}
        <div className="flex w-full items-center justify-between gap-3 py-3 lg:py-0 lg:h-[60px]">

          {/* Left: Toggle + Logo */}
          <div className="flex items-center gap-3">
            <button
              className="header-action-btn"
              onClick={handleToggle}
              aria-label="Toggle Sidebar"
            >
              {isMobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd" clipRule="evenodd"
                    d="M6.22 7.28a1 1 0 011.42-1.42L12 10.94l4.36-4.36a1 1 0 111.42 1.42L13.41 12l4.36 4.36a1 1 0 11-1.42 1.42L12 13.41l-4.36 4.36a1 1 0 11-1.42-1.42L10.59 12 6.22 7.28z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                  <path d="M1 1h16M1 7h10M1 13h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              )}
            </button>

            {/* Logo — mobile only */}
            <Link href="/" className="flex items-center lg:hidden">
              <Image
                width={110} height={30}
                className="h-auto w-auto max-h-8 object-contain dark:hidden"
                src="/images/logo/logooct.png"
                alt="Logo" priority
              />
              <Image
                width={110} height={30}
                className="hidden h-auto w-auto max-h-8 object-contain dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo" priority
              />
            </Link>
          </div>

          {/* Center: Search bar — desktop */}
          <div className="hidden lg:flex flex-1 max-w-[480px] mx-6">
            <div
              className="search-wrapper relative w-full transition-all duration-300"
              style={{
                filter: isSearchFocused
                  ? "drop-shadow(0 4px 16px rgba(0,160,157,0.18))"
                  : "none",
              }}
            >
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: isSearchFocused ? "#00A09D" : "#94a3b8" }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    fillRule="evenodd" clipRule="evenodd"
                    d="M3 9a6 6 0 1110.89 3.477l3.817 3.816a.75.75 0 01-1.06 1.061l-3.817-3.817A6 6 0 013 9zm6-4.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
                    fill="currentColor"
                  />
                </svg>
              </span>

              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un produit, stock, commande..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="h-10 w-full rounded-xl pl-10 pr-16 text-sm text-gray-700 placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                style={{
                  border: isSearchFocused
                    ? "1.5px solid rgba(0,160,157,0.6)"
                    : "1.5px solid rgba(0,0,0,0.09)",
                  background: isSearchFocused
                    ? "rgba(255,255,255,1)"
                    : "rgba(248,250,252,0.8)",
                  transition: "all 0.2s ease",
                }}
              />

              <kbd
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
                style={{
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "rgba(248,250,252,1)",
                  fontSize: "10px",
                  color: "#94a3b8",
                  fontFamily: "system-ui",
                  letterSpacing: "0.02em",
                }}
              >
                <span>⌘</span><span>K</span>
              </kbd>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile more button */}
            <button
              onClick={toggleApplicationMenu}
              className="header-action-btn lg:hidden"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="5" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            </button>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggleButton />
              <NotificationDropdown />
            </div>

            {/* User dropdown — always visible on desktop */}
            <div className="hidden lg:block">
              <UserDropdown />
            </div>
          </div>
        </div>

        {/* Mobile expanded menu */}
        <div
          className={`${isApplicationMenuOpen ? "flex mobile-menu-animated" : "hidden"} w-full items-center justify-between gap-3 py-3 lg:hidden`}
          style={{ borderTop: "1px solid rgba(0,160,157,0.1)" }}
        >
          {/* Mobile search */}
          <div className="flex-1 relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 9a6 6 0 1110.89 3.477l3.817 3.816a.75.75 0 01-1.06 1.061l-3.817-3.817A6 6 0 013 9zm6-4.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" fill="currentColor"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              className="h-9 w-full rounded-lg pl-9 pr-3 text-sm"
              style={{
                border: "1.5px solid rgba(0,0,0,0.09)",
                background: "rgba(248,250,252,0.9)",
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;