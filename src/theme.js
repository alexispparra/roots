// Central theme for the app inspired by the provided UI
const PALETTE = {
  greenDark: '#42524A',
  beige: '#F5F5DC',
  beigeLight: '#F8F6F2',
  orangePastel: '#FFC499',
  orangePastelDark: '#F8CBA6',
  white: '#FFFFFF',
  grayLight: '#E9E9E9',
  brown: '#786C3B',
  brownDark: '#964B00',
  terracotta: '#C66A5A', // ya usado en el sidebar
  sage: '#C9E4C5',
  ivory: '#F9F6F2',
  evergreen: '#68756D',
  black: '#111111', // para máximo contraste
  contrastText: '#111111', // texto sobre fondos claros
  darkText: '#212121', // texto oscuro alternativo
  lightText: '#FFFFFF', // texto sobre fondos oscuros
  shadow: '0 4px 24px rgba(66,82,74,0.08)',
  // Returns beige as rgba with variable alpha
  beigeRgba: (alpha = 1) => {
    // Convert hex #F5F5DC to rgb
    return `rgba(245,245,220,${alpha})`;
  },
};

export default PALETTE;
