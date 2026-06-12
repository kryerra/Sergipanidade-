import { memo } from "react";
import { MapPin } from "lucide-react";
import type { Destination } from "@/constants/destinations";

interface RoteiroMapaSVGProps {
  stops: Destination[];
}

export const RoteiroMapaSVG = memo(function RoteiroMapaSVG({ stops }: RoteiroMapaSVGProps) {
  if (stops.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--cinza-leve)] rounded-[var(--radius)]">
        <div className="text-center text-[var(--cinza-txt)] p-6">
          <MapPin size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma parada no mapa</p>
        </div>
      </div>
    );
  }

  const W = 380;
  const H = 440;
  const lats = stops.map((s) => s.lat);
  const lons = stops.map((s) => s.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const padLat = Math.max((maxLat - minLat) * 0.32, 0.015);
  const padLon = Math.max((maxLon - minLon) * 0.32, 0.015);
  const bMinLat = minLat - padLat;
  const bMaxLat = maxLat + padLat;
  const bMinLon = minLon - padLon;
  const bMaxLon = maxLon + padLon;

  const px = (lon: number) => ((lon - bMinLon) / (bMaxLon - bMinLon)) * W;
  const py = (lat: number) => H - ((lat - bMinLat) / (bMaxLat - bMinLat)) * H;

  const routePts = stops.map((s) => `${px(s.lon)},${py(s.lat)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-full"
      style={{ borderRadius: "var(--radius)" }}
    >
      {/* Terra de fundo */}
      <rect width={W} height={H} fill="#EEF3EA" />
      {/* Faixa de água à direita */}
      <rect
        x={W * 0.8}
        y={0}
        width={W * 0.2}
        height={H}
        fill="#C8DFF0"
        opacity="0.7"
      />
      {/* Grade de coordenadas (Grid) */}
      {[0.25, 0.5, 0.75].map((f) => (
        <g key={f}>
          <line
            x1={W * f}
            y1={0}
            x2={W * f}
            y2={H}
            stroke="#D5DFCF"
            strokeWidth="0.8"
          />
          <line
            x1={0}
            y1={H * f}
            x2={W}
            y2={H * f}
            stroke="#D5DFCF"
            strokeWidth="0.8"
          />
        </g>
      ))}
      {/* Sombra do trajeto */}
      <polyline
        points={routePts}
        fill="none"
        stroke="#00000015"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Linha do trajeto */}
      <polyline
        points={routePts}
        fill="none"
        stroke="#0D7377"
        strokeWidth="3"
        strokeDasharray="10 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Setas de direção (pontos médios) */}
      {stops.slice(0, -1).map((s, i) => {
        const nx = stops[i + 1];
        const mx = (px(s.lon) + px(nx.lon)) / 2;
        const my = (py(s.lat) + py(nx.lat)) / 2;
        const angle =
          (Math.atan2(py(nx.lat) - py(s.lat), px(nx.lon) - px(s.lon)) * 180) /
          Math.PI;
        return (
          <text
            key={i}
            x={mx}
            y={my}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#0D7377"
            fontSize="10"
            transform={`rotate(${angle}, ${mx}, ${my})`}
          >
            ▶
          </text>
        );
      })}
      {/* Marcadores (Pins) */}
      {stops.map((s, i) => (
        <g key={s.id}>
          <circle cx={px(s.lon)} cy={py(s.lat)} r={17} fill="white" />
          <circle cx={px(s.lon)} cy={py(s.lat)} r={15} fill="#0D7377" />
          <text
            x={px(s.lon)}
            y={py(s.lat) + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="11"
            fontWeight="700"
          >
            {i + 1}
          </text>
          {/* Fundo do rótulo */}
          <rect
            x={px(s.lon) - 35}
            y={py(s.lat) + 18}
            width={70}
            height={16}
            rx={4}
            fill="rgba(255,255,255,0.88)"
          />
          <text
            x={px(s.lon)}
            y={py(s.lat) + 26}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#18181B"
            fontSize="8"
            fontWeight="600"
          >
            {s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name}
          </text>
        </g>
      ))}
      {/* Bússola */}
      <g transform={`translate(${W - 28}, 22)`}>
        <circle r={14} fill="white" fillOpacity="0.9" />
        <text
          textAnchor="middle"
          y={-4}
          fontSize="8"
          fill="#0D7377"
          fontWeight="700"
        >
          N
        </text>
        <line x1={0} y1={-10} x2={0} y2={10} stroke="#ddd" strokeWidth="1" />
        <line x1={-10} y1={0} x2={10} y2={0} stroke="#ddd" strokeWidth="1" />
      </g>
    </svg>
  );
});
