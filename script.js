// Константы и переменные
const sgValues = {
    'I': 0.8, 'II': 1.2, 'III': 1.8, 'IV': 2.4,
    'V': 3.2, 'VI': 4.0, 'VII': 5.6, 'VIII': 7.0
};

const mapUrls = {
    'main': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta1.jpg',
    'krym': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta2.jpg',
    'sakhalin': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta3.jpg'
};

const tableUrls = {
    'tableG': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/tableG.jpg',
};

// Обновляем объект с изображениями
const roofImages = {
    'single_slope': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/1_Односкатная.png',
    'pitched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/2_Двускатная.png',
    'arched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/3_Сводчатая.png',
    'pointed': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/4_Стрельчатая.png',
    'lantern': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/5_С фонарями.png',
    'long_lantern': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/6_С продольными+фонарями.png',
    'shed': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/7_Шедовые покрытия.png',
    'multi_pitched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/8_Многопролётные двускатные.png',
    'multi_arched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/9_Многопролётные сводчатые.png',
    'multi_lantern': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/10_Многопролётные с фонарями.png',
    'height_drop': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/11_С перепадом высоты.png',
    'double_height_drop': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/12_С двумя перепадами высоты.png',
    'cylindrical': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/13_Висячие цилиндрической формы.png',
    'dome': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/14_Купольные покрытия.png',
    'cone': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/15_Конические круговые покрытия.png',
    'parapet': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/16_Парапеты.png',
    'heightened': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/17_Участки при возвышающихся надстройках.png'
};

let currentScheme = 'uniform';
let currentCity = '';
let currentTemperature = null;
let currentSgMethod = 'manual';

