import i18n from '@/i18n';
import { Currency } from '@/types/Types';

// The API seeds currency names in English; these are the localized names by ISO code.
const NAMES: Record<'bg' | 'es', Record<string, string>> = {
  bg: {
    USD: 'Щатски долар', EUR: 'Евро', GBP: 'Британска лира', JPY: 'Японска йена', CAD: 'Канадски долар',
    AUD: 'Австралийски долар', CHF: 'Швейцарски франк', CNY: 'Китайски юан', SEK: 'Шведска крона',
    NOK: 'Норвежка крона', DKK: 'Датска крона', NZD: 'Новозеландски долар', SGD: 'Сингапурски долар',
    HKD: 'Хонконгски долар', KRW: 'Южнокорейски вон', INR: 'Индийска рупия', MXN: 'Мексиканско песо',
    BRL: 'Бразилски реал', RUB: 'Руска рубла', ZAR: 'Южноафрикански ранд', TRY: 'Турска лира',
    AED: 'Дирхам на ОАЕ', PLN: 'Полска злота', THB: 'Тайландски бат', IDR: 'Индонезийска рупия',
    MYR: 'Малайзийски рингит', PHP: 'Филипинско песо', HUF: 'Унгарски форинт', CZK: 'Чешка крона',
    ILS: 'Израелски шекел', CLP: 'Чилийско песо', PKR: 'Пакистанска рупия', EGP: 'Египетска лира',
    SAR: 'Саудитски риял', COP: 'Колумбийско песо', VND: 'Виетнамски донг', BDT: 'Бангладешка така',
    NGN: 'Нигерийска найра', KWD: 'Кувейтски динар', QAR: 'Катарски риял', OMR: 'Омански риал',
    TWD: 'Нов тайвански долар', ARS: 'Аржентинско песо', UAH: 'Украинска гривна', BGN: 'Български лев',
  },
  es: {
    USD: 'Dólar estadounidense', EUR: 'Euro', GBP: 'Libra esterlina', JPY: 'Yen japonés', CAD: 'Dólar canadiense',
    AUD: 'Dólar australiano', CHF: 'Franco suizo', CNY: 'Yuan chino', SEK: 'Corona sueca',
    NOK: 'Corona noruega', DKK: 'Corona danesa', NZD: 'Dólar neozelandés', SGD: 'Dólar de Singapur',
    HKD: 'Dólar de Hong Kong', KRW: 'Won surcoreano', INR: 'Rupia india', MXN: 'Peso mexicano',
    BRL: 'Real brasileño', RUB: 'Rublo ruso', ZAR: 'Rand sudafricano', TRY: 'Lira turca',
    AED: 'Dírham de los EAU', PLN: 'Esloti polaco', THB: 'Baht tailandés', IDR: 'Rupia indonesia',
    MYR: 'Ringgit malayo', PHP: 'Peso filipino', HUF: 'Forinto húngaro', CZK: 'Corona checa',
    ILS: 'Séquel israelí', CLP: 'Peso chileno', PKR: 'Rupia pakistaní', EGP: 'Libra egipcia',
    SAR: 'Riyal saudí', COP: 'Peso colombiano', VND: 'Dong vietnamita', BDT: 'Taka bangladesí',
    NGN: 'Naira nigeriana', KWD: 'Dinar kuwaití', QAR: 'Riyal catarí', OMR: 'Rial omaní',
    TWD: 'Nuevo dólar taiwanés', ARS: 'Peso argentino', UAH: 'Grivna ucraniana', BGN: 'Lev búlgaro',
  },
};

/** Currency name in the app language, falling back to the API's English name. */
export function getCurrencyName(currency: Pick<Currency, 'code' | 'name'>, language: string = i18n.language): string {
  const names = language === 'bg' || language === 'es' ? NAMES[language] : undefined;
  return names?.[currency.code] ?? currency.name;
}
