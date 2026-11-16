import localFont from 'next/font/local';

const golosText = localFont({
  src: [
    {
      path: '../../../public/fonts/GolosText-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/GolosText-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/GolosText-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/GolosText-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/GolosText-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-golos-text',
});

export { golosText };

// AKBW brend shriftlari (sayt bilan bir xil)
const kenao = localFont({
  src: '../../../public/fonts/Kenao.otf',
  variable: '--font-kenao',
  display: 'swap',
});
const didot = localFont({
  src: '../../../public/fonts/DidotBold.otf',
  variable: '--font-didot',
  display: 'swap',
});
const futura = localFont({
  src: '../../../public/fonts/futuralight.ttf',
  variable: '--font-futura',
  display: 'swap',
});

export { kenao, didot, futura };
