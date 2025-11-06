// Константы согласно СП 20.13330.2016 с Изм.5
const SNOW_DISTRICTS = {
    'I': 0.5, 'II': 1.0, 'III': 1.5, 'IV': 2.0, 
    'V': 2.5, 'VI': 3.0, 'VII': 3.5, 'VIII': 4.0
};

// п.10.12: "Для снеговых нагрузок коэффициент надежности по нагрузке γf = 1,4"
const GAMMA_F = 1.4;

// Данные по городам согласно карте районирования и СП 131.13330.2020
const CITIES_DATA = {
    'Москва': { district: 'III', temp: -7.7, wind: 4.5 },
    'Санкт-Петербург': { district: 'III', temp: -5.5, wind: 4.0 },
    'Великий Новгород': { district: 'III', temp: -8.0, wind: 4.2 },
    'Екатеринбург': { district: 'IV', temp: -12.6, wind: 5.2 },
    'Новосибирск': { district: 'IV', temp: -16.2, wind: 5.8 },
    'Нижний Новгород': { district: 'III', temp: -8.9, wind: 4.8 },
    'Казань': { district: 'III', temp: -9.8, wind: 5.1 },
    'Самара': { district: 'IV', temp: -9.5, wind: 5.3 },
    'Омск': { district: 'IV', temp: -16.3, wind: 5.6 },
    'Челябинск': { district: 'IV', temp: -12.8, wind: 5.4 },
    'Ростов-на-Дону': { district: 'II', temp: -3.1, wind: 3.8 },
    'Уфа': { district: 'IV', temp: -12.5, wind: 5.2 },
    'Волгоград': { district: 'III', temp: -6.7, wind: 4.2 },
    'Пермь': { district: 'IV', temp: -12.8, wind: 5.0 },
    'Красноярск': { district: 'IV', temp: -15.6, wind: 5.5 },
    'Воронеж': { district: 'III', temp: -6.5, wind: 4.5 },
    'Саратов': { district: 'III', temp: -7.9, wind: 4.8 },
    'Краснодар': { district: 'II', temp: -0.3, wind: 3.5 },
    'Тольятти': { district: 'IV', temp: -9.2, wind: 5.0 },
    'Ижевск': { district: 'IV', temp: -12.5, wind: 4.9 },
    'Барнаул': { district: 'IV', temp: -15.5, wind: 5.7 },
    'Ульяновск': { district: 'IV', temp: -10.1, wind: 5.1 },
    'Иркутск': { district: 'II', temp: -17.8, wind: 5.3 },
    'Хабаровск': { district: 'II', temp: -20.9, wind: 5.0 },
    'Ярославль': { district: 'III', temp: -8.9, wind: 4.6 },
    'Владивосток': { district: 'II', temp: -9.9, wind: 4.8 },
    'Махачкала': { district: 'I', temp: 1.2, wind: 3.2 },
    'Томск': { district: 'IV', temp: -17.1, wind: 5.6 },
    'Кемерово': { district: 'IV', temp: -15.8, wind: 5.4 },
    'Новокузнецк': { district: 'IV', temp: -14.2, wind: 5.5 },
    'Сочи': { district: 'I', temp: 5.0, wind: 2.8 },
    'Якутск': { district: 'II', temp: -39.6, wind: 6.2 },
    'Мурманск': { district: 'V', temp: -8.1, wind: 5.8 },
    'Архангельск': { district: 'IV', temp: -12.8, wind: 5.5 },
    'Калининград': { district: 'II', temp: -1.5, wind: 3.6 },
    'Петропавловск-Камчатский': { district: 'VII', temp: -7.6, wind: 5.9 }
};

// Коэффициенты для расчета Ce по новым правилам
const KV_COEFFICIENTS = {
    'A': {
        'cold': { 'low_wind': 1.4, 'medium_wind': 1.5, 'high_wind': 1.5 },
        'very_cold': { 'low_wind': 1.4, 'medium_wind': 1.5, 'high_wind': 1.2 },
        'extreme_cold': { 'low_wind': 1.5, 'medium_wind': 1.2, 'high_wind': 1.2 }
    },
    'B': {
        'cold': { 'low_wind': 1.4, 'medium_wind': 1.4, 'high_wind': 1.5 },
        'very_cold': { 'low_wind': 1.4, 'medium_wind': 1.4, 'high_wind': 1.5 },
        'extreme_cold': { 'low_wind': 1.4, 'medium_wind': 1.5, 'high_wind': 1.2 }
    }
};

// Константы для карт
const MAP_URLS = {
    'main': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta1.jpg',
    'krym': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta2.jpg', 
    'sakhalin': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta3.jpg'
};

// Изображения для типов покрытий
const ROOF_IMAGES = {
    'flat': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/1_Плоская.png',
    'single_slope': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/2_Односкатная.png',
    'pitched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/2_Двускатная.png',
    'arched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/3_Сводчатая.png',
    'multi_slope': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/4_Многопролетная.png',
    'height_drop': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/5_Перепад.png',
    'obstacles': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/6_Препятствия.png',
    'spatial': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/7_Пространственная.png',
    'lantern': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/8_Фонарь.png',
    'shed': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/9_Шедовая.png'
};

const ROOF_CAPTIONS = {
    'flat': 'Рис. Б.1 - Плоские покрытия (уклон ≤ 2.5%)',
    'single_slope': 'Рис. Б.1 - Односкатные покрытия (схема 3)',
    'pitched': 'Рис. Б.1 - Двускатные покрытия (схемы 1-3)',
    'arched': 'Рис. Б.2 - Сводчатые покрытия',
    'multi_slope': 'Рис. Б.3 - Многопролетные покрытия',
    'height_drop': 'Рис. Б.4 - Покрытия с перепадами высот',
    'obstacles': 'Рис. Б.5 - Покрытия с препятствиями',
    'spatial': 'Рис. Б.6 - Пространственные покрытия',
    'lantern': 'Рис. Б.7 - Покрытия с фонарями',
    'shed': 'Рис. Б.8 - Шедовые покрытия'
};

// Коэффициенты трения для материалов покрытия (таблица 10.3)
const FRICTION_COEFFICIENTS = {
    'steel_sheet': 0.02,
    'steel_folded': 0.05,
    'aluminum': 0.04,
    'glass': 0.012,
    'pvc': 0.014,
    'wood_dry': 0.055,
    'wood_wet': 0.1,
    'ice': 0.028,
    'metal_tile': 0.1,
    'ceramic_tile': 0.2
};