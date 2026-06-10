import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MapPin,
  PawPrint,
  Search,
  TreePine,
  UtensilsCrossed,
  Waves,
  X,
} from "lucide-react";

import { destinations } from "@/constants/destinations";
import { translations } from "@/constants/translations";
import { SERGIPE_HOME_MIX } from "@/constants/sergipeImages";

import { AtracaoCard } from "@/features/home/components/AtracaoCard";
import { HotelCard } from "@/features/home/components/HotelCard";
import { HeroSlideshow } from "@/components/shared/HeroSlideshow";

import type { UserProfile } from "@/types";

const HOTEL_IMG_1 =
  "https://images.unsplash.com/photo-1512680865582-710e8a690ed6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwcG91c2FkYSUyMHNlcmdpcGUlMjBiZWFjaHxlbnwxfHx8fDE3Nzc5Mjc3MjR8MA&ixlib=rb-4.1.0&q=80&w=1080";

const HOTEL_IMG_2 =
  "https://images.unsplash.com/photo-1742818737141-c60cb17fa947?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHBvb2wlMjB0cm9waWNhbCUyMHJlc29ydCUyMEJyYXppbHxlbnwxfHx8fDE3Nzc5Mjc3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080";

const HOTEL_IMG_3 =
  "https://images.unsplash.com/photo-1776761420412-e6451f458162?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxiZWFjaGZyb250JTIwaG90ZWwlMjByZXNvcnQlMjBwb29sJTIwb2NlYW4lMjB2aWV3fGVufDF8fHx8MTc3NzkyNzczNXww&ixlib=rb-4.1.0&q=80&w=1080";

const EXPERIENCIAS_BG =
  "src/assets/images/orla-exp.jpg";

const EXPERIENCIAS_BG_2 =
  "src/assets/images/orla-por-do-sol-exp.jpg";

const EXPERIENCIAS_BG_3 =
  "src/assets/images/sj-exp1.png";

import hotelsData from "@/constants/hotels.json";

interface HotelMock {
  id: string;
  name: string;
  category: string;
  bairro: string;
  priceLevel: number;
  startingPrice: string;
  rating: number;
  reviews: string;
  image: string;
  amenities: string[];
}

interface HomeScreenProps {
  onNavigate: (screen: string, destinationId?: string) => void;
  onToast: (message: string) => void;
  language: "pt" | "en" | "es";
  onChangeLanguage: (lang: "pt" | "en" | "es") => void;
  userProfile: UserProfile;
}

const HOTELS_MOCK: HotelMock[] = hotelsData;


const DEST_LIKES: Record<string, string> = {
  "orla-atalaia": "73mil",
  miauteria: "41mil",
  "museu-gente": "28mil",
  "canion-xingo": "52mil",
  "mercado-thales": "35mil",
  "sao-cristovao": "19mil",
  "mangue-seco": "47mil",
  "praia-do-saco": "31mil",
};

function getLikes(id: string) {
  return DEST_LIKES[id] ?? "12mil";
}

