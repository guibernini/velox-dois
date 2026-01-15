"use client";
import { useEffect } from "react";

export default function Obrigado() {
  useEffect(() => {
    if (typeof gtag !== "undefined") {
      gtag("event", "conversion", {
        send_to: "AW-17791443438/q-NqCPPHz9UbEO7Dz6NC",
      });
    }
  }, []);

  return (
    <div style={{ padding: "80px", textAlign: "center" }}>
      <h1>Obrigado pelo contato!</h1>
      <p>Em instantes você será atendido por um especialista da Velox Solar.</p>
    </div>
  );
}
