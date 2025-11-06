// Константы согласно СП 20.13330.2016 с Изм.5
const SNOW_DISTRICTS = {
    'I': 0.5, 'II': 1.0, 'III': 1.5, 'IV': 2.0, 
    'V': 2.5, 'VI': 3.0, 'VII': 3.5, 'VIII': 4.0
};

// п.10.12: "Для снеговых нагрузок коэффициент надежности по нагрузке γf = 1,4"
const GAMMA_F = 1.4;

// Данные по городам согласно карте районирования
const CITIES_DATA = {
    'Москва': { district: 'III', temp: -7.7, wind: 4.5 },
    'Санкт-Петербург': { district: 'III', temp: -5.5, wind: 4.0 },
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

// Константы для карт
const MAP_URLS = {
    'main': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta1.jpg',
    'krym': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta2.jpg', 
    'sakhalin': 'https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/karta3.jpg'
};

// Изображения для типов покрытий
const ROOF_IMAGES = {
    'flat': '1_Односкатная.png',
    'single_slope': '1_Односкатная.png',
    'pitched': '2_Двускатная.png',
    'arched': '3_Сводчатая.png',
    'multi_slope': '4_Многопролетная.png',
    'height_drop': '5_Перепад.png',
    'obstacles': '6_Препятствия.png',
    'spatial': '7_Пространственная.png',
    'lantern': '8_Фонарь.png',
    'shed': '9_Шедовая.png'
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    updateAllCalculations();
});

function initializeCalculator() {
    setupEventListeners();
    initializeCitySelect();
    initializeRoofTypeParameters();
}

function initializeCitySelect() {
    const citySelect = document.getElementById('citySelect');
    if (!citySelect) return;
    
    citySelect.innerHTML = '<option value="">Выберите город</option>';
    
    Object.keys(CITIES_DATA).forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        option.setAttribute('data-district', CITIES_DATA[city].district);
        option.setAttribute('data-temp', CITIES_DATA[city].temp);
        option.setAttribute('data-wind', CITIES_DATA[city].wind);
        citySelect.appendChild(option);
    });
}

function initializeRoofTypeParameters() {
    const roofType = document.getElementById('roofType');
    if (!roofType) return;
    
    roofType.addEventListener('change', function() {
        updateRoofParameters();
        updateAllCalculations();
    });
    // Инициализация при загрузке
    updateRoofParameters();
}

function setupEventListeners() {
    const calculationElements = [
        'sgManual', 'citySelect', 'snowDistrictMap', 'customSg', 'buildingType',
        'protected', 'dimMin', 'dimMax', 'januaryTemp', 'manualWindSpeed',
        'roofType', 'roofAngle', 'reducedLoad', 'forPurlins', 'terrainType'
    ];
    
    calculationElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', updateAllCalculations);
            element.addEventListener('input', updateAllCalculations);
        }
    });

    // Обработчики для переключения методов
    document.querySelectorAll('input[name="sgMethod"]').forEach(radio => {
        radio.addEventListener('change', toggleSgMethod);
    });
    document.querySelectorAll('input[name="ceMethod"]').forEach(radio => {
        radio.addEventListener('change', toggleCeMethod);
    });
    document.querySelectorAll('input[name="ctMethod"]').forEach(radio => {
        radio.addEventListener('change', toggleCtMethod);
    });
    document.querySelectorAll('input[name="muMethod"]').forEach(radio => {
        radio.addEventListener('change', toggleMuMethod);
    });
    document.querySelectorAll('input[name="spMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            showSpMethod(this.value);
            updateAllCalculations();
        });
    });
    document.querySelectorAll('input[name="ctType"]').forEach(radio => {
        radio.addEventListener('change', updateAllCalculations);
    });
}

// ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ МЕТОДОВ
function toggleSgMethod() {
    const manualMethod = document.querySelector('input[name="sgMethod"][value="manual"]').checked;
    const manualInput = document.getElementById('sgManualInput');
    const spCalculation = document.getElementById('sgSpCalculation');
    
    if (manualInput && spCalculation) {
        manualInput.style.display = manualMethod ? 'block' : 'none';
        spCalculation.style.display = manualMethod ? 'none' : 'block';
    }
    updateAllCalculations();
}

function toggleCeMethod() {
    const manualMethod = document.querySelector('input[name="ceMethod"][value="manual"]').checked;
    const manualInput = document.getElementById('ceManualInput');
    const spCalculation = document.getElementById('ceSpCalculation');
    
    if (manualInput && spCalculation) {
        manualInput.style.display = manualMethod ? 'block' : 'none';
        spCalculation.style.display = manualMethod ? 'none' : 'block';
    }
    updateAllCalculations();
}

function toggleCtMethod() {
    const manualMethod = document.querySelector('input[name="ctMethod"][value="manual"]').checked;
    const manualInput = document.getElementById('ctManualInput');
    const spCalculation = document.getElementById('ctSpCalculation');
    
    if (manualInput && spCalculation) {
        manualInput.style.display = manualMethod ? 'block' : 'none';
        spCalculation.style.display = manualMethod ? 'none' : 'block';
    }
    updateAllCalculations();
}

function toggleMuMethod() {
    const manualMethod = document.querySelector('input[name="muMethod"][value="manual"]').checked;
    const manualInput = document.getElementById('muManualInput');
    const spCalculation = document.getElementById('muSpCalculation');
    
    if (manualInput && spCalculation) {
        manualInput.style.display = manualMethod ? 'block' : 'none';
        spCalculation.style.display = manualMethod ? 'none' : 'block';
    }
    updateAllCalculations();
}

