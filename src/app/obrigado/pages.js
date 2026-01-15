"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function Obrigado() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    // 1. Dispara o Pixel de LEAD (Conversão Real)
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq('track', 'Lead'); 
      window.fbq('track', 'CompleteRegistration');
    }

    // 2. Recupera o link salvo
    const redirectUrl = localStorage.getItem("velox_redirect") || "https://wa.me/5511940306171";

    // 3. Redirecionamento Automático
    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3000); // Espera 3 segundos para garantir o Pixel

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0D17] flex flex-col items-center justify-center text-center px-6 font-sans text-white">
      
      <div className="bg-[#141826] p-8 rounded-3xl border border-[#00FF88]/30 shadow-[0_0_40px_rgba(0,255,136,0.1)] max-w-md w-full">
        <div className="mx-auto bg-[#00FF88]/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-[#00FF88]">
          <CheckCircle size={40} />
        </div>

        <h1 className="text-3xl font-bold mb-2">Sucesso! 🚀</h1>
        <p className="text-gray-400 mb-8">
          Recebemos sua simulação. Estamos te conectando com um especialista da Velox.
        </p>

        <div className="flex items-center justify-center gap-2 text-[#00FF88] font-bold text-lg mb-8 animate-pulse">
          <FaWhatsapp size={24} />
          Redirecionando em {count}...
        </div>

        <div className="flex justify-center">
            <Loader2 className="animate-spin text-gray-500" />
        </div>

        <button 
          onClick={() => {
            const url = localStorage.getItem("velox_redirect") || "https://wa.me/5511940306171";
            window.location.href = url;
          }}
          className="mt-8 text-sm text-gray-500 underline hover:text-white transition"
        >
          Não foi redirecionado? Clique aqui.
        </button>
      </div>
    </div>
  );
}