// ФУНКЦИИ НАВИГАЦИИ
function showStep(stepNumber) {
    // Скрыть все шаги
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Показать нужный шаг
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    // Прокрутить к верху
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(nextStepNumber) {
    showStep(nextStepNumber);
}

function prevStep(prevStepNumber) {
    showStep(prevStepNumber);
}

function resetCalculator() {
    // Сбросить все значения к начальным
    document.getElementById('sgManual').value = '1.8';
    document.getElementById('ceManual').value = '1.0';
    document.getElementById('ctManual').value = '1.0';
    document.getElementById('muManual').value = '1.0';
    document.getElementById('roofAngle').value = '30';
    document.getElementById('januaryTemp').value = 'unknown';
    document.getElementById('reducedLoad').checked = false;
    
    // Скрыть отчет
    document.getElementById('report').style.display = 'none';
    
    // Вернуться к шагу 1
    showStep(1);
}

// БАЗОВЫЕ ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ МЕТОДОВ
function toggleSgMethod() {
    const method = document.querySelector('input[name="sgMethod"]:checked').value;
    currentSgMethod = method;
    document.getElementById('sgManualInput').style.display = method === 'manual' ? 'block' : 'none';
    document.getElementById('sgSpCalculation').style.display = method === 'sp' ? 'block' : 'none';
}

function toggleCeMethod() {
    const method = document.querySelector('input[name="ceMethod"]:checked').value;
    document.getElementById('ceManualInput').style.display = method === 'manual' ? 'block' : 'none';
    document.getElementById('ceSpCalculation').style.display = method === 'sp' ? 'block' : 'none';
    if (method === 'sp') {
        updateCe();
    }
}

function toggleCtMethod() {
    const method = document.querySelector('input[name="ctMethod"]:checked').value;
    document.getElementById('ctManualInput').style.display = method === 'manual' ? 'block' : 'none';
    document.getElementById('ctSpCalculation').style.display = method === 'sp' ? 'block' : 'none';
}

function toggleMuMethod() {
    const method = document.querySelector('input[name="muMethod"]:checked').value;
    document.getElementById('muManualInput').style.display = method === 'manual' ? 'block' : 'none';
    document.getElementById('muSpCalculation').style.display = method === 'sp' ? 'block' : 'none';
    if (method === 'sp') {
        updateMu();
    }
}

// Функции для работы с картой
function showSpMethod(method) {
    const cityMethod = document.getElementById('cityMethod');
    const mapMethod = document.getElementById('mapMethod');
    const mapToggleBtn = document.getElementById('mapToggleBtn');
    
    if (method === 'city') {
        cityMethod.style.display = 'block';
        mapMethod.style.display = 'none';
        if (mapToggleBtn) mapToggleBtn.style.display = 'none';
        setFromCity();
    } else {
        cityMethod.style.display = 'none';
        mapMethod.style.display = 'block';
        if (mapToggleBtn) mapToggleBtn.style.display = 'inline-block';
    }
}

function toggleMap(id) {
    const elem = document.getElementById(id);
    elem.style.display = elem.style.display === 'none' ? 'block' : 'none';
    const btn = document.getElementById('mapToggleBtn');
    if (btn) {
        btn.textContent = elem.style.display === 'none' ? '🗺️ Показать карту' : '🗺️ Скрыть карту';
    }
}

function updateMapSrc() {
    const type = document.getElementById('mapType').value;
    document.getElementById('snowMap').src = mapUrls[type];
}

// Функции для работы с городами
function setFromCity() {
    const select = document.getElementById('citySelect');
    const option = select.options[select.selectedIndex];
    currentCity = option.value;
    const district = option.getAttribute('data-district');
    const temp = option.getAttribute('data-temp') || null;
    
    currentTemperature = temp ? parseFloat(temp) : null;
    
    if (district) {
        if (document.getElementById('snowDistrictMap')) {
            document.getElementById('snowDistrictMap').value = district;
        }
    }
    
    const sg = sgValues[district] || '1.8';
    document.getElementById('sgValue').textContent = sg;
    
    // Автоматически устанавливаем температуру в селекте
    if (currentTemperature !== null) {
        const tempSelect = document.getElementById('januaryTemp');
        tempSelect.value = currentTemperature <= -5 ? 'cold' : 'warm';
    }
    
    updateTemperatureInfo();
    updateCe();
}

function updateSgFromMap() {
    const district = document.getElementById('snowDistrictMap').value;
    const sg = sgValues[district] || '';
    document.getElementById('sgValue').textContent = sg;
}

// Функции для расчета Ce
function updateCe() {
    const terrain = document.getElementById('terrainType').value;
    const protected = document.getElementById('protected').checked;
    const dimMin = parseFloat(document.getElementById('dimMin').value) || 50;
    const dimMax = parseFloat(document.getElementById('dimMax').value) || 50;
    const tempSelect = document.getElementById('januaryTemp');
    const warmJan = tempSelect.value === 'warm';
    
    // Проверка размеров
    const dimensionError = document.getElementById('dimensionError');
    if (dimMin > dimMax) {
        dimensionError.style.display = 'block';
        document.getElementById('ceValue').textContent = '❌ Ошибка в размерах';
        document.getElementById('ceCalculationDetails').innerHTML = '<p class="warning">Пожалуйста, исправьте размеры покрытия</p>';
        return;
    } else {
        dimensionError.style.display = 'none';
    }
    
    const Ce = calculateCe(terrain, dimMin, dimMax, protected, warmJan);
    document.getElementById('ceValue').textContent = `Рассчитанное значение Ce: ${Ce.toFixed(2)}`;
    
    // Обновляем детали расчета
    let details = '';
    if (protected) {
        details = '<p class="note">🏠 Здание защищено от ветра - применяется Ce = 0.85</p>';
    } else if (warmJan) {
        details = '<p class="note">🌡️ Теплая зима (t_янв > -5°C) - применяется Ce = 1.0</p>';
    } else {
        details = `<p class="note">📏 Размеры покрытия: ${dimMin}×${dimMax} м, тип местности: ${terrain}</p>`;
    }
    document.getElementById('ceCalculationDetails').innerHTML = details;
}

function calculateCe(terrain, dimMin, dimMax, protected, warmJan) {
    if (protected) return 0.85;
    if (warmJan) return 1.0;
    
    // Расчет по СП 20.13330.2016 п.10.6-10.9
    const l = Math.min(dimMin, dimMax);
    const L = Math.max(dimMin, dimMax);
    
    if (terrain === 'A') {
        if (l <= 50 && L <= 100) return 0.7;
        if (l > 100 || L > 200) return 1.0;
        return 0.85;
    } else if (terrain === 'B') {
        if (l <= 50 && L <= 100) return 0.7;
        if (l > 100 || L > 200) return 1.0;
        return 0.85;
    } else if (terrain === 'C') {
        return 1.0;
    }
    
    return 1.0;
}

// Функции для работы с температурой
function updateTemperatureInfo() {
    const temperatureInfo = document.getElementById('temperatureInfo');
    const reducedLoadCheckbox = document.getElementById('reducedLoad');
    const tempSelect = document.getElementById('januaryTemp');
    
    let temperatureHTML = '';
    let isCold = false;
    
    if (tempSelect.value === 'cold') {
        temperatureHTML = `
            <p>✅ Холодный регион - пониженная нагрузка доступна</p>
            <p class="italic">${currentCity ? `Для населенного пункта ${currentCity}` : 'Для выбранного региона'}</p>
        `;
        isCold = true;
    } else if (tempSelect.value === 'warm') {
        temperatureHTML = `
            <p>❌ Теплый регион - пониженная нагрузка не применяется</p>
            <p class="italic">${currentCity ? `Для населенного пункта ${currentCity}` : 'Для выбранного региона'}</p>
        `;
        isCold = false;
    } else {
        temperatureHTML = `
            <p class="italic">Выберите тип зимы вручную для определения возможности применения пониженной нагрузки</p>
        `;
        isCold = false;
    }
    
    if (temperatureInfo) {
        temperatureInfo.innerHTML = temperatureHTML;
    }
    
    if (reducedLoadCheckbox) {
        reducedLoadCheckbox.disabled = !isCold;
        if (!isCold) {
            reducedLoadCheckbox.checked = false;
        }
    }
}

// Функции для расчета μ
function showParams() {
    const type = document.getElementById('roofType').value;
    const ref = document.getElementById('roofType').options[document.getElementById('roofType').selectedIndex].getAttribute('data-ref');
    
    document.getElementById('roofRef').textContent = `Ссылка на СП: ${ref}`;
    
    // Обновляем изображение
    document.getElementById('roofImage').src = roofImages[type] || 'https://via.placeholder.com/400x250/3498db/ffffff?text=Изображение+не+доступно';
    
    // Обновляем параметры ввода для каждого типа
    let paramsHTML = '';
    
    switch(type) {
        case 'single_slope':
        case 'pitched':
        case 'pointed':
        case 'shed':
        case 'multi_pitched':
            paramsHTML = '<label>Угол наклона крыши α (°): <input type="number" id="roofAngle" min="0" max="90" value="30" onchange="updateMu()"></label>';
            break;
        case 'arched':
        case 'multi_arched':
            paramsHTML = `
                <label>Угол наклона крыши α (°): <input type="number" id="roofAngle" min="0" max="90" value="30" onchange="updateMu()"></label>
                <label>Отношение f/l: <input type="number" id="archRatio" step="0.01" min="0" max="1" value="0.1" onchange="updateMu()"></label>
            `;
            break;
        case 'lantern':
        case 'long_lantern':
        case 'multi_lantern':
            paramsHTML = `
                <label>Угол наклона крыши α (°): <input type="number" id="roofAngle" min="0" max="90" value="30" onchange="updateMu()"></label>
                <label>Высота фонаря h (м): <input type="number" id="lanternHeight" min="0" value="2" onchange="updateMu()"></label>
                <label>Ширина фонаря b (м): <input type="number" id="lanternWidth" min="0" value="3" onchange="updateMu()"></label>
            `;
            break;
        case 'height_drop':
            paramsHTML = `
                <label>Высота перепада h (м): <input type="number" id="heightDrop" min="0" value="2" onchange="updateMu()"></label>
                <label>Длина ската верхнего покрытия l1 (м): <input type="number" id="lengthUpper" min="0" value="10" onchange="updateMu()"></label>
                <label>Длина ската нижнего покрытия l2 (м): <input type="number" id="lengthLower" min="0" value="10" onchange="updateMu()"></label>
            `;
            break;
        case 'double_height_drop':
            paramsHTML = `
                <label>Высота первого перепада h1 (м): <input type="number" id="heightDrop1" min="0" value="2" onchange="updateMu()"></label>
                <label>Высота второго перепада h2 (м): <input type="number" id="heightDrop2" min="0" value="2" onchange="updateMu()"></label>
                <label>Длина скатов (м): <input type="number" id="lengthSlope" min="0" value="10" onchange="updateMu()"></label>
            `;
            break;
        case 'cylindrical':
            paramsHTML = '<label>Угол наклона образующей α (°): <input type="number" id="cylindricalAngle" min="0" max="90" value="30" onchange="updateMu()"></label>';
            break;
        case 'dome':
            paramsHTML = '<label>Отношение f/d: <input type="number" id="domeRatio" step="0.01" min="0" max="0.5" value="0.1" onchange="updateMu()"></label>';
            break;
        case 'cone':
            paramsHTML = '<label>Угол наклона образующей α (°): <input type="number" id="coneAngle" min="0" max="90" value="30" onchange="updateMu()"></label>';
            break;
        case 'parapet':
            paramsHTML = '<label>Высота парапета h (м): <input type="number" id="parapetHeight" min="0" value="1" onchange="updateMu()"></label>';
            break;
        case 'heightened':
            paramsHTML = `
                <label>Высота надстройки h (м): <input type="number" id="heightenedHeight" min="0" value="3" onchange="updateMu()"></label>
                <label>Ширина надстройки b (м): <input type="number" id="heightenedWidth" min="0" value="5" onchange="updateMu()"></label>
            `;
            break;
        default:
            paramsHTML = '<label>Данный тип покрытия требует специального расчета</label>';
    }
    
    document.getElementById('roofParams').innerHTML = paramsHTML;
    updateMu();
}

// Обновляем функцию updateMu для всех типов
function updateMu() {
    const type = document.getElementById('roofType').value;
    let muResults = {};
    let details = '';
    
    switch(type) {
        case 'single_slope':
            const angleSingle = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForSingleSlope(angleSingle);
            details = `Односкатная крыша, угол ${angleSingle}°`;
            break;
        case 'pitched':
            const anglePitched = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForPitchedRoof(anglePitched);
            details = `Двускатная крыша, угол ${anglePitched}°`;
            break;
        case 'pointed':
            const anglePointed = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForPointedRoof(anglePointed);
            details = `Стрельчатая крыша, угол ${anglePointed}°`;
            break;
        case 'arched':
            const angleArched = parseFloat(document.getElementById('roofAngle').value) || 0;
            const ratioArched = parseFloat(document.getElementById('archRatio').value) || 0.1;
            muResults = calculateMuForArchedRoof(ratioArched);
            details = `Сводчатая крыша, угол ${angleArched}°, f/l=${ratioArched}`;
            break;
        case 'lantern':
            const angleLantern = parseFloat(document.getElementById('roofAngle').value) || 0;
            const heightLantern = parseFloat(document.getElementById('lanternHeight').value) || 2;
            const widthLantern = parseFloat(document.getElementById('lanternWidth').value) || 3;
            muResults = calculateMuForLanternRoof(angleLantern, heightLantern, widthLantern);
            details = `Покрытие с фонарями, угол ${angleLantern}°, h=${heightLantern}м, b=${widthLantern}м`;
            break;
        case 'shed':
            const angleShed = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForShedRoof(angleShed);
            details = `Шедовое покрытие, угол ${angleShed}°`;
            break;
        case 'multi_pitched':
            const angleMulti = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForMultiPitchedRoof(angleMulti);
            details = `Многопролетное двускатное покрытие, угол ${angleMulti}°`;
            break;
        // ... и так для всех остальных типов
        default:
            muResults = {'Основная зона': 1.0};
            details = 'Стандартное значение: μ = 1.0';
    }
    
    displayMuSchemes(muResults);
    document.getElementById('muCalculationDetails').innerHTML = `<p class="note">${details}</p>`;
}

// Добавляем новые функции расчета для всех типов крыш
function calculateMuForPointedRoof(angle) {
    // Расчет для стрельчатых покрытий (аналогично арочным)
    return calculateMuForArchedRoof(angle / 90); // Упрощенный расчет
}

function calculateMuForLanternRoof(angle, height, width) {
    // Расчет для покрытий с фонарями
    const baseMu = calculateMuForSlopedRoof(angle);
    const lanternEffect = Math.min(height / 2, 1.5);
    
    return {
        'Схема 1 (основное покрытие)': {
            'Основная площадь': baseMu.toFixed(2),
            'описание': 'Распределение снега на основном покрытии',
            'применение': 'Для расчета основного покрытия'
        },
        'Схема 2 (зона фонаря)': {
            'У фонаря с наветренной стороны': (baseMu * 1.5).toFixed(2),
            'У фонаря с подветренной стороны': (baseMu * 0.5).toFixed(2),
            'описание': 'Образование снеговых мешков у фонарей',
            'применение': 'Для расчета в зонах фонарей'
        }
    };
}

function calculateMuForShedRoof(angle) {
    // Расчет для шедовых покрытий
    if (angle <= 15) return {
        'Схема 1 (равномерная)': {
            'Все скаты': 1.0,
            'описание': 'Для шедовых покрытий с малыми углами наклона',
            'применение': 'Основная схема'
        }
    };
    
    const mu = calculateMuForSlopedRoof(angle);
    return {
        'Схема 1 (равномерная)': {
            'Все скаты': mu.toFixed(2),
            'описание': 'Равномерное распределение по шедовому покрытию',
            'применение': 'Для расчета шедовых конструкций'
        }
    };
}

function calculateMuForMultiPitchedRoof(angle) {
    // Расчет для многопролетных двускатных покрытий
    const mu = calculateMuForSlopedRoof(angle);
    return {
        'Схема 1 (равномерная)': {
            'Все пролеты': mu.toFixed(2),
            'описание': 'Равномерное распределение по всем пролетам',
            'применение': 'Для расчета многопролетных покрытий'
        },
        'Схема 2 (неравномерная)': {
            'Крайние пролеты': (mu * 1.1).toFixed(2),
            'Средние пролеты': (mu * 0.9).toFixed(2),
            'описание': 'Неравномерное распределение с учетом краевых эффектов',
            'применение': 'Для уточненного расчета'
        }
    };
}

function calculateMuForDoubleHeightDrop(h1, h2, length) {
    // Расчет для покрытий с двумя перепадами высоты
    const m1 = Math.min(2 * h1, 8);
    const m2 = Math.min(2 * h2, 8);
    const mu1 = Math.min(m1, 4);
    const mu2 = Math.min(m2, 4);
    const muMax = Math.max(mu1, mu2);
    
    return {
        'Схема 1 (снеговые мешки)': {
            'У первого перепада': mu1.toFixed(2),
            'У второго перепада': mu2.toFixed(2),
            'Остальная площадь': '1.0',
            'описание': 'Образование снеговых мешков у перепадов высоты',
            'применение': 'Для расчета в зонах перепадов'
        }
    };
}

function calculateMuForParapetRoof(height) {
    // Расчет для парапетов
    const mu = Math.min(1.0 + height / 2, 2.0);
    return {
        'Схема 1 (у парапета)': {
            'Зона у парапета': mu.toFixed(2),
            'Остальная площадь': '1.0',
            'описание': 'Снегоотложение у парапетов и возвышений',
            'применение': 'Для расчета зон у парапетов'
        }
    };
}

function calculateMuForHeightenedRoof(height, width) {
    // Расчет для участков у возвышающихся надстроек
    const area = height * width;
    let mu = 1.0;
    if (area > 10) mu = 1.5;
    if (area > 20) mu = 2.0;
    if (area > 30) mu = 2.5;
    
    return {
        'Схема 1 (у надстройки)': {
            'Зона у надстройки': mu.toFixed(2),
            'Остальная площадь': '1.0',
            'описание': 'Снегоотложение у возвышающихся надстроек',
            'применение': 'Для расчета зон у надстроек'
        }
    };
}

function calculateMuForFlatRoof() {
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 1.0,
            'описание': 'Для плоских покрытий применяется равномерное распределение снега по всей площади согласно п.Б.1 СП 20.13330.2016',
            'применение': 'Используется для расчета всех элементов покрытия'
        }
    };
}

