import { translations } from "@/constants/translations";
import { Map } from 'lucide-react';

interface GPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: 'pt' | 'en' | 'es' | 'sp';
  destinationName?: string;
  lat?: number;
  lon?: number;
}

export function GPSModal({ isOpen, onClose, onConfirm, language, destinationName, lat, lon }: GPSModalProps) {
  if (!isOpen) return null;

  const t = translations[language];

  const handleOpenMaps = () => {
    if (lat && lon) {
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
      window.open(googleMapsUrl, '_blank');
    }
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(14,14,17,0.65)] z-[1500] flex items-center justify-center">
      <div className="bg-[var(--branco)] rounded-[var(--radius)] p-8 max-w-[380px] w-[90%] text-center">
        <div className="flex justify-center mb-3 text-[var(--teal)]">
          <Map size={48} />
        </div>
        <h3 className="font-['Fjalla_One'] text-lg md:text-[22px] text-[var(--preto)] mb-2">{t.openInGPS}</h3>
        <p className="text-sm text-[#777] mb-6 leading-relaxed">
          {t.gpsRedirectMessage}
          {destinationName && (
            <span className="block mt-2 font-bold text-[var(--azul)]">{destinationName}</span>
          )}
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-3 rounded-[var(--radius-sm)] text-sm font-bold cursor-pointer border-none
                       bg-[var(--cinza-leve)] text-[var(--preto)]
                       hover:bg-[var(--cinza-med)]"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleOpenMaps}
            className="flex-1 px-3 py-3 rounded-[var(--radius-sm)] text-sm font-bold cursor-pointer border-none
                       bg-[var(--azul)] text-[var(--branco)]
                       hover:opacity-85"
          >
            {t.openMaps}
          </button>
        </div>
      </div>
    </div>
  );
}
