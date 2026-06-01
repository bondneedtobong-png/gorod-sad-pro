/**
 * Стилизованные SVG-иконки растений и объектов сада.
 * Все рисуются в quadrate viewBox 0 0 100 100 — масштабируются легко.
 * Палитра привязана к бренду (forest + wheat).
 */

interface IconProps {
  className?: string;
  season?: "spring" | "summer" | "autumn" | "winter";
}

const seasonLeafColor = {
  spring: "#A8D8A0",
  summer: "#5F8466",
  autumn: "#E69138",
  winter: "#9FC5E8",
};

const seasonBlossom = {
  spring: "#F5C7C7",
  summer: null,
  autumn: "#C0683A",
  winter: "#E8F0F5",
};

export function TreeIcon({ className, season = "summer" }: IconProps) {
  const leaf = seasonLeafColor[season];
  const blossom = seasonBlossom[season];
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="44" y="68" width="12" height="22" rx="2" fill="#3D2818" />
      <circle cx="50" cy="42" r="26" fill={leaf} opacity={season === "winter" ? 0.6 : 1} />
      <circle cx="35" cy="50" r="18" fill={leaf} opacity={season === "winter" ? 0.6 : 0.9} />
      <circle cx="65" cy="50" r="18" fill={leaf} opacity={season === "winter" ? 0.6 : 0.9} />
      {blossom && season === "spring" && (
        <>
          <circle cx="42" cy="34" r="4" fill={blossom} />
          <circle cx="58" cy="40" r="3" fill={blossom} />
          <circle cx="50" cy="28" r="3" fill={blossom} />
        </>
      )}
      {season === "winter" && (
        <>
          <circle cx="40" cy="36" r="3" fill="white" opacity="0.9" />
          <circle cx="58" cy="42" r="2.5" fill="white" opacity="0.9" />
          <circle cx="50" cy="30" r="2" fill="white" opacity="0.9" />
        </>
      )}
    </svg>
  );
}

export function ConiferIcon({ className, season = "summer" }: IconProps) {
  const dark = season === "winter" ? "#6B7F70" : "#274730";
  const mid = season === "winter" ? "#8DA993" : "#3A6240";
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="46" y="78" width="8" height="14" rx="1" fill="#3D2818" />
      <polygon points="50,12 28,46 72,46" fill={dark} />
      <polygon points="50,30 24,62 76,62" fill={mid} />
      <polygon points="50,48 22,80 78,80" fill={dark} />
      {season === "winter" && (
        <>
          <polygon points="50,12 28,46 72,46" fill="white" opacity="0.3" />
          <circle cx="36" cy="42" r="2" fill="white" />
          <circle cx="60" cy="54" r="2" fill="white" />
          <circle cx="50" cy="66" r="2.5" fill="white" />
        </>
      )}
    </svg>
  );
}

export function BushIcon({ className, season = "summer" }: IconProps) {
  const leaf = seasonLeafColor[season];
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="30" cy="60" r="22" fill={leaf} opacity="0.9" />
      <circle cx="70" cy="60" r="22" fill={leaf} opacity="0.9" />
      <circle cx="50" cy="50" r="26" fill={leaf} />
      {season === "winter" && (
        <>
          <circle cx="30" cy="55" r="3" fill="white" opacity="0.7" />
          <circle cx="70" cy="55" r="3" fill="white" opacity="0.7" />
          <circle cx="50" cy="45" r="3" fill="white" opacity="0.7" />
        </>
      )}
    </svg>
  );
}

export function FlowerBedIcon({ className, season = "summer" }: IconProps) {
  const visible = season !== "winter";
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="10" y="60" width="80" height="30" rx="6" fill="#3D2818" />
      {visible ? (
        <>
          <circle cx="22" cy="60" r="6" fill="#F5C7C7" />
          <circle cx="38" cy="56" r="7" fill="#FF9E80" />
          <circle cx="52" cy="60" r="6" fill="#D9C77A" />
          <circle cx="66" cy="55" r="7" fill="#B388FF" />
          <circle cx="80" cy="60" r="6" fill="#F5C7C7" />
          <circle cx="22" cy="60" r="2" fill="#5F8466" />
          <circle cx="38" cy="56" r="2" fill="#5F8466" />
          <circle cx="52" cy="60" r="2" fill="#5F8466" />
          <circle cx="66" cy="55" r="2" fill="#5F8466" />
          <circle cx="80" cy="60" r="2" fill="#5F8466" />
        </>
      ) : (
        <>
          <rect x="10" y="58" width="80" height="6" fill="white" opacity="0.6" />
          <circle cx="30" cy="58" r="2" fill="white" />
          <circle cx="50" cy="58" r="2" fill="white" />
          <circle cx="70" cy="58" r="2" fill="white" />
        </>
      )}
    </svg>
  );
}

