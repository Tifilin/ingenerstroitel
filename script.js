// Константы и переменные
const sgValues = {
    'I': 0.5, 'II': 1.0, 'III': 1.5, 'IV': 2.0,
    'V': 2.5, 'VI': 3.0, 'VII': 3.5, 'VIII': 4.0
};

const mapUrls = {
    'main': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta1.jpg',
    'krym': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta2.jpg',
    'sakhalin': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta3.jpg'
};

const roofImages = {
    'single_slope': '1_Односкатная.png',
    'pitched': '2_Двускатная.png',
    'arched': '3_Сводчатая.png',
    'pointed': '4_Стрельчатая.png',
    'lantern': '5_С фонарями.png',
    'long_lantern': '6_С продольными фонарями.png',
    'shed': '7_Шедовые покрытия.png',
    'multi_pitched': '8_Многопролётные двускатные.png',
    'multi_arched': '9_Многопролётные сводчатые.png',
    'multi_lantern': '10_Многопролётные с фонарями.png',
    'height_drop': '11_С перепадом высоты.png',
    'double_height_drop': '12_С двумя перепадами высоты.png',
    'cylindrical': '13_Висячие цилиндрической формы.png',
    'dome': '14_Купольные покрытия.png',
    'cone': '15_Конические круговые покрытия.png',
    'parapet': '16_Парапеты.png',
    'heightened': '17_Участки при возвышающихся надстройках.png'
};

// Глобальные переменные для хранения данных
let currentStep = 1;
let sgValue = 1.5;
let ceValue = 1.0;
let ctValue = 1.0;
let muValue = 1.0;
let kbValue = 1.0;
let gammaF = 1.4;
let isMountainArea = false;
let altitude = 500;
let mountainRegion = '';
let currentCity = '';
let currentTemperature = null;
let currentSgMethod = 'manual';

// Базовый URL для изображений
const baseImageUrl = 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/';

// ФУНКЦИИ НАВИГАЦИИ
function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
    currentStep = stepNumber;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(nextStepNumber) {
    showStep(nextStepNumber);
}

function prevStep(prevStepNumber) {
    showStep(prevStepNumber);
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
    if (method === 'sp') {
        updateCt();
    }
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
    const mapImg = document.getElementById('snowMap');
    mapImg.src = mapUrls[type];
    mapImg.onerror = function() {
        this.style.display = 'none';
        console.warn('Карта не загружена:', this.src);
    };
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
        sgValue = sgValues[district] || 1.5;
        document.getElementById('sgValue').textContent = sgValue;
    }
    
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
    sgValue = sgValues[district] || 1.5;
    document.getElementById('sgValue').textContent = sgValue;
}

// Функции для расчета Ce согласно п.10.5-10.9 СП 20.13330.2016
function updateCe() {
    const terrain = document.getElementById('terrainType').value;
    const protected = document.getElementById('protected').checked;
    const dimMin = parseFloat(document.getElementById('dimMin').value) || 50;
    const dimMax = parseFloat(document.getElementById('dimMax').value) || 50;
    
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
    
    const Ce = calculateCe(terrain, dimMin, dimMax, protected);
    ceValue = Ce;
    document.getElementById('ceValue').textContent = `Рассчитанное значение Ce: ${Ce.toFixed(2)}`;
    
    // Обновляем детали расчета
    let details = '';
    if (protected) {
        details = '<p class="note">🏠 Здание защищено от ветра - применяется Ce = 1.0 согласно п.10.6 СП 20.13330.2016</p>';
    } else {
        details = `<p class="note">📏 Размеры покрытия: ${dimMin}×${dimMax} м, тип местности: ${terrain}</p>`;
        details += `<p class="italic">Расчет по п.10.7 СП 20.13330.2016</p>`;
    }
    document.getElementById('ceCalculationDetails').innerHTML = details;
}

// ФУНКЦИЯ РАСЧЕТА Ce согласно п.10.5-10.9 СП 20.13330.2016
function calculateCe(terrain, dimMin, dimMax, protected) {
    // Согласно п.10.6 СП 20.13330.2016
    if (protected) return 1.0;
    
    const l = Math.min(dimMin, dimMax);
    const L = Math.max(dimMin, dimMax);
    
    // ПРАВИЛЬНЫЙ расчет по СП 20.13330.2016 п.10.7
    if (terrain === 'A') {
        if (l <= 50 && L <= 100) return 0.7;
        if (l > 100 || L > 200) return 1.0;
        return 0.85;
    } else if (terrain === 'B') {
        if (l <= 50 && L <= 100) return 0.7;
        if (l > 100 || L > 200) return 1.0;
        return 0.85;
    } else if (terrain === 'C') {
        return 1.0; // Для типа C всегда 1.0
    }
    
    return 1.0;
}

