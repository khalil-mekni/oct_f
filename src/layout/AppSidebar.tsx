"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  PieChartIcon,
  UserCircleIcon,
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";
import {
  Receipt,
  ShoppingCart,
  Truck,
  Boxes,
  ArrowLeftRight,
  Users,        // ✅ Fournisseurs
  UserCog,      // ✅ Gestion des utilisateurs
  BrainCircuit, // ✅ Prédiction & recommandation
} from "lucide-react";

type Role =
  | "ADMIN"
  | "RESPONSABLE_APPROVISIONNEMENT"
  | "RESPONSABLE_STOCKAGE";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles: Role[];
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    roles: Role[];
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT", "RESPONSABLE_STOCKAGE"],
  },
  {
    icon: <Users />,
    name: "Fournisseurs",
    path: "/fournisseurs",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT"],
  },
  {
    icon: <PageIcon />,
    name: "Contrats",
    path: "/contrats",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT"],
  },
  {
    icon: <ShoppingCart />,
    name: "Commandes",
    path: "/commandes",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT"],
  },
  {
    icon: <Truck />,
    name: "Bon Livraisons",
    path: "/bon-livraisons",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT"],
  },
  {
    icon: <Receipt />,
    name: "Factures",
    path: "/factures",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT"],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Entrepots",
    path: "/entrepots",
    roles: ["ADMIN", "RESPONSABLE_STOCKAGE"],
  },
  {
    icon: <GridIcon />,
    name: "Stocks",
    path: "/stocks",
    roles: ["ADMIN", "RESPONSABLE_STOCKAGE"],
  },
  {
    icon: <Boxes />,
    name: "Stock Inventaire",
    path: "/stock-inventaire",
    roles: ["ADMIN", "RESPONSABLE_STOCKAGE"],
  },
  {
    icon: <ArrowLeftRight />,
    name: "Mouvements de stock",
    path: "/mouvements",
    roles: ["ADMIN", "RESPONSABLE_STOCKAGE"],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Emballages",
    path: "/emballages",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT",],
  },
  {
    icon: <UserCog />,
    name: "Gestion des utilisateurs",
    path: "/G_utilisateur",
    roles: ["ADMIN"],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
    roles: ["ADMIN"],
  },
  {
    icon: <PieChartIcon />,
    name: "Analytics",
    path: "/prediction",
    roles: ["ADMIN"],
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT", "RESPONSABLE_STOCKAGE"],
  },



  {
    icon: <BrainCircuit />,
    name: "prédiction & recommandation",
    path: "/prediction-emballage",
    roles: ["ADMIN", "RESPONSABLE_APPROVISIONNEMENT", "RESPONSABLE_STOCKAGE"],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const userRole = user?.role as Role | undefined;

  const filteredNavItems = navItems.filter((item) => {
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;

      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }

      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.path && (
            <Link
              href={nav.path}
              className={`menu-item group ${
                isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
              }`}
            >
              <span
                className={`${
                  isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>

              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-10 flex items-center transition-all duration-300 ${
          !isExpanded && !isHovered ? "justify-center" : "justify-start px-6"
        }`}
      >
        <Link href="/" className="flex items-center justify-center w-full">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="relative w-full flex justify-start">
              <Image
                className="dark:hidden object-contain"
                src="/images/logo/logoOCT.png"
                alt="Logo"
                width={160}
                height={45}
                priority
              />

              <Image
                className="hidden dark:block object-contain dark:brightness-200"
                src="/images/logo/oct.webp"
                alt="Logo"
                width={160}
                height={45}
              />
            </div>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo Icon"
              width={35}
              height={35}
              className="min-w-[35px]"
            />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              {loading ? (
                <div className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
              ) : filteredNavItems.length > 0 ? (
                renderMenuItems(filteredNavItems, "main")
              ) : (
                <p className="text-sm text-red-500 px-3">
                  Aucun menu disponible
                </p>
              )}
            </div>
          </div>
        </nav>

        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;