export function LampIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="48" y="60" width="4" height="32" fill="#3D3D3D" />
      <rect x="44" y="88" width="12" height="4" rx="1" fill="#3D3D3D" />
      <path d="M40 56 L60 56 L56 38 L44 38 Z" fill="#D9C77A" />
      <ellipse cx="50" cy="38" rx="14" ry="4" fill="#3D3D3D" />
      <circle cx="50" cy="46" r="6" fill="#FFE08A" opacity="0.6" />
    </svg>
  );
}

export function BenchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="14" y="50" width="72" height="6" rx="1" fill="#8B5A2B" />
      <rect x="14" y="58" width="72" height="6" rx="1" fill="#8B5A2B" />
      <rect x="18" y="64" width="4" height="22" fill="#3D2818" />
      <rect x="78" y="64" width="4" height="22" fill="#3D2818" />
      <rect x="14" y="36" width="72" height="4" rx="1" fill="#8B5A2B" />
      <rect x="18" y="40" width="4" height="14" fill="#3D2818" />
      <rect x="78" y="40" width="4" height="14" fill="#3D2818" />
    </svg>
  );
}

export function FountainIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <ellipse cx="50" cy="78" rx="38" ry="10" fill="#5BA3D0" opacity="0.4" />
      <ellipse cx="50" cy="76" rx="36" ry="9" fill="#9FC5E8" />
      <ellipse cx="50" cy="74" rx="34" ry="8" fill="#5BA3D0" />
      <rect x="46" y="40" width="8" height="34" fill="#7A8B8E" />
      <ellipse cx="50" cy="40" rx="16" ry="4" fill="#9FC5E8" />
      <ellipse cx="50" cy="38" rx="14" ry="3" fill="#5BA3D0" />
      <path d="M50 28 Q42 18 38 28" stroke="#9FC5E8" strokeWidth="2" fill="none" />
      <path d="M50 28 Q58 18 62 28" stroke="#9FC5E8" strokeWidth="2" fill="none" />
      <circle cx="50" cy="20" r="3" fill="#9FC5E8" />
    </svg>
  );
}

export function PathIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect width="100" height="100" fill="#A8A29E" />
      <rect x="0" y="0" width="48" height="48" stroke="#7C7672" strokeWidth="1" fill="#BCB6B1" />
      <rect x="52" y="0" width="48" height="48" stroke="#7C7672" strokeWidth="1" fill="#A8A29E" />
      <rect x="0" y="52" width="48" height="48" stroke="#7C7672" strokeWidth="1" fill="#A8A29E" />
      <rect x="52" y="52" width="48" height="48" stroke="#7C7672" strokeWidth="1" fill="#BCB6B1" />
    </svg>
  );
}

export function LawnIcon({ className, season = "summer" }: IconProps) {
  const color =
    season === "winter"
      ? "#E8F0F5"
      : season === "autumn"
        ? "#C0A050"
        : season === "spring"
          ? "#A8D8A0"
          : "#5F8466";
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect width="100" height="100" fill={color} />
      {season !== "winter" && (
        <>
          <line x1="20" y1="20" x2="22" y2="14" stroke="#3A6240" strokeWidth="1" />
          <line x1="40" y1="30" x2="42" y2="22" stroke="#3A6240" strokeWidth="1" />
          <line x1="60" y1="40" x2="62" y2="32" stroke="#3A6240" strokeWidth="1" />
          <line x1="80" y1="20" x2="82" y2="14" stroke="#3A6240" strokeWidth="1" />
          <line x1="30" y1="60" x2="32" y2="52" stroke="#3A6240" strokeWidth="1" />
          <line x1="50" y1="70" x2="52" y2="62" stroke="#3A6240" strokeWidth="1" />
          <line x1="70" y1="80" x2="72" y2="72" stroke="#3A6240" strokeWidth="1" />
          <line x1="15" y1="85" x2="17" y2="77" stroke="#3A6240" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}

export function WaterIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect width="100" height="100" fill="#5BA3D0" />
      <path d="M0 30 Q25 22 50 30 T100 30" stroke="#9FC5E8" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M0 55 Q25 48 50 55 T100 55" stroke="#9FC5E8" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M0 80 Q25 72 50 80 T100 80" stroke="#9FC5E8" strokeWidth="2" fill="none" opacity="0.7" />
    </svg>
  );
}

export function EraserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="20" y="40" width="60" height="36" rx="6" fill="#E5D998" stroke="#B8A35F" strokeWidth="2" />
      <line x1="35" y1="50" x2="35" y2="66" stroke="#B8A35F" strokeWidth="2" />
      <line x1="50" y1="50" x2="50" y2="66" stroke="#B8A35F" strokeWidth="2" />
      <line x1="65" y1="50" x2="65" y2="66" stroke="#B8A35F" strokeWidth="2" />
    </svg>
  );
}