function calculateMuForSingleSlope(angle) {
    if (angle <= 25) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': 1.0,
                'описание': 'При углах наклона до 25° снег распределяется равномерно по всей поверхности ската согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Основная расчетная схема для односкатных крыш'
            }
        };
    }
    if (angle >= 60) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': 0.0,
                'описание': 'При углах наклона 60° и более снег не задерживается на поверхности согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Снеговая нагрузка не учитывается'
            }
        };
    }
    const mu = 1.0 - (angle - 25) / 35;
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu.toFixed(2),
            'описание': `Линейная интерполяция между 25° (μ=1.0) и 60° (μ=0.0) согласно п.Б.1 СП 20.13330.2016. Формула: μ = 1.0 - (α - 25°)/35°`,
            'применение': 'Основная расчетная схема для углов от 25° до 60°'
        }
    };
}

function calculateMuForPitchedRoof(angle) {
    if (angle <= 25) {
        return {
            'Схема 1 (равномерная)': {
                'Оба ската': 1.0,
                'описание': 'Равномерное распределение снега по обоим скатам согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Для расчета прогибов и равномерно нагруженных элементов'
            },
            'Схема 2 (неравномерная)': {
                'Один скат': 1.0,
                'Другой скат': 0.5,
                'описание': 'Неравномерное распределение - снегоотложение с наветренной стороны согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Для расчета прочности при неблагоприятном загружении'
            }
        };
    }
    if (angle >= 60) {
        return {
            'Схема 1 (равномерная)': {
                'Оба ската': 0.0,
                'описание': 'Снег не задерживается на крутых скатах согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Снеговая нагрузка не учитывается'
            }
        };
    }
    const mu = 1.0 - (angle - 25) / 35;
    return {
        'Схема 1 (равномерная)': {
            'Оба ската': mu.toFixed(2),
            'описание': 'Равномерное распределение по обоим скатам согласно п.Б.1 СП 20.13330.2016',
            'применение': 'Для расчета прогибов'
        },
        'Схема 2 (неравномерная)': {
            'Один скат': (1.5 * mu).toFixed(2),
            'Другой скат': (0.5 * mu).toFixed(2),
            'описание': 'Неравномерное распределение с коэффициентами 1.5μ и 0.5μ согласно п.Б.1 СП 20.13330.2016',
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForMultiSlope(angle) {
    if (angle <= 25) return {
        'Схема 1 (равномерная)': {
            'Все скаты': 1.0,
            'описание': 'Равномерное распределение по всем скатам согласно п.Б.1 СП 20.13330.2016',
            'применение': 'Основная расчетная схема для многоскатных крыш'
        }
    };
    if (angle >= 60) return {
        'Схема 1 (равномерная)': {
            'Все скаты': 0.0,
            'описание': 'Снег не задерживается на крутых скатах согласно п.Б.1 СП 20.13330.2016',
            'применение': 'Снеговая нагрузка не учитывается'
        }
    };
    const mu = 1.0 - (angle - 25) / 35;
    return {
        'Схема 1 (равномерная)': {
            'Все скаты': mu.toFixed(2),
            'описание': 'Равномерное распределение по всем скатам с учетом угла наклона',
            'применение': 'Для многоскатных крыш с углами от 25° до 60°'
        }
    };
}

function calculateMuForArchedRoof(ratio) {
    if (ratio <= 0.1) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 1.0,
            'описание': 'Для пологих арок (f/l ≤ 0.1) применяется равномерное распределение согласно п.Б.2 СП 20.13330.2016',
            'применение': 'Основная схема для пологих арок'
        }
    };
    if (ratio >= 0.4) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 0.0,
            'описание': 'Для крутых арок (f/l ≥ 0.4) снег не задерживается согласно п.Б.2 СП 20.13330.2016',
            'применение': 'Снеговая нагрузка не учитывается'
        }
    };
    const mu = 1.0 - (ratio - 0.1) / 0.3;
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu.toFixed(2),
            'описание': `Линейная интерполяция в зависимости от стрелы подъема f/l согласно п.Б.2 СП 20.13330.2016. Формула: μ = 1.0 - (f/l - 0.1)/0.3`,
            'применение': 'Для арочных покрытий со стрелой подъема от 0.1 до 0.4'
        }
    };
}

