"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth.api";

export default function ResetPasswordConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const result = await resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setMessage(result);

      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-black text-gray-900 mb-3">Nouveau mot de passe</h1>
        <p className="text-gray-500 mb-6">
          Définissez un nouveau mot de passe pour votre compte.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 bg-gray-100"
          />

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-[#00A09D]"
          />

          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 outline-none focus:border-[#00A09D]"
          />

          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
          {message && <p className="text-green-600 text-sm font-semibold">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#00A09D] py-3 text-white font-bold hover:bg-[#008784]"
          >
            {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signin" className="text-[#00A09D] font-bold">
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}