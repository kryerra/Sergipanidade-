/**
 * Thin wrapper kept for backward-compatibility.
 * All new code should import { Logo } from './Logo' directly.
 */
import { Logo } from './Logo';

interface SergipanidadeLogoProps {
  variant?: 'dark' | 'light';
  showSlogan?: boolean;
  iconSize?: number;
  iconOnly?: boolean;
}

export function SergipanidadeLogo({
  variant = 'dark',
  showSlogan = false,
  iconSize = 32,
  iconOnly = false,
}: SergipanidadeLogoProps) {
  if (iconOnly) {
    return (
      <Logo
        variant={variant}
        width={iconSize}
        height={iconSize}
        iconOnly
      />
    );
  }

  return (
    <Logo
  variant={variant}
  width={145}
  height={64}
  showSlogan={showSlogan}
/>
  );
}