function calculateMuForCylindricalRoof(angle) {
    if (angle <= 25) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 1.0,
            'описание': 'Для цилиндрических покрытий с углом наклона до 25° применяется равномерное распределение согласно п.Б.10 СП 20.13330.2016',
            'применение': 'Основная схема для пологих цилиндрических покрытий'
        }
    };
    if (angle >= 60) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 0.0,
            'описание': 'Для крутых цилиндрических покрытий (угол ≥ 60°) снег не задерживается согласно п.Б.10 СП 20.13330.2016',
            'применение': 'Снеговая нагрузка не учитывается'
        }
    };
    const mu = 1.0 - (angle - 25) / 35;
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu.toFixed(2),
            'описание': `Линейная интерполяция для цилиндрических покрытий согласно п.Б.10 СП 20.13330.2016. Формула: μ = 1.0 - (α - 25°)/35°`,
            'применение': 'Для цилиндрических покрытий с углами от 25° до 60°'
        }
    };
}

function calculateMuForDomeRoof(ratio) {
    if (ratio <= 0.1) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 1.0,
            'описание': 'Для пологих куполов (f/d ≤ 0.1) применяется равномерное распределение согласно п.Б.11 СП 20.13330.2016',
            'применение': 'Основная схема для пологих купольных покрытий'
        }
    };
    if (ratio >= 0.4) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 0.0,
            'описание': 'Для крутых куполов (f/d ≥ 0.4) снег не задерживается согласно п.Б.11 СП 20.13330.2016',
            'применение': 'Снеговая нагрузка не учитывается'
        }
    };
    const mu = 1.0 - (ratio - 0.1) / 0.3;
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu.toFixed(2),
            'описание': `Линейная интерполяция для купольных покрытий согласно п.Б.11 СП 20.13330.2016. Формула: μ = 1.0 - (f/d - 0.1)/0.3`,
            'применение': 'Для купольных покрытий со стрелой подъема от 0.1 до 0.4'
        }
    };
}

