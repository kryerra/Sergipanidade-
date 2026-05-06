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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        padding: sizeStyle.padding,
        minHeight: sizeStyle.minHeight,
        backgroundColor: disabled ? '#D9D9D9' : '#0D7377',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 12,
        fontSize: sizeStyle.fontSize,
        fontFamily: "'Fjalla One', sans-serif",
        letterSpacing: '0.06em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s, transform 0.12s',
        outline: 'none',
        textTransform: 'uppercase',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0A5D61';
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0D7377';
      }}
      onMouseDown={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
      {...rest}
    >
      {leftIcon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{leftIcon}</span>}
      {children}
    </button>
  );
}