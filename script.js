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

const roofImages = {
    'single_slope': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/1_Односкатная.png',
    'pitched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/2_Двускатная.png',
    'arched': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/3_Сводчатая.png',
    'pointed': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/4_Стрельчатая.png',
    'lantern': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/5_С фонарями.png',
    'long_lantern': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/6_С продольными фонарями.png',
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

// Глобальные переменные для хранения данных
let currentStep = 1;
let sgValue = 1.8;
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
        sgValue = sgValues[district] || 1.8;
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
    sgValue = sgValues[district] || 1.8;
    document.getElementById('sgValue').textContent = sgValue;
}

// Функции для расчета Ce
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
        details = '<p class="note">🏠 Здание защищено от ветра - применяется Ce = 0.85</p>';
    } else {
        details = `<p class="note">📏 Размеры покрытия: ${dimMin}×${dimMax} м, тип местности: ${terrain}</p>`;
    }
    document.getElementById('ceCalculationDetails').innerHTML = details;
}

function calculateCe(terrain, dimMin, dimMax, protected) {
    if (protected) return 0.85;
    
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
    const tempSelect = document.getElementById('januaryTemp');
    
    let temperatureHTML = '';
    
    if (tempSelect.value === 'cold') {
        temperatureHTML = `
            <p>✅ Холодный регион - пониженная нагрузка доступна</p>
            <p class="italic">${currentCity ? `Для населенного пункта ${currentCity}` : 'Для выбранного региона'}</p>
        `;
    } else if (tempSelect.value === 'warm') {
        temperatureHTML = `
            <p>❌ Теплый регион - пониженная нагрузка не применяется</p>
            <p class="italic">${currentCity ? `Для населенного пункта ${currentCity}` : 'Для выбранного региона'}</p>
        `;
    } else {
        temperatureHTML = `
            <p class="italic">Выберите тип зимы вручную для определения возможности применения пониженной нагрузки</p>
        `;
    }
    
    if (temperatureInfo) {
        temperatureInfo.innerHTML = temperatureHTML;
    }
}

// Функции для расчета Ct
function updateCt() {
    const ctType = document.querySelector('input[name="ctType"]:checked').value;
    const tempSelect = document.getElementById('januaryTemp').value;
    
    let ct = 1.0;
    let calculationDetails = '';
    
    switch(ctType) {
        case 'normal':
            ct = 1.0;
            calculationDetails = 'Ct = 1.0 (обычное покрытие с утеплением)';
            break;
        case 'transparent':
            ct = 1.0;
            calculationDetails = 'Ct = 1.0 (прозрачные покрытия)';
            break;
        case 'highLoss':
            if (tempSelect === 'cold') {
                ct = 1.1;
                calculationDetails = 'Ct = 1.1 (покрытия с повышенными тепловыми потерями, холодная зима ≤ -5°C)';
            } else if (tempSelect === 'warm') {
                ct = 1.2;
                calculationDetails = 'Ct = 1.2 (покрытия с повышенными тепловыми потерями, теплая зима > -5°C)';
            } else {
                ct = 1.1;
                calculationDetails = 'Ct = 1.1 (покрытия с повышенными тепловыми потерями, температура не определена - принято по холодной зиме)';
            }
            break;
        case 'cold':
            ct = 1.2;
            calculationDetails = 'Ct = 1.2 (холодные покрытия с коэффициентом теплопередачи ≤ 1 Вт/(м²·°C))';
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
                <label>Расстояние от парапета (м): <input type="number" id="parapetDistance" min="0" value="2" onchange="updateMu()"></label>
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

// ДЕТАЛЬНЫЕ ФУНКЦИИ РАСЧЕТА μ ПО СП 20.13330.2016 (ТОЧНОЕ СООТВЕТСТВИЕ СХЕМАМ)
function calculateMuForSingleSlope(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.1 (вариант 1)': {
            'μ': mu.toFixed(2),
            'описание': `Односкатное покрытие по схеме Б.1 (вариант 1). Угол наклона α = ${angle}°. Расчет по формуле: μ = ${mu.toFixed(2)}`,
            'применение': 'Для расчета равномерно распределенной нагрузки'
        }
    };
}

function calculateMuForPitchedRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.1 (вариант 1)': {
            'μ₁': mu.toFixed(2),
            'μ₂': mu.toFixed(2),
            'описание': `Двускатное покрытие по схеме Б.1 (вариант 1). Угол наклона α = ${angle}°. Равномерное распределение: μ₁ = μ₂ = ${mu.toFixed(2)}`,
            'применение': 'Для расчета прогибов'
        },
        'Схема Б.1 (вариант 2)': {
            'μ₁': (1.25 * mu).toFixed(2),
            'μ₂': (0.75 * mu).toFixed(2),
            'описание': `Двускатное покрытие по схеме Б.1 (вариант 2). Угол наклона α = ${angle}°. Неравномерное распределение: μ₁ = 1.25×${mu.toFixed(2)} = ${(1.25 * mu).toFixed(2)}, μ₂ = 0.75×${mu.toFixed(2)} = ${(0.75 * mu).toFixed(2)}`,
            'применение': 'Для расчета прочности (вариант 2)'
        },
        'Схема Б.1 (вариант 3)': {
            'μ₁': (0.6 * mu).toFixed(2),
            'μ₂': (1.4 * mu).toFixed(2),
            'описание': `Двускатное покрытие по схеме Б.1 (вариант 3). Угол наклона α = ${angle}°. Неравномерное распределение: μ₁ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)}, μ₂ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)}`,
            'применение': 'Для расчета прочности (вариант 3)'
        }
    };
}

