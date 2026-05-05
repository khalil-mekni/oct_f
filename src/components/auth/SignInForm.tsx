"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import { useAuth } from "@/context/AuthContext";

export default function SignInForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setInfo(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Veuillez saisir votre email.");
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Veuillez saisir votre mot de passe.");
      setLoading(false);
      return;
    }

    try {
      const payload = await login({
        email: cleanEmail,
        password,
        remember: isChecked,
      });

      const role = payload.user.role;

      if (
        role === "ADMIN" ||
        role === "RESPONSABLE_APPROVISIONNEMENT" ||
        role === "RESPONSABLE_STOCKAGE"
      ) {
        router.replace("/");
      } else {
        setError("Votre rôle n'est pas encore validé par l'administrateur.");
      }
    } catch (err: any) {
      const message = err?.message || "Erreur lors de la connexion.";
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("email not verified")) {
        setError("Votre email n'est pas encore vérifié.");
        setInfo(
          "Vérifiez votre boîte mail puis cliquez sur le lien de vérification avant de vous connecter."
        );
      } else if (lowerMessage.includes("pending admin")) {
        setError("Votre compte est en attente de validation par l'administrateur.");
      } else if (lowerMessage.includes("account inactive")) {
        setError("Votre compte est bloqué. Contactez l'administrateur.");
      } else if (lowerMessage.includes("invalid credentials")) {
        setError("Email ou mot de passe incorrect.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC]">
      <div className="hidden lg:flex w-1/2 bg-[#00A09D] relative flex-col justify-between p-20 overflow-hidden group">
        <div className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-110">
          <Image
            src="/images/stock.png"
            alt="Logistique Entrepôt"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00A09D] via-[#00A09D]/60 to-transparent"></div>
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-4 mb-14">
            <div className="bg-white p-3 rounded-2xl shadow-2xl transform -rotate-3 transition-transform group-hover:rotate-0">
              <div className="w-12 h-12 bg-[#00A09D] rounded-xl flex items-center justify-center font-black text-3xl italic text-white shadow-inner">
                S
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter leading-none text-white">
                OCT
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-emerald-200/80">
                Smart Inventory
              </span>
            </div>
          </div>

          <h2 className="text-6xl font-black leading-[1.05] text-white tracking-tighter mb-6">
            La gestion <br />
            <span className="text-emerald-300 italic">réinventée.</span>
          </h2>

          <p className="text-emerald-50/80 text-xl max-w-md leading-relaxed font-light">
            Une traçabilité totale pour vos emballages, du fournisseur jusqu&apos;au stockage final.
          </p>
        </div>

        <div className="relative z-20 self-start flex items-center gap-5 bg-white/10 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 shadow-2xl transform transition-all hover:translate-x-2">
          <div className="w-12 h-12 rounded-full bg-emerald-400 flex items-center justify-center font-black text-[#00A09D] text-xl">
            ✓
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-black text-white uppercase tracking-wider">@2026</p>
            <p className="text-xs text-emerald-100/70">Optimisé pour Thé, Riz & Sucre</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center flex-1 px-10 sm:px-16 lg:px-28 bg-white relative">
        <div className="w-full max-w-md mx-auto">
          <Link
            href="/"
            className="group inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-[#00A09D] transition-all mb-10"
          >
            <div className="p-2 rounded-full border border-gray-100 mr-3 group-hover:border-[#00A09D]/30 transition-colors">
              <ChevronLeftIcon className="transform group-hover:-translate-x-1 transition-transform" />
            </div>
            Retour au Dashboard
          </Link>

          <div className="mb-14">
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">
              Connexion
            </h1>
            <div className="h-1.5 w-12 bg-[#00A09D] rounded-full mb-4"></div>
            <p className="text-gray-400 font-medium">
              Authentification sécurisée pour gestionnaires.
            </p>
          </div>

          <form className="space-y-9" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Email
              </Label>
              <Input
                defaultValue={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="admin@stockmaster.com"
                type="email"
                className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#00A09D] focus:ring-[6px] focus:ring-[#00A09D]/5 transition-all py-5 px-7 rounded-2xl border-2 text-sm font-semibold"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Mot de passe
                </Label>
                <Link
                  href="/reset-password"
                  className="text-[10px] text-[#00A09D] hover:text-[#008784] font-black uppercase tracking-tighter border-b-2 border-transparent hover:border-[#00A09D] transition-all"
                >
                  Oublié ?
                </Link>
              </div>

              <div className="relative group">
                <Input
                  defaultValue={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#00A09D] focus:ring-[6px] focus:ring-[#00A09D]/5 transition-all py-5 px-7 rounded-2xl border-2 text-sm font-semibold"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#00A09D] transition-colors"
                >
                  {showPassword ? <EyeIcon size={22} /> : <EyeCloseIcon size={22} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span
                className="text-xs text-gray-500 font-bold select-none cursor-pointer"
                onClick={() => setIsChecked(!isChecked)}
              >
                Mémoriser ma session
              </span>
            </div>

            {error && <p className="text-red-500 font-bold text-sm">{error}</p>}
            {info && <p className="text-amber-600 font-semibold text-sm">{info}</p>}

            <Button
              className="w-full py-8 bg-[#00A09D] hover:bg-[#008784] text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_40px_rgba(0,160,157,0.25)] transition-all transform hover:-translate-y-1.5 active:scale-[0.97]"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se Connecter"}
            </Button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Vous n&apos;avez pas de compte ?{" "}
              <Link
                href="/signup"
                className="text-[#00A09D] hover:text-[#008784] transition-colors ml-1 font-black uppercase tracking-tighter border-b-2 border-[#00A09D]/20"
              >
                S&apos;inscrire
              </Link>
            </p>
          </div>

          <div className="mt-20 text-center pt-10 border-t border-gray-50">
            <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
              Système de gestion de stock alimentaire — v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}