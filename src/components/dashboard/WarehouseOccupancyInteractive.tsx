"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import {
  Building2,
  MapPin,
  Package,
  Boxes,
  Archive,
  AlertTriangle,
  ChevronRight,
  PieChart,
} from "lucide-react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useWarehousesDetailed } from "@/hooks/useWarehousesDetailed";
import type { WarehouseDetailedItem } from "@/types/dashboard.types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function levelStyles(level: WarehouseDetailedItem["level"]) {
  if (level === "critical") {
    return {
      badge:
        "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
      progress: "#EF4444",
      text: "Critique",
    };
  }

  if (level === "warning") {
    return {
      badge:
        "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
      progress: "#F59E0B",
      text: "Warning",
    };
  }

  return {
    badge:
      "bg-success-100 text-success-700 dark:bg-success-500/15 dark:text-success-400",
    progress: "#12B76A",
    text: "Normal",
  };
}

// Couleurs claires et pastel pour le graphique circulaire
const DONUT_COLORS = [
  "#FF6B6B", // Rouge clair
  "#4ECDC4", // Turquoise
  "#45B7D1", // Bleu clair
  "#96CEB4", // Vert pastel
  "#FFEAA7", // Jaune pastel
  "#DDA0DD", // Violet clair
  "#98D8C8", // Menthe
  "#F7D794", // Pêche
  "#786FA6", // Lavande
  "#F3A683", // Corail
  "#778BEB", // Bleu pervenche
  "#E77F67", // Saumon
  "#63CDDA", // Cyan
  "#F19066", // Orange pastel
  "#546E7A", // Bleu gris
];

