export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'k';
  }
  return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getWeatherLabel(weather: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy'): { text: string; icon: string } {
  switch (weather) {
    case 'sunny':
      return { text: '晴朗烈日 ☀️', icon: '☀️' };
    case 'partly_cloudy':
      return { text: '多雲時晴 🌤️', icon: '🌤️' };
    case 'cloudy':
      return { text: '陰天 ☁️', icon: '☁️' };
    case 'rainy':
      return { text: '陰雨 🌧️', icon: '🌧️' };
    default:
      return { text: '晴朗 ☀️', icon: '☀️' };
  }
}
