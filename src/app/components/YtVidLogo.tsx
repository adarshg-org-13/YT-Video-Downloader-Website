export default function YtVidLogo({
  size = 32,
  color = "white",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
    >
      {/* Play button triangle */}
      <rect x="8" y="8" width="84" height="84" rx="18" fill={color} opacity="0.15" />
      <rect x="8" y="8" width="84" height="84" rx="18" stroke={color} strokeWidth="3" fill="none" />
      {/* Play triangle */}
      <polygon
        points="38,30 38,70 72,50"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Download arrow below */}
      <line x1="50" y1="78" x2="50" y2="92" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <polyline points="42,85 50,94 58,85" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
