import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface TaviraLogoProps {
  size?: number;
}

// Layout (100x100 viewBox):
//   Circle: cx=50 cy=11 r=8   (head dot at top)
//   Arms:  two strokes connecting to the circle's lower-left (45,17) and
//          lower-right (55,17) edges, sweeping outward-upward to wide tips.
//          Circle drawn last covers the join points.
//   Teardrop: from circle bottom (50,19) downward, closing back to start.
//   Drawing order: arms → teardrop → circle (circle sits on top).
export function TaviraLogo({ size = 80 }: TaviraLogoProps) {
  const rawId = React.useId();
  const gradId = `taviraGrad${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient
          id={gradId}
          x1="0"
          y1="3"
          x2="0"
          y2="96"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0%" stopColor="#3EC6C6" />
          <Stop offset="100%" stopColor="#5B7BFF" />
        </LinearGradient>
      </Defs>

      {/* Left arm: sweeps outward-upward from circle lower-left edge to wide tip */}
      <Path
        d="M 5 22 C 3 8 40 10 45 17"
        stroke={`url(#${gradId})`}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right arm: mirror of left */}
      <Path
        d="M 95 22 C 97 8 60 10 55 17"
        stroke={`url(#${gradId})`}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Teardrop: hangs from circle bottom, widens then tapers to rounded base */}
      <Path
        d="M 50 19 C 38 30 27 48 27 64 C 27 80 37 93 50 96 C 63 93 73 80 73 64 C 73 48 62 30 50 19"
        stroke={`url(#${gradId})`}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Head dot — drawn last so it sits on top of arm join points */}
      <Circle cx="50" cy="11" r="8" fill={`url(#${gradId})`} />
    </Svg>
  );
}
