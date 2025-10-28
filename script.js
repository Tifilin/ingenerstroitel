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
        case 'height_drop':
            const h = parseFloat(document.getElementById('heightDrop').value) || 2;
            const l1 = parseFloat(document.getElementById('lengthUpper').value) || 10;
            const l2 = parseFloat(document.getElementById('lengthLower').value) || 10;
            muResults = calculateMuForHeightDrop(h, l1, l2);
            details = `Покрытие с перепадом высоты, h=${h}м, l1=${l1}м, l2=${l2}м`;
            break;
        default:
            muResults = {
                'Схема 1 (равномерная)': {
                    'Основная зона': '1.0',
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

// ФУНКЦИИ РАСЧЕТА μ ДЛЯ РАЗЛИЧНЫХ ТИПОВ КРЫШ
function calculateMuForSingleSlope(angle) {
    if (angle <= 25) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': '1.0',
                'описание': 'При углах наклона до 25° снег распределяется равномерно по всей поверхности ската согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Основная расчетная схема для односкатных крыш'
            }
        };
    }
    if (angle >= 60) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': '0.0',
                'описание': 'При углах наклона 60° и более снег не задерживается на поверхности согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Снеговая нагрузка не учитывается'
            }
        };
    }
    const mu = (1.0 - (angle - 25) / 35).toFixed(2);
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu,
            'описание': `Линейная интерполяция между 25° (μ=1.0) и 60° (μ=0.0) согласно п.Б.1 СП 20.13330.2016. Формула: μ = 1.0 - (α - 25°)/35°`,
            'применение': 'Основная расчетная схема для углов от 25° до 60°'
        }
    };
}

function calculateMuForPitchedRoof(angle) {
    if (angle <= 25) {
        return {
            'Схема 1 (равномерная)': {
                'Оба ската': '1.0',
                'описание': 'Равномерное распределение снега по обоим скатам согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Для расчета прогибов и равномерно нагруженных элементов'
            },
            'Схема 2 (неравномерная)': {
                'Один скат': '1.0',
                'Другой скат': '0.5',
                'описание': 'Неравномерное распределение - снегоотложение с наветренной стороны согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Для расчета прочности при неблагоприятном загружении'
            }
        };
    }
    if (angle >= 60) {
        return {
            'Схема 1 (равномерная)': {
                'Оба ската': '0.0',
                'описание': 'Снег не задерживается на крутых скатах согласно п.Б.1 СП 20.13330.2016',
                'применение': 'Снеговая нагрузка не учитывается'
            }
        };
    }
    const mu = (1.0 - (angle - 25) / 35).toFixed(2);
    return {
        'Схема 1 (равномерная)': {
            'Оба ската': mu,
            'описание': 'Равномерное распределение по обоим скатам согласно п.Б.1 СП 20.13330.2016',
            'применение': 'Для расчета прогибов'
        },
        'Схема 2 (неравномерная)': {
            'Один скат': (1.5 * parseFloat(mu)).toFixed(2),
            'Другой скат': (0.5 * parseFloat(mu)).toFixed(2),
            'описание': 'Неравномерное распределение с коэффициентами 1.5μ и 0.5μ согласно п.Б.1 СП 20.13330.2016',
            'применение': 'Для расчета прочности'
        }
    };
}

function calculateMuForPointedRoof(angle) {
    const ratio = angle / 90;
    if (ratio <= 0.1) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': '1.0',
                'описание': 'Для пологих стрельчатых покрытий применяется равномерное распределение',
                'применение': 'Основная схема для пологих стрельчатых крыш'
            }
        };
    }
    if (ratio >= 0.4) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': '0.0',
                'описание': 'Для крутых стрельчатых покрытий снег не задерживается',
                'применение': 'Снеговая нагрузка не учитывается'
            }
        };
    }
    const mu = (1.0 - (ratio - 0.1) / 0.3).toFixed(2);
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu,
            'описание': `Линейная интерполяция для стрельчатых покрытий`,
            'применение': 'Для стрельчатых покрытий'
        }
    };
}

