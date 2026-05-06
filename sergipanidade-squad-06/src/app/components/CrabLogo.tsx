import logoImage from 'figma:asset/24713a6dad66889762ead22d6968ece9f3b7797f.png';

interface CrabLogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

export function CrabLogo({ size = 52, variant = 'light' }: CrabLogoProps) {
  return (
    <img
      src={logoImage}
      alt="Sergipanidade Logo"
      style={{ width: size, height: size }}
      className="object-contain"
    />
  );
}