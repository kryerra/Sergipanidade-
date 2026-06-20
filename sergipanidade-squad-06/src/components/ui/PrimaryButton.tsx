/**
 * PrimaryButton — botão teal principal
 * Sergipanidade Rebrand 2026
 * border-radius: 12px | padding: 12px 24px
 */
import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Largura total do contêiner */
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Ícone à esquerda do texto */
  leftIcon?: React.ReactNode;
}

const SIZE_MAP = {
  sm: { padding: '8px 16px', fontSize: 13, minHeight: 36 },
  md: { padding: '12px 24px', fontSize: 15, minHeight: 44 },
  lg: { padding: '14px 32px', fontSize: 17, minHeight: 52 },
};

export function PrimaryButton({
  children,
  fullWidth = false,
  size = 'md',
  leftIcon,
  disabled,
  style,
  ...rest
}: PrimaryButtonProps) {
  const sizeStyle = SIZE_MAP[size];
  return (
    <button
      disabled={disabled}
      className={
        `${fullWidth ? 'w-full' : ''} inline-flex items-center justify-center gap-2 rounded-[12px] border-none font-sans font-bold uppercase transition-transform transition-colors` +
        ` ${disabled ? 'bg-[#D9D9D9] text-[#777] cursor-not-allowed' : 'bg-[#0D7377] text-white hover:bg-[#0A5D61] active:scale-95 cursor-pointer'}`
      }
      style={{
        gap: 8,
        padding: sizeStyle.padding,
        minHeight: sizeStyle.minHeight,
        borderRadius: 12,
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