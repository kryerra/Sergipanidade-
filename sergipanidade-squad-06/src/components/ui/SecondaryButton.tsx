/**
 * SecondaryButton — botão outline
 * Sergipanidade Design System v2
 * border: 1.5px | border-radius: 8px | padding: 12px 24px
 */
import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Cor do outline — padrão preto (#111111) */
  color?: 'default' | 'orange' | 'blue' | 'red' | 'green';
  leftIcon?: React.ReactNode;
}

const COLOR_MAP = {
  default: { border: '#111111', text: '#111111', hover: '#111111', hoverText: '#FFFFFF' },
  orange:  { border: '#000080', text: '#000080', hover: '#000080', hoverText: '#FFFFFF' },
  blue:    { border: '#1565C0', text: '#1565C0', hover: '#1565C0', hoverText: '#FFFFFF' },
  red:     { border: '#D32F2F', text: '#D32F2F', hover: '#D32F2F', hoverText: '#FFFFFF' },
  green:   { border: '#2E7D32', text: '#2E7D32', hover: '#2E7D32', hoverText: '#FFFFFF' },
};

const SIZE_MAP = {
  sm: { padding: '7px 14px', fontSize: 12, minHeight: 36 },
  md: { padding: '11px 22px', fontSize: 14, minHeight: 44 },
  lg: { padding: '13px 30px', fontSize: 16, minHeight: 52 },
};

export function SecondaryButton({
  children,
  fullWidth = false,
  size = 'md',
  color = 'default',
  leftIcon,
  disabled,
  style,
  ...rest
}: SecondaryButtonProps) {
  const sizeStyle = SIZE_MAP[size];
  const colorStyle = COLOR_MAP[color];
  return (
    <button
      disabled={disabled}
      className={` ${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2 rounded-[8px] transition-colors transition-transform ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-95 active:scale-95'}`}
      style={{
        gap: 8,
        padding: sizeStyle.padding,
        minHeight: sizeStyle.minHeight,
        backgroundColor: 'transparent',
        color: disabled ? '#D8D8D8' : colorStyle.text,
        border: `1.5px solid ${disabled ? '#D8D8D8' : colorStyle.border}`,
        borderRadius: 8,
        fontSize: sizeStyle.fontSize,
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        letterSpacing: '0.06em',
        outline: 'none',
        textTransform: 'uppercase',
        ...style,
      }}
      {...rest}
    >
      {leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>}
      {children}
    </button>
  );
}