function calculateMuForArchedRoof(angle, ratio) {
    const muArch = calculateArchMu(ratio);
    
    return {
        'Схема Б.2 (вариант 1)': {
            'μ': muArch.toFixed(2),
            'описание': `Сводчатое покрытие по схеме Б.2 (вариант 1). Угол ${angle}°, отношение f/l = ${ratio}. Расчет: μ = ${muArch.toFixed(2)}`,
            'применение': 'Для равномерного распределения'
        },
        'Схема Б.2 (вариант 2)': {
            'μ на участке 0-0.5l': '0.5',
            'μ на участке 0.5l-l': '1.0',
            'μ на участке l-1.5l': '1.5',
            'μ на участке 1.5l-2l': '1.0',
            'μ на участке 2l-2.5l': '0.5',
            'описание': `Сводчатое покрытие по схеме Б.2 (вариант 2). Угол ${angle}°, отношение f/l = ${ratio}. Неравномерное распределение по длине покрытия`,
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
    
    return {
        'Схема Б.3 (вариант 1)': {
            'μ в зоне A': mu.toFixed(2),
            'μ₁ в зоне B': Math.max(mu, parseFloat(mu2)).toFixed(2),
            'μ₂ в зоне C': Math.max(mu, parseFloat(mu1), parseFloat(mu2)).toFixed(2),
            'описание': `Покрытие с фонарями по схеме Б.3 (вариант 1). h=${h}м, b=${b}м, l=${l}м. Расчет: μ₁ = max(${mu.toFixed(2)}, 2h/l=${mu2}) = ${Math.max(mu, parseFloat(mu2)).toFixed(2)}, μ₂ = max(${mu.toFixed(2)}, 2h/b=${mu1}, 2h/l=${mu2}) = ${Math.max(mu, parseFloat(mu1), parseFloat(mu2)).toFixed(2)}`,
            'применение': 'Для основного покрытия'
        },
        'Схема Б.3 (вариант 2)': {
            'μ на покрытии фонаря': mu1,
            'μ у торцов фонаря': mu2,
            'описание': `Покрытие с фонарями по схеме Б.3 (вариант 2). Расчет коэффициентов для фонарей: μ = 2h/b = ${mu1}, μ = 2h/l = ${mu2}`,
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
            'описание': `Шедовое покрытие по схеме Б.5 (вариант 1). Угол наклона α = ${angle}°. Расчет: μ₁ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)}, μ₂ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)}`,
            'применение': 'Для расчета прочности'
        },
        'Схема Б.5 (вариант 2)': {
            'μ в зоне A': mu.toFixed(2),
            'μ₁ в зоне B': (0.6 * mu).toFixed(2),
            'μ₂ в зоне C': (1.4 * mu).toFixed(2),
            'описание': `Шедовое покрытие по схеме Б.5 (вариант 2). Угол наклона α = ${angle}°. Расчет: μ₁ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)}, μ₂ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)}`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForMultiPitchedRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.6 (вариант 1)': {
            'μ на всех скатах': mu.toFixed(2),
            'описание': `Многопролетное двускатное покрытие по схеме Б.6 (вариант 1). Угол наклона α = ${angle}°. Равномерное распределение`,
            'применение': 'Для расчета прогибов'
        },
        'Схема Б.6 (вариант 2)': {
            'μ₁ на крайних скатах': (1.4 * mu).toFixed(2),
            'μ₂ на средних скатах': (0.6 * mu).toFixed(2),
            'описание': `Многопролетное двускатное покрытие по схеме Б.6 (вариант 2). Угол наклона α = ${angle}°. Расчет: μ₁ = 1.4×${mu.toFixed(2)} = ${(1.4 * mu).toFixed(2)}, μ₂ = 0.6×${mu.toFixed(2)} = ${(0.6 * mu).toFixed(2)}`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForMultiArchedRoof(angle, ratio) {
    const muArch = calculateArchMu(ratio);
    
    return {
        'Схема Б.6 (вариант 1)': {
            'μ во всех пролетах': muArch.toFixed(2),
            'описание': `Многопролетное сводчатое покрытие по схеме Б.6 (вариант 1). Угол ${angle}°, отношение f/l = ${ratio}. Равномерное распределение`,
            'применение': 'Для расчета прогибов'
        },
        'Схема Б.6 (вариант 2)': {
            'μ₁ в крайних пролетах': (1.4 * muArch).toFixed(2),
            'μ₂ в средних пролетах': (0.6 * muArch).toFixed(2),
            'описание': `Многопролетное сводчатое покрытие по схеме Б.6 (вариант 2). Угол ${angle}°, отношение f/l = ${ratio}. Расчет: μ₁ = 1.4×${muArch.toFixed(2)} = ${(1.4 * muArch).toFixed(2)}, μ₂ = 0.6×${muArch.toFixed(2)} = ${(0.6 * muArch).toFixed(2)}`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForHeightDrop(h, l1, l2) {
    const mu1 = Math.min(h / l1, 2).toFixed(2);
    const mu2 = Math.min(h / l2, 2).toFixed(2);
    
    return {
        'Схема Б.7 (вариант 1)': {
            'μ₁ на верхнем покрытии': mu1,
            'μ₂ на нижнем покрытии': mu2,
            'μ₃ в зоне перепада': '2.0',
            'описание': `Покрытие с перепадом высоты по схеме Б.7 (вариант 1). h=${h}м, l1=${l1}м, l2=${l2}м. Расчет: μ₁ = min(h/l1, 2) = ${mu1}, μ₂ = min(h/l2, 2) = ${mu2}, μ₃ = 2.0`,
            'применение': 'Для расчета прочности'
        },
        'Схема Б.7 (вариант 2)': {
            'μ₁ на верхнем покрытии': mu1,
            'μ₂ на нижнем покрытии': mu2,
            'μ₃ в зоне перепада': '0.0',
            'описание': `Покрытие с перепадом высоты по схеме Б.7 (вариант 2). h=${h}м, l1=${l1}м, l2=${l2}м. Расчет: μ₁ = min(h/l1, 2) = ${mu1}, μ₂ = min(h/l2, 2) = ${mu2}, μ₃ = 0.0`,
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForParapet(h, distance) {
    // Расчет по п.Б.13 СП 20.13330.2016
    const mu = Math.min(2 * h / distance, 3).toFixed(2);
    
    return {
        'Схема Б.13 (вариант а)': {
            'μ': mu,
            'описание': `Парапет по схеме Б.13 (вариант а). Высота парапета h=${h}м, расстояние от парапета ${distance}м. Расчет: μ = min(2h/${distance}, 3) = ${mu}`,
            'применение': 'Для расчета нагрузки у парапета'
        },
        'Схема Б.13 (вариант б)': {
            'μ': '3.0',
            'описание': `Парапет по схеме Б.13 (вариант б). Высота парапета h=${h}м. Принимается максимальное значение μ = 3.0`,
            'применение': 'Для расчета нагрузки у парапета'
        }
    };
}

function calculateMuForConeRoof(angle) {
    const mu = calculateBaseMu(angle);
    
    return {
        'Схема Б.15': {
            'μ': mu.toFixed(2),
            'описание': `Коническое круговое покрытие по схеме Б.15. Угол наклона образующей α = ${angle}°. Расчет: μ = ${mu.toFixed(2)}`,
            'применение': 'Для равномерного распределения'
        }
    };
}

function calculateBaseMu(angle) {
    if (angle <= 25) return 1.0;
    if (angle >= 60) return 0.0;
    return (60 - angle) / 35;
}

function calculateArchMu(ratio) {
    if (ratio <= 0.1) return 1.0;
    if (ratio >= 0.4) return 0.0;
    return 1.25 * (1 - 2.5 * ratio);
}

function displayMuSchemes(schemes) {
    const container = document.getElementById('muSchemes');
    let html = '';
    
    for (const [schemeName, schemeData] of Object.entries(schemes)) {
        html += `<div class="scheme">`;
        html += `<h4>${schemeName}</h4>`;
        
        // Отображаем значения μ
        for (const [key, value] of Object.entries(schemeData)) {
            if (key.startsWith('μ')) {
                html += `<p><strong>${key}:</strong> ${value}</p>`;
            }
        }
        
        // Отображаем описание и применение
        html += `<p class="scheme-description">${schemeData.описание}</p>`;
        html += `<p class="scheme-application"><em>Применение:</em> ${schemeData.применение}</p>`;
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

// Функции для расчета kb
function updateKb() {
    const kbType = document.querySelector('input[name="kbType"]:checked').value;
    
    let kb = 1.0;
    let calculationDetails = '';
    
    switch(kbType) {
        case 'normal':
            kb = 1.0;
            calculationDetails = 'kb = 1.0 (обычные условия эксплуатации)';
            break;
        case 'special':
            kb = 0.85;
            calculationDetails = 'kb = 0.85 (специальные условия эксплуатации согласно п.10.11 СП 20.13330.2016)';
            break;
    }
    
    kbValue = kb;
    document.getElementById('kbValue').textContent = `Рассчитанное значение kb: ${kb.toFixed(2)}`;
    document.getElementById('kbCalculationDetails').innerHTML = `<div class="detailed-explanation">${calculationDetails}</div>`;
}

// Функции для расчета γf
function updateGammaF() {
    const gammaFType = document.querySelector('input[name="gammaFType"]:checked').value;
    
    let gamma = 1.4;
    let calculationDetails = '';
    
    switch(gammaFType) {
        case 'normal':
            gamma = 1.4;
            calculationDetails = 'γf = 1.4 (нормальное сочетание нагрузок)';
            break;
        case 'special':
            gamma = 1.2;
            calculationDetails = 'γf = 1.2 (особое сочетание нагрузок)';
            break;
    }
    
    gammaF = gamma;
    document.getElementById('gammaFValue').textContent = `Выбранное значение γf: ${gamma.toFixed(2)}`;
    document.getElementById('gammaFCalculationDetails').innerHTML = `<div class="detailed-explanation">${calculationDetails}</div>`;
}

// Функция для расчета итоговой нагрузки
function calculateFinalLoad() {
    // Получаем значения коэффициентов
    const sgManual = parseFloat(document.getElementById('sgManual').value) || sgValue;
    const ceManual = parseFloat(document.getElementById('ceManual').value) || ceValue;
    const ctManual = parseFloat(document.getElementById('ctManual').value) || ctValue;
    const muManual = parseFloat(document.getElementById('muManual').value) || muValue;
    
    // Определяем, какие значения использовать
    const sg = currentSgMethod === 'manual' ? sgManual : sgValue;
    const ce = document.querySelector('input[name="ceMethod"]:checked').value === 'manual' ? ceManual : ceValue;
    const ct = document.querySelector('input[name="ctMethod"]:checked').value === 'manual' ? ctManual : ctValue;
    const mu = document.querySelector('input[name="muMethod"]:checked').value === 'manual' ? muManual : muValue;
    
    // Расчет нормативной нагрузки
    const sn = sg * ce * ct * mu * kbValue;
    
    // Расчет расчетной нагрузки
    const sr = sn * gammaF;
    
    // Отображаем результаты
    document.getElementById('normalLoad').textContent = sn.toFixed(3);
    document.getElementById('designLoad').textContent = sr.toFixed(3);
    
    // Отображаем детали расчета
    const calculationDetails = `
        <p><strong>Формула расчета нормативной нагрузки:</strong></p>
        <p>S₀ = Sg × Ce × Ct × μ × kb</p>
        <p>S₀ = ${sg.toFixed(2)} × ${ce.toFixed(2)} × ${ct.toFixed(2)} × ${mu.toFixed(2)} × ${kbValue.toFixed(2)} = ${sn.toFixed(3)} кПа</p>
        <br>
        <p><strong>Формула расчета расчетной нагрузки:</strong></p>
        <p>S = S₀ × γf</p>
        <p>S = ${sn.toFixed(3)} × ${gammaF.toFixed(2)} = ${sr.toFixed(3)} кПа</p>
    `;
    
    document.getElementById('finalCalculationDetails').innerHTML = calculationDetails;
    
    // Добавляем справочную информацию о высоте снежного покрова
    const snowHeightInfo = document.getElementById('snowHeightInfo');
    if (snowHeightInfo) {
        const minHeight = (sn / 0.8).toFixed(2);
        const maxHeight = (sn / 0.3).toFixed(2);
        snowHeightInfo.innerHTML = `
            <p class="note">Справочная информация: Максимальная нормативная снеговая нагрузка ${sn.toFixed(3)} кПа соответствует высоте снежного покрова от ${minHeight} м до ${maxHeight} м (при плотности снега 0.3-0.8 т/м³)</p>
        `;
    }
    
    // Показываем результаты
    document.getElementById('finalResults').style.display = 'block';
}

// Функция для экспорта результатов
function exportResults() {
    const results = {
        'Нормативная нагрузка': document.getElementById('normalLoad').textContent,
        'Расчетная нагрузка': document.getElementById('designLoad').textContent,
        'Коэффициенты': {
            'Sg': sgValue,
            'Ce': ceValue,
            'Ct': ctValue,
            'μ': muValue,
            'kb': kbValue,
            'γf': gammaF
        }
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "snow_load_results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация значений по умолчанию
    updateCe();
    updateCt();
    updateKb();
    updateGammaF();
    showParams();
    
    // Инициализация карты
    updateMapSrc();
    
    // Показываем первый шаг
    showStep(1);
});