export default function WarehouseOccupancyInteractive() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError, error } = useWarehousesDetailed();
  const warehouses = data ?? [];

  const [activeWarehouseId, setActiveWarehouseId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWarehouseId && warehouses.length > 0) {
      setActiveWarehouseId(warehouses[0].id);
    }
  }, [warehouses, activeWarehouseId]);

  const activeWarehouse =
    warehouses.find((w) => w.id === activeWarehouseId) ?? warehouses[0] ?? null;

  // Préparer les données pour le graphique circulaire
  const donutData = useMemo(() => {
    // Prendre les 15 premiers entrepôts max pour la lisibilité
    const topWarehouses = warehouses.slice(0, 15);
    const otherWarehouses = warehouses.slice(15);
    
    const otherTotalStock = otherWarehouses.reduce((sum, w) => sum + w.stock_existant, 0);
    const otherTotalCapacity = otherWarehouses.reduce((sum, w) => sum + w.capacite_totale, 0);
    const otherFillRate = otherTotalCapacity > 0 ? (otherTotalStock / otherTotalCapacity) * 100 : 0;
    
    const categories = [...topWarehouses.map(w => w.nom)];
    const fillRates = [...topWarehouses.map(w => w.fillRate)];
    
    if (otherWarehouses.length > 0) {
      categories.push(`Autres (${otherWarehouses.length} entrepôts)`);
      fillRates.push(otherFillRate);
    }
    
    return {
      categories,
      fillRates,
      colors: DONUT_COLORS.slice(0, categories.length),
    };
  }, [warehouses]);

  // Options du graphique circulaire (donut) - Version corrigée
  const donutOptions: ApexOptions = useMemo(
    () => ({
      colors: donutData.colors,
      chart: {
        type: "donut",
        height: 420,
        toolbar: {
          show: false,
        },
        events: {
          dataPointSelection: (_event, _chartContext, config) => {
            const index = config.dataPointIndex;
            if (index >= 0 && index < warehouses.length) {
              const warehouseName = donutData.categories[index];
              if (warehouseName && !warehouseName.includes("Autres")) {
                const foundWarehouse = warehouses.find(w => w.nom === warehouseName);
                if (foundWarehouse) {
                  setActiveWarehouseId(foundWarehouse.id);
                }
              }
            }
          },
          dataPointMouseEnter: (_event, _chartContext, config) => {
            const index = config.dataPointIndex;
            if (index >= 0 && index < warehouses.length) {
              const warehouseName = donutData.categories[index];
              if (warehouseName && !warehouseName.includes("Autres")) {
                const foundWarehouse = warehouses.find(w => w.nom === warehouseName);
                if (foundWarehouse) {
                  setActiveWarehouseId(foundWarehouse.id);
                }
              }
            }
          },
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "60%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Occupation moyenne",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6B7280",
                formatter: () => {
                  const avgFillRate = warehouses.reduce((sum, w) => sum + w.fillRate, 0) / warehouses.length;
                  return `${avgFillRate.toFixed(1)}%`;
                },
              },
            },
          },
          expandOnClick: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, { seriesIndex }: { seriesIndex: number }) => {
          const percentage = donutData.fillRates[seriesIndex];
          return `${percentage.toFixed(1)}%`;
        },
        style: {
          fontSize: "11px",
          fontWeight: 600,
          colors: ["#FFFFFF"],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          color: "#000000",
          opacity: 0.3,
        },
      },
      legend: {
        show: true,
        position: "right",
        fontSize: "12px",
        fontFamily: "Outfit, sans-serif",
        fontWeight: 500,
        labels: {
          colors: ["#4B5563"],
        },
        markers: {
          size: 10,
          strokeWidth: 0,
          shape: "circle",
        },
        itemMargin: {
          horizontal: 8,
          vertical: 6,
        },
        formatter: (legendName: string, opts: any) => {
          const percentage = donutData.fillRates[opts.seriesIndex];
          return `${legendName} (${percentage.toFixed(1)}%)`;
        },
      },
      tooltip: {
        custom: ({ seriesIndex }) => {
          const warehouseName = donutData.categories[seriesIndex];
          const fillRate = donutData.fillRates[seriesIndex];
          
          const warehouse = warehouses.find(w => w.nom === warehouseName);
          
          if (warehouse) {
            return `
              <div style="padding:12px 14px; min-width: 200px; font-family: Outfit, sans-serif;">
                <div style="font-weight:600; color:#111827; margin-bottom:8px;">${warehouse.nom}</div>
                <div style="font-size:12px; color:#6B7280; margin-bottom:6px;">Occupation: ${fillRate.toFixed(1)}%</div>
                <div style="font-size:12px; color:#6B7280;">Stock: ${warehouse.stock_existant.toLocaleString()}</div>
                <div style="font-size:12px; color:#6B7280;">Capacité: ${warehouse.capacite_totale.toLocaleString()}</div>
                <div style="font-size:12px; color:#6B7280;">Disponible: ${warehouse.capacite_disponible.toLocaleString()}</div>
                <div style="font-size:12px; color:#6B7280;">Lots: ${warehouse.entrepotLots.length}</div>
              </div>
            `;
          }
          
          return `
            <div style="padding:12px 14px; font-family: Outfit, sans-serif;">
              <div style="font-weight:600; color:#111827; margin-bottom:8px;">${warehouseName}</div>
              <div style="font-size:12px; color:#6B7280;">Occupation moyenne: ${fillRate.toFixed(1)}%</div>
            </div>
          `;
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["#FFFFFF"],
      },
      states: {
        hover: {
          filter: {
            type: "darken",
            value: 0.85,
          },
        },
        active: {
          filter: {
            type: "darken",
            value: 0.9,
          },
        },
      },
      responsive: [
        {
          breakpoint: 1280,
          options: {
            legend: {
              position: "bottom",
            },
            chart: {
              height: 380,
            },
          },
        },
        {
          breakpoint: 768,
          options: {
            legend: {
              position: "bottom",
              fontSize: "10px",
            },
            chart: {
              height: 320,
            },
          },
        },
      ],
    }),
    [warehouses, donutData]
  );

  const donutSeries = donutData.fillRates;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7 h-[500px] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="xl:col-span-5 h-[500px] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400">
        Erreur entrepôts interactifs :{" "}
        {error instanceof Error ? error.message : "Erreur inconnue"}
      </div>
    );
  }

  if (!activeWarehouse) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Aucun entrepôt disponible.
      </div>
    );
  }

  const styles = levelStyles(activeWarehouse.level);
  const avgFillRate = warehouses.reduce((sum, w) => sum + w.fillRate, 0) / warehouses.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Occupation interactive des entrepôts
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Survole ou clique sur une section du graphique pour afficher les détails de l'entrepôt
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-44 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Voir détails
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Actualiser
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Graphique circulaire - Donut */}
        <div className="xl:col-span-7 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
                <PieChart className="size-5 text-blue-500" />
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-white/90">
                Répartition de l'occupation par entrepôt
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {warehouses.length} entrepôt(s)
              </span>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Moyenne: {avgFillRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <ReactApexChart
            options={donutOptions}
            series={donutSeries}
            type="donut"
            height={420}
          />

          {/* Légende supplémentaire avec statistiques */}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl bg-white p-2 text-center shadow-sm dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Occupation max
              </div>
              <div className="mt-1 text-base font-bold text-red-600">
                {Math.max(...warehouses.map(w => w.fillRate)).toFixed(1)}%
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 text-center shadow-sm dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Occupation min
              </div>
              <div className="mt-1 text-base font-bold text-green-600">
                {Math.min(...warehouses.map(w => w.fillRate)).toFixed(1)}%
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 text-center shadow-sm dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Stock total
              </div>
              <div className="mt-1 text-base font-bold text-blue-600">
                {warehouses.reduce((sum, w) => sum + w.stock_existant, 0).toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-white p-2 text-center shadow-sm dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Capacité totale
              </div>
              <div className="mt-1 text-base font-bold text-purple-600">
                {warehouses.reduce((sum, w) => sum + w.capacite_totale, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Détail de l'entrepôt sélectionné */}
        <div className="xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-gray-800">
                  <Building2 className="size-5 text-gray-700 dark:text-gray-300" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {activeWarehouse.nom}
                    </h4>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles.badge}`}
                    >
                      {styles.text}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="size-3.5" />
                    <span>{activeWarehouse.adresse || "Adresse non renseignée"}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Occupation</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {activeWarehouse.fillRate.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Capacité utilisée</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {activeWarehouse.stock_existant} / {activeWarehouse.capacite_totale}
                </span>
              </div>

              <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(activeWarehouse.fillRate, 100)}%`,
                    backgroundColor: styles.progress,
                  }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white p-3 dark:bg-gray-800">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Stock</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {activeWarehouse.stock_existant}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 dark:bg-gray-800">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Disponible</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {activeWarehouse.capacite_disponible}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 dark:bg-gray-800">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">Lots</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {activeWarehouse.entrepotLots.length}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h5 className="font-medium text-gray-800 dark:text-white/90">
                  Lots disponibles
                </h5>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activeWarehouse.entrepotLots.length} élément(s)
                </span>
              </div>

              <div className="max-h-[260px] space-y-3 overflow-y-auto pr-1">
                {activeWarehouse.entrepotLots.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    Aucun lot disponible dans cet entrepôt.
                  </div>
                ) : (
                  activeWarehouse.entrepotLots.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Archive className="size-4 text-gray-500 dark:text-gray-400" />
                            <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                              {item.lot?.code_lot ?? "Lot inconnu"}
                            </p>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Package className="size-3.5" />
                              {item.emballage?.name ?? "Emballage inconnu"}
                            </span>
                            {item.emballage?.code ? (
                              <>
                                <span>•</span>
                                <span>{item.emballage.code}</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Quantité
                          </p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            <Boxes className="mr-1 inline size-4" />
                            {item.quantite}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {activeWarehouse.level === "critical" ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-400">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4" />
                  <span>
                    Cet entrepôt a dépassé le seuil critique. Un transfert ou une réorganisation
                    du stock est recommandé.
                  </span>
                </div>
              </div>
            ) : null}

            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Voir le détail complet
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}