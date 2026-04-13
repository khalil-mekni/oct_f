"use client";

import { User } from "@/context/AuthContext";
import { UserCircle, Calendar, Mail, Shield } from "lucide-react";

export default function UserMetaCard({ user }: { user: User }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50/30 to-white rounded-2xl shadow-sm border border-sky-100">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100/30 to-teal-100/30 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-100/20 to-amber-100/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
      
      <div className="relative p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-sm">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-400 rounded-full border-2 border-white"></div>
            </div>
            
            <div>
              <h2 className="text-3xl font-semibold text-gray-800">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 bg-teal-50 rounded-full border border-teal-200">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">{user.role}</span>
              </div>
            </div>
            
            {user.last_login_at && (
              <div className="px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs text-orange-700">
                    Dernière connexion: {user.last_login_at}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}