function calculateMuForConeRoof(angle) {
    if (angle <= 25) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 1.0,
            'описание': 'Для конических покрытий с углом наклона до 25° применяется равномерное распределение согласно п.Б.12 СП 20.13330.2016',
            'применение': 'Основная схема для пологих конических покрытий'
        }
    };
    if (angle >= 60) return {
        'Схема 1 (равномерная)': {
            'Вся площадь': 0.0,
            'описание': 'Для крутых конических покрытий (угол ≥ 60°) снег не задерживается согласно п.Б.12 СП 20.13330.2016',
            'применение': 'Снеговая нагрузка не учитывается'
        }
    };
    const mu = 1.0 - (angle - 25) / 35;
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu.toFixed(2),
            'описание': `Линейная интерполяция для конических покрытий согласно п.Б.12 СП 20.13330.2016. Формула: μ = 1.0 - (α - 25°)/35°`,
            'применение': 'Для конических покрытий с углами от 25° до 60°'
        }
    };
}

function calculateMuForHeightDrop(h, l1, l2) {
    const m = Math.min(2 * h, 8);
    const mu1 = Math.min(m, 4);
    const mu2 = Math.min(m / 1.4, 4);
    
    return {
        'Схема 1 (снеговой мешок)': {
            'Верхнее покрытие (зона мешка)': mu1.toFixed(2),
            'Нижнее покрытие': mu2.toFixed(2),
            'Остальная площадь': '1.0',
            'описание': `Образование снегового мешка у перепада высот согласно п.Б.8 СП 20.13330.2016. Расчет: m = min(2h, 8) = ${m}, μ₁ = min(m, 4) = ${mu1}, μ₂ = min(m/1.4, 4) = ${mu2.toFixed(2)}`,
            'применение': 'Для расчета элементов в зоне перепада высот'
        }
    };
}