function showSpMethod(method) {
    const cityMethod = document.getElementById('cityMethod');
    const mapMethod = document.getElementById('mapMethod');
    
    if (cityMethod && mapMethod) {
        cityMethod.style.display = method === 'city' ? 'block' : 'none';
        mapMethod.style.display = method === 'map' ? 'block' : 'none';
    }
    updateAllCalculations();
}

// ФУНКЦИИ ДЛЯ РАБОТЫ С КАРТАМИ
function toggleMap() {
    const mapContainer = document.getElementById('mapContainer');
    const btn = document.getElementById('mapToggleBtn');
    
    if (!mapContainer || !btn) return;
    
    if (mapContainer.style.display === 'none') {
        mapContainer.style.display = 'block';
        btn.textContent = '🗺️ Скрыть карту';
        if (!document.getElementById('snowMap').src) {
            updateMapSrc();
        }
    } else {
        mapContainer.style.display = 'none';
        btn.textContent = '🗺️ Показать карту';
    }
}

function updateMapSrc() {
    const type = document.getElementById('mapType');
    const mapImg = document.getElementById('snowMap');
    
    if (!type || !mapImg) return;
    
    mapImg.src = MAP_URLS[type.value] || MAP_URLS.main;
    
    mapImg.onerror = function() {
        this.alt = 'Карта временно недоступна';
    };
}

// ФУНКЦИИ ДЛЯ РАБОТЫ С ТИПАМИ ПОКРЫТИЙ
function updateRoofParameters() {
    const roofType = document.getElementById('roofType');
    const paramsContainer = document.getElementById('roofParams');
    
    if (!roofType || !paramsContainer) return;
    
    const type = roofType.value;
    let html = '';
    
    switch(type) {
        case 'flat':
            html = `
                <label>Уклон покрытия i (%): <input type="number" id="roofSlopePercent" min="0" max="2.5" value="1.0" step="0.1" onchange="updateAllCalculations()"></label>
                <p class="note">Для плоских покрытий уклон i ≤ 2.5% (Б.1)</p>
            `;
            break;
        case 'single_slope':
            html = `
                <label>Угол наклона α (°): <input type="number" id="roofAngle" min="0" max="90" value="15" onchange="updateAllCalculations()"></label>
                <label>Длина ската l (м): <input type="number" id="slopeLength" min="1" value="20" onchange="updateAllCalculations()"></label>
                <p class="note">Односкатное покрытие (Б.1 схема 3)</p>
            `;
            break;
        case 'pitched':
            html = `
                <label>Угол наклона α (°): <input type="number" id="roofAngle" min="0" max="90" value="30" onchange="updateAllCalculations()"></label>
                <label>Длина ската l (м): <input type="number" id="slopeLength" min="1" value="15" onchange="updateAllCalculations()"></label>
                <p class="note">Двускатное покрытие (Б.1 схема 2)</p>
            `;
            break;
        case 'arched':
            html = `
                <label>Угол в коньке α (°): <input type="number" id="roofAngle" min="0" max="90" value="30" onchange="updateAllCalculations()"></label>
                <label>Отношение f/l: <input type="number" id="archRatio" step="0.01" min="0" max="0.5" value="0.1" onchange="updateAllCalculations()"></label>
                <label>Пролет l (м): <input type="number" id="archSpan" min="1" value="24" onchange="updateAllCalculations()"></label>
                <p class="note">Сводчатые покрытия (Б.2)</p>
            `;
            break;
        default:
            html = `
                <label>Угол наклона α (°): <input type="number" id="roofAngle" min="0" max="90" value="30" onchange="updateAllCalculations()"></label>
            `;
    }
    
    paramsContainer.innerHTML = html;
    
    const ref = roofType.selectedOptions[0].getAttribute('data-ref');
    const roofRef = document.getElementById('roofRef');
    if (roofRef) {
        roofRef.textContent = `Ссылка на СП: ${ref}`;
    }
    
    updateRoofImage();
}

function updateRoofImage() {
    const roofType = document.getElementById('roofType');
    const roofImage = document.getElementById('roofImage');
    
    if (!roofType || !roofImage) return;
    
    const imageName = ROOF_IMAGES[roofType.value];
    
    if (imageName) {
        roofImage.src = `https://raw.githubusercontent.com/Tifilin/ingenerstroitel/refs/heads/main/${imageName}`;
        roofImage.alt = `Схема покрытия: ${roofType.value}`;
        
        roofImage.onerror = function() {
            this.alt = 'Схема временно недоступна';
        };
    }
}

