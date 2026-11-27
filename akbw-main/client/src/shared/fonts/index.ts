import localFont from 'next/font/local';

export const Kenao = localFont({
  src: [
    {
      path: '../../../public/fonts/Kenao.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-kenao',
  display: 'swap',
});

export const monsterrat = {
  variable: '--font-montserrat',
  className: 'font-montserrat',
  style: { fontFamily: 'Montserrat, system-ui, -apple-system, sans-serif' },
};

export const Radiant = localFont({
  src: [
    {
      path: '../../../public/fonts/OPTIRadiant-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-radiant',
  display: 'swap',
});

export const Didot = localFont({
  src: [
    {
      path: '../../../public/fonts/DidotBold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-didot',
  display: 'swap',
});

export const Granjon = localFont({
  src: [
    {
      path: '../../../public/fonts/GranjonRoman.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-granjon',
  display: 'swap',
});

export const Rosan = localFont({
  src: [
    {
      path: '../../../public/fonts/Rosan.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-rosan',
  display: 'swap',
});
