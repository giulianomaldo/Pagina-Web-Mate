/* Logo SVG como componente React — ENCONTRARTE INFUSIONES */
export default function Logo({ height = 48, theme = 'dark' }) {
  const textColor   = theme === 'light' ? '#ffffff' : '#23391c';
  const strokeColor = theme === 'light' ? '#ffffff' : '#23391c';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 100"
      height={height}
      width="auto"
      aria-label="Encontrarte Infusiones"
      role="img"
    >
      {/* Manos sosteniendo el mate */}
      <g stroke={strokeColor} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Mano izquierda */}
        <path d="M38 72 C30 68 24 60 26 50 C27 43 33 40 38 44"/>
        <path d="M38 44 C38 36 42 30 48 30"/>
        <path d="M26 50 C20 48 16 44 20 38 C22 34 28 34 30 38"/>
        <path d="M30 38 C28 32 30 26 36 26"/>
        <path d="M36 26 C40 20 48 20 50 26"/>

        {/* Mano derecha */}
        <path d="M82 72 C90 68 96 60 94 50 C93 43 87 40 82 44"/>
        <path d="M82 44 C82 36 78 30 72 30"/>
        <path d="M94 50 C100 48 104 44 100 38 C98 34 92 34 90 38"/>
        <path d="M90 38 C92 32 90 26 84 26"/>
        <path d="M84 26 C80 20 72 20 70 26"/>

        {/* Mate/vaso en el centro */}
        <path d="M48 30 Q50 24 60 23 Q70 24 72 30"/>
        <path d="M48 30 L46 55 Q48 62 60 63 Q72 62 74 55 L72 30"/>

        {/* Bombilla */}
        <line x1="60" y1="23" x2="60" y2="48"/>
        <circle cx="60" cy="50" r="3"/>

        {/* Hojas/vapor arriba del mate */}
        <path d="M52 18 C48 12 50 6 56 8 C54 14 56 18 52 18"/>
        <path d="M60 15 C60 8 66 5 68 10 C64 12 62 16 60 15"/>
        <path d="M68 18 C72 12 78 12 76 18 C72 18 68 22 68 18"/>

        {/* Líneas decorativas base */}
        <path d="M38 72 Q60 80 82 72" strokeWidth="1"/>
        <path d="M42 76 Q60 84 78 76" strokeWidth="0.8" strokeDasharray="2,2"/>
      </g>

      {/* Nombre principal */}
      <text
        x="118"
        y="46"
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize="22"
        fontWeight="700"
        fill={textColor}
        letterSpacing="3"
      >
        ENCONTRARTE
      </text>

      {/* Subtítulo */}
      <text
        x="122"
        y="64"
        fontFamily="'Poppins', system-ui, sans-serif"
        fontSize="10"
        fontWeight="400"
        fill={textColor}
        letterSpacing="5"
        opacity="0.7"
      >
        INFUSIONES
      </text>

      {/* Línea decorativa bajo el nombre */}
      <line x1="118" y1="70" x2="300" y2="70" stroke={strokeColor} strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}