// Функции для работы с температурой
function updateTemperatureInfo() {
    const temperatureInfo = document.getElementById('temperatureInfo');
    const tempSelect = document.getElementById('januaryTemp');
    
    let temperatureHTML = '';
    
    if (tempSelect.value === 'cold') {
        temperatureHTML = `
            <p>✅ Холодный регион - пониженная нагрузка доступна согласно п.10.11</p>
            <p class="italic">${currentCity ? `Для населенного пункта ${currentCity}` : 'Для выбранного региона'}</p>
        `;
    } else if (tempSelect.value === 'warm') {
        temperatureHTML = `
            <p>❌ Теплый регион - пониженная нагрузка не применяется согласно п.10.11</p>
            <p class="italic">${currentCity ? `Для населенного пункта ${currentCity}` : 'Для выбранного региона'}</p>
        `;
    } else {
        temperatureHTML = `
            <p class="italic">Выберите тип зимы вручную для определения возможности применения пониженной нагрузки согласно п.10.11 СП 20.13330.2016</p>
        `;
    }
    
    if (temperatureInfo) {
        temperatureInfo.innerHTML = temperatureHTML;
    }
}

// Функции для расчета Ct согласно п.10.10 СП 20.13330.2016
function updateCt() {
    const ctType = document.querySelector('input[name="ctType"]:checked').value;
    
    let ct = 1.0;
    let calculationDetails = '';
    
    // Согласно п.10.10 СП 20.13330.2016
    switch(ctType) {
        case 'normal':
            ct = 1.0;
            calculationDetails = 'Ct = 1.0 (обычное покрытие с утеплением) согласно п.10.10 СП 20.13330.2016';
            break;
        case 'transparent':
            ct = 1.0;
            calculationDetails = 'Ct = 1.0 (прозрачные покрытия) согласно п.10.10 СП 20.13330.2016';
            break;
        case 'highLoss':
            ct = 0.8;
            calculationDetails = 'Ct = 0.8 (покрытия с повышенными тепловыми потерями) согласно п.10.10 СП 20.13330.2016';
            break;
        case 'cold':
            ct = 1.0;
            calculationDetails = 'Ct = 1.0 (холодные покрытия) согласно п.10.10 СП 20.13330.2016';
            break;
    }
    
    ctValue = ct;
    document.getElementById('ctValue').textContent = `Рассчитанное значение Ct: ${ct.toFixed(2)}`;
    document.getElementById('ctCalculationDetails').innerHTML = `<div class="detailed-explanation">${calculationDetails}</div>`;
}