function calculateMuForArchedRoof(ratio) {
    if (ratio <= 0.1) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': '1.0',
                'описание': 'Для пологих арок (f/l ≤ 0.1) применяется равномерное распределение согласно п.Б.2 СП 20.13330.2016',
                'применение': 'Основная схема для пологих арок'
            }
        };
    }
    if (ratio >= 0.4) {
        return {
            'Схема 1 (равномерная)': {
                'Вся площадь': '0.0',
                'описание': 'Для крутых арок (f/l ≥ 0.4) снег не задерживается согласно п.Б.2 СП 20.13330.2016',
                'применение': 'Снеговая нагрузка не учитывается'
            }
        };
    }
    const mu = (1.0 - (ratio - 0.1) / 0.3).toFixed(2);
    return {
        'Схема 1 (равномерная)': {
            'Вся площадь': mu,
            'описание': `Линейная интерполяция в зависимости от стрелы подъема f/l согласно п.Б.2 СП 20.13330.2016. Формула: μ = 1.0 - (f/l - 0.1)/0.3`,
            'применение': 'Для арочных покрытий со стрелой подъема от 0.1 до 0.4'
        }
    };
}

function calculateMuForLanternRoof(angle, height, width) {
    const baseMu = calculateMuForSlopedRoof(angle).toFixed(2);
    
    return {
        'Схема 1 (основное покрытие)': {
            'Основная площадь': baseMu,
            'описание': 'Распределение снега на основном покрытии согласно п.Б.3 СП 20.13330.2016',
            'применение': 'Для расчета основного покрытия'
        },
        'Схема 2 (зона фонаря)': {
            'У фонаря с наветренной стороны': (parseFloat(baseMu) * 1.5).toFixed(2),
            'У фонаря с подветренной стороны': (parseFloat(baseMu) * 0.5).toFixed(2),
            'описание': 'Образование снеговых мешков у фонарей согласно п.Б.3 СП 20.13330.2016',
            'применение': 'Для расчета в зонах фонарей'
        }
    };
}

function calculateMuForShedRoof(angle) {
    if (angle <= 15) {
        return {
            'Схема 1 (равномерная)': {
                'Все скаты': '1.0',
                'описание': 'Для шедовых покрытий с малыми углами наклона согласно п.Б.5 СП 20.13330.2016',
                'применение': 'Основная схема'
            }
        };
    }
    
    const mu = calculateMuForSlopedRoof(angle).toFixed(2);
    return {
        'Схема 1 (равномерная)': {
            'Все скаты': mu,
            'описание': 'Равномерное распределение по шедовому покрытию согласно п.Б.5 СП 20.13330.2016',
            'применение': 'Для расчета шедовых конструкций'
        }
    };
}

function calculateMuForMultiPitchedRoof(angle) {
    const mu = calculateMuForSlopedRoof(angle).toFixed(2);
    return {
        'Схема 1 (равномерная)': {
            'Все пролеты': mu,
            'описание': 'Равномерное распределение по всем пролетам согласно п.Б.6 СП 20.13330.2016',
            'применение': 'Для расчета многопролетных покрытий'
        },
        'Схема 2 (неравномерная)': {
            'Крайние пролеты': (parseFloat(mu) * 1.1).toFixed(2),
            'Средние пролеты': (parseFloat(mu) * 0.9).toFixed(2),
            'описание': 'Неравномерное распределение с учетом краевых эффектов согласно п.Б.6 СП 20.13330.2016',
            'применение': 'Для уточненного расчета'
        }
    };
}

function calculateMuForHeightDrop(h, l1, l2) {
    const m = Math.min(2 * h, 8);
    const mu1 = Math.min(m, 4).toFixed(2);
    const mu2 = Math.min(m / 1.4, 4).toFixed(2);
    
    return {
        'Схема 1 (снеговой мешок)': {
            'Верхнее покрытие (зона мешка)': mu1,
            'Нижнее покрытие': mu2,
            'Остальная площадь': '1.0',
            'описание': `Образование снегового мешка у перепада высот согласно п.Б.8 СП 20.13330.2016. Расчет: m = min(2h, 8) = ${m}, μ₁ = min(m, 4) = ${mu1}, μ₂ = min(m/1.4, 4) = ${mu2}`,
            'применение': 'Для расчета элементов в зоне перепада высот'
        }
    };
}

function calculateMuForSlopedRoof(angle) {
    if (angle <= 25) return 1.0;
    if (angle >= 60) return 0.0;
    return 1.0 - (angle - 25) / 35;
}

