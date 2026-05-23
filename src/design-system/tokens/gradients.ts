export const gradients = {
  fire: ['#FF4B2B', '#FF416C'],
  ocean: ['#00F2FE', '#4FACFE'],
  purple: ['#8A2387', '#E94057', '#F27121'],
  sunset: ['#F27121', '#E94057'],
  midnight: ['#0F2027', '#203A43', '#2C5364'],
  premium: ['#8A2387', '#E94057'],
  success: ['#10B981', '#059669'],
  darkSurface: ['#121216', '#0B0B0E'],
  glassOverlay: ['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.03)'],
  amoledSurface: ['#0A0A0C', '#000000'],
  glowOrange: ['rgba(255, 75, 43, 0.4)', 'rgba(255, 75, 43, 0)'],
  glowPurple: ['rgba(138, 35, 135, 0.4)', 'rgba(138, 35, 135, 0)'],
};
export type GradientType = keyof typeof gradients;
