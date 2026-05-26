"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getWarehouseCoordinates, type Coordinates, calculateDistance } from "@/lib/warehouseCoordinates";
import type { Entrepot } from "@/lib/entrepot.api";
import { Warehouse, MapPin, Navigation, Info } from "lucide-react";

// ── Fix Leaflet icons for Next.js ──────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type MapEntrepot = Entrepot & {
  coords: Coordinates | null;
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function WarehouseMap({ entrepots }: { entrepots: Entrepot[] }) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [limit, setLimit] = useState<number | "all">(5);

  // Instant local localization instead of external geocoding
  const data: MapEntrepot[] = useMemo(() => {
    return entrepots.map(e => ({
      ...e,
      coords: getWarehouseCoordinates(e.nom, e.adresse || "")
    }));
  }, [entrepots]);

  const validEntrepots = useMemo(() => data.filter((e) => e.coords), [data]);

  const getMarkerColor = (e: Entrepot) => {
    const stock = Number(e.stock_existant ?? 0);
    const capacity = Number(e.capacite_totale ?? 0);
    if (capacity === 0) return "#64748B"; 
    const rate = (stock / capacity) * 100;
    if (rate >= 90) return "#EF4444"; 
    if (rate >= 70) return "#F59E0B"; 
    return "#10B981"; 
  };

  const createCustomIcon = (color: string, isSelected: boolean) => {
    return L.divIcon({
      className: "custom-warehouse-marker",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${isSelected ? `
            <div style="position: absolute; width: 32px; height: 32px; background-color: ${color}; border-radius: 50%; opacity: 0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          ` : ''}
          <div style="width: 20px; height: 20px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid ${isSelected ? '#1C2434' : color}; z-index: 10;">
            <div style="width: 10px; height: 10px; background-color: ${color}; border-radius: 50%;"></div>
          </div>
          <div style="position: absolute; bottom: -5px; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${isSelected ? '#1C2434' : color}; z-index: 5;"></div>
        </div>
      `,
      iconSize: [24, 30],
      iconAnchor: [12, 30],
      popupAnchor: [0, -32],
    });
  };

  const mapCenter: [number, number] = useMemo(() => {
    if (validEntrepots.length > 0) {
      const sumLat = validEntrepots.reduce((acc, e) => acc + (e.coords?.lat || 0), 0);
      const sumLng = validEntrepots.reduce((acc, e) => acc + (e.coords?.lng || 0), 0);
      return [sumLat / validEntrepots.length, sumLng / validEntrepots.length];
    }
    return [34.0, 9.0]; // Tunisia center
  }, [validEntrepots]);

  const allDistances = useMemo(() => {
    if (!selectedWarehouseId) return [];
    const source = validEntrepots.find((e) => e.id === selectedWarehouseId);
    if (!source || !source.coords) return [];

    return validEntrepots
      .filter((e) => e.id !== selectedWarehouseId)
      .map((e) => ({
        target: e,
        distance: calculateDistance(source.coords!, e.coords!),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [selectedWarehouseId, validEntrepots]);

  const displayedDistances = useMemo(() => {
    if (limit === "all") return allDistances;
    return allDistances.slice(0, limit);
  }, [allDistances, limit]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
      <div className="xl:col-span-3">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-gray-800">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-[#1C2434] dark:text-white">
              <MapPin size={16} className="text-[#00A09D]" />
              Localisation des Entrepôts
            </h3>
          </div>
          <div className="h-[500px] w-full relative">
            <MapContainer
              key={validEntrepots.length}
              center={mapCenter}
              zoom={6}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", zIndex: 10 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ChangeView center={mapCenter} />
              
              {validEntrepots.map((e) => (
                <Marker
                  key={e.id}
                  position={[e.coords!.lat, e.coords!.lng]}
                  icon={createCustomIcon(getMarkerColor(e), selectedWarehouseId === e.id)}
                  eventHandlers={{
                    click: () => setSelectedWarehouseId(e.id),
                  }}
                >
                  <Popup className="warehouse-map-popup">
                    <div className="min-w-[220px] p-2 font-sans">
                      <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00A09D]/10">
                          <Warehouse size={20} className="text-[#00A09D]" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-black text-gray-800 text-sm truncate leading-tight">{e.nom}</p>
                           <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{e.statut || 'ACTIF'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                          <p className="text-[11px] text-gray-600 leading-normal">{e.adresse}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="rounded-xl bg-gray-50/50 p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                            <p className="text-[9px] uppercase font-black text-gray-400 mb-0.5">Capacité</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs tabular-nums">{e.capacite_totale?.toLocaleString()}</p>
                          </div>
                          <div className="rounded-xl bg-gray-50/50 p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                            <p className="text-[9px] uppercase font-black text-gray-400 mb-0.5">Stock</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs tabular-nums">{e.stock_existant?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {selectedWarehouseId && displayedDistances.length > 0 && (
                validEntrepots
                  .filter(e => e.id === selectedWarehouseId)
                  .map(source => (
                    displayedDistances.map(({ target }) => (
                        <Polyline
                          key={`${source.id}-${target.id}`}
                          positions={[
                            [source.coords!.lat, source.coords!.lng],
                            [target.coords!.lat, target.coords!.lng]
                          ]}
                          pathOptions={{ 
                            color: '#00A09D', 
                            weight: 1.5, 
                            dashArray: '5, 8',
                            opacity: 0.6
                          }}
                        />
                      ))
                  ))
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 border-b border-gray-50 px-5 py-4 dark:border-gray-800">
            <Navigation size={16} className="text-[#00A09D]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-[#1C2434] dark:text-white">
              Analyse de distance
            </h3>
          </div>
          
          <div className="p-5">
            {!selectedWarehouseId ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                   <Info size={24} />
                </div>
                <p className="text-xs font-bold text-gray-400 leading-relaxed px-4">
                  Cliquez sur un marqueur pour analyser les proximités logistiques
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl bg-[#00A09D]/5 p-4 border border-[#00A09D]/10">
                  <p className="text-[10px] font-black uppercase text-[#00A09D] mb-1.5 opacity-70">Source Sélectionnée</p>
                  <p className="text-sm font-black text-gray-800 dark:text-white leading-tight">
                    {validEntrepots.find(e => e.id === selectedWarehouseId)?.nom}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase text-gray-400">Affichage</p>
                  <div className="flex gap-1">
                    {[3, 5, 10, 'all'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setLimit(val as any)}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-colors ${
                          limit === val 
                            ? "bg-[#00A09D] text-white" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        }`}
                      >
                        {val === 'all' ? 'Tous' : val}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="max-h-[350px] space-y-2 overflow-y-auto pr-2 scrollbar-thin">
                    {displayedDistances.length > 0 ? displayedDistances.map(({ target, distance }) => (
                      <div key={target.id} className="group flex items-center justify-between rounded-2xl border border-gray-50 bg-gray-50/20 p-3 transition-all hover:border-[#00A09D]/20 hover:bg-white dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-black text-gray-700 dark:text-gray-200 group-hover:text-[#00A09D] transition-colors">{target.nom}</p>
                          <p className="truncate text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{target.adresse}</p>
                        </div>
                        <div className="ml-3 text-right">
                          <p className="text-[11px] font-black text-[#00A09D]">{distance.toFixed(1)} <span className="text-[9px] opacity-60">km</span></p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-4 text-[10px] font-bold text-gray-400">Aucune destination trouvée</p>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => setSelectedWarehouseId(null)}
                  className="w-full rounded-2xl border border-gray-100 py-3 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all dark:border-gray-800 dark:hover:bg-gray-800"
                >
                  Fermer l&apos;analyse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
