/**
 * UserAvatar — círculo com iniciais do usuário
 * Sergipanidade Design System v2
 */

interface UserAvatarProps {
  name: string;
  /** Diâmetro em px (padrão 40) */
  size?: number;
  /** Cor de fundo customizada (padrão laranja #000080) */
  bgColor?: string;
  /** Cor do texto (padrão branco) */
  textColor?: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function UserAvatar({
  name,
  size = 40,
  bgColor = '#000080',
  textColor = '#FFFFFF',
  className = '',
}: UserAvatarProps) {
  const initials = getInitials(name || '?');
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      className={className}
      role="img"
      aria-label={`Avatar de ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontFamily: "'Fjalla One', sans-serif",
        letterSpacing: '0.04em',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}
