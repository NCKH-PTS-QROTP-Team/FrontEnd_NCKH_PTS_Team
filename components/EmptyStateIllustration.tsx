import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface EmptyStateIconProps {
  size?: number;
  color?: string;
}

export const EmptyBoxIcon: React.FC<EmptyStateIconProps> = ({ size = 64, color = '#D1D5DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect x="12" y="20" width="40" height="32" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M12 28 L32 16 L52 28" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M32 16 L32 48" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Circle cx="32" cy="38" r="3" fill={color}/>
  </Svg>
);

export const EmptyUsersIcon: React.FC<EmptyStateIconProps> = ({ size = 64, color = '#D1D5DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="24" cy="20" r="8" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M10 48 C10 38 16 34 24 34 C32 34 38 38 38 48" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <Circle cx="42" cy="18" r="6" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M38 42 C38 36 40 32 42 32 C48 32 54 34 54 42" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
  </Svg>
);

export const EmptySearchIcon: React.FC<EmptyStateIconProps> = ({ size = 64, color = '#D1D5DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="26" cy="26" r="14" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M36 36 L50 50" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M26 20 L26 32 M20 26 L32 26" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const EmptyDocumentIcon: React.FC<EmptyStateIconProps> = ({ size = 64, color = '#D1D5DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Path d="M18 12 L18 52 C18 54 19 55 21 55 L43 55 C45 55 46 54 46 52 L46 20 L38 12 L21 12 C19 12 18 13 18 15 Z" stroke={color} strokeWidth="2" fill="none"/>
    <Path d="M38 12 L38 20 L46 20" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M26 30 L38 30 M26 38 L38 38 M26 46 L34 46" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const EmptyListIcon: React.FC<EmptyStateIconProps> = ({ size = 64, color = '#D1D5DB' }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Rect x="12" y="16" width="40" height="8" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <Rect x="12" y="28" width="40" height="8" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <Rect x="12" y="40" width="40" height="8" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <Circle cx="18" cy="20" r="2" fill={color}/>
    <Circle cx="18" cy="32" r="2" fill={color}/>
    <Circle cx="18" cy="44" r="2" fill={color}/>
  </Svg>
);