function calculateMuForSnowBags(width, length) {
    const area = width * length;
    let mu = 1.0;
    if (area > 50) mu = 1.5;
    else if (area > 20) mu = 2.0;
    else mu = 3.0;
    
    return {
        'Схема 1 (снеговой мешок)': {
            'Зона снегового мешка': mu.toFixed(2),
            'Остальная площадь': '1.0',
            'описание': `Образование снегового мешка в местах с препятствиями для сноса снега согласно п.Б.9 СП 20.13330.2016. Площадь мешка: ${area} м²`,
            'применение': 'Для расчета зон с возможным образованием снеговых мешков'
        }
    };
}

function displayMuSchemes(muResults) {
    const container = document.getElementById('muSchemesContainer');
    let html = '<div class="mu-scheme"><h4>📐 Схемы распределения μ:</h4>';
    
    Object.keys(muResults).forEach(scheme => {
        const schemeData = muResults[scheme];
        html += `<div class="scheme-description">`;
        html += `<h5>${scheme}</h5>`;
        html += `<p><strong>📝 Описание:</strong> ${schemeData.описание}</p>`;
        html += `<p><strong>🎯 Применение:</strong> ${schemeData.применение}</p>`;
        html += `<div class="zone-calculation">`;
        
        Object.keys(schemeData).forEach(key => {
            if (!['описание', 'применение'].includes(key)) {
                html += `<div class="mu-zone"><strong>${key}:</strong> μ = ${schemeData[key]}</div>`;
            }
        });
        
        html += `</div></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function calculateSnowHeight(snowLoad) {
    const minHeight = (snowLoad / 8).toFixed(2);
    const maxHeight = (snowLoad / 3).toFixed(2);
    return { min: minHeight, max: maxHeight };
}

function updateCalculations() {
    // Обновляем расчеты при изменении параметров
}

// Основная функция расчета
function calculate() {
    let Sg, Ce, Ct;
    let SgSource = '', CeSource = '', CtSource = '';
    
    // Проверка размеров покрытия
    const dimMin = parseFloat(document.getElementById('dimMin').value) || 50;
    const dimMax = parseFloat(document.getElementById('dimMax').value) || 50;
    if (dimMin > dimMax) {
        alert('❌ Ошибка: Наименьший размер покрытия не может быть больше наибольшего размера. Пожалуйста, исправьте значения в шаге 2.');
        showStep(2);
        return;
    }
    
    // Sg
    const sgMethod = document.querySelector('input[name="sgMethod"]:checked').value;
    if (sgMethod === 'manual') {
        Sg = parseFloat(document.getElementById('sgManual').value) || 1.8;
        SgSource = 'Ручной ввод';
    } else {
        if (document.querySelector('input[name="spMethod"]:checked').value === 'city') {
            const citySelect = document.getElementById('citySelect');
            const district = citySelect.options[citySelect.selectedIndex].getAttribute('data-district');
            Sg = sgValues[district] || 1.8;
            SgSource = `По населенному пункту (${document.getElementById('citySelect').value})`;
        } else {
            const district = document.getElementById('snowDistrictMap').value;
            Sg = sgValues[district] || 1.8;
            SgSource = 'По карте снеговых районов';
        }
        const customSg = document.getElementById('customSg').value;
        if (customSg) {
            Sg = parseFloat(customSg);
            SgSource += ' (уточнено по данным Росгидромета)';
        }
    }
    
    // Ce
    const ceMethod = document.querySelector('input[name="ceMethod"]:checked').value;
    if (ceMethod === 'manual') {
        Ce = parseFloat(document.getElementById('ceManual').value) || 1.0;
        CeSource = 'Ручной ввод';
    } else {
        const terrain = document.getElementById('terrainType').value;
        const protected = document.getElementById('protected').checked;
        const dimMin = parseFloat(document.getElementById('dimMin').value) || 50;
        const dimMax = parseFloat(document.getElementById('dimMax').value) || 50;
        const tempSelect = document.getElementById('januaryTemp');
        const warmJan = tempSelect.value === 'warm';
        Ce = calculateCe(terrain, dimMin, dimMax, protected, warmJan);
        CeSource = 'Расчет по СП 20.13330.2016';
    }
    
    // Ct
    const ctMethod = document.querySelector('input[name="ctMethod"]:checked').value;
    if (ctMethod === 'manual') {
        Ct = parseFloat(document.getElementById('ctManual').value) || 1.0;
        CtSource = 'Ручной ввод';
    } else {
        Ct = parseFloat(document.getElementById('ct').value) || 1.0;
        CtSource = 'По СП 20.13330.2016';
    }
    
    // Получаем все схемы μ
    const type = document.getElementById('roofType').value;
    let muResults = {};
    
    if (document.querySelector('input[name="muMethod"]:checked').value === 'manual') {
        const singleMu = parseFloat(document.getElementById('muManual').value) || 1.0;
        muResults = {
            'Схема 1 (ручной ввод)': {
                'Вся площадь': singleMu,
                'описание': 'Значение μ задано вручную пользователем',
                'применение': 'Для расчета по заданному коэффициенту'
            }
        };
    } else {
        switch(type) {
            case 'flat':
                muResults = calculateMuForFlatRoof();
                break;
            case 'single_slope':
                const angleSingle = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForSingleSlope(angleSingle);
                break;
            case 'pitched':
                const anglePitched = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForPitchedRoof(anglePitched);
                break;
            case 'multi_slope':
                const angleMulti = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForMultiSlope(angleMulti);
                break;
            case 'arched':
                const ratio = parseFloat(document.getElementById('archRatio').value) || 0.1;
                muResults = calculateMuForArchedRoof(ratio);
                break;
            case 'cylindrical':
                const cylindricalAngle = parseFloat(document.getElementById('cylindricalAngle').value) || 30;
                muResults = calculateMuForCylindricalRoof(cylindricalAngle);
                break;
            case 'dome':
                const domeRatio = parseFloat(document.getElementById('domeRatio').value) || 0.1;
                muResults = calculateMuForDomeRoof(domeRatio);
                break;
            case 'cone':
                const coneAngle = parseFloat(document.getElementById('coneAngle').value) || 30;
                muResults = calculateMuForConeRoof(coneAngle);
                break;
            case 'height_drop':
                const h = parseFloat(document.getElementById('heightDrop').value) || 2;
                const l1 = parseFloat(document.getElementById('lengthUpper').value) || 10;
                const l2 = parseFloat(document.getElementById('lengthLower').value) || 10;
                muResults = calculateMuForHeightDrop(h, l1, l2);
                break;
            case 'snow_bags':
                const width = parseFloat(document.getElementById('snowBagWidth').value) || 5;
                const length = parseFloat(document.getElementById('snowBagLength').value) || 10;
                muResults = calculateMuForSnowBags(width, length);
                break;
            default:
                muResults = {
                    'Схема 1 (равномерная)': {
                        'Основная зона': 1.0,
                        'описание': 'Стандартное значение по умолчанию',
                        'применение': 'Общий расчет'
                    }
                };
        }
    }
    
    // Расчет нагрузок для всех схем и зон
    let allLoadResults = [];
    let calculationDetails = '';
    
    Object.keys(muResults).forEach(scheme => {
        const schemeData = muResults[scheme];
        calculationDetails += `<h4>${scheme}</h4>`;
        calculationDetails += `<div class="scheme-description">`;
        calculationDetails += `<p><strong>📝 Описание:</strong> ${schemeData.описание}</p>`;
        calculationDetails += `<p><strong>🎯 Применение:</strong> ${schemeData.применение}</p>`;
        calculationDetails += `</div>`;
        
        Object.keys(schemeData).forEach(zone => {
            if (!['описание', 'применение'].includes(zone)) {
                const mu = parseFloat(schemeData[zone]) || 1.0;
                const Sn = mu * Ct * Ce * Sg;
                const Sr = 1.4 * Sn;
                
                allLoadResults.push({ scheme, zone, mu, Sn, Sr });
                
                calculationDetails += `
                    <div class="zone-calculation">
                        <div class="calculation-formula">
                            <strong>Расчет для зоны "${zone}":</strong><br>
                            μ = ${mu.toFixed(2)}<br>
                            S_n = μ × Ct × Ce × Sg = ${mu.toFixed(2)} × ${Ct} × ${Ce.toFixed(2)} × ${Sg} = ${Sn.toFixed(2)} кПа<br>
                            S_r = 1.4 × S_n = 1.4 × ${Sn.toFixed(2)} = ${Sr.toFixed(2)} кПа
                        </div>
                        <div class="load-result">
                            <strong>Результат для ${zone}:</strong><br>
                            Нормативная нагрузка S_n = ${Sn.toFixed(2)} кПа<br>
                            Расчетная нагрузка S_r = ${Sr.toFixed(2)} кПа
                        </div>
                    </div>
                `;
            }
        });
    });
    
    // Информация о высоте снега
    const maxSn = Math.max(...allLoadResults.map(r => r.Sn));
    const snowHeight = calculateSnowHeight(maxSn);
    
    // Информация о температуре для отчета
    const tempSelect = document.getElementById('januaryTemp');
    let temperatureInfo = '';
    if (tempSelect.value === 'cold') {
        temperatureInfo = `Температура января: ≤ -5°C (холодная зима)${currentCity ? ` - ${currentCity}` : ''}`;
    } else if (tempSelect.value === 'warm') {
        temperatureInfo = `Температура января: > -5°C (теплая зима)${currentCity ? ` - ${currentCity}` : ''}`;
    } else {
        temperatureInfo = 'Температура января: не определена';
    }
    
    let reduced = '';
    const reducedLoadChecked = document.getElementById('reducedLoad').checked;
    if (reducedLoadChecked && tempSelect.value === 'cold') {
        const SnRed = 0.5 * Sg;
        reduced = `
            <h3>📉 Пониженная нормативная нагрузка (п.10.11)</h3>
            <div class="calculation-formula">
                S_n_red = 0.5 × S_g = 0.5 × ${Sg} = ${SnRed.toFixed(2)} кПа
            </div>
            <div class="scheme-usage">
                <strong>🎯 Применение пониженной нагрузки:</strong><br>
                • Используется ТОЛЬКО для расчета деформаций и прогибов<br>
                • НЕ используется для расчета прочности<br>
                • Применяется только в холодных регионах (t_янв ≤ -5°C)<br>
                • Для расчета прочности используйте полную нормативную нагрузку из таблицы выше
            </div>
        `;
    } else if (reducedLoadChecked && tempSelect.value === 'warm') {
        reduced = '<div class="warning"><p>❌ Пониженная снеговая нагрузка не применяется для теплых регионов (t_янв > -5°C) по требованиям безопасности!</p></div>';
    }

    const report = `
        <h3>📝 Исходные данные:</h3>
        <table>
            <tr><th>Параметр</th><th>Значение</th><th>Метод определения</th></tr>
            <tr><td>Нормативная нагрузка Sg</td><td>${Sg} кПа</td><td>${SgSource}</td></tr>
            <tr><td>Коэффициент ветра Ce</td><td>${Ce.toFixed(2)}</td><td>${CeSource}</td></tr>
            <tr><td>Термический коэффициент Ct</td><td>${Ct}</td><td>${CtSource}</td></tr>
            <tr><td>Тип покрытия</td><td>${document.getElementById('roofType').options[document.getElementById('roofType').selectedIndex].text}</td><td>-</td></tr>
            <tr><td>${temperatureInfo}</td><td></td><td></td></tr>
        </table>

        <div class="snow-height-info">
            <strong>📏 Справочная информация:</strong> Максимальная нормативная снеговая нагрузка ${maxSn.toFixed(2)} кПа соответствует высоте снежного покрова 
            от ${snowHeight.min} м до ${snowHeight.max} м (при плотности снега 0.3-0.8 т/м³)
        </div>

        <h3>🧮 Детальный расчет по схемам и зонам:</h3>
        ${calculationDetails}

        <h3>📊 Сводная таблица результатов:</h3>
        <table>
            <tr><th>Схема</th><th>Зона</th><th>μ</th><th>Нормативная S_n, кПа</th><th>Расчетная S_r, кПа</th><th>Применение</th></tr>
            ${allLoadResults.map(result => `
                <tr>
                    <td>${result.scheme}</td>
                    <td>${result.zone}</td>
                    <td>${result.mu.toFixed(2)}</td>
                    <td>${result.Sn.toFixed(2)}</td>
                    <td><strong>${result.Sr.toFixed(2)}</strong></td>
                    <td>${muResults[result.scheme].применение}</td>
                </tr>
            `).join('')}
        </table>

        ${reduced}

        <div class="note">
            <p><strong>💡 Рекомендации по применению результатов:</strong></p>
            <p>• <strong>Для расчета ПРОЧНОСТИ</strong> используйте МАКСИМАЛЬНОЕ значение расчетной нагрузки S_r из таблицы</p>
            <p>• <strong>Для расчета ДЕФОРМАЦИЙ</strong> используйте нормативную нагрузку S_n соответствующей зоны</p>
            <p>• <strong>Для сложных конструкций</strong> проверяйте каждую зону отдельно при наличии разных нагрузок</p>
            <p>• <strong>Для ответственных конструкций</strong> обязательна проверка квалифицированным специалистом</p>
            <p>• <strong>При наличии нескольких схем</strong> рассматривайте каждую как отдельное загружение</p>
        </div>

        <div class="warning">
            <p><strong>⚠️ Важные замечания:</strong></p>
            <p>• Данный расчет выполнен в соответствии с СП 20.13330.2016</p>
            <p>• Для окончательного проектирования необходим учет всех факторов</p>
            <p>• Рекомендуется консультация с квалифицированным проектировщиком</p>
            <p>• Несущая способность конструкций должна быть проверена на все комбинации нагрузок</p>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = report;
    document.getElementById('report').style.display = 'block';
    document.getElementById('report').scrollIntoView({ behavior: 'smooth' });
}

// Функция сохранения как PDF
function saveAsPDF() {
    window.print();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    toggleSgMethod();
    toggleCeMethod();
    toggleCtMethod();
    toggleMuMethod();
    showSpMethod('city');
    showParams();
    updateTemperatureInfo();
    
    // Показать только первый шаг
    showStep(1);
});
