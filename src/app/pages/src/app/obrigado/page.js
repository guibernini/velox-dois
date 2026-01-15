"use client";

import { useEffect } from "react";

export default function Obrigado() {
  useEffect(() => {
    // Dispara conversão do Google Ads
    if (typeof gtag !== "undefined") {
      gtag("event", "conversion", {
        send_to: "AW-17791443438/q-NqCPPHz9UbEO7Dz6NC",
      });
    }

    // Redireciona para WhatsApp após 0,5 segundos
    const timer = setTimeout(() => {
      window.location.href = "https://wa.me/5511940306171";
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: "80px", textAlign: "center" }}>
      <h1>Obrigado pelo contato!</h1>
      <p>Em instantes você será atendido por um especialista da Velox Solar.</p>
    </div>
  );
}