// Функции для расчета μ
function showParams() {
    const type = document.getElementById('roofType').value;
    const ref = document.getElementById('roofType').options[document.getElementById('roofType').selectedIndex].getAttribute('data-ref');
    
    document.getElementById('roofRef').textContent = `Ссылка на СП: ${ref}`;
    
    // Обновляем изображение с обработкой ошибок
    const roofImage = document.getElementById('roofImage');
    const imageName = roofImages[type];
    if (imageName) {
        roofImage.src = baseImageUrl + imageName;
        roofImage.onerror = function() {
            this.src = 'https://via.placeholder.com/400x250/3498db/ffffff?text=Схема+не+доступна';
            console.warn('Изображение схемы не загружено:', this.src);
        };
        roofImage.alt = `Схема покрытия: ${type}`;
    }
    
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
                <label>Расстояние между фонарями (м): <input type="number" id="lanternDistance" min="0" value="6" onchange="updateMu()"></label>
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
            paramsHTML = `
                <label>Высота парапета h (м): <input type="number" id="parapetHeight" min="0" value="1" onchange="updateMu()"></label>
                <label>Расстояние от парапета s (м): <input type="number" id="parapetDistance" min="0" value="2" onchange="updateMu()"></label>
            `;
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

function updateMu() {
    const type = document.getElementById('roofType').value;
    let muResults = {};
    let details = '';
    
    switch(type) {
        case 'single_slope':
            const angleSingle = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForSingleSlope(angleSingle);
            details = `Односкатное покрытие, угол ${angleSingle}°`;
            break;
        case 'pitched':
            const anglePitched = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForPitchedRoof(anglePitched);
            details = `Двускатное покрытие, угол ${anglePitched}°`;
            break;
        case 'pointed':
            const anglePointed = parseFloat(document.getElementById('roofAngle').value) || 0;
            muResults = calculateMuForPointedRoof(anglePointed);
            details = `Стрельчатое покрытие, угол ${anglePointed}°`;
            break;
        case 'arched':
            const angleArched = parseFloat(document.getElementById('roofAngle').value) || 0;
            const ratioArched = parseFloat(document.getElementById('archRatio').value) || 0.1;
            muResults = calculateMuForArchedRoof(angleArched, ratioArched);
            details = `Сводчатое покрытие, угол ${angleArched}°, f/l=${ratioArched}`;
            break;
        case 'lantern':
            const angleLantern = parseFloat(document.getElementById('roofAngle').value) || 0;
            const heightLantern = parseFloat(document.getElementById('lanternHeight').value) || 2;
            const widthLantern = parseFloat(document.getElementById('lanternWidth').value) || 3;
            const distanceLantern = parseFloat(document.getElementById('lanternDistance').value) || 6;
            muResults = calculateMuForLanternRoof(angleLantern, heightLantern, widthLantern, distanceLantern);
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
        case 'multi_arched':
            const angleMultiArched = parseFloat(document.getElementById('roofAngle').value) || 0;
            const ratioMultiArched = parseFloat(document.getElementById('archRatio').value) || 0.1;
            muResults = calculateMuForMultiArchedRoof(angleMultiArched, ratioMultiArched);
            details = `Многопролетное сводчатое покрытие, угол ${angleMultiArched}°, f/l=${ratioMultiArched}`;
            break;
        case 'height_drop':
            const h = parseFloat(document.getElementById('heightDrop').value) || 2;
            const l1 = parseFloat(document.getElementById('lengthUpper').value) || 10;
            const l2 = parseFloat(document.getElementById('lengthLower').value) || 10;
            muResults = calculateMuForHeightDrop(h, l1, l2);
            details = `Покрытие с перепадом высоты, h=${h}м, l1=${l1}м, l2=${l2}м`;
            break;
        case 'parapet':
            const parapetHeight = parseFloat(document.getElementById('parapetHeight').value) || 1;
            const parapetDistance = parseFloat(document.getElementById('parapetDistance').value) || 2;
            muResults = calculateMuForParapet(parapetHeight, parapetDistance);
            details = `Парапет высотой ${parapetHeight}м, расстояние ${parapetDistance}м`;
            break;
        case 'cone':
            const coneAngle = parseFloat(document.getElementById('coneAngle').value) || 30;
            muResults = calculateMuForConeRoof(coneAngle);
            details = `Коническое покрытие, угол ${coneAngle}°`;
            break;
        default:
            muResults = {
                'Схема 1 (равномерная)': {
                    'μ': '1.0',
                    'описание': 'Стандартное значение по умолчанию',
                    'применение': 'Общий расчет'
                }
            };
            details = 'Стандартное значение: μ = 1.0';
    }
    
    displayMuSchemes(muResults);
    const muCalculationDetails = document.getElementById('muCalculationDetails');
    if (muCalculationDetails) {
        muCalculationDetails.innerHTML = `<p class="note">${details}</p>`;
    }
}

// ДЕТАЛЬНЫЕ ФУНКЦИИ РАСЧЕТА μ ПО СП 20.13330.2016
function calculateMuForSingleSlope(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.1 (вариант 1)': {
            'μ': mu.toFixed(2),
            'описание': `Односкатное покрытие по схеме Б.1 (вариант 1). Угол наклона α = ${angle}°. Расчет по таблице Б.1 СП 20.13330.2016: μ = ${mu.toFixed(2)}`,
            'применение': 'Для расчета равномерно распределенной нагрузки'
        }
    };
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ РАСЧЕТА ДЛЯ ДВУСКАТНОЙ КРЫШИ
function calculateMuForPitchedRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    const results = {
        'Схема Б.1 (вариант 1) - для расчета прогибов': {
            'μ₁ (левый скат)': mu.toFixed(2),
            'μ₂ (правый скат)': mu.toFixed(2),
            'описание': `Двускатное покрытие по схеме Б.1 (вариант 1). Угол наклона α = ${angle}°. Равномерное распределение: μ₁ = μ₂ = ${mu.toFixed(2)} согласно п.Б.1 СП 20.13330.2016`,
            'применение': 'Для расчета прогибов и перемещений'
        }
    };
    
    // Вариант 2 согласно п.Б.1 б) СП 20.13330.2016
    if (angle >= 15 && angle <= 40) {
        results['Схема Б.1 (вариант 2) - для расчета прочности'] = {
            'μ₁ (наветренный скат)': (0.75 * mu).toFixed(2),
            'μ₂ (подветренный скат)': (1.25 * mu).toFixed(2),
            'описание': `Двускатное покрытие по схеме Б.1 (вариант 2). Угол наклона α = ${angle}°. Неравномерное распределение: μ₁ = 0.75×${mu.toFixed(2)} = ${(0.75 * mu).toFixed(2)}, μ₂ = 1.25×${mu.toFixed(2)} = ${(1.25 * mu).toFixed(2)} согласно п.Б.1 б) СП 20.13330.2016`,
            'применение': 'Для расчета прочности при 15°≤α≤40°'
        };
    }
    
    // Вариант 3 согласно п.Б.1 б) СП 20.13330.2016
    if (angle >= 10 && angle <= 30) {
        results['Схема Б.1 (вариант 3) - с ходовыми мостиками'] = {
            'μ₁ (один скат)': (0.6 * mu).toFixed(2),
            'μ₂ (другой скат)': (1.4 * mu).toFixed(2),
            'описание': `Двускатное покрытие по схеме Б.1 (вариант 3). Угол наклона α = ${angle}°. Неравномерное распределение: μ₁ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)}, μ₂ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)} согласно п.Б.1 б) СП 20.13330.2016`,
            'применение': 'Для расчета прочности при 10°≤α≤30° с ходовыми мостиками'
        };
    }
    
    return results;
}

