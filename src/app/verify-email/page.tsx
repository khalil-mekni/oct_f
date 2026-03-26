"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth.api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Vérification en cours...");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then((res) => {
        setMessage(res || "Email verified successfully.");
        setIsSuccess(true);

        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      })
      .catch(() => {
        setMessage("Lien invalide ou expiré.");
        setIsSuccess(false);
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-10 rounded-3xl shadow-lg text-center max-w-xl w-full">
        <h1 className="text-3xl font-black mb-6 text-gray-900">
          Vérification de votre email
        </h1>

        {token ? (
          <>
            <p className={`font-semibold text-lg ${isSuccess ? "text-green-600" : "text-red-500"}`}>
              {message}
            </p>

            {isSuccess && (
              <p className="mt-4 text-sm text-gray-500">
                Redirection vers la page de connexion...
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-600">Un email de vérification a été envoyé à :</p>
            <p className="font-bold text-[#00A09D] mt-2">{email}</p>
          </>
        )}
      </div>
    </div>
  );
}