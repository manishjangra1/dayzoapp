import { Platform } from 'react-native';

export function triggerConfetti() {
  if (Platform.OS === 'web') {
    try {
      const confetti = require('canvas-confetti');
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.55 },
        colors: ['#FF4B2B', '#FF416C', '#8A2387', '#E94057', '#00F2FE'],
      });
    } catch (e) {
      console.warn('Failed to fire web confetti:', e);
    }
  } else {
    console.log('🎉 Dopamine Confetti triggered on Native device!');
  }
}
