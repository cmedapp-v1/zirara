import React from 'react';

interface CMEDLogoProps {
  className?: string;
  variant?: 'full' | 'emblem' | 'light' | 'white';
  height?: number | string;
}

export const CMEDLogo: React.FC<CMEDLogoProps> = ({
  className = 'h-10 w-auto',
  variant = 'full',
  height
}) => {
  const isWhite = variant === 'white';
  const textColor = isWhite ? '#FFFFFF' : '#0F172A';
  const subtextColor = isWhite ? '#CBD5E1' : '#334155';

  if (variant === 'emblem') {
    return (
      <svg
        viewBox="0 0 90 90"
        className={className}
        style={height ? { height } : undefined}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo CMED"
      >
        {/* Red Head */}
        <ellipse cx="45" cy="18" rx="10" ry="7" fill="#D93829" />
        {/* Blue Arc */}
        <path
          d="M 24 64 C 6 49 8 30 26 21 C 38 15 45 18 42 22 C 30 26 20 37 25 54 C 28 61 33 65 37 68 C 32 67 27 66 24 64 Z"
          fill="#1D70B8"
        />
        {/* Green Ribbon */}
        <path
          d="M 16 65 C 28 67 46 66 59 56 C 68 49 72 41 75 35 C 74 38 70 46 60 53 C 49 62 33 65 16 65 Z"
          fill="#15803D"
        />
        {/* Orange Arc */}
        <path
          d="M 57 30 C 70 34 84 46 84 60 C 84 73 74 85 54 90 C 64 85 71 78 74 69 C 78 58 72 43 59 35 C 57 33 55 32 53 30 C 54 30 55 30 57 30 Z"
          fill="#E58E1A"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 440 131"
      className={className}
      style={height ? { height } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Corps Marocain pour Éducation et Développement - الهيئة المغربية للتربية والتنمية"
    >
      {/* Left: Tifinagh */}
      <g
        className="font-arabic"
        textAnchor="middle"
        style={{
          fontFamily: "'Noto Sans Tifinagh', 'Segoe UI Historic', system-ui, sans-serif",
          fontWeight: 700,
          fill: textColor
        }}
      >
        <text x="85" y="44" fontSize="21" letterSpacing="0.5">
          ⵜ.ⴼ.ⵍ.ⵍ. ⵜ.ⵎⵖⵔ.ⴱⵉⵜ
        </text>
        <text x="85" y="80" fontSize="21" letterSpacing="0.5">
          ⵍ:ⵜⵔⴱⵢⵜ ⴷ:ⵓⵜⵏⵎⵉⵜ
        </text>
      </g>

      {/* Center: CMED Emblem */}
      <g id="cmed-emblem">
        {/* Red Head */}
        <ellipse cx="204" cy="22" rx="10.5" ry="7.5" fill="#D93829" />

        {/* Blue Swoosh */}
        <path
          d="M 180 72 C 160 55 162 34 182 25 C 196 19 204 22 201 26 C 187 31 176 43 182 62 C 185 70 190 74 195 78 C 189 77 184 75 180 72 Z"
          fill="#1D70B8"
        />

        {/* Green Swoosh */}
        <path
          d="M 172 73 C 185 75 204 74 218 63 C 228 55 233 46 236 40 C 235 43 230 52 220 60 C 208 70 190 73 172 73 Z"
          fill="#15803D"
        />

        {/* Orange Swoosh */}
        <path
          d="M 218 36 C 232 40 248 53 248 69 C 248 83 238 96 216 102 C 227 96 235 88 238 78 C 242 66 236 50 221 41 C 218 39 216 38 214 36 C 215 36 216 36 218 36 Z"
          fill="#E58E1A"
        />
      </g>

      {/* Right: Arabic Text */}
      <g
        className="font-arabic"
        textAnchor="end"
        style={{
          fontFamily: "'Tajawal', 'Amiri', 'Traditional Arabic', sans-serif",
          fontWeight: 800,
          fill: textColor
        }}
      >
        <text x="430" y="42" fontSize="26">
          الهيئة المغربية
        </text>
        <text x="430" y="78" fontSize="26">
          للتربية والتنمية
        </text>
      </g>

      {/* Bottom: French Subtitle */}
      <text
        x="220"
        y="114"
        textAnchor="middle"
        style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: 600,
          fontSize: '15.5px',
          fill: subtextColor,
          letterSpacing: '-0.2px'
        }}
      >
        Corps Marocain pour Éducation et Développement
      </text>
    </svg>
  );
};