// ФУНКЦИИ НАВИГАЦИИ
function nextStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    const nextStep = document.getElementById(`step${stepNumber}`);
    if (nextStep) {
        nextStep.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    const prevStep = document.getElementById(`step${stepNumber}`);
    if (prevStep) {
        prevStep.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ОСНОВНЫЕ ФУНКЦИИ РАСЧЕТА СОГЛАСНО СП 20.13330.2016

function calculateSg() {
    const method = document.querySelector('input[name="sgMethod"]:checked');
    if (!method) return 1.5;
    
    if (method.value === 'manual') {
        const manualSg = document.getElementById('sgManual');
        return manualSg ? parseFloat(manualSg.value) || 1.5 : 1.5;
    } else {
        let district;
        const spMethod = document.querySelector('input[name="spMethod"]:checked');
        
        if (spMethod && spMethod.value === 'city') {
            const citySelect = document.getElementById('citySelect');
            const city = citySelect ? citySelect.value : '';
            district = city ? CITIES_DATA[city].district : 'III';
        } else {
            const snowDistrictMap = document.getElementById('snowDistrictMap');
            district = snowDistrictMap ? snowDistrictMap.value : 'III';
        }
        
        const customSg = document.getElementById('customSg');
        if (customSg && customSg.value) {
            const customValue = parseFloat(customSg.value);
            if (!isNaN(customValue) && customValue > 0) {
                return Math.max(0.5, Math.min(4.0, customValue));
            }
        }
        
        return SNOW_DISTRICTS[district] || 1.5;
    }
}

function calculateCe() {
    const method = document.querySelector('input[name="ceMethod"]:checked');
    if (!method) return 1.0;
    
    if (method.value === 'manual') {
        const manualCe = document.getElementById('ceManual');
        return manualCe ? parseFloat(manualCe.value) || 1.0 : 1.0;
    }
    
    // Расчет по СП 20.13330.2016 п.10.5-10.9
    const protectedCheckbox = document.getElementById('protected');
    if (protectedCheckbox && protectedCheckbox.checked) {
        return 1.0; // п.10.6 - для защищенных зданий
    }
    
    // Проверка условий п.10.7 для применения снижения Ce
    if (!checkCeReductionConditions()) {
        return 1.0; // условия не выполнены - Ce = 1.0
    }
    
    // Формула 10.3: Ce = (1.2 - 0.1√l) 
    const l = calculateCharacteristicSize();
    const ce = 1.2 - 0.1 * Math.sqrt(l);
    
    // Ограничение согласно п.10.5: 0.5 ≤ Ce ≤ 1.0
    return Math.max(0.5, Math.min(1.0, ce));
}

function checkCeReductionConditions() {
    const roofTypeElement = document.getElementById('roofType');
    const roofAngleElement = document.getElementById('roofAngle');
    const archRatioElement = document.getElementById('archRatio');
    const dimMinElement = document.getElementById('dimMin');
    
    if (!roofTypeElement || !roofAngleElement || !dimMinElement) return false;
    
    const roofType = roofTypeElement.value;
    const angle = parseFloat(roofAngleElement.value) || 0;
    const archRatio = archRatioElement ? parseFloat(archRatioElement.value) || 0 : 0;
    const b = parseFloat(dimMinElement.value) || 50;
    
    // Условия п.10.7 для снижения Ce
    if (roofType === 'flat' || roofType === 'single_slope' || roofType === 'pitched') {
        if (angle <= 12 && b >= 48) return true;
        if (angle > 12 && angle <= 20 && b >= 24) return true;
    }
    
    // Для сводчатых покрытий
    if (roofType === 'arched') {
        if (archRatio <= 1/6 && b >= 48) return true;
        if (archRatio > 1/6 && archRatio <= 1/3 && b >= 24) return true;
    }
    
    return false;
}

function calculateCharacteristicSize() {
    const dimMin = document.getElementById('dimMin');
    const dimMax = document.getElementById('dimMax');
    const dimensionError = document.getElementById('dimensionError');
    
    if (!dimMin || !dimMax) return 50;
    
    const b = parseFloat(dimMin.value) || 50;
    const L = parseFloat(dimMax.value) || 50;
    
    if (dimensionError) {
        if (b > L) {
            dimensionError.style.display = 'block';
            return 50;
        } else {
            dimensionError.style.display = 'none';
        }
    }
    
    // Характеристический размер согласно п.10.7 - наименьший размер
    return Math.min(b, L);
}

function calculateCt() {
    const method = document.querySelector('input[name="ctMethod"]:checked');
    if (!method) return 1.0;
    
    if (method.value === 'manual') {
        const manualCt = document.getElementById('ctManual');
        return manualCt ? parseFloat(manualCt.value) || 1.0 : 1.0;
    }
    
    const ctType = document.querySelector('input[name="ctType"]:checked');
    if (!ctType) return 1.0;
    
    // Согласно п.10.10 СП 20.13330.2016
    const ctValues = {
        'normal': 1.0,      // Обычные покрытия
        'transparent': 1.1, // Прозрачные покрытия
        'highLoss': 1.2,    // С повышенными теплопотерями
        'cold': 1.0         // Холодные покрытия
    };
    
    return ctValues[ctType.value] || 1.0;
}

function calculateMu() {
    const method = document.querySelector('input[name="muMethod"]:checked');
    if (!method) return 1.0;
    
    if (method.value === 'manual') {
        const manualMu = document.getElementById('muManual');
        return manualMu ? parseFloat(manualMu.value) || 1.0 : 1.0;
    }
    
    const roofTypeElement = document.getElementById('roofType');
    const roofAngleElement = document.getElementById('roofAngle');
    
    if (!roofTypeElement || !roofAngleElement) return 1.0;
    
    const roofType = roofTypeElement.value;
    const angle = parseFloat(roofAngleElement.value) || 30;
    
    // Расчет согласно Приложению Б СП 20.13330.2016
    switch(roofType) {
        case 'flat':
            return 1.0; // Б.1 - плоские покрытия
        case 'single_slope':
            return calculateMuForSingleSlope(angle);
        case 'pitched':
            return calculateMuForPitched(angle);
        case 'arched':
            return calculateMuForArched(angle);
        default:
            return 1.0;
    }
}

function calculateMuForSingleSlope(angle) {
    // Б.1 - односкатные покрытия (схема 3)
    if (angle <= 25) {
        return 1.0;
    } else if (angle <= 60) {
        return (60 - angle) / 35;
    } else {
        return 0;
    }
}

function calculateMuForPitched(angle) {
    // Б.1 - двускатные покрытия - ВСЕ ТРИ СХЕМЫ
    const schemes = calculateMuSchemesForPitched(angle);
    
    // Для расчета берем максимальное значение из всех схем и зон
    let maxMu = 0;
    Object.values(schemes).forEach(scheme => {
        Object.values(scheme.zones).forEach(zone => {
            if (zone.mu > maxMu) maxMu = zone.mu;
        });
    });
    
    return maxMu;
}

function calculateMuSchemesForPitched(angle) {
    const schemes = {};
    
    // Схема 1 - равномерное распределение (Б.1 схема 1)
    if (angle <= 30) {
        schemes.scheme1 = { 
            name: "Схема 1 - Равномерное распределение",
            zones: {
                'zone1': { mu: 1.0, description: "μ₁ = 1,0" },
                'zone2': { mu: 1.0, description: "μ₂ = 1,0" }
            }
        };
    } else if (angle <= 60) {
        const mu = (60 - angle) / 30;
        schemes.scheme1 = {
            name: "Схема 1 - Равномерное распределение", 
            zones: {
                'zone1': { mu: mu, description: `μ₁ = (60 - ${angle})/30 = ${mu.toFixed(2)}` },
                'zone2': { mu: mu, description: `μ₂ = (60 - ${angle})/30 = ${mu.toFixed(2)}` }
            }
        };
    } else {
        schemes.scheme1 = {
            name: "Схема 1 - Равномерное распределение",
            zones: {
                'zone1': { mu: 0, description: "μ₁ = 0" },
                'zone2': { mu: 0, description: "μ₂ = 0" }
            }
        };
    }
    
    // Схема 2 - неравномерное распределение (Б.1 схема 2)
    if (angle <= 15) {
        schemes.scheme2 = {
            name: "Схема 2 - Неравномерное распределение",
            zones: {
                'zone1': { mu: 1.0, description: "μ₁ = 1,0" },
                'zone2': { mu: 1.0, description: "μ₂ = 1,0" }
            }
        };
    } else if (angle <= 60) {
        const mu = (60 - angle) / 30;
        schemes.scheme2 = {
            name: "Схема 2 - Неравномерное распределение",
            zones: {
                'zone1': { mu: 0.5, description: "μ₁ = 0,5" },
                'zone2': { mu: 1.5 * mu, description: `μ₂ = 1,5 × (60 - ${angle})/30 = ${(1.5 * mu).toFixed(2)}` }
            }
        };
    } else {
        schemes.scheme2 = {
            name: "Схема 2 - Неравномерное распределение",
            zones: {
                'zone1': { mu: 0, description: "μ₁ = 0" },
                'zone2': { mu: 0, description: "μ₂ = 0" }
            }
        };
    }
    
    // Схема 3 - образование снегового мешка (Б.1 схема 3) - для углов 20-30°
    if (angle >= 20 && angle <= 30) {
        schemes.scheme3 = {
            name: "Схема 3 - Образование снегового мешка",
            zones: {
                'zone1': { mu: 1.0, description: "μ₁ = 1,0" },
                'zone2': { mu: 2.0, description: "μ₂ = 2,0 (снеговой мешок)" },
                'zone3': { mu: 1.0, description: "μ₃ = 1,0" }
            }
        };
    }
    
    return schemes;
}

function calculateMuForArched(angle) {
    // Б.2 - сводчатые покрытия
    if (angle <= 30) {
        return 1.0;
    } else if (angle <= 60) {
        return (60 - angle) / 30;
    } else {
        return 0;
    }
}

// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateAllCalculations() {
    updateSgDisplay();
    updateCeDisplay();
    updateCtDisplay();
    updateMuDisplay();
    updateTemperatureInfo();
    updateWindInfo();
    updatePreview();
}

function updateSgDisplay() {
    const Sg = calculateSg();
    const sgValueElement = document.getElementById('sgValue');
    const snowDistrictElement = document.getElementById('snowDistrict');
    const detailsElement = document.getElementById('sgCalculationDetails');
    
    if (sgValueElement) sgValueElement.textContent = Sg.toFixed(2);
    
    let district = 'III';
    const spMethod = document.querySelector('input[name="spMethod"]:checked');
    
    if (spMethod && spMethod.value === 'city') {
        const citySelect = document.getElementById('citySelect');
        const city = citySelect ? citySelect.value : '';
        district = city ? CITIES_DATA[city].district : 'III';
    } else {
        const snowDistrictMap = document.getElementById('snowDistrictMap');
        district = snowDistrictMap ? snowDistrictMap.value : 'III';
    }
    
    if (snowDistrictElement) snowDistrictElement.textContent = district;
    if (detailsElement) detailsElement.innerHTML = generateSgCalculationDetails(Sg, district);
}

function generateSgCalculationDetails(Sg, district) {
    let details = '<div class="protocol-step">';
    details += '<div class="protocol-header"><strong>Расчет нормативной снеговой нагрузки Sg</strong><span class="protocol-reference">п.10.2, Таблица 10.1</span></div>';
    
    const sgMethod = document.querySelector('input[name="sgMethod"]:checked');
    
    if (sgMethod && sgMethod.value === 'manual') {
        details += `<div class="protocol-description"><strong>Метод определения:</strong> Ручной ввод нормативной снеговой нагрузки</div>`;
        details += `<div class="protocol-description"><strong>Обоснование:</strong> п.10.2 СП 20.13330.2016 - Sg принимается по карте районирования или задается вручную</div>`;
    } else {
        const spMethod = document.querySelector('input[name="spMethod"]:checked');
        if (spMethod && spMethod.value === 'city') {
            const citySelect = document.getElementById('citySelect');
            const city = citySelect ? citySelect.value : '';
            details += `<div class="protocol-description"><strong>Метод определения:</strong> По населенному пункту</div>`;
            details += `<div class="protocol-description"><strong>Населенный пункт:</strong> ${city}</div>`;
            details += `<div class="protocol-description"><strong>Снеговой район:</strong> ${district} (определен по карте районирования территории РФ)</div>`;
        } else {
            details += `<div class="protocol-description"><strong>Метод определения:</strong> По карте снеговых районов</div>`;
            details += `<div class="protocol-description"><strong>Снеговой район:</strong> ${district} (выбран вручную по карте)</div>`;
        }
        
        const customSg = document.getElementById('customSg');
        if (customSg && customSg.value) {
            details += `<div class="protocol-description"><strong>Уточнение:</strong> Применено уточненное значение по данным Росгидромета (для объектов на границах районов или в сложном рельефе)</div>`;
        }
        
        details += `<div class="protocol-description"><strong>Нормативное основание:</strong> Таблица 10.1 СП 20.13330.2016 с Изменением №5 - Значения весового покрова снега на 1 м² горизонтальной поверхности земли</div>`;
    }
    
    details += `<div class="protocol-formula">Sg = ${Sg.toFixed(2)} кПа</div>`;
    details += `<div class="protocol-result">Нормативная снеговая нагрузка: ${Sg.toFixed(2)} кПа</div>`;
    details += '</div>';
    
    return details;
}

function updateCeDisplay() {
    const Ce = calculateCe();
    const ceValueElement = document.getElementById('ceValue');
    const detailsElement = document.getElementById('ceCalculationDetails');
    
    if (ceValueElement) ceValueElement.textContent = `Рассчитанное значение Ce: ${Ce.toFixed(2)}`;
    if (detailsElement) detailsElement.innerHTML = generateCeCalculationDetails(Ce);
}

function generateCeCalculationDetails(Ce) {
    let details = '<div class="protocol-step">';
    details += '<div class="protocol-header"><strong>Расчет коэффициента воздействия ветра Ce</strong><span class="protocol-reference">п.10.5-10.9</span></div>';
    
    const protectedCheckbox = document.getElementById('protected');
    const isProtected = protectedCheckbox && protectedCheckbox.checked;
    
    if (isProtected) {
        details += `<div class="protocol-description"><strong>Условия:</strong> Объект защищен от прямого воздействия ветра</div>`;
        details += `<div class="protocol-description"><strong>Обоснование:</strong> п.10.6 СП 20.13330.2016 - для защищенных зданий Ce = 1.0</div>`;
    } else {
        const l = calculateCharacteristicSize();
        const canReduce = checkCeReductionConditions();
        
        if (!canReduce) {
            details += `<div class="protocol-description"><strong>Условия:</strong> Не выполнены условия п.10.7 для снижения Ce</div>`;
            details += `<div class="protocol-description"><strong>Обоснование:</strong> п.10.5 СП 20.13330.2016 - при невыполнении условий Ce = 1.0</div>`;
        } else {
            details += `<div class="protocol-description"><strong>Условия:</strong> Выполнены условия п.10.7 для снижения Ce</div>`;
            details += `<div class="protocol-description"><strong>Характеристический размер:</strong> l = ${l} м</div>`;
            details += `<div class="protocol-description"><strong>Формула расчета:</strong> п.10.3 СП 20.13330.2016 - Ce = 1.2 - 0.1√l</div>`;
            details += `<div class="protocol-description"><strong>Расчет:</strong> Ce = 1.2 - 0.1 × ${Math.sqrt(l).toFixed(2)} = ${Ce.toFixed(2)}</div>`;
        }
    }
    
    details += `<div class="protocol-formula">Ce = ${Ce.toFixed(2)}</div>`;
    details += `<div class="protocol-result">Коэффициент воздействия ветра: ${Ce.toFixed(2)}</div>`;
    details += '</div>';
    
    return details;
}

function updateCtDisplay() {
    const Ct = calculateCt();
    const ctValueElement = document.getElementById('ctValue');
    const detailsElement = document.getElementById('ctCalculationDetails');
    
    if (ctValueElement) ctValueElement.textContent = `Рассчитанное значение Ct: ${Ct.toFixed(1)}`;
    if (detailsElement) detailsElement.innerHTML = generateCtCalculationDetails(Ct);
}

function generateCtCalculationDetails(Ct) {
    const ctType = document.querySelector('input[name="ctType"]:checked');
    let typeDescription = 'Обычные покрытия с утеплением';
    
    if (ctType) {
        switch(ctType.value) {
            case 'normal':
                typeDescription = 'Обычные покрытия с утеплением';
                break;
            case 'transparent':
                typeDescription = 'Прозрачные покрытия (с коэффициентом теплопередачи > 1 Вт/(м²·°C))';
                break;
            case 'highLoss':
                typeDescription = 'Покрытия с повышенными тепловыми потерями';
                break;
            case 'cold':
                typeDescription = 'Холодные покрытия (с коэффициентом теплопередачи ≤ 1 Вт/(м²·°C))';
                break;
        }
    }
    
    let details = '<div class="protocol-step">';
    details += '<div class="protocol-header"><strong>Расчет термического коэффициента Ct</strong><span class="protocol-reference">п.10.10</span></div>';
    details += `<div class="protocol-description"><strong>Тип покрытия:</strong> ${typeDescription}</div>`;
    details += `<div class="protocol-description"><strong>Обоснование:</strong> п.10.10 СП 20.13330.2016 - значения коэффициента Ct в зависимости от теплового режима покрытия</div>`;
    details += `<div class="protocol-formula">Ct = ${Ct.toFixed(1)}</div>`;
    details += `<div class="protocol-result">Термический коэффициент: ${Ct.toFixed(1)}</div>`;
    details += '</div>';
    
    return details;
}

function updateMuDisplay() {
    const Mu = calculateMu();
    const muValueElement = document.getElementById('muValue');
    const detailsElement = document.getElementById('muCalculationDetails');
    
    if (muValueElement) muValueElement.textContent = `Максимальное значение μ: ${Mu.toFixed(2)}`;
    if (detailsElement) detailsElement.innerHTML = generateMuCalculationDetails(Mu);
    
    updateMuSchemesDisplay();
}

function generateMuCalculationDetails(Mu) {
    const roofTypeElement = document.getElementById('roofType');
    const roofAngleElement = document.getElementById('roofAngle');
    
    if (!roofTypeElement || !roofAngleElement) return '';
    
    const roofType = roofTypeElement.value;
    const angle = parseFloat(roofAngleElement.value) || 30;
    
    let details = '<div class="protocol-step">';
    details += '<div class="protocol-header"><strong>Расчет коэффициента перехода μ</strong><span class="protocol-reference">п.10.4, Приложение Б</span></div>';
    
    switch(roofType) {
        case 'flat':
            details += `<div class="protocol-description"><strong>Тип покрытия:</strong> Плоское покрытие (уклон ≤ 2.5%)</div>`;
            details += `<div class="protocol-description"><strong>Обоснование:</strong> Б.1 СП 20.13330.2016 - для плоских покрытий μ = 1.0</div>`;
            break;
            
        case 'pitched':
            details += `<div class="protocol-description"><strong>Тип покрытия:</strong> Двускатное покрытие</div>`;
            details += `<div class="protocol-description"><strong>Угол наклона:</strong> α = ${angle}°</div>`;
            
            const schemes = calculateMuSchemesForPitched(angle);
            Object.keys(schemes).forEach(schemeKey => {
                const scheme = schemes[schemeKey];
                details += `<div class="protocol-description"><strong>${scheme.name}:</strong></div>`;
                Object.values(scheme.zones).forEach(zone => {
                    details += `<div class="protocol-description" style="margin-left: 20px;">${zone.description}</div>`;
                });
            });
            
            details += `<div class="protocol-description"><strong>Принято для расчета:</strong> μ = ${Mu.toFixed(2)} (максимальное значение из всех схем)</div>`;
            break;
            
        case 'single_slope':
            details += `<div class="protocol-description"><strong>Тип покрытия:</strong> Односкатное покрытие</div>`;
            details += `<div class="protocol-description"><strong>Угол наклона:</strong> α = ${angle}°</div>`;
            
            if (angle <= 25) {
                details += `<div class="protocol-description"><strong>Обоснование:</strong> Б.1 схема 3 СП 20.13330.2016 - при α ≤ 25° μ = 1.0</div>`;
            } else if (angle <= 60) {
                details += `<div class="protocol-description"><strong>Формула расчета:</strong> Б.1 схема 3 СП 20.13330.2016 - μ = (60 - α)/35</div>`;
                details += `<div class="protocol-description"><strong>Расчет:</strong> μ = (60 - ${angle})/35 = ${Mu.toFixed(2)}</div>`;
            } else {
                details += `<div class="protocol-description"><strong>Обоснование:</strong> Б.1 схема 3 СП 20.13330.2016 - при α > 60° μ = 0</div>`;
            }
            break;
            
        default:
            details += `<div class="protocol-description"><strong>Тип покрытия:</strong> ${roofType}</div>`;
            details += `<div class="protocol-description"><strong>Обоснование:</strong> Расчет по соответствующей схеме Приложения Б</div>`;
    }
    
    details += `<div class="protocol-formula">μ = ${Mu.toFixed(2)}</div>`;
    details += `<div class="protocol-result">Коэффициент перехода: ${Mu.toFixed(2)}</div>`;
    details += '</div>';
    
    return details;
}

function updateMuSchemesDisplay() {
    const roofTypeElement = document.getElementById('roofType');
    const roofAngleElement = document.getElementById('roofAngle');
    const schemesContainer = document.getElementById('muSchemesContainer');
    
    if (!roofTypeElement || !roofAngleElement || !schemesContainer) return;
    
    const roofType = roofTypeElement.value;
    const angle = parseFloat(roofAngleElement.value) || 30;
    
    let schemesHTML = '';
    
    if (roofType === 'pitched') {
        const schemes = calculateMuSchemesForPitched(angle);
        
        Object.keys(schemes).forEach(schemeKey => {
            const scheme = schemes[schemeKey];
            schemesHTML += `<div class="mu-scheme">`;
            schemesHTML += `<h4>${scheme.name}</h4>`;
            
            // Визуализация зон
            schemesHTML += `<div class="scheme-visualization">`;
            Object.values(scheme.zones).forEach((zone, index) => {
                schemesHTML += `
                    <div class="scheme-zone">
                        <div class="zone-label">Зона ${index + 1}</div>
                        <div class="zone-value">${zone.mu.toFixed(2)}</div>
                        <div class="zone-label">μ</div>
                    </div>
                `;
            });
            schemesHTML += `</div>`;
            
            // Описание зон
            Object.values(scheme.zones).forEach(zone => {
                schemesHTML += `<div class="protocol-description">${zone.description}</div>`;
            });
            
            schemesHTML += `</div>`;
        });
    }
    
    schemesContainer.innerHTML = schemesHTML;
}

function updateTemperatureInfo() {
    const tempSelect = document.getElementById('januaryTemp');
    const tempInfo = document.getElementById('temperatureInfo');
    const reducedLoadCheckbox = document.getElementById('reducedLoad');
    
    if (!tempSelect || !tempInfo) return;
    
    let explanation = '';
    let className = '';
    
    switch(tempSelect.value) {
        case 'cold':
            explanation = '❄️ Холодный регион (t_янв ≤ -5°C). Согласно п.10.11 допускается применение пониженной снеговой нагрузки 0.5Sg для расчета деформаций конструкций.';
            className = 'cold-region';
            if (reducedLoadCheckbox) reducedLoadCheckbox.disabled = false;
            break;
        case 'warm':
            explanation = '☀️ Теплый регион (t_янв > -5°C). Пониженная снеговая нагрузка не применяется из-за неравномерного отложения снега и образования ледяных корок.';
            className = 'warm-region';
            if (reducedLoadCheckbox) {
                reducedLoadCheckbox.disabled = true;
                reducedLoadCheckbox.checked = false;
            }
            break;
        default:
            explanation = '❓ Температура января не определена. Для применения пониженной нагрузки необходимо указать среднемесячную температуру января.';
            className = 'unknown-region';
            if (reducedLoadCheckbox) reducedLoadCheckbox.disabled = true;
    }
    
    tempInfo.innerHTML = `<div class="${className}">${explanation}</div>`;
}

function updateWindInfo() {
    const windInfo = document.getElementById('windInfo');
    const manualWindSpeed = document.getElementById('manualWindSpeed');
    const terrainType = document.getElementById('terrainType');
    
    if (!windInfo || !manualWindSpeed || !terrainType) return;
    
    const windSpeed = parseFloat(manualWindSpeed.value) || 4.0;
    let terrainDescription = '';
    
    switch(terrainType.value) {
        case 'A':
            terrainDescription = 'A - открытые побережья морей, озер и водохранилищ, пустыни, степи, лесостепи, тундра';
            break;
        case 'B':
            terrainDescription = 'B - городские территории, лесные массивы и другие местности, равномерно покрытые препятствиями высотой более 10 м';
            break;
        case 'C':
            terrainDescription = 'C - городские районы с застройкой зданиями высотой более 25 м';
            break;
    }
    
    windInfo.innerHTML = `
        <strong>Параметры ветра:</strong><br>
        • Средняя скорость ветра: ${windSpeed} м/с<br>
        • Тип местности: ${terrainDescription}
    `;
}

function updatePreview() {
    const Sg = calculateSg();
    const Ce = calculateCe();
    const Ct = calculateCt();
    const Mu = calculateMu();
    const forPurlinsCheckbox = document.getElementById('forPurlins');
    const reducedLoadCheckbox = document.getElementById('reducedLoad');
    const previewResult = document.getElementById('previewResult');
    
    if (!previewResult) return;
    
    const forPurlins = forPurlinsCheckbox ? forPurlinsCheckbox.checked : false;
    const reducedLoad = reducedLoadCheckbox ? reducedLoadCheckbox.checked : false;
    
    // Расчет по прочности (п.10.1)
    const S0 = Sg * Ce * Ct * Mu; // Нормативное значение
    const S = GAMMA_F * S0;       // Расчетное значение
    
    // Для прогонов (п.10.4 примечание 4)
    const S_purlins = forPurlins ? S * 1.1 : S;
    
    // Для деформаций (п.10.11)
    const S0_reduced = reducedLoad ? 0.5 * Sg * Ce * Ct * Mu : S0;
    
    let previewHTML = `
        <strong>Предварительный расчет:</strong><br>
        <div class="calculation-formula">
            S₀ = Sg × Ce × Ct × μ = ${Sg.toFixed(2)} × ${Ce.toFixed(2)} × ${Ct.toFixed(1)} × ${Mu.toFixed(2)} = ${S0.toFixed(2)} кПа<br>
            S = γf × S₀ = 1,4 × ${S0.toFixed(2)} = ${S.toFixed(2)} кПа
        </div>
    `;
    
    if (forPurlins) {
        previewHTML += `<div class="calculation-result">Для прогонов (×1.1): ${S_purlins.toFixed(2)} кПа</div>`;
    }
    
    if (reducedLoad) {
        previewHTML += `<div class="calculation-result">Для деформаций (0.5Sg): ${S0_reduced.toFixed(2)} кПа</div>`;
    }
    
    previewResult.innerHTML = previewHTML;
}

// ФИНАЛЬНЫЙ РАСЧЕТ
function calculateFinal() {
    const Sg = calculateSg();
    const Ce = calculateCe();
    const Ct = calculateCt();
    const Mu = calculateMu();
    const forPurlinsCheckbox = document.getElementById('forPurlins');
    const reducedLoadCheckbox = document.getElementById('reducedLoad');
    
    const forPurlins = forPurlinsCheckbox ? forPurlinsCheckbox.checked : false;
    const reducedLoad = reducedLoadCheckbox ? reducedLoadCheckbox.checked : false;
    
    // Расчет по прочности (п.10.1)
    const S0 = Sg * Ce * Ct * Mu; // Нормативное значение
    const S = GAMMA_F * S0;       // Расчетное значение
    
    // Для прогонов (п.10.4 примечание 4)
    const S_purlins = forPurlins ? S * 1.1 : S;
    
    // Для деформаций (п.10.11)
    const S0_reduced = reducedLoad ? 0.5 * Sg * Ce * Ct * Mu : S0;
    
    generateReport(S, S_purlins, S0_reduced, Sg, Ce, Ct, Mu, S0);
}

function generateReport(S, S_purlins, S0_reduced, Sg, Ce, Ct, Mu, S0) {
    const report = document.getElementById('report');
    const reportContent = document.getElementById('reportContent');
    const stepsContainer = document.querySelector('.steps-container');
    
    if (!report || !reportContent || !stepsContainer) return;
    
    reportContent.innerHTML = `
        <div class="report-section">
            <h3>📋 Итоговые результаты расчета</h3>
            
            <div class="final-result">
                🎯 <strong>РАСЧЕТНАЯ СНЕГОВАЯ НАГРУЗКА ДЛЯ РАСЧЕТА ПО ПРОЧНОСТИ</strong><br>
                <span style="font-size: 24px;">${S.toFixed(2)} кПа (${(S * 100).toFixed(0)} кгс/м²)</span>
            </div>
            
            ${S_purlins !== S ? `
            <div class="calculation-result">
                <strong>Для расчета прогонов (п.10.4 примечание 4):</strong><br>
                ${S_purlins.toFixed(2)} кПа
            </div>
            ` : ''}
            
            <div class="calculation-result">
                <strong>Нормативное значение для расчета деформаций:</strong><br>
                ${S0_reduced.toFixed(2)} кПа
            </div>
        </div>

        <div class="report-section">
            <h3>🧮 Протокол расчета</h3>
            
            <div class="protocol-step">
                <div class="protocol-header"><strong>Исходные данные</strong></div>
                <div class="protocol-description">• Нормативная снеговая нагрузка Sg = ${Sg.toFixed(2)} кПа</div>
                <div class="protocol-description">• Коэффициент воздействия ветра Ce = ${Ce.toFixed(2)}</div>
                <div class="protocol-description">• Термический коэффициент Ct = ${Ct.toFixed(1)}</div>
                <div class="protocol-description">• Коэффициент перехода μ = ${Mu.toFixed(2)}</div>
                <div class="protocol-description">• Коэффициент надежности γf = 1,4 (п.10.12)</div>
            </div>
            
            <div class="protocol-step">
                <div class="protocol-header"><strong>Расчет нормативного значения снеговой нагрузки S₀ (п.10.1)</strong></div>
                <div class="protocol-formula">
                    S₀ = Sg × Ce × Ct × μ<br>
                    S₀ = ${Sg.toFixed(2)} × ${Ce.toFixed(2)} × ${Ct.toFixed(1)} × ${Mu.toFixed(2)}<br>
                    S₀ = ${S0.toFixed(2)} кПа
                </div>
            </div>
            
            <div class="protocol-step">
                <div class="protocol-header"><strong>Расчет расчетного значения снеговой нагрузки S (п.10.1)</strong></div>
                <div class="protocol-formula">
                    S = γf × S₀<br>
                    S = 1,4 × ${S0.toFixed(2)}<br>
                    S = ${S.toFixed(2)} кПа
                </div>
            </div>
            
            ${S0_reduced !== S0 ? `
            <div class="protocol-step">
                <div class="protocol-header"><strong>Пониженное нормативное значение для расчета деформаций (п.10.11)</strong></div>
                <div class="protocol-formula">
                    S₀ = 0,5 × Sg × Ce × Ct × μ<br>
                    S₀ = 0,5 × ${Sg.toFixed(2)} × ${Ce.toFixed(2)} × ${Ct.toFixed(1)} × ${Mu.toFixed(2)}<br>
                    S₀ = ${S0_reduced.toFixed(2)} кПа
                </div>
            </div>
            ` : ''}
        </div>

        <div class="report-section">
            <h3>📚 Нормативные ссылки</h3>
            <p>• СП 20.13330.2016 "Нагрузки и воздействия" с Изменением №5</p>
            <p>• п.10.1 - Общая формула снеговой нагрузки</p>
            <p>• п.10.2, Таблица 10.1 - Нормативная снеговая нагрузка Sg</p>
            <p>• п.10.5-10.9 - Коэффициент воздействия ветра Ce</p>
            <p>• п.10.10 - Термический коэффициент Ct</p>
            <p>• п.10.4, Приложение Б - Коэффициент перехода μ</p>
            <p>• п.10.12 - Коэффициент надежности γf = 1,4</p>
            <p>• п.10.11 - Пониженная снеговая нагрузка для расчета деформаций</p>
        </div>
    `;
    
    report.style.display = 'block';
    stepsContainer.style.display = 'none';
    report.scrollIntoView({ behavior: 'smooth' });
}

// Вспомогательные функции
function saveAsPDF() {
    window.print();
}

function resetCalculator() {
    if (confirm('Вы уверены, что хотите начать новый расчет? Все введенные данные будут потеряны.')) {
        location.reload();
    }
}

// Экспорт функций
window.nextStep = nextStep;
window.prevStep = prevStep;
window.toggleSgMethod = toggleSgMethod;
window.showSpMethod = showSpMethod;
window.toggleCeMethod = toggleCeMethod;
window.toggleCtMethod = toggleCtMethod;
window.toggleMuMethod = toggleMuMethod;
window.updateRoofParameters = updateRoofParameters;
window.toggleMap = toggleMap;
window.updateMapSrc = updateMapSrc;
window.calculateFinal = calculateFinal;
window.saveAsPDF = saveAsPDF;
window.resetCalculator = resetCalculator;
