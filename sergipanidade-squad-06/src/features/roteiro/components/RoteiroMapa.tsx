import { useEffect, useState, Component, ErrorInfo, ReactNode, useRef, memo } from "react";
import Map, { Marker, Popup, Source, Layer, NavigationControl, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Destination } from "@/constants/destinations";
import { MapPin, Star, Satellite, Map as MapIcon } from "lucide-react";
import { RoteiroMapaSVG } from "./RoteiroMapaSVG";
import "./RoteiroMapa.css";

const MAP_STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

type MapStyleKey = keyof typeof MAP_STYLES;

// Token do Mapbox proveniente do .env
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Função para verificar se o navegador do usuário suporta WebGL
const isWebGLSupported = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
};

interface RoteiroMapaProps {
  stops: Destination[];
}

/* ─── Error Boundary Local ─── */
interface ErrorBoundaryProps {
  children: ReactNode;
  stops: Destination[];
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro no renderizador do Mapbox GL:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Caso ocorra falha (ex: erro crítico do WebGL), renderiza o mapa SVG de fallback
      return <RoteiroMapaSVG stops={this.props.stops} />;
    }

    return this.props.children;
  }
}

/* ─── Componente Principal do Mapa Mapbox ─── */
function InnerRoteiroMapa({ stops }: RoteiroMapaProps) {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStop, setSelectedStop] = useState<Destination | null>(null);
  const [popupIndex, setPopupIndex] = useState<number>(-1);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("streets");

  // Se não houver paradas, exibe estado vazio
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

  // Ajusta os limites (bounds) do mapa para conter todas as paradas
  // stopsDependency evita re-rodar fitBounds se os destinos reais não mudaram
  const stopsDependency = stops.map((s) => `${s.id}-${s.lat}-${s.lon}`).join(",");

  // Ref para fitBounds para reuso no resize observer
  const fitBoundsRef = useRef<() => void>(() => {});

  fitBoundsRef.current = () => {
    if (!mapRef.current || stops.length === 0) return;
    try {
      if (stops.length === 1) {
        mapRef.current.easeTo({
          center: [stops[0].lon, stops[0].lat],
          zoom: 14,
          duration: 800,
        });
        return;
      }
      const lons = stops.map((s) => s.lon);
      const lats = stops.map((s) => s.lat);
      const minLon = Math.min(...lons);
      const minLat = Math.min(...lats);
      const maxLon = Math.max(...lons);
      const maxLat = Math.max(...lats);

      mapRef.current.fitBounds(
        [minLon, minLat, maxLon, maxLat],
        {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 800,
          maxZoom: 15,
        }
      );
    } catch (err) {
      console.warn("Erro no fitBounds:", err);
    }
  };

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !containerRef.current) return;

    // Executa fitBounds inicial
    fitBoundsRef.current();

    // Observer para atualizar o tamanho do Mapbox e recalcular limites quando o container redimensionar
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        try {
          mapRef.current.resize();
        } catch (err) {
          console.warn("Erro ao redimensionar mapa:", err);
        }
      }
      // Pequeno timeout para dar tempo de atualizar o canvas
      setTimeout(() => {
        fitBoundsRef.current();
      }, 100);
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mapLoaded, stopsDependency]);

  // Estruturação do GeoJSON para desenhar a linha do trajeto
  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: stops.map((s) => [s.lon, s.lat]),
    },
  };

  // Coordenadas iniciais centralizadas no primeiro ponto
  const initialViewport = {
    longitude: stops[0].lon,
    latitude: stops[0].lat,
    zoom: 12,
  };

  return (
    <div ref={containerRef} className="roteiro-mapa-container" style={{ position: "relative" }}>
      {/* Toggle de Estilo do Mapa */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 10,
          display: "flex",
          gap: "6px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "10px",
          padding: "5px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
      >
        <button
          onClick={() => setMapStyle("streets")}
          title="Mapa de ruas"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "7px",
            border: "none",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
            transition: "all 0.2s ease",
            background: mapStyle === "streets" ? "var(--primary, #f06030)" : "transparent",
            color: mapStyle === "streets" ? "#fff" : "var(--preto, #1a1a1a)",
          }}
        >
          <MapIcon size={14} />
          Ruas
        </button>
        <button
          onClick={() => setMapStyle("satellite")}
          title="Visualização realista por satélite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "7px",
            border: "none",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
            transition: "all 0.2s ease",
            background: mapStyle === "satellite" ? "var(--primary, #f06030)" : "transparent",
            color: mapStyle === "satellite" ? "#fff" : "var(--preto, #1a1a1a)",
          }}
        >
          <Satellite size={14} />
          Satélite
        </button>
      </div>

      <Map
        ref={mapRef}
        initialViewState={initialViewport}
        onLoad={() => setMapLoaded(true)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLES[mapStyle]}
        style={{ width: "100%", height: "100%" }}
        attributionControl={true}
      >
        {/* Controle de navegação (zoom e bússola) */}
        <NavigationControl position="top-right" showCompass={true} />

        {/* Desenha a Linha de Rota no Mapa */}
        {stops.length > 1 && (
          <Source id="route-source" type="geojson" data={geojson}>
            <Layer
              id="route-layer"
              type="line"
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
              paint={{
                "line-color": "#f06030", // Laranja da identidade visual
                "line-width": 4,
                "line-dasharray": [2, 2], // Linha tracejada para um look moderno
              }}
            />
          </Source>
        )}

        {/* Marcadores das Paradas do Roteiro */}
        {stops.map((stop, i) => (
          <Marker
            key={stop.id + "-" + i}
            longitude={stop.lon}
            latitude={stop.lat}
            anchor="center"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (selectedStop?.id === stop.id && popupIndex === i) {
                  setSelectedStop(null);
                  setPopupIndex(-1);
                } else {
                  setSelectedStop(stop);
                  setPopupIndex(i);
                }
              }}
              className="cursor-pointer group relative flex items-center justify-center"
              style={{ width: "32px", height: "32px" }}
            >
              {/* Efeito de Ping Animado */}
              <span 
                className="absolute inline-flex h-8 w-8 rounded-full bg-[var(--primary)] opacity-40 animate-ping" 
                style={{ backgroundColor: "var(--primary, #f06030)" }}
              ></span>
              
              {/* Círculo do Pin */}
              <div 
                className="relative flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold border-2 border-white shadow-lg transform group-hover:scale-115 transition-transform" 
                style={{ backgroundColor: "var(--primary, #f06030)" }}
              >
                {i + 1}
              </div>
            </div>
          </Marker>
        ))}

        {/* Popup Informativo ao Clicar em uma Parada */}
        {selectedStop && (
          <Popup
            longitude={selectedStop.lon}
            latitude={selectedStop.lat}
            anchor="top"
            onClose={() => {
              setSelectedStop(null);
              setPopupIndex(-1);
            }}
            closeOnClick={false}
            className="custom-mapbox-popup"
            maxWidth="240px"
          >
            <div className="flex flex-col gap-2 font-sans text-[var(--preto)]">
              {selectedStop.image && (
                <img
                  src={selectedStop.image}
                  alt={selectedStop.name}
                  className="w-full h-24 object-cover rounded-lg"
                />
              )}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-[var(--primary)] px-1.5 py-0.5 bg-[var(--secondary)] rounded-full uppercase tracking-wider">
                    {selectedStop.category}
                  </span>
                  <span className="text-xs font-bold text-[var(--cinza-txt)]">
                    Parada {popupIndex + 1}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[var(--preto)] leading-snug">
                  {selectedStop.name}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} className="fill-amber-400 stroke-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-600">{selectedStop.rating}</span>
                  <span className="text-[10px] text-[var(--cinza-txt)]">({selectedStop.reviews})</span>
                </div>
                <p className="text-[11px] text-[var(--cinza-txt)] mt-1.5 leading-relaxed line-clamp-2">
                  {selectedStop.shortDesc}
                </p>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

export const RoteiroMapa = memo(function RoteiroMapa({ stops }: RoteiroMapaProps) {
  const isSupported = isWebGLSupported();
  
  // Se o token estiver em branco ou o navegador não possuir WebGL, fallback automático para SVG
  if (!MAPBOX_TOKEN || !isSupported) {
    console.warn(
      !MAPBOX_TOKEN
        ? "Mapbox: VITE_MAPBOX_TOKEN não foi definido no ambiente. Usando o mapa de fallback (SVG)."
        : "Mapbox: WebGL não é suportado neste navegador. Usando o mapa de fallback (SVG)."
    );
    return <RoteiroMapaSVG stops={stops} />;
  }

  return (
    <MapErrorBoundary stops={stops}>
      <InnerRoteiroMapa stops={stops} />
    </MapErrorBoundary>
  );
});
