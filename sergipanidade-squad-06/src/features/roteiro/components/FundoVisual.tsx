import { ReactNode } from "react";
import SergipeCulturalBg from "@/imports/fundo-roteiro.png";

interface FundoVisualProps {
  children: ReactNode;
  className?: string;
}

export function FundoVisual({
  children,
  className = "",
}: FundoVisualProps) {
  return (
    <div
      className={`relative w-full min-h-screen bg-[#F7F6F3] ${className}`}
      style={{
        backgroundImage: `url(${SergipeCulturalBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Camada de sobreposição semitransparente para legibilidade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(247, 246, 243, 0.70)",
          zIndex: 0,
        }}
      />
      {/* Camada de conteúdo */}
      <div
        style={{ position: "relative", zIndex: 1 }}
        className="w-full h-full flex flex-col min-h-screen"
      >
        {children}
      </div>
    </div>
  );
}