function calculateMuForArchedRoof(angle, ratio) {
    const muArch = calculateArchMu(ratio);
    
    return {
        'Схема Б.2 (вариант 1)': {
            'μ': muArch.toFixed(2),
            'описание': `Сводчатое покрытие по схеме Б.2 (вариант 1). Угол ${angle}°, отношение f/l = ${ratio}. Расчет по формуле Б.1 СП 20.13330.2016: μ = ${muArch.toFixed(2)}`,
            'применение': 'Для равномерного распределения'
        },
        'Схема Б.2 (вариант 2)': {
            'μ на участке 0-0.5l': '0.5',
            'μ на участке 0.5l-l': '1.0',
            'μ на участке l-1.5l': '1.5',
            'μ на участке 1.5l-2l': '1.0',
            'μ на участке 2l-2.5l': '0.5',
            'описание': `Сводчатое покрытие по схеме Б.2 (вариант 2). Угол ${angle}°, отношение f/l = ${ratio}. Неравномерное распределение по длине покрытия согласно п.Б.2 СП 20.13330.2016`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForLanternRoof(angle, height, width, distance) {
    const mu = calculateBaseMu(angle);
    const b = width;
    const h = height;
    const l = distance;
    
    // Расчет по п.Б.3 СП 20.13330.2016
    const mu1 = Math.min(2 * h / b, 4).toFixed(2);
    const mu2 = Math.min(2 * h / l, 4).toFixed(2);
    const mu3 = Math.min(2 * h / b, 2).toFixed(2);
    
    return {
        'Схема Б.3 (вариант 1)': {
            'μ в зоне A': mu.toFixed(2),
            'μ₁ в зоне B': Math.max(mu, parseFloat(mu2)).toFixed(2),
            'μ₂ в зоне C': Math.max(mu, parseFloat(mu1), parseFloat(mu2)).toFixed(2),
            'описание': `Покрытие с фонарями по схеме Б.3 (вариант 1). h=${h}м, b=${b}м, l=${l}м. Расчет по формулам Б.2 СП 20.13330.2016: μ₁ = max(${mu.toFixed(2)}, 2h/l=${mu2}) = ${Math.max(mu, parseFloat(mu2)).toFixed(2)}, μ₂ = max(${mu.toFixed(2)}, 2h/b=${mu1}, 2h/l=${mu2}) = ${Math.max(mu, parseFloat(mu1), parseFloat(mu2)).toFixed(2)}`,
            'применение': 'Для основного покрытия'
        },
        'Схема Б.3 (вариант 2)': {
            'μ на покрытии фонаря': mu1,
            'μ у торцов фонаря': mu2,
            'μ в зоне B': mu3,
            'описание': `Покрытие с фонарями по схеме Б.3 (вариант 2). Расчет коэффициентов для фонарей по формулам Б.2 СП 20.13330.2016: μ = 2h/b = ${mu1} (но не более 4), μ = 2h/l = ${mu2} (но не более 4), μ в зоне B = 2h/b = ${mu3} (но не более 2)`,
            'применение': 'Для покрытия фонарей'
        }
    };
}

function calculateMuForShedRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.5 (вариант 1)': {
            'μ в зоне A': mu.toFixed(2),
            'μ₁ в зоне B': (1.4 * mu).toFixed(2),
            'μ₂ в зоне C': (0.6 * mu).toFixed(2),
            'описание': `Шедовое покрытие по схеме Б.5 (вариант 1). Угол наклона α = ${angle}°. Расчет: μ₁ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)}, μ₂ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)} согласно п.Б.5 СП 20.13330.2016`,
            'применение': 'Для расчета прочности'
        },
        'Схема Б.5 (вариант 2)': {
            'μ в зоне A': mu.toFixed(2),
            'μ₁ в зоне B': (0.6 * mu).toFixed(2),
            'μ₂ в зоне C': (1.4 * mu).toFixed(2),
            'описание': `Шедовое покрытие по схеме Б.5 (вариант 2). Угол наклона α = ${angle}°. Расчет: μ₁ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)}, μ₂ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)} согласно п.Б.5 СП 20.13330.2016`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForMultiPitchedRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.6 (вариант 1)': {
            'μ на всех скатах': mu.toFixed(2),
            'описание': `Многопролетное двускатное покрытие по схеме Б.6 (вариант 1). Угол наклона α = ${angle}°. Равномерное распределение согласно п.Б.6 СП 20.13330.2016`,
            'применение': 'Для расчета прогибов'
        },
        'Схема Б.6 (вариант 2)': {
            'μ₁ на крайних скатах': (1.4 * mu).toFixed(2),
            'μ₂ на средних скатах': (0.6 * mu).toFixed(2),
            'описание': `Многопролетное двускатное покрытие по схеме Б.6 (вариант 2). Угол наклона α = ${angle}°. Расчет: μ₁ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)}, μ₂ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)} согласно п.Б.6 СП 20.13330.2016`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForMultiArchedRoof(angle, ratio) {
    const muArch = calculateArchMu(ratio);
    
    return {
        'Схема Б.6 (вариант 1)': {
            'μ во всех пролетах': muArch.toFixed(2),
            'описание': `Многопролетное сводчатое покрытие по схеме Б.6 (вариант 1). Угол ${angle}°, отношение f/l = ${ratio}. Равномерное распределение согласно п.Б.6 СП 20.13330.2016`,
            'применение': 'Для расчета прогибов'
        },
        'Схема Б.6 (вариант 2)': {
            'μ₁ в крайних пролетах': (1.4 * muArch).toFixed(2),
            'μ₂ в средних пролетах': (0.6 * muArch).toFixed(2),
            'описание': `Многопролетное сводчатое покрытие по схеме Б.6 (вариант 2). Угол ${angle}°, отношение f/l = ${ratio}. Расчет: μ₁ = 1.4×${muArch.toFixed(2)} = ${(1.4 * muArch).toFixed(2)}, μ₂ = 0.6×${muArch.toFixed(2)} = ${(0.6 * muArch).toFixed(2)} согласно п.Б.6 СП 20.13330.2016`,
            'применение': 'Для расчета прочности'
        }
    };
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ РАСЧЕТА ДЛЯ ПЕРЕПАДА ВЫСОТ
function calculateMuForHeightDrop(h, l1, l2) {
    // ПРАВИЛЬНЫЙ расчет по п.Б.8 СП 20.13330.2016
    const mu1 = Math.min(2 * h / l1, 2).toFixed(2);
    const mu2 = Math.min(2 * h / l2, 2).toFixed(2);
    const mu3_max = Math.min(2 * h / Math.sqrt(sgValue), 4).toFixed(2);
    
    return {
        'Схема Б.8 (вариант 1)': {
            'μ₁ (верхнее покрытие)': mu1,
            'μ₂ (нижнее покрытие)': mu2,
            'μ₃ (зона перепада)': `2.0 (max ${mu3_max})`,
            'описание': `Покрытие с перепадом высоты по схеме Б.8 (вариант 1). h=${h}м, l1=${l1}м, l2=${l2}м. ` +
                       `Расчет по формуле Б.5 СП 20.13330.2016: μ₁ = min(2h/l1, 2) = ${mu1}, μ₂ = min(2h/l2, 2) = ${mu2}, ` +
                       `μ₃ = 2.0 (не более 2h/√S₀ = ${mu3_max})`,
            'применение': 'Для расчета прочности'
        },
        'Схема Б.8 (вариант 2)': {
            'μ₁ (верхнее покрытие)': mu1,
            'μ₂ (нижнее покрытие)': mu2,
            'μ₃ (зона перепада)': '0.0',
            'описание': `Покрытие с перепадом высоты по схеме Б.8 (вариант 2). h=${h}м, l1=${l1}м, l2=${l2}м. ` +
                       `Расчет по формуле Б.5 СП 20.13330.2016: μ₁ = min(2h/l1, 2) = ${mu1}, μ₂ = min(2h/l2, 2) = ${mu2}, μ₃ = 0.0`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForParapet(h, distance) {
    // Расчет по п.Б.13 СП 20.13330.2016
    // б) Схему на рисунке Б.16 для покрытий с парапетами следует применять при h/S₀ > 0,8;
    // μ = 2h/s, но не более 3.
    
    const s = distance;
    let mu = Math.min(2 * h / s, 3).toFixed(2);
    
    // Проверка условия применения схемы Б.13
    const sg = sgValue; // S₀ в кПа
    const condition = h / sg > 0.8;
    
    let description = '';
    if (condition) {
        description = `Парапет по схеме Б.13. Высота парапета h=${h}м, расстояние от парапета s=${s}м. `;
        description += `Условие применения: h/S₀ = ${h}/${sg} = ${(h/sg).toFixed(2)} > 0.8 - выполняется. `;
        description += `Расчет по п.Б.13 б) СП 20.13330.2016: μ = min(2h/s, 3) = min(${2*h}/${s}, 3) = ${mu}`;
    } else {
        description = `Парапет по схеме Б.13. Высота парапета h=${h}м, расстояние от парапета s=${s}м. `;
        description += `Условие применения: h/S₀ = ${h}/${sg} = ${(h/sg).toFixed(2)} ≤ 0.8 - не выполняется. `;
        description += `Схема Б.13 не применяется, используется μ = 1.0`;
        mu = '1.0';
    }
    
    return {
        'Схема Б.13': {
            'μ': mu,
            'описание': description,
            'применение': 'Для расчета нагрузки у парапетов согласно п.Б.13 СП 20.13330.2016'
        }
    };
}

function calculateMuForConeRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.15': {
            'μ': mu.toFixed(2),
            'описание': `Коническое круговое покрытие по схеме Б.15. Угол наклона образующей α = ${angle}°. Расчет по таблице Б.3 СП 20.13330.2016: μ = ${mu.toFixed(2)}`,
            'применение': 'Для равномерного распределения'
        }
    };
}

function calculateMuForPointedRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.2 (вариант 1)': {
            'μ': mu.toFixed(2),
            'описание': `Стрельчатое покрытие по схеме Б.2 (вариант 1). Угол наклона ${angle}°. Равномерное распределение согласно п.Б.2 СП 20.13330.2016`,
            'применение': 'Для равномерного распределения'
        }
    };
}

// БАЗОВЫЕ ФУНКЦИИ РАСЧЕТА
function calculateBaseMu(angle) {
    // Согласно таблице Б.1 СП 20.13330.2016
    if (angle <= 25) return 1.0;
    if (angle >= 60) return 0.0;
    return (60 - angle) / 35;
}

function calculateArchMu(ratio) {
    // Согласно п.Б.2 СП 20.13330.2016
    if (ratio <= 0.1) return 1.0;
    if (ratio >= 0.4) return 0.0;
    return 1.25 * (1 - 2.5 * ratio);
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ОТОБРАЖЕНИЯ СХЕМ μ
function displayMuSchemes(muResults) {
    const container = document.getElementById('muSchemesContainer');
    if (!container) return;
    
    let html = '<div class="mu-scheme"><h4>📐 Схемы распределения μ:</h4>';
    
    Object.keys(muResults).forEach(scheme => {
        const schemeData = muResults[scheme];
        
        html += `<div class="scheme-description">`;
        html += `<h5>${scheme}</h5>`;
        html += `<p><strong>📝 Описание:</strong> ${schemeData.описание}</p>`;
        html += `<p><strong>🎯 Применение:</strong> ${schemeData.применение}</p>`;
        html += `<div class="zone-calculation">`;
        
        // Находим максимальное значение μ для этой схемы
        let maxMuInScheme = 0;
        Object.keys(schemeData).forEach(key => {
            if (!['описание', 'применение', 'description', 'application'].includes(key)) {
                const value = schemeData[key];
                const muVal = parseFloat(value) || 0;
                if (muVal > maxMuInScheme) maxMuInScheme = muVal;
                html += `<div class="mu-zone"><strong>${key}:</strong> ${value}</div>`;
            }
        });
        
        html += `<div class="mu-zone" style="background:#2c3e50;color:white;"><strong>Макс. μ в схеме:</strong> ${maxMuInScheme.toFixed(2)}</div>`;
        html += `</div></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Обновляем глобальное максимальное значение μ
    updateGlobalMuValue(muResults);
}

// НОВАЯ ФУНКЦИЯ для обновления глобального значения μ
function updateGlobalMuValue(muResults) {
    let maxMu = 0;
    
    Object.keys(muResults).forEach(scheme => {
        const schemeData = muResults[scheme];
        Object.keys(schemeData).forEach(key => {
            if (!['описание', 'применение', 'description', 'application'].includes(key)) {
                const value = schemeData[key];
                // Извлекаем числовое значение из строки (может содержать доп. текст)
                const muMatch = value.toString().match(/(\d+\.?\d*)/);
                if (muMatch) {
                    const muVal = parseFloat(muMatch[1]);
                    if (muVal > maxMu) maxMu = muVal;
                }
            }
        });
    });
    
    muValue = maxMu > 0 ? maxMu : 1.0;
    
    const muValueElement = document.getElementById('muValue');
    if (muValueElement) {
        muValueElement.textContent = `Максимальное значение μ: ${muValue.toFixed(2)}`;
    }
}

// Переключение учета горных районов
function toggleMountainArea() {
    isMountainArea = document.getElementById('mountainArea').checked;
    document.getElementById('mountainCalculation').style.display = isMountainArea ? 'block' : 'none';
    
    if (!isMountainArea) {
        kbValue = 1.0;
        document.getElementById('kbDisplay').innerHTML = '';
    } else {
        updateKb();
    }
}

// Обновление высотного коэффициента k_b
function updateKb() {
    if (!isMountainArea) return;
    
    altitude = parseFloat(document.getElementById('altitude').value) || 500;
    mountainRegion = document.getElementById('mountainRegion').value;
    
    let kb = 1.0;
    let calculationDetails = '';
    
    const regionCoefficients = {
        'dagestan': 0.001,
        'krasnodar_adler': 0.009,
        'krasnodar_apsheron': 0.008,
        'krasnodar_tuapse': 0.005,
        'krasnodar_other': 0.003,
        'stavropol': 0.001,
        'evenkia': 0.001,
        'krasnoyarsk_kuznetsk': 0.0068,
        'krasnoyarsk_sayan': 0.0063,
        'krasnoyarsk_north': 0.0028,
        'buryatia_khamar': 0.002,
        'buryatia_baikal': 0.0046,
        'yakutia_aldan': 0.002,
        'crimea_yayla': 0.004,
        'crimea_south': 0.002
    };
    
    if (mountainRegion && regionCoefficients[mountainRegion]) {
        const coefficient = regionCoefficients[mountainRegion];
        kb = 1 + coefficient * altitude;
        calculationDetails = `k_b = 1 + ${coefficient} × ${altitude} = ${kb.toFixed(3)}`;
        
        document.getElementById('kbCalculationDetails').innerHTML = `
            <div class="detailed-explanation">
                <strong>Расчет высотного коэффициента:</strong><br>
                ${calculationDetails}
            </div>
        `;
        
        document.getElementById('kbDisplay').innerHTML = `
            <div class="kb-display">
                Высотный коэффициент k_b = ${kb.toFixed(3)}
            </div>
        `;
    } else {
        calculationDetails = 'k_b = 1.0 (район не выбран)';
        document.getElementById('kbCalculationDetails').innerHTML = `
            <div class="warning">
                ⚠️ Высотный коэффициент не рассчитан. Выберите горный район для расчета.
            </div>
        `;
        document.getElementById('kbDisplay').innerHTML = '';
    }
    
    kbValue = kb;
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
        Sg = parseFloat(document.getElementById('sgManual').value) || 1.5;
        SgSource = 'Ручной ввод';
    } else {
        if (document.querySelector('input[name="spMethod"]:checked').value === 'city') {
            const citySelect = document.getElementById('citySelect');
            const district = citySelect.options[citySelect.selectedIndex].getAttribute('data-district');
            Sg = sgValues[district] || 1.5;
            SgSource = `По населенному пункту (${document.getElementById('citySelect').value})`;
        } else {
            const district = document.getElementById('snowDistrictMap').value;
            Sg = sgValues[district] || 1.5;
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
        Ce = ceValue;
        CeSource = 'Расчет по СП 20.13330.2016';
    }
    
    // Ct
    const ctMethod = document.querySelector('input[name="ctMethod"]:checked').value;
    if (ctMethod === 'manual') {
        Ct = parseFloat(document.getElementById('ctManual').value) || 1.0;
        CtSource = 'Ручной ввод';
    } else {
        Ct = ctValue;
        CtSource = 'Расчет по СП 20.13330.2016';
    }
    
    // Получаем все схемы μ
    const type = document.getElementById('roofType').value;
    let muResults = {};
    
    if (document.querySelector('input[name="muMethod"]:checked').value === 'manual') {
        const singleMu = parseFloat(document.getElementById('muManual').value) || 1.0;
        muResults = {
            'Схема 1 (ручной ввод)': {
                'μ': singleMu.toFixed(2),
                'описание': 'Значение μ задано вручную пользователем',
                'применение': 'Для расчета по заданному коэффициенту'
            }
        };
    } else {
        switch(type) {
            case 'single_slope':
                const angleSingle = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForSingleSlope(angleSingle);
                break;
            case 'pitched':
                const anglePitched = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForPitchedRoof(anglePitched);
                break;
            case 'arched':
                const angleArched = parseFloat(document.getElementById('roofAngle').value) || 0;
                const ratioArched = parseFloat(document.getElementById('archRatio').value) || 0.1;
                muResults = calculateMuForArchedRoof(angleArched, ratioArched);
                break;
            case 'lantern':
                const angleLantern = parseFloat(document.getElementById('roofAngle').value) || 0;
                const heightLantern = parseFloat(document.getElementById('lanternHeight').value) || 2;
                const widthLantern = parseFloat(document.getElementById('lanternWidth').value) || 3;
                const distanceLantern = parseFloat(document.getElementById('lanternDistance').value) || 6;
                muResults = calculateMuForLanternRoof(angleLantern, heightLantern, widthLantern, distanceLantern);
                break;
            case 'shed':
                const angleShed = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForShedRoof(angleShed);
                break;
            case 'multi_pitched':
                const angleMulti = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForMultiPitchedRoof(angleMulti);
                break;
            case 'multi_arched':
                const angleMultiArched = parseFloat(document.getElementById('roofAngle').value) || 0;
                const ratioMultiArched = parseFloat(document.getElementById('archRatio').value) || 0.1;
                muResults = calculateMuForMultiArchedRoof(angleMultiArched, ratioMultiArched);
                break;
            case 'height_drop':
                const h = parseFloat(document.getElementById('heightDrop').value) || 2;
                const l1 = parseFloat(document.getElementById('lengthUpper').value) || 10;
                const l2 = parseFloat(document.getElementById('lengthLower').value) || 10;
                muResults = calculateMuForHeightDrop(h, l1, l2);
                break;
            case 'parapet':
                const parapetHeight = parseFloat(document.getElementById('parapetHeight').value) || 1;
                const parapetDistance = parseFloat(document.getElementById('parapetDistance').value) || 2;
                muResults = calculateMuForParapet(parapetHeight, parapetDistance);
                break;
            case 'cone':
                const coneAngle = parseFloat(document.getElementById('coneAngle').value) || 30;
                muResults = calculateMuForConeRoof(coneAngle);
                break;
            default:
                muResults = {
                    'Схема 1 (равномерная)': {
                        'μ': '1.0',
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
                const Sn = mu * Ct * Ce * Sg * kbValue;
                const Sr = 1.4 * Sn;
                
                allLoadResults.push({ scheme, zone, mu, Sn, Sr });
                
                calculationDetails += `
                    <div class="zone-calculation">
                        <div class="calculation-formula">
                            <strong>Расчет для зоны "${zone}":</strong><br>
                            ${zone} = ${mu.toFixed(2)}<br>
                            S_n = ${zone} × Ct × Ce × Sg × k_b = ${mu.toFixed(2)} × ${Ct.toFixed(2)} × ${Ce.toFixed(2)} × ${Sg} × ${kbValue.toFixed(3)} = ${Sn.toFixed(2)} кПа<br>
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
    
    // Информация о высоте снега (перенесена в конец отчета)
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
                <strong>🎯 Применение пониженной нагрузки согласно п.10.11 СП 20.13330.2016:</strong><br>
                • Используется ТОЛЬКО для расчета деформаций и прогибов<br>
                • НЕ используется для расчета прочности<br>
                • Применяется только в холодных регионах (t_янв ≤ -5°C)<br>
                • Для расчета прочности используйте полную нормативную нагрузку из таблицы выше
            </div>
        `;
    } else if (reducedLoadChecked && tempSelect.value === 'warm') {
        reduced = '<div class="warning"><p>❌ Пониженная снеговая нагрузка не применяется для теплых регионов (t_янв > -5°C) по требованиям п.10.11 СП 20.13330.2016!</p></div>';
    }

    // Добавляем схемы из СП в отчет
    const schemeImages = {
        'single_slope': '1_Односкатная.png',
        'pitched': '2_Двускатная.png',
        'arched': '3_Сводчатая.png',
        'lantern': '5_С фонарями.png',
        'shed': '7_Шедовые покрытия.png',
        'multi_pitched': '8_Многопролётные двускатные.png',
        'multi_arched': '9_Многопролётные сводчатые.png',
        'height_drop': '11_С перепадом высоты.png',
        'parapet': '16_Парапеты.png',
        'cone': '15_Конические круговые покрытия.png'
    };

    const report = `
        <h3>📝 Исходные данные:</h3>
        <table>
            <tr><th>Параметр</th><th>Значение</th><th>Метод определения</th></tr>
            <tr><td>Нормативная нагрузка Sg</td><td>${Sg} кПа</td><td>${SgSource}</td></tr>
            <tr><td>Коэффициент ветра Ce</td><td>${Ce.toFixed(2)}</td><td>${CeSource}</td></tr>
            <tr><td>Термический коэффициент Ct</td><td>${Ct.toFixed(2)}</td><td>${CtSource}</td></tr>
            ${isMountainArea ? `<tr><td>Высотный коэффициент k_b</td><td>${kbValue.toFixed(3)}</td><td>По Таблице Ж.1 СП 20.13330.2016</td></tr>` : ''}
            <tr><td>Тип покрытия</td><td>${document.getElementById('roofType').options[document.getElementById('roofType').selectedIndex].text}</td><td>-</td></tr>
            <tr><td>${temperatureInfo}</td><td></td><td></td></tr>
        </table>

        ${isMountainArea ? `
        <div class="mountain-control">
            <h3>🏔️ Учёт высотного коэффициента для горных районов</h3>
            <p>Применён высотный коэффициент k_b = ${kbValue.toFixed(3)} для ${document.getElementById('mountainRegion').options[document.getElementById('mountainRegion').selectedIndex].text}</p>
            <p>Высота расположения объекта: ${altitude} м над уровнем моря</p>
        </div>
        ` : ''}

        <div class="scheme-reference">
            <h3>📐 Используемые схемы распределения снеговой нагрузки:</h3>
            <img src="${baseImageUrl + (schemeImages[type] || '2_Двускатная.png')}" alt="Схема распределения снеговой нагрузки" style="max-width: 500px;" onerror="this.src='https://via.placeholder.com/400x250/3498db/ffffff?text=Схема+не+доступна'">
            <p class="italic">Схема распределения снеговой нагрузки по СП 20.13330.2016 Приложение Б</p>
        </div>

        <h3>🧮 Детальный расчет по схемам и зонам:</h3>
        ${calculationDetails}

        <h3>📊 Сводная таблица результатов:</h3>
        <table>
            <tr><th>Схема</th><th>Зона/Коэффициент</th><th>Значение</th><th>Нормативная S_n, кПа</th><th>Расчетная S_r, кПа</th><th>Применение</th></tr>
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

        <div class="snow-height-info">
            <strong>📏 Справочная информация:</strong> Максимальная нормативная снеговая нагрузка ${maxSn.toFixed(2)} кПа соответствует высоте снежного покрова 
            от ${snowHeight.min} м до ${snowHeight.max} м (при плотности снега 0.3-0.8 т/м³)
        </div>

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

function calculateSnowHeight(snowLoad) {
    const minHeight = (snowLoad / 8).toFixed(2);
    const maxHeight = (snowLoad / 3).toFixed(2);
    return { min: minHeight, max: maxHeight };
}

function resetCalculator() {
    location.reload();
}

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
    updateCe();
    updateCt();
    
    // Инициализация карты
    updateMapSrc();
});
