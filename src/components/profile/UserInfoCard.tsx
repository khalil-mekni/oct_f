"use client";

import { User } from "@/context/AuthContext";
import { User2, Phone, Cake, CalendarDays, Briefcase } from "lucide-react";

export default function UserInfoCard({ user }: { user: User }) {
  const infoItems = [
    { 
      icon: User2, 
      label: "Prénom", 
      value: user.first_name,
      color: "sky"
    },
    { 
      icon: User2, 
      label: "Nom", 
      value: user.last_name,
      color: "teal"
    },
    { 
      icon: Phone, 
      label: "Téléphone", 
      value: user.phone,
      color: "orange"
    },
    { 
      icon: Cake, 
      label: "Date de naissance", 
      value: user.birth_date,
      color: "amber"
    },
    { 
      icon: CalendarDays, 
      label: "Dernière connexion", 
      value: user.last_login_at,
      color: "sky",
      fullWidth: true
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-sky-500" />
          Informations personnelles
        </h3>
        <p className="text-sm text-gray-400 mt-1">Détails de votre profil</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            const colorMap = {
              sky: "bg-sky-50 text-sky-500",
              teal: "bg-teal-50 text-teal-500",
              orange: "bg-orange-50 text-orange-500",
              amber: "bg-amber-50 text-amber-500"
            };
            
            return (
              <div 
                key={index} 
                className={`group hover:shadow-sm transition-all duration-200 rounded-xl p-4 bg-gray-50/30 ${item.fullWidth ? 'md:col-span-2' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colorMap[item.color as keyof typeof colorMap]} transition-all`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {item.value || "-"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}