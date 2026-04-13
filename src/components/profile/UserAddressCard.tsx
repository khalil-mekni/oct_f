"use client";

import { User } from "@/context/AuthContext";
import { MapPin, Home, Compass } from "lucide-react";

export default function UserAddressCard({ user }: { user: User }) {
  const hasAddress = user.address && user.address !== "-";
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-500" />
          Adresse
        </h3>
        <p className="text-sm text-gray-400 mt-1">Votre localisation</p>
      </div>
      
      <div className="p-6">
        {hasAddress ? (
          <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100/20 to-teal-100/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex items-start gap-4 p-4 bg-gradient-to-r from-sky-50/40 to-transparent rounded-xl border border-sky-100">
              <div className="p-3 bg-gradient-to-br from-sky-400 to-teal-400 rounded-xl shadow-sm">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-3.5 h-3.5 text-teal-500" />
                  <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Adresse principale</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{user.address}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-sm text-gray-400">Aucune adresse renseignée</p>
            <button className="mt-3 text-xs text-sky-500 hover:text-sky-600 font-medium">
              + Ajouter une adresse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}