export function HomeScreen({
  onNavigate,
  onToast,
  language,
  onChangeLanguage,
}: HomeScreenProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [experienciaIndex, setExperienciaIndex] = useState<number>(0);

  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[language] as typeof translations.pt;

  const experienciasSlides = useMemo(
    () => [
      {
        id: "gastronomia",
        image: EXPERIENCIAS_BG,
        tagline: t.bannerTagline || "A LAGOSTA MAIS FAMOSA DE SERGIPE",
        desc:
          t.bannerDesc ||
          "Orla de Atalaia: onde a história, o sabor e a paisagem se encontram em um único destino.",
        chips: [
          t.experienciasFrutos || "Frutos do Mar",
          t.experienciasPraias || "Praias",
          t.experienciasPasseios || "Passeios",
          t.experienciasCultura || "Cultura",
          t.experienciasEco || "Ecoturismo",
        ],
      },
      {
        id: "praias",
        image: EXPERIENCIAS_BG_2,
        tagline: "PRAIAS E PAISAGENS",
        desc:
          "Conheça cenários incríveis de Sergipe, com praias, brisa do mar e experiências perfeitas para curtir o dia.",
        chips: ["Praias", "Passeios", "Natureza", "Família", "Fotos"],
      },
      {
        id: "cultura",
        image: EXPERIENCIAS_BG_3,
        tagline: "CULTURA SERGIPANA",
        desc:
          "Explore histórias, sabores, mercados, tradições e lugares que mostram a identidade do povo sergipano.",
        chips: ["Cultura", "História", "Gastronomia", "Roteiros", "Artesanato"],
      },
    ],
    [t]
  );

  const currentExperiencia = experienciasSlides[experienciaIndex];

  const filteredDestinations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return destinations;

    return destinations.filter((destination) => {
      const desc =
        language === "en" && destination.shortDesc_en
          ? destination.shortDesc_en
          : language === "es" && destination.shortDesc_es
          ? destination.shortDesc_es
          : destination.shortDesc;

      return (
        destination.name.toLowerCase().includes(term) ||
        desc.toLowerCase().includes(term) ||
        destination.category.toLowerCase().includes(term) ||
        destination.region.toLowerCase().includes(term) ||
        destination.bairro.toLowerCase().includes(term)
      );
    });
  }, [language, searchTerm]);

  const vamosCurtirItems = useMemo(
    () => filteredDestinations.slice(0, 3),
    [filteredDestinations]
  );

  function langPillLabel() {
    if (language === "pt") return "Português";
    if (language === "en") return "English";
    return "Español";
  }

  function handleSearch() {
    const term = searchTerm.trim();

    if (term) {
      onToast(`${t.searchingFor}: ${term}`);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  function nextExperiencia() {
    setExperienciaIndex((prev) => (prev + 1) % experienciasSlides.length);
  }

  function prevExperiencia() {
    setExperienciaIndex(
      (prev) => (prev - 1 + experienciasSlides.length) % experienciasSlides.length
    );
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      setExperienciaIndex((prev) => (prev + 1) % experienciasSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [experienciasSlides.length]);

  useEffect(() => {
    if (!showLanguageMenu) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
        setShowLanguageMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLanguageMenu]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--branco)" }}>
      <HeroSlideshow
        images={SERGIPE_HOME_MIX}
        height="480px"
        overlayOpacity={0.52}
      >
        <>

          <div className="absolute top-5 right-5 sm:right-8 z-20" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setShowLanguageMenu((prev) => !prev)}
              aria-expanded={showLanguageMenu}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md
                         border border-white/20 rounded-full text-white text-[13px] font-medium
                         cursor-pointer hover:bg-white/20 transition-all duration-150 min-h-11"
            >
              <MapPin size={16} strokeWidth={2.5} style={{ color: "#0D7377" }} />
              <span>{langPillLabel()}</span>
              <ChevronDown
                size={14}
                className={`opacity-60 transition-transform ${
                  showLanguageMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showLanguageMenu && (
              <div
                className="absolute top-full right-0 mt-2 bg-white rounded-sm
                           shadow-(--sombra-md) border border-(--cinza-med)
                           overflow-hidden min-w-42.5 z-20"
              >
                {[
                  {
                    lang: "pt" as const,
                    label: "Português",
                    accent: "text-[var(--primary)] bg-[var(--laranja-leve)]",
                  },
                  {
                    lang: "en" as const,
                    label: "English",
                    accent: "text-[var(--azul)] bg-[var(--azul-leve)]",
                  },
                  {
                    lang: "es" as const,
                    label: "Español",
                    accent:
                      "text-[var(--vermelho)] bg-[rgba(232,84,58,0.07)]",
                  },
                ].map(({ lang, label, accent }) => (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => {
                      onChangeLanguage(lang);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left text-[13px]
                                font-medium transition-colors border-none cursor-pointer
                                ${
                                  language === lang
                                    ? accent
                                    : "bg-white text-(--preto) hover:bg-(--cinza-leve)"
                                }`}
                  >
                    <span>{label}</span>
                    {language === lang && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center text-center w-full px-5 sm:px-10 py-16">
            <h1
              className="font-['Fjalla_One'] text-white tracking-wide mb-4 leading-tight"
              style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
            >
              {t.homeTitle}
            </h1>

            <p
              className="text-white/70 mb-8 max-w-140 leading-relaxed"
              style={{ fontSize: "17px" }}
            >
              {t.homeSubtitle}
            </p>

            <div className="flex gap-2 w-full max-w-150">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />

                <input
                  type="text"
                  placeholder={t.searchPlaceholder?.replace("🔍  ", "")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-10 py-3.5 border-none rounded-[10px] text-[14px]
                             bg-white outline-none text-(--preto)
                             shadow-[0_4px_24px_rgba(0,0,0,0.18)] placeholder:text-gray-400"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      onToast(t.searchCleared);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center
                               justify-center bg-gray-100 text-gray-500 border-none rounded-full
                               cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="px-6 py-3.5 text-white border-none rounded-[10px]
                           font-['Fjalla_One'] text-[14px] tracking-widest uppercase cursor-pointer
                           transition-all whitespace-nowrap min-h-11"
                style={{
                  backgroundColor: "var(--primary)",
                  boxShadow: "0 4px 20px rgba(13,115,119,0.22)",
                }}
              >
                {t.searchButton}
              </button>
            </div>
          </div>
        </>
      </HeroSlideshow>

      <section
        className="px-5 sm:px-8"
        style={{
          backgroundColor: "var(--branco)",
          paddingTop: "48px",
          paddingBottom: "64px",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3
                         font-bold tracking-widest uppercase"
              style={{
                fontSize: "11px",
                backgroundColor: "rgba(13,115,119,0.10)",
                color: "var(--azul)",
                border: "1px solid rgba(13,115,119,0.22)",
              }}
            >
              {t.vamosCurtirTag}
            </div>

            <h2
              className="font-['Fjalla_One'] text-(--preto) tracking-wide leading-tight mb-2"
              style={{ fontSize: "clamp(22px, 4vw, 30px)" }}
            >
              {t.vamosCurtirTitle}
            </h2>

            <p className="text-(--cinza-txt)" style={{ fontSize: "15px" }}>
              {t.vamosCurtirSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("guia")}
            className="self-start sm:self-auto shrink-0 font-bold
                       bg-none border-none cursor-pointer hover:underline transition-all
                       text-[14px] min-h-11 flex items-center gap-1"
            style={{ color: "var(--primary)" }}
          >
            {t.viewAll}
          </button>
        </div>

        {vamosCurtirItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4 flex justify-center">
              <Search size={48} style={{ color: "var(--cinza-txt)" }} />
            </div>

            <h3
              className="font-['Fjalla_One'] text-(--preto) mb-2"
              style={{ fontSize: "24px" }}
            >
              {t.noResults?.title}
            </h3>

            <p className="text-[14px] text-(--cinza-txt) mb-6">
              {t.noResults?.message}
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                onToast(t.noResults?.cleared);
              }}
              className="px-6 py-3 text-white border-none rounded-[10px]
                         font-['Fjalla_One'] text-[13px] tracking-wider uppercase cursor-pointer
                         hover:opacity-90 transition-all min-h-11"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {t.noResults?.clearButton}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {vamosCurtirItems.map((dest) => (
              <AtracaoCard
                key={dest.id}
                id={dest.id}
                name={dest.name}
                hours={dest.hours}
                image={dest.image}
                likes={getLikes(dest.id)}
                onNavigate={onNavigate}
                onToast={onToast}
                curtirLabel={t.curtir}
                compartilharLabel={t.compartilhar}
                salvarLabel={t.salvar}
                curtidoToast={t.curtido}
                compartilhadoToast={t.compartilhado}
              />
            ))}
          </div>
        )}

        {vamosCurtirItems.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(24,24,27,0.08)" }}
            />

            <span className="text-[12px] text-(--cinza-txt) whitespace-nowrap">
              {filteredDestinations.length > 3
                ? `${t.viewAll?.replace("→", "").trim()} ${
                    filteredDestinations.length - 3
                  } ${
                    filteredDestinations.length - 3 === 1 ? t.result : t.results
                  }`
                : `${filteredDestinations.length} ${
                    filteredDestinations.length === 1 ? t.result : t.results
                  }`}
            </span>

            <div
              className="h-px flex-1"
              style={{ backgroundColor: "rgba(24,24,27,0.08)" }}
            />
          </div>
        )}
      </section>

      <section
        className="px-5 sm:px-8"
        style={{
          backgroundColor: "#FFFFFF",
          paddingTop: "48px",
          paddingBottom: "64px",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3
                         font-bold tracking-widest uppercase"
              style={{
                fontSize: "11px",
                backgroundColor: "rgba(13,115,119,0.10)",
                color: "var(--azul)",
                border: "1px solid rgba(13,115,119,0.22)",
              }}
            >
              {t.arreiMalasTag}
            </div>

            <h2
              className="font-['Fjalla_One'] text-(--preto) tracking-wide leading-tight mb-2"
              style={{ fontSize: "clamp(22px, 4vw, 30px)" }}
            >
              {t.arreiMalasTitle}
            </h2>

            <p className="text-(--cinza-txt)" style={{ fontSize: "15px" }}>
              {t.arreiMalasSubtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToast("Abrindo todas as hospedagens...")}
            className="self-start sm:self-auto shrink-0 font-bold
                       bg-none border-none cursor-pointer hover:underline transition-all
                       text-[14px] min-h-11 flex items-center gap-1"
            style={{ color: "var(--azul)" }}
          >
            {t.viewAll}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {HOTELS_MOCK.map((hotel) => (
            <HotelCard
              key={hotel.id}
              {...hotel}
              verOpcoesLabel={t.verOpcoes}
              apartirDeLabel={t.apartirDe}
              porNoiteLabel={t.porNoite}
              onToast={onToast}
            />
          ))}
        </div>
      </section>

      <section
        className="px-5 sm:px-8"
        style={{
          backgroundColor: "#1A1A1A",
          paddingTop: "48px",
          paddingBottom: "64px",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3
                         font-bold tracking-widest uppercase"
              style={{
                fontSize: "11px",
                backgroundColor: "rgba(255,255,255,0.07)",
                color: "var(--primary)",
                border: "1px solid rgba(36, 28, 100, 0.28)",
              }}
            >
              {t.experiencias360Tag}
            </div>

            <h2
              className="font-['Fjalla_One'] text-white tracking-wide leading-tight mb-2"
              style={{ fontSize: "clamp(22px, 4vw, 30px)" }}
            >
              {t.experiencias360Title}
            </h2>

            <p className="text-white/50" style={{ fontSize: "15px" }}>
              {t.experiencias360Subtitle}
            </p>
          </div>
        </div>

        <div
          className="relative rounded-2xl overflow-hidden group"
          style={{ minHeight: "450px" }}
        >
          <div
            key={currentExperiencia.id}
            className="absolute inset-0 transition-all duration-700"
            style={{
              backgroundImage: `url(${currentExperiencia.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(24,24,27,0.96) 0%, rgba(24,24,27,0.80) 45%, rgba(24,24,27,0.18) 75%, rgba(24,24,27,0.03) 100%)",
            }}
          />

          <button
            type="button"
            onClick={prevExperiencia}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full
                       border border-white/20 bg-black/30 text-white flex items-center justify-center
                       cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={nextExperiencia}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full
                       border border-white/20 bg-black/30 text-white flex items-center justify-center
                       cursor-pointer opacity-0 group-hover:opacity-100 transition-all hover:bg-black/50"
          >
            <ChevronRight size={22} />
          </button>

          <div className="relative z-10 flex flex-col justify-center h-full px-8 py-10 md:px-12 md:py-12 max-w-140">
            <p
              className="font-bold tracking-widest uppercase mb-3"
              style={{ fontSize: "11px", color: "var(--primary)" }}
            >
              {currentExperiencia.tagline}
            </p>

            <p
              className="text-white/80 mb-6 leading-relaxed"
              style={{ fontSize: "16px" }}
            >
              {currentExperiencia.desc}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {currentExperiencia.chips.map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium text-white
                             transition-colors cursor-default"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigate("guia")}
              className="self-start flex items-center gap-2 px-7 py-3.5 rounded-full
                         bg-white text-(--preto) font-bold cursor-pointer border-none
                         transition-all duration-150 min-h-12
                         hover:opacity-90 active:scale-[0.98]"
              style={{
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(255,255,255,0.12)",
              }}
            >
              {t.vejaLista}
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ backgroundColor: "var(--primary)" }}
          />
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          {experienciasSlides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              onClick={() => setExperienciaIndex(index)}
              aria-label={`Ir para experiência ${index + 1}`}
              className="rounded-full transition-all border-none cursor-pointer"
              style={{
                width: experienciaIndex === index ? "24px" : "8px",
                height: "8px",
                backgroundColor:
                  experienciaIndex === index
                    ? "var(--primary)"
                    : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </section>

      <div className="md:hidden h-[calc(64px+env(safe-area-inset-bottom))]" />
    </div>
  );
}