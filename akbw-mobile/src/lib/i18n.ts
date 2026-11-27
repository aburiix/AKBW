import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { useCallback } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Ilova tillari — sayt bilan bir xil: uz (asosiy), ru, en.
 * Kalit = o'zbekcha matn; tarjima topilmasa o'zbekchasi chiqadi.
 * {n} kabi o'rinlar vars bilan to'ldiriladi: t('{n} ta mahsulot', { n: 5 }).
 */
export type Lang = 'uz' | 'ru' | 'en';

export const LANGS: { id: Lang; title: string }[] = [
  { id: 'uz', title: 'Özbekça' },
  { id: 'ru', title: 'Русский' },
  { id: 'en', title: 'English' },
];

function deviceLang(): Lang {
  try {
    const code = getLocales()[0]?.languageCode;
    // Asosiy bozor — O'zbekiston: telefon ruscha bo'lsa ruscha, qolgan hollarda o'zbekcha.
    // Inglizchani foydalanuvchi Profil → Til'dan o'zi tanlaydi.
    if (code === 'ru') return 'ru';
  } catch {
    // e'tiborsiz
  }
  return 'uz';
}

export const useLang = create<{ lang: Lang; setLang: (l: Lang) => void }>()(
  persist((set) => ({ lang: deviceLang(), setLang: (lang) => set({ lang }) }), {
    name: 'akbw.lang',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

type Dict = Record<string, { ru: string; en: string }>;

const D: Dict = {
  // menyu va sarlavhalar
  ASOSIY: { ru: 'ГЛАВНАЯ', en: 'HOME' },
  KATALOG: { ru: 'КАТАЛОГ', en: 'CATALOG' },
  SAVAT: { ru: 'КОРЗИНА', en: 'CART' },
  PROFIL: { ru: 'ПРОФИЛЬ', en: 'PROFILE' },
  KIRISH: { ru: 'ВХОД', en: 'SIGN IN' },
  'BUYURTMA BERISH': { ru: 'ОФОРМЛЕНИЕ', en: 'CHECKOUT' },
  BUYURTMALARIM: { ru: 'МОИ ЗАКАЗЫ', en: 'MY ORDERS' },
  SEVIMLILAR: { ru: 'ИЗБРАННОЕ', en: 'FAVORITES' },
  "KIYIB KO'RISH": { ru: 'ПРИМЕРКА', en: 'TRY ON' },

  // asosiy sahifa
  "AKBW · Yangi qo'shilganlar": { ru: 'AKBW · Новинки', en: 'AKBW · New arrivals' },
  'Bizning Brendimiz — Uslub va Ishonch': { ru: 'Наш бренд — стиль и доверие', en: 'Our Brand — Style and Trust' },
  "Kiyimga bo'lgan munosabatni o'zgartiramiz. Sifatli kiyim sizning tarafingizdir.": {
    ru: 'Меняем отношение к одежде. Качественная одежда — на вашей стороне.',
    en: 'We change the way you see clothing. Quality clothing is on your side.',
  },
  'Mahsulotlar →': { ru: 'Товары →', en: 'Products →' },
  Yangilari: { ru: 'Новинки', en: 'New' },
  Fasl: { ru: 'Сезон', en: 'Season' },
  Bahor: { ru: 'Весна', en: 'Spring' },
  Yoz: { ru: 'Лето', en: 'Summer' },
  Kuz: { ru: 'Осень', en: 'Autumn' },
  Qish: { ru: 'Зима', en: 'Winter' },
  'Qayta urinish': { ru: 'Повторить', en: 'Try again' },
  'AKBW · Yangi': { ru: 'AKBW · Новое', en: 'AKBW · New' },
  Hammasi: { ru: 'Все', en: 'All' },
  "Yangi qo'shilganlar": { ru: 'Новинки', en: 'New arrivals' },
  'AKBW · Top': { ru: 'AKBW · Топ', en: 'AKBW · Top' },
  "Ko'p sotilganlar": { ru: 'Хиты продаж', en: 'Best sellers' },
  'AKBW · Asartimentlar': { ru: 'AKBW · Ассортимент', en: 'AKBW · Collections' },
  Uslublar: { ru: 'Стили', en: 'Styles' },
  '← suring · bosib oching →': { ru: '← листайте · нажмите, чтобы открыть →', en: '← swipe · tap to open →' },
  'AKBW · Brend': { ru: 'AKBW · Бренд', en: 'AKBW · Brand' },
  "Sifatli mato, puxta tikuv va o'zingizga mos uslub. AKBW AI yordamida o'lchamingizni toping va kiyimni kiyib ko'ring.": {
    ru: 'Качественная ткань, аккуратный пошив и стиль, который подходит именно вам. С AKBW AI подберите размер и примерьте одежду.',
    en: 'Quality fabric, careful tailoring and a style that suits you. Find your size and try clothes on with AKBW AI.',
  },
  'AKBW AI bilan gaplashish': { ru: 'Спросить AKBW AI', en: 'Chat with AKBW AI' },

  // katalog va filtr
  Katalog: { ru: 'Каталог', en: 'Catalog' },
  'AKBW · {n} ta mahsulot': { ru: 'AKBW · {n} товаров', en: 'AKBW · {n} products' },
  'Kiyim qidirish…': { ru: 'Поиск одежды…', en: 'Search clothes…' },
  Filtr: { ru: 'Фильтр', en: 'Filter' },
  'Filtr · {n}': { ru: 'Фильтр · {n}', en: 'Filter · {n}' },
  'Hech narsa topilmadi': { ru: 'Ничего не найдено', en: 'Nothing found' },
  'Filtrni tozalash': { ru: 'Сбросить фильтр', en: 'Clear filter' },
  Tozalash: { ru: 'Сбросить', en: 'Clear' },
  Yopish: { ru: 'Закрыть', en: 'Close' },
  Saralash: { ru: 'Сортировка', en: 'Sort' },
  Arzonroq: { ru: 'Дешевле', en: 'Cheaper' },
  Qimmatroq: { ru: 'Дороже', en: 'Pricier' },
  "Narx, so'm": { ru: 'Цена, сум', en: 'Price, UZS' },
  dan: { ru: 'от', en: 'from' },
  gacha: { ru: 'до', en: 'to' },
  '200 mingacha': { ru: 'до 200 тыс.', en: 'under 200K' },
  '200–500 ming': { ru: '200–500 тыс.', en: '200–500K' },
  '500 mingdan': { ru: 'от 500 тыс.', en: '500K+' },
  cheksiz: { ru: 'без ограничений', en: 'no limit' },
  "Qo'llash": { ru: 'Применить', en: 'Apply' },
  "Qo'llash ({n})": { ru: 'Применить ({n})', en: 'Apply ({n})' },
  'Hozir katalogda: {n} ta mahsulot': { ru: 'Сейчас в каталоге: {n} товаров', en: 'In catalog now: {n} products' },

  // mahsulot
  'Mahsulot topilmadi': { ru: 'Товар не найден', en: 'Product not found' },
  Orqaga: { ru: 'Назад', en: 'Back' },
  "O'lchamni tanlang": { ru: 'Выберите размер', en: 'Choose a size' },
  'Rangni tanlang': { ru: 'Выберите цвет', en: 'Choose a color' },
  "Savatga qo'shildi": { ru: 'Добавлено в корзину', en: 'Added to cart' },
  'Xarid davom etsin': { ru: 'Продолжить покупки', en: 'Keep shopping' },
  "Savatga o'tish": { ru: 'Перейти в корзину', en: 'Go to cart' },
  Sevimlilar: { ru: 'Избранное', en: 'Favorites' },
  "O'lcham": { ru: 'Размер', en: 'Size' },
  Rang: { ru: 'Цвет', en: 'Color' },
  "Kiyib ko'rish": { ru: 'Примерить', en: 'Try on' },
  "O'lchamni so'rash": { ru: 'Спросить размер', en: 'Ask about size' },
  Tavsif: { ru: 'Описание', en: 'Description' },
  "Savatga qo'shish": { ru: 'В корзину', en: 'Add to cart' },

  // savat
  'AKBW · Savat': { ru: 'AKBW · Корзина', en: 'AKBW · Cart' },
  Savat: { ru: 'Корзина', en: 'Cart' },
  "Savat hozircha bo'sh": { ru: 'Корзина пока пуста', en: 'Your cart is empty' },
  "Katalogga o'tish": { ru: 'Перейти в каталог', en: 'Go to catalog' },
  'Avval kiring': { ru: 'Сначала войдите', en: 'Please sign in' },
  'Buyurtma berish uchun profilingizga kiring.': {
    ru: 'Чтобы оформить заказ, войдите в профиль.',
    en: 'Sign in to your profile to place an order.',
  },
  Bekor: { ru: 'Отмена', en: 'Cancel' },
  'Bekor qilish': { ru: 'Отменить', en: 'Cancel' },
  Kirish: { ru: 'Войти', en: 'Sign in' },
  Jami: { ru: 'Итого', en: 'Total' },
  'Buyurtma berish': { ru: 'Оформить заказ', en: 'Place order' },
  "O'chirish": { ru: 'Удалить', en: 'Remove' },

  // buyurtma berish
  "Yetkazib berish xizmati (BTS) hozircha ishlamayapti. Birozdan keyin urinib ko'ring.": {
    ru: 'Служба доставки (BTS) сейчас недоступна. Попробуйте чуть позже.',
    en: 'The delivery service (BTS) is unavailable right now. Please try again later.',
  },
  'Buyurtma qabul qilindi': { ru: 'Заказ принят', en: 'Order received' },
  "Menejer buyurtmani tekshiradi. Tasdiqlangach, «Buyurtmalarim» bo'limida to'lov qilasiz.": {
    ru: 'Менеджер проверит заказ. После подтверждения оплатите его в разделе «Мои заказы».',
    en: 'A manager will review your order. Once confirmed, pay for it in “My orders”.',
  },
  Buyurtmalarim: { ru: 'Мои заказы', en: 'My orders' },
  'Buyurtma yuborilmadi': { ru: 'Заказ не отправлен', en: 'Order not sent' },
  "Savat bo'sh": { ru: 'Корзина пуста', en: 'Cart is empty' },
  'Yetkazib berish manzili': { ru: 'Адрес доставки', en: 'Delivery address' },
  'Buyurtma BTS orqali siz tanlagan filialga yetkaziladi.': {
    ru: 'Заказ будет доставлен через BTS в выбранный вами пункт.',
    en: 'Your order will be delivered via BTS to the branch you choose.',
  },
  Viloyat: { ru: 'Область', en: 'Region' },
  'Tuman / shahar': { ru: 'Район / город', en: 'District / city' },
  'BTS filiali': { ru: 'Пункт BTS', en: 'BTS branch' },
  Buyurtma: { ru: 'Заказ', en: 'Order' },
  'Yetkazib berish': { ru: 'Доставка', en: 'Delivery' },
  "To'lov menejer buyurtmani tasdiqlagandan keyin Payme, Click yoki Paynet orqali qilinadi. Yakuniy summa tasdiqlangan buyurtmada ko'rsatiladi.":
    {
      ru: 'Оплата через Payme, Click или Paynet после подтверждения заказа менеджером. Итоговая сумма будет указана в подтверждённом заказе.',
      en: 'Payment via Payme, Click or Paynet after a manager confirms the order. The final amount is shown in the confirmed order.',
    },
  'Buyurtmani yuborish': { ru: 'Отправить заказ', en: 'Send order' },
  'Yuklanmoqda…': { ru: 'Загрузка…', en: 'Loading…' },
  Tanlang: { ru: 'Выберите', en: 'Choose' },
  'Qidirish…': { ru: 'Поиск…', en: 'Search…' },

  // buyurtmalar
  Tekshirilmoqda: { ru: 'На проверке', en: 'Under review' },
  "To'lov kutilmoqda": { ru: 'Ожидает оплаты', en: 'Awaiting payment' },
  "To'langan": { ru: 'Оплачен', en: 'Paid' },
  "Yo'lda": { ru: 'В пути', en: 'On the way' },
  'Bekor qilingan': { ru: 'Отменён', en: 'Cancelled' },
  "To'lov havolasi olinmadi": { ru: 'Не удалось получить ссылку на оплату', en: 'Could not get the payment link' },
  "To'lov ochilmadi": { ru: 'Оплата не открылась', en: 'Payment did not open' },
  "Hali buyurtma yo'q": { ru: 'Заказов пока нет', en: 'No orders yet' },
  "To'lash": { ru: 'Оплатить', en: 'Pay' },
  "Menejer tasdiqlagach, shu yerda to'lov tugmasi chiqadi.": {
    ru: 'После подтверждения менеджером здесь появится кнопка оплаты.',
    en: 'Once a manager confirms, the pay button will appear here.',
  },
  "To'lov usuli": { ru: 'Способ оплаты', en: 'Payment method' },
  'Mahsulot #{n}': { ru: 'Товар #{n}', en: 'Product #{n}' },

  // profil
  Avto: { ru: 'Авто', en: 'Auto' },
  Tungi: { ru: 'Тёмная', en: 'Dark' },
  Kunduzgi: { ru: 'Светлая', en: 'Light' },
  "Ko'rinish": { ru: 'Оформление', en: 'Appearance' },
  "«Avto» — telefoningiz sozlamasiga qarab o'zi almashadi.": {
    ru: '«Авто» — переключается по настройке телефона.',
    en: '“Auto” follows your phone setting.',
  },
  Til: { ru: 'Язык', en: 'Language' },
  'Shaxsiy kabinet': { ru: 'Личный кабинет', en: 'My account' },
  "Buyurtmalar, saqlangan ma'lumotlar, kiyib ko'rish va AKBW AI uchun profilingizga kiring.": {
    ru: 'Войдите, чтобы видеть заказы, сохранённые данные, примерку и AKBW AI.',
    en: 'Sign in for orders, saved details, try-on and AKBW AI.',
  },
  "Kirish / Ro'yxatdan o'tish": { ru: 'Вход / Регистрация', en: 'Sign in / Sign up' },
  'AKBW · Kabinet': { ru: 'AKBW · Кабинет', en: 'AKBW · Account' },
  Profil: { ru: 'Профиль', en: 'Profile' },
  'Yordam · AKBW AI': { ru: 'Помощь · AKBW AI', en: 'Help · AKBW AI' },
  'Saytni ochish': { ru: 'Открыть сайт', en: 'Open website' },
  Chiqish: { ru: 'Выйти', en: 'Sign out' },
  'Profildan chiqasizmi?': { ru: 'Выйти из профиля?', en: 'Sign out of your profile?' },

  // kirish
  "Ro'yxatdan o'tish": { ru: 'Регистрация', en: 'Sign up' },
  'Telefon raqamingizni kiriting — SMS orqali kod yuboramiz.': {
    ru: 'Введите номер телефона — мы отправим код по SMS.',
    en: 'Enter your phone number — we will text you a code.',
  },
  'Kod olish': { ru: 'Получить код', en: 'Get code' },
  '{n} raqamiga yuborilgan kodni kiriting.': { ru: 'Введите код, отправленный на {n}.', en: 'Enter the code sent to {n}.' },
  Tasdiqlash: { ru: 'Подтвердить', en: 'Confirm' },
  'Qayta yuborish ({n})': { ru: 'Отправить снова ({n})', en: 'Resend ({n})' },
  'Kodni qayta yuborish': { ru: 'Отправить код снова', en: 'Resend code' },
  "Raqamni o'zgartirish": { ru: 'Изменить номер', en: 'Change number' },
  'Siz yangi foydalanuvchisiz. Ismingizni kiriting.': { ru: 'Вы новый пользователь. Введите имя.', en: 'You are new here. Enter your name.' },
  Ism: { ru: 'Имя', en: 'First name' },
  Familiya: { ru: 'Фамилия', en: 'Last name' },
  Erkak: { ru: 'Мужской', en: 'Male' },
  Ayol: { ru: 'Женский', en: 'Female' },
  'Xatolik yuz berdi': { ru: 'Произошла ошибка', en: 'Something went wrong' },

  // AI
  'AKBW AI': { ru: 'AKBW AI', en: 'AKBW AI' },
  "Shaxsiy moda yordamchingiz: o'lcham, kiyim tanlash va uslub bo'yicha maslahat beradi.": {
    ru: 'Ваш личный модный помощник: подскажет размер, одежду и стиль.',
    en: 'Your personal fashion assistant: advice on size, outfits and style.',
  },
  Tarix: { ru: 'История', en: 'History' },
  Yangi: { ru: 'Новый', en: 'New' },
  'Salom! Men AKBW AI.': { ru: 'Привет! Я AKBW AI.', en: "Hi! I'm AKBW AI." },
  "Kiyim, o'lcham yoki uslub haqida so'rang.": { ru: 'Спросите об одежде, размере или стиле.', en: 'Ask about clothes, sizes or style.' },
  'Menga qaysi o‘lcham to‘g‘ri keladi?': { ru: 'Какой размер мне подойдёт?', en: 'Which size fits me?' },
  'Ofis uchun kiyim tavsiya qil': { ru: 'Посоветуй одежду для офиса', en: 'Suggest an office outfit' },
  'Yangi kelgan kiyimlarni ko‘rsat': { ru: 'Покажи новинки', en: 'Show me new arrivals' },
  'Qishga nima kiyay?': { ru: 'Что надеть зимой?', en: 'What should I wear in winter?' },
  'Katalogdan qidiryapman…': { ru: 'Ищу в каталоге…', en: 'Searching the catalog…' },
  "Mahsulotni ko'ryapman…": { ru: 'Смотрю товар…', en: 'Looking at the product…' },
  "O'lchamni hisoblayapman…": { ru: 'Подбираю размер…', en: 'Working out the size…' },
  "Buyurtmalaringizni ko'ryapman…": { ru: 'Смотрю ваши заказы…', en: 'Checking your orders…' },
  'Eslab qolyapman…': { ru: 'Запоминаю…', en: 'Remembering…' },
  'Unutyapman…': { ru: 'Забываю…', en: 'Forgetting…' },
  'Ishlayapman…': { ru: 'Работаю…', en: 'Working…' },
  'Yozyapti…': { ru: 'Печатает…', en: 'Typing…' },
  'Savol yozing…': { ru: 'Напишите вопрос…', en: 'Type a question…' },
  'Bugun qoldi: {a} / {b}': { ru: 'Осталось сегодня: {a} / {b}', en: 'Left today: {a} / {b}' },
  Suhbatlar: { ru: 'Диалоги', en: 'Chats' },
  "Hali suhbat yo'q": { ru: 'Диалогов пока нет', en: 'No chats yet' },
  Suhbat: { ru: 'Диалог', en: 'Chat' },
  'AI siz haqingizda eslab qolgan': { ru: 'Что AI запомнил о вас', en: 'What AI remembers about you' },
  Tor: { ru: 'Плотная', en: 'Snug' },
  Keng: { ru: 'Свободная', en: 'Loose' },
  Odatiy: { ru: 'Обычная', en: 'Regular' },
  "{n} o'tirish": { ru: '{n} посадка', en: '{n} fit' },
  " · o'lchamlar orasida": { ru: ' · между размерами', en: ' · between sizes' },
  'AKBW AI hali ishga tushirilmagan. Tez orada!': { ru: 'AKBW AI ещё не запущен. Скоро!', en: 'AKBW AI is not live yet. Coming soon!' },
  'Bugungi savollar limiti tugadi. Ertaga yana yozing.': {
    ru: 'Лимит вопросов на сегодня исчерпан. Напишите завтра.',
    en: "Today's question limit is reached. Write again tomorrow.",
  },
  'Suhbat juda uzun bo‘ldi — yangi suhbat oching.': { ru: 'Диалог слишком длинный — начните новый.', en: 'This chat is too long — start a new one.' },
  'Iltimos, profilingizga qayta kiring.': { ru: 'Пожалуйста, войдите снова.', en: 'Please sign in again.' },
  'Xabar bo‘sh.': { ru: 'Сообщение пустое.', en: 'The message is empty.' },
  'Bu savolga javob bera olmayman. Boshqacha so‘rab ko‘ring.': {
    ru: 'Не могу ответить на этот вопрос. Попробуйте спросить иначе.',
    en: "I can't answer that. Try asking differently.",
  },
  'Javob olishda xatolik bo‘ldi. Qayta urinib ko‘ring.': { ru: 'Ошибка при получении ответа. Попробуйте ещё раз.', en: 'Failed to get a reply. Please try again.' },

  // kiyib ko'rish
  'Ruxsat kerak': { ru: 'Нужно разрешение', en: 'Permission needed' },
  'Kameraga ruxsat bering (Sozlamalar → Expo Go).': { ru: 'Разрешите доступ к камере (Настройки → Expo Go).', en: 'Allow camera access (Settings → Expo Go).' },
  'Rasmlarga ruxsat bering.': { ru: 'Разрешите доступ к фото.', en: 'Allow access to photos.' },
  "Rasmni o'qib bo'lmadi": { ru: 'Не удалось прочитать фото', en: 'Could not read the photo' },
  'Boshqa rasm tanlang.': { ru: 'Выберите другое фото.', en: 'Choose another photo.' },
  "Kiyib ko'rish ishlamadi": { ru: 'Примерка не удалась', en: 'Try-on failed' },
  "Kiyib ko'rish xizmati hali ishga tushirilmagan. Tez orada!": { ru: 'Примерка ещё не запущена. Скоро!', en: 'Try-on is not live yet. Coming soon!' },
  'Bugungi urinishlar tugadi. Ertaga yana urinib ko‘ring.': { ru: 'Попытки на сегодня закончились. Попробуйте завтра.', en: "Today's attempts are used up. Try again tomorrow." },
  "Kiyib ko'rish faqat ro'yxatdan o'tganlar uchun.": { ru: 'Примерка доступна только зарегистрированным.', en: 'Try-on is for registered users only.' },
  "O'zingizning to'liq bo'y rasmingizni yuklang — AI {n} ustingizga kiygizib ko'rsatadi.": {
    ru: 'Загрузите своё фото в полный рост — AI покажет на вас {n}.',
    en: 'Upload a full-length photo of yourself — AI will show {n} on you.',
  },
  kiyimni: { ru: 'одежду', en: 'the outfit' },
  'Xizmat hali ishga tushirilmagan — tez orada.': { ru: 'Сервис ещё не запущен — скоро.', en: 'Not live yet — coming soon.' },
  Siz: { ru: 'Вы', en: 'You' },
  'Suratga olish': { ru: 'Сделать фото', en: 'Take photo' },
  Galereya: { ru: 'Галерея', en: 'Gallery' },
  'AI ishlayapti…': { ru: 'AI работает…', en: 'AI is working…' },
  'Bu 10–40 soniya davom etadi': { ru: 'Это займёт 10–40 секунд', en: 'This takes 10–40 seconds' },
  Natija: { ru: 'Результат', en: 'Result' },

  // umumiy xatolar
  "Internet bilan aloqa yo'q. Qayta urinib ko'ring.": { ru: 'Нет соединения с интернетом. Попробуйте ещё раз.', en: 'No internet connection. Please try again.' },
  "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.": { ru: 'Слишком много попыток. Попробуйте чуть позже.', en: 'Too many attempts. Please try again later.' },
  "Internet bilan aloqa yo'q yoki javob juda uzoq kutildi.": { ru: 'Нет соединения или ответ слишком долгий.', en: 'No connection or the response took too long.' },
  "SMS yuborib bo'lmadi. Birozdan keyin qayta urinib ko'ring.": { ru: 'Не удалось отправить SMS. Попробуйте чуть позже.', en: 'Could not send the SMS. Please try again later.' },
  "so'm": { ru: 'сум', en: 'UZS' },
  "Sevimlilar bo'sh. Mahsulot sahifasidagi ♡ tugmasini bosing.": {
    ru: 'В избранном пусто. Нажмите ♡ на странице товара.',
    en: 'No favorites yet. Tap ♡ on a product page.',
  },
  // yangi profil
  Sozlamalar: { ru: 'Настройки', en: 'Settings' },
  Bildirishnomalar: { ru: 'Уведомления', en: 'Notifications' },
  Yordam: { ru: 'Помощь', en: 'Help' },
  'AKBW AI yordamchi': { ru: 'Помощник AKBW AI', en: 'AKBW AI assistant' },
  "Biz bilan bog'lanish": { ru: 'Связаться с нами', en: 'Contact us' },
  "Qo'ng'iroq qilish": { ru: 'Позвонить', en: 'Call us' },
  "Qo'ng'iroq": { ru: 'Звонок', en: 'Call' },
  "Ma'lumot": { ru: 'Информация', en: 'Information' },
  'Maxfiylik siyosati': { ru: 'Политика конфиденциальности', en: 'Privacy policy' },
  'Foydalanish shartlari': { ru: 'Условия использования', en: 'Terms of use' },
  'Men AKBW': { ru: 'Я принимаю', en: 'I agree to the AKBW' },
  'va': { ru: 'и', en: 'and' },
  'bilan tanishdim va roziman.': { ru: 'AKBW.', en: '.' },
  "Davom etish uchun shartlarga rozilik bering.": { ru: 'Чтобы продолжить, примите условия.', en: 'Please accept the terms to continue.' },
  Savatda: { ru: 'В корзине', en: 'In cart' },
  Tahrirlash: { ru: 'Изменить', en: 'Edit' },
  Buyurtmalar: { ru: 'Заказы', en: 'Orders' },
  "{n} ta buyurtma tasdiqlandi — to'lov qiling": { ru: 'Подтверждено заказов: {n} — оплатите', en: '{n} order(s) confirmed — please pay' },
  Xaridlar: { ru: 'Покупки', en: 'Shopping' },
  "Kiyib ko'rish tarixi": { ru: 'История примерок', en: 'Try-on history' },
  'PROFILNI TAHRIRLASH': { ru: 'РЕДАКТИРОВАНИЕ', en: 'EDIT PROFILE' },
  BILDIRISHNOMALAR: { ru: 'УВЕДОМЛЕНИЯ', en: 'NOTIFICATIONS' },
  "BOG'LANISH": { ru: 'СВЯЗЬ', en: 'CONTACT' },
  "KIYIB KO'RISH TARIXI": { ru: 'ИСТОРИЯ ПРИМЕРОК', en: 'TRY-ON HISTORY' },
  Jins: { ru: 'Пол', en: 'Gender' },
  Telefon: { ru: 'Телефон', en: 'Phone' },
  Saqlash: { ru: 'Сохранить', en: 'Save' },
  "Hozircha bildirishnoma yo'q": { ru: 'Уведомлений пока нет', en: 'No notifications yet' },
  'Xabaringiz yuborildi': { ru: 'Сообщение отправлено', en: 'Message sent' },
  "Tez orada siz bilan bog'lanamiz.": { ru: 'Мы скоро с вами свяжемся.', en: 'We will get back to you soon.' },
  "Savol, taklif yoki shikoyatingizni yozing — menejer Telegram orqali ko'rib, siz bilan bog'lanadi.": {
    ru: 'Напишите вопрос, предложение или жалобу — менеджер получит его в Telegram и свяжется с вами.',
    en: 'Write your question, suggestion or complaint — a manager will see it in Telegram and contact you.',
  },
  Xabar: { ru: 'Сообщение', en: 'Message' },
  'Masalan: buyurtmam qachon yetib keladi?': { ru: 'Например: когда придёт мой заказ?', en: 'E.g. when will my order arrive?' },
  Yuborish: { ru: 'Отправить', en: 'Send' },
  "Rasmni o'chirasizmi?": { ru: 'Удалить фото?', en: 'Delete this photo?' },
  "Hali kiyib ko'rilmagan. Mahsulot sahifasida «Kiyib ko'rish» tugmasini bosing.": {
    ru: 'Примерок пока нет. Нажмите «Примерить» на странице товара.',
    en: 'No try-ons yet. Tap “Try on” on a product page.',
  },
  "O'chirish uchun rasmni bosib turing": { ru: 'Удерживайте фото, чтобы удалить', en: 'Press and hold a photo to delete it' },
  "Akkauntni o'chirish": { ru: 'Удалить аккаунт', en: 'Delete account' },
  "Akkauntni o'chirasizmi?": { ru: 'Удалить аккаунт?', en: 'Delete your account?' },
  "Ismingiz, telefon raqamingiz, AI suhbatlari va kiyib ko'rish rasmlari butunlay o'chiriladi. Buyurtmalar tarixi shaxssiz holda saqlanadi. Bu amalni qaytarib bo'lmaydi.": {
    ru: 'Ваше имя, номер телефона, диалоги с AI и фото примерок будут удалены навсегда. История заказов сохранится без персональных данных. Это действие нельзя отменить.',
    en: 'Your name, phone number, AI chats and try-on photos will be permanently deleted. Order history is kept without personal data. This cannot be undone.',
  },
  "Akkaunt o'chirildi": { ru: 'Аккаунт удалён', en: 'Account deleted' },
  // sharhlar, chat, taklif, promokod, biz haqimizda
  Sharhlar: { ru: 'Отзывы', en: 'Reviews' },
  '{n} ta sharh': { ru: 'отзывов: {n}', en: '{n} reviews' },
  'Sharh yozish': { ru: 'Написать отзыв', en: 'Write a review' },
  'Sharhimni tahrirlash': { ru: 'Изменить мой отзыв', en: 'Edit my review' },
  'Sharhni tahrirlash': { ru: 'Изменить отзыв', en: 'Edit review' },
  "Sharhni o'chirasizmi?": { ru: 'Удалить отзыв?', en: 'Delete this review?' },
  'Sharh yozish uchun profilingizga kiring.': { ru: 'Войдите, чтобы написать отзыв.', en: 'Sign in to write a review.' },
  "Hali sharh yo'q. Birinchi bo'lib fikr qoldiring!": { ru: 'Отзывов пока нет. Будьте первым!', en: 'No reviews yet. Be the first!' },
  'Mahsulot haqida fikringiz…': { ru: 'Ваше мнение о товаре…', en: 'Your thoughts on the product…' },
  "Yana ko'rsatish": { ru: 'Показать ещё', en: 'Show more' },
  Mijoz: { ru: 'Покупатель', en: 'Customer' },
  'Mamnun mijozlar': { ru: 'Довольные клиенты', en: 'Happy customers' },
  'Sevimli mijozlarimiz': { ru: 'Наши любимые клиенты', en: 'Our favorite customers' },
  'Mening sharhlarim': { ru: 'Мои отзывы', en: 'My reviews' },
  'MENING SHARHLARIM': { ru: 'МОИ ОТЗЫВЫ', en: 'MY REVIEWS' },
  'Siz hali sharh yozmagansiz. Sotib olgan kiyimingiz sahifasida «Sharh yozish» tugmasini bosing.': {
    ru: 'Вы ещё не писали отзывов. Нажмите «Написать отзыв» на странице купленной вещи.',
    en: "You haven't written any reviews yet. Tap “Write a review” on a product you bought.",
  },
  Savollar: { ru: 'Вопросы', en: 'FAQ' },
  'Yetkazib berish qancha vaqt oladi?': { ru: 'Сколько времени занимает доставка?', en: 'How long does delivery take?' },
  "O'zbekistonda standart yetkazib berish 3-5 ish kuni, xalqaro yetkazib berish 7-14 kun davom etadi.": {
    ru: 'Стандартная доставка по Узбекистану занимает 3-5 рабочих дней, международная доставка — 7-14 дней.',
    en: 'Standard delivery in Uzbekistan takes 3-5 business days, international delivery takes 7-14 days.',
  },
  'Qaytarish siyosati qanday?': { ru: 'Какова политика возврата?', en: 'What is the return policy?' },
  'Biz barcha ishlatilmagan va yuvilmagan buyumlar uchun 30 kunlik pulni qaytarish kafolati taqdim etamiz.': {
    ru: 'Мы предоставляем 30-дневную гарантию возврата денег для всех неиспользованных и нестираных вещей.',
    en: 'We offer a 30-day money-back guarantee for all unused and unwashed items.',
  },
  "Qanday qilib to'g'ri o'lchamni tanlash mumkin?": { ru: 'Как правильно выбрать размер?', en: 'How to choose the correct size?' },
  "O'lcham bo'yicha savolingiz bo'lsa, «O'lchamni so'rash» tugmasi orqali AKBW AI'dan so'rang.": {
    ru: 'Если есть вопрос о размере, спросите AKBW AI кнопкой «Спросить размер».',
    en: 'If you have a size question, ask AKBW AI via “Ask about size”.',
  },
  'Yordam chati': { ru: 'Чат поддержки', en: 'Support chat' },
  'YORDAM CHATI': { ru: 'ЧАТ ПОДДЕРЖКИ', en: 'SUPPORT CHAT' },
  "Mahsulot so'rash": { ru: 'Запросить товар', en: 'Request a product' },
  "MAHSULOT SO'RASH": { ru: 'ЗАПРОС ТОВАРА', en: 'PRODUCT REQUEST' },
  "Kerakli kiyimni so'rang": { ru: 'Запросите нужную вещь', en: 'Ask for what you need' },
  'Savolingiz bormi?': { ru: 'Есть вопрос?', en: 'Have a question?' },
  'Katalogda topilmagan kiyimning rasmini yoki tavsifini yuboring — menejer topib, narxini aytadi.': {
    ru: 'Отправьте фото или описание вещи, которой нет в каталоге, — менеджер найдёт её и сообщит цену.',
    en: "Send a photo or description of an item that isn't in the catalog — a manager will find it and quote a price.",
  },
  'Menejerga yozing — buyurtma, yetkazib berish yoki to‘lov bo‘yicha yordam beramiz.': {
    ru: 'Напишите менеджеру — поможем с заказом, доставкой или оплатой.',
    en: 'Message a manager — we help with orders, delivery and payment.',
  },
  'Xabar yozing…': { ru: 'Напишите сообщение…', en: 'Write a message…' },
  'Rasm biriktirildi': { ru: 'Фото прикреплено', en: 'Photo attached' },
  Rasm: { ru: 'Фото', en: 'Photo' },
  "Do'stlarni taklif qiling": { ru: 'Пригласите друзей', en: 'Invite friends' },
  'Taklif kodingiz': { ru: 'Ваш код приглашения', en: 'Your invite code' },
  Ulashish: { ru: 'Поделиться', en: 'Share' },
  'Taklif kodi (ixtiyoriy)': { ru: 'Код приглашения (необязательно)', en: 'Invite code (optional)' },
  "AKBW — zamonaviy kiyim do'koni. Ro'yxatdan o'tishda mening taklif kodimni kiriting: {code}\nhttps://akbw.uz": {
    ru: 'AKBW — современный магазин одежды. При регистрации введите мой код приглашения: {code}\nhttps://akbw.uz',
    en: 'AKBW — a modern clothing store. Enter my invite code when you sign up: {code}\nhttps://akbw.uz',
  },
  Promokod: { ru: 'Промокод', en: 'Promo code' },
  'Promokodni kiriting': { ru: 'Введите промокод', en: 'Enter promo code' },
  "Promokod noto'g'ri": { ru: 'Неверный промокод', en: 'Invalid promo code' },
  'Promokod topilmadi yoki muddati tugagan.': { ru: 'Промокод не найден или истёк.', en: 'Promo code not found or expired.' },
  '{n}% chegirma qo‘llandi': { ru: 'скидка {n}% применена', en: '{n}% discount applied' },
  'Biz haqimizda': { ru: 'О нас', en: 'About us' },
  'BIZ HAQIMIZDA': { ru: 'О НАС', en: 'ABOUT US' },
  'Oddiy, Sifatli Cheksiz Dizayn': { ru: 'Простой, Качественный, Безграничный Дизайн', en: 'Simple, High-Quality, Endless Design' },
  "O'zbekistonda tashkil topgan zamonaviy platforma": { ru: 'Современная платформа, созданная в Узбекистане', en: 'A modern platform founded in Uzbekistan' },
  "AKBW — O'zbekistonda tashkil topgan zamonaviy kiyim platformasi bo'lib, soddalik, sifat va minimal dizayn g'oyalariga asoslangan.": {
    ru: 'AKBW — современная платформа одежды, основанная в Узбекистане, базирующаяся на идеях простоты, качества и минималистичного дизайна.',
    en: 'AKBW is a modern clothing platform founded in Uzbekistan, based on the ideas of simplicity, quality, and minimal design.',
  },
  "Platformaning asosiy maqsadi kundalik hayot uchun qulay, zamonaviy va estetik jihatdan toza kiyimlarni taklif qilish orqali o'ziga xos uslubni shakllantirishdir.": {
    ru: 'Основная цель платформы — формирование уникального стиля путем предложения удобной, современной и эстетически чистой одежды для повседневной жизни.',
    en: 'The main goal of the platform is to shape a unique style by offering comfortable, modern, and aesthetically clean clothes for daily life.',
  },
  Vizyon: { ru: 'Видение', en: 'Vision' },
  "Vaqt sinovidan o'tadigan uslubni tanlash": { ru: 'Выбор стиля, неподвластного времени', en: 'Choosing a style that stands the test of time' },
  "Platforma g'oyasi shovqinli trendlar va tez o'zgaruvchan modadan ko'ra, uzoq muddatli qiymatga ega bo'lgan dizayn, sokin ranglar va sifatli materiallarga tayanadi.": {
    ru: 'Идея платформы опирается не на шумные тренды и быстроменяющуюся моду, а на дизайн, имеющий долгосрочную ценность, спокойные цвета и качественные материалы.',
    en: "The platform's idea relies on long-term value design, calm colors, and quality materials rather than noisy trends and fast-changing fashion.",
  },
  Minimalizm: { ru: 'Минимализм', en: 'Minimalism' },
  'Ortiqcha bezaklarsiz, tushunarli shakllar va sokin ranglar orqali xarakter ifodasi.': {
    ru: 'Выражение характера через понятные формы и спокойные цвета без лишних украшений.',
    en: 'Expressing character through clear shapes and calm colors, without excess decoration.',
  },
  Sifat: { ru: 'Качество', en: 'Quality' },
  "Har bir mahsulot tanlashdan tortib mijozga yetib borguncha qat'iy nazorat.": {
    ru: 'Строгий контроль каждого товара — от выбора до доставки клиенту.',
    en: 'Strict control of every product, from selection to delivery.',
  },
  Kelajak: { ru: 'Будущее', en: 'Future' },
  "O'zbekistonda boshlanib, xalqaro miqyosga intilayotgan barqaror rivojlanish.": {
    ru: 'Устойчивое развитие: начав в Узбекистане, стремимся к международному уровню.',
    en: 'Sustainable growth that started in Uzbekistan and aims for the international stage.',
  },
  'Rivojlanish va Maqsadlar': { ru: 'Развитие и Цели', en: 'Development and Goals' },
  "Platforma Toshkent shahrida tashkil topgan bo'lib, faoliyati ABURIIX GROUP tarkibida olib boriladi. AKBW jamoasi dizayn, sifat nazorati va onlayn savdo jarayonlariga alohida e'tibor qaratadi.": {
    ru: 'Платформа была основана в городе Ташкенте и ведет свою деятельность в составе ABURIIX GROUP. Команда AKBW уделяет особое внимание дизайну, контролю качества и процессам онлайн-продаж.',
    en: 'The platform was founded in Tashkent and operates within ABURIIX GROUP. The AKBW team pays special attention to design, quality control, and online sales processes.',
  },
  "AKBW dastlab sifatli ishlab chiqaruvchilar bilan hamkorlik qilish orqali bozorda o'z o'rnini mustahkamlashni maqsad qilgan. Kelajakda esa platforma o'z dizayniga ega bo'lgan, AKBW falsafasini to'liq aks ettiruvchi mahsulotlarni yaratishni rejalashtiradi.": {
    ru: 'AKBW изначально ставит целью укрепление своих позиций на рынке путем сотрудничества с качественными производителями. В будущем платформа планирует создавать продукцию с собственным дизайном, полностью отражающую философию AKBW.',
    en: 'AKBW initially aims to strengthen its position in the market by cooperating with quality manufacturers. In the future, the platform plans to create products with its own design, fully reflecting the AKBW philosophy.',
  },
  'AKBW Asoschisi': { ru: 'Основатель AKBW', en: 'Founder of AKBW' },
  'Profil rasmi': { ru: 'Фото профиля', en: 'Profile photo' },
  "Rasmni o'chirish": { ru: 'Удалить фото', en: 'Remove photo' },
  "Rasmni o'zgartirish": { ru: 'Изменить фото', en: 'Change photo' },
  "Rasm qo'yish": { ru: 'Добавить фото', en: 'Add photo' },
  'Old money': { ru: 'Old money', en: 'Old money' },
  Oversize: { ru: 'Оверсайз', en: 'Oversize' },
  Minimalistik: { ru: 'Минимализм', en: 'Minimalist' },
  Sport: { ru: 'Спорт', en: 'Sport' },
  Glamour: { ru: 'Гламур', en: 'Glamour' },
};

/**
 * O'zbek lotin yozuvining yangi shakli (foydalanuvchi talabi, 2026-11-27):
 * Oʻ→Ö, Gʻ→Ğ, Sh→Ş, Ch→Ç (ng, x, q o'zgarmaydi). {o'rinlar}, havolalar va @nomlar tegilmaydi.
 */
export function toNewLatin(text: string): string {
  return text
    .split(/(\{[^}]*\}|https?:\/\/\S+|@[\w.]+)/)
    .map((part, i) =>
      i % 2
        ? part
        : part
            .replace(/O['ʻ‘’`]/g, 'Ö')
            .replace(/o['ʻ‘’`]/g, 'ö')
            .replace(/G['ʻ‘’`]/g, 'Ğ')
            .replace(/g['ʻ‘’`]/g, 'ğ')
            .replace(/S[Hh]/g, 'Ş')
            .replace(/sh/g, 'ş')
            .replace(/C[Hh]/g, 'Ç')
            .replace(/ch/g, 'ç'),
    )
    .join('');
}

function fill(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

/** Komponentdan tashqarida (api, format) — joriy tilni o'qiydi. */
export function tr(uz: string, vars?: Record<string, string | number>): string {
  const lang = useLang.getState().lang;
  return fill(lang === 'uz' ? toNewLatin(uz) : (D[uz]?.[lang] ?? uz), vars);
}

/** Komponent ichida: til almashganda qayta chiziladi. */
export function useT() {
  const lang = useLang((s) => s.lang);
  return useCallback(
    (uz: string, vars?: Record<string, string | number>) => fill(lang === 'uz' ? toNewLatin(uz) : (D[uz]?.[lang] ?? uz), vars),
    [lang],
  );
}