function displayMuSchemes(muResults) {
    const container = document.getElementById('muSchemesContainer');
    if (!container) return;
    
    let html = '<div class="mu-scheme"><h4>📐 Схемы распределения μ:</h4>';
    
    Object.keys(muResults).forEach(scheme => {
        const schemeData = muResults[scheme];
        
        // Проверяем, что schemeData - объект и имеет нужные свойства
        if (typeof schemeData !== 'object' || schemeData === null) {
            console.warn(`Некорректные данные для схемы: ${scheme}`, schemeData);
            return;
        }
        
        html += `<div class="scheme-description">`;
        html += `<h5>${scheme}</h5>`;
        
        // Безопасное получение описания и применения
        const description = schemeData.описание || 'Описание не указано';
        const application = schemeData.применение || 'Применение не указано';
        
        html += `<p><strong>📝 Описание:</strong> ${description}</p>`;
        html += `<p><strong>🎯 Применение:</strong> ${application}</p>`;
        html += `<div class="zone-calculation">`;
        
        // Перебираем все свойства кроме служебных
        Object.keys(schemeData).forEach(key => {
            if (!['описание', 'применение', 'description', 'application'].includes(key)) {
                const value = schemeData[key];
                html += `<div class="mu-zone"><strong>${key}:</strong> μ = ${value}</div>`;
            }
        });
        
        html += `</div></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Устанавливаем максимальное значение μ
    let maxMu = 0;
    Object.keys(muResults).forEach(scheme => {
        const schemeData = muResults[scheme];
        if (typeof schemeData === 'object' && schemeData !== null) {
            Object.keys(schemeData).forEach(key => {
                if (!['описание', 'применение', 'description', 'application'].includes(key)) {
                    const muVal = parseFloat(schemeData[key]) || 0;
                    if (muVal > maxMu) maxMu = muVal;
                }
            });
        }
    });
    
    muValue = maxMu;
    
    // Безопасное обновление элемента muValue
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
    
    // Коэффициенты из Таблицы Ж.1 СП 20.13330.2016 с добавлением Крыма
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
                'Вся площадь': singleMu.toFixed(2),
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
                const ratio = parseFloat(document.getElementById('archRatio').value) || 0.1;
                muResults = calculateMuForArchedRoof(ratio);
                break;
            case 'lantern':
                const angleLantern = parseFloat(document.getElementById('roofAngle').value) || 0;
                const heightLantern = parseFloat(document.getElementById('lanternHeight').value) || 2;
                const widthLantern = parseFloat(document.getElementById('lanternWidth').value) || 3;
                muResults = calculateMuForLanternRoof(angleLantern, heightLantern, widthLantern);
                break;
            case 'shed':
                const angleShed = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForShedRoof(angleShed);
                break;
            case 'multi_pitched':
                const angleMulti = parseFloat(document.getElementById('roofAngle').value) || 0;
                muResults = calculateMuForMultiPitchedRoof(angleMulti);
                break;
            case 'height_drop':
                const h = parseFloat(document.getElementById('heightDrop').value) || 2;
                const l1 = parseFloat(document.getElementById('lengthUpper').value) || 10;
                const l2 = parseFloat(document.getElementById('lengthLower').value) || 10;
                muResults = calculateMuForHeightDrop(h, l1, l2);
                break;
            default:
                muResults = {
                    'Схема 1 (равномерная)': {
                        'Основная зона': '1.0',
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
        
        Object.keys(schemeData).forEach(key => {
            if (!['описание', 'применение'].includes(key)) {
                const mu = parseFloat(schemeData[key]) || 1.0;
                const Sn = mu * Ct * Ce * Sg * kbValue;
                const Sr = 1.4 * Sn;
                
                allLoadResults.push({ scheme, zone, mu, Sn, Sr });
                
                calculationDetails += `
                    <div class="zone-calculation">
                        <div class="calculation-formula">
                            <strong>Расчет для зоны "${key}":</strong><br>
                            μ = ${mu.toFixed(2)}<br>
                            S_n = μ × Ct × Ce × Sg × k_b = ${mu.toFixed(2)} × ${Ct.toFixed(2)} × ${Ce.toFixed(2)} × ${Sg} × ${kbValue.toFixed(3)} = ${Sn.toFixed(2)} кПа<br>
                            S_r = 1.4 × S_n = 1.4 × ${Sn.toFixed(2)} = ${Sr.toFixed(2)} кПа
                        </div>
                        <div class="load-result">
                            <strong>Результат для ${key}:</strong><br>
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
        const SnRed = 0.5 * Sg * kbValue;
        reduced = `
            <h3>📉 Пониженная нормативная нагрузка (п.10.11)</h3>
            <div class="calculation-formula">
                S_n_red = 0.5 × S_g × k_b = 0.5 × ${Sg} × ${kbValue.toFixed(3)} = ${SnRed.toFixed(2)} кПа
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
    updateKb();
});
