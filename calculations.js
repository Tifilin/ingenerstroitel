// ===== КОНСТАНТЫ И СПРАВОЧНЫЕ ДАННЫЕ =====

// Коэффициент надежности по снеговой нагрузке (п.10.12)
//const GAMMA_F = 1.4;

// ===== РАСЧЕТ Ce ПО ИЗМЕНЕНИЮ №5 =====

/**
 * Расчет коэффициента воздействия ветра Ce по новым правилам Изменения №5
 */
function calculateCeNewRules(params) {
    const { 
        roofType, 
        angle, 
        dimensions, 
        terrainType, 
        isProtected, 
        januaryTemp, 
        windSpeed,
        buildingHeight 
    } = params;
    
    console.log('Calculating Ce with params:', params);
    
    // п.10.6: Если защищено от ветра - Ce = 1.0
    if (isProtected) {
        return { 
            ce: 1.0, 
            method: 'protected',
            details: { reason: 'Объект защищен от прямого воздействия ветра (п.10.6)' }
        };
    }
    
    // п.10.9а: Для районов с температурой января выше -5°C Ce = 1.0
    if (januaryTemp > -5) {
        return { 
            ce: 1.0, 
            method: 'warm_region',
            details: { reason: 'Район со средней температурой января выше -5°C (п.10.9а)' }
        };
    }
    
    // Проверяем условия п.10.7 для применения снижения Ce
    const canReduceCe = checkCeReductionConditions(roofType, angle, dimensions, terrainType, januaryTemp);
    
    if (!canReduceCe.applicable) {
        return { 
            ce: 1.0, 
            method: 'default',
            details: { reason: canReduceCe.reason }
        };
    }
    
    // Расчет по формуле 10.2
    const lc = calculateCharacteristicSize(dimensions);
    const kv = getKvCoefficient(terrainType, januaryTemp, windSpeed);
    const k = getKcoefficient(terrainType, buildingHeight);
    
    console.log('Ce calculation parameters:', { lc, kv, k });
    
    const ce = (kv - 0.4 * Math.sqrt(k)) * (0.8 + 0.002 * lc);
    
    // Ограничения согласно п.10.5
    const finalCe = Math.max(0.5, Math.min(1.0, ce));
    
    return { 
        ce: finalCe, 
        method: 'formula_10_2',
        details: { 
            lc: lc, 
            kv: kv, 
            k: k, 
            calculatedCe: ce,
            formula: `Ce = (${kv.toFixed(2)} - 0.4√${k.toFixed(2)}) × (0.8 + 0.002×${lc.toFixed(2)})`,
            conditions: canReduceCe.conditions
        }
    };
}

/**
 * Проверка условий для применения снижения Ce (п.10.7)
 */
function checkCeReductionConditions(roofType, angle, dimensions, terrainType, januaryTemp) {
    const b = Math.min(dimensions.width, dimensions.length);
    const L = Math.max(dimensions.width, dimensions.length);
    
    // п.10.7: Только для местности типов A и B
    if (terrainType === 'C') {
        return {
            applicable: false,
            reason: 'Снижение Ce не применяется для местности типа C (п.10.7)',
            conditions: { terrainType: 'C' }
        };
    }
    
    // Проверяем пологость покрытия
    let isGentlySloped = false;
    let slopeCondition = '';
    
    if (roofType === 'flat') {
        // Плоские покрытия: уклон ≤ 10°
        isGentlySloped = angle <= 10;
        slopeCondition = `Плоское покрытие: угол ${angle}° ≤ 10°`;
    } else if (roofType === 'single_slope' || roofType === 'pitched') {
        // Односкатные и двускатные: уклон ≤ 10°
        isGentlySloped = angle <= 10;
        slopeCondition = `${roofType === 'single_slope' ? 'Односкатное' : 'Двускатное'} покрытие: угол ${angle}° ≤ 10°`;
    } else if (roofType === 'arched') {
        // Сводчатые: f/l ≤ 0.05
        // В данном упрощенном расчете считаем arched как пологое при угле ≤ 10°
        isGentlySloped = angle <= 10;
        slopeCondition = `Сводчатое покрытие: угол ${angle}° соответствует f/l ≤ 0.05`;
    }
    
    if (!isGentlySloped) {
        return {
            applicable: false,
            reason: `Покрытие не является пологим (${slopeCondition})`,
            conditions: { slopeCondition, isGentlySloped: false }
        };
    }
    
    // Проверяем характерный размер
    const lc = calculateCharacteristicSize(dimensions);
    if (lc > 100) {
        return {
            applicable: false,
            reason: `Характеристический размер lc = ${lc.toFixed(2)} м > 100 м (п.10.7)`,
            conditions: { lc, maxLc: 100, slopeCondition }
        };
    }
    
    // Проверяем минимальный размер покрытия для разных уклонов
    let minB = 0;
    if (angle <= 10) {
        minB = 48; // Для уклонов до 10° - 48 м
    } else if (angle <= 20) {
        minB = 24; // Для уклонов 10°-20° - 24 м
    }
    
    if (b < minB) {
        return {
            applicable: false,
            reason: `Наименьший размер покрытия b = ${b} м < ${minB} м для угла ${angle}°`,
            conditions: { b, minB, slopeCondition }
        };
    }
    
    return {
        applicable: true,
        reason: 'Условия п.10.7 выполнены',
        conditions: { 
            slopeCondition, 
            lc, 
            b, 
            L,
            terrainType,
            isGentlySloped: true
        }
    };
}

/**
 * Расчет характеристического размера lc (п.10.7)
 */
function calculateCharacteristicSize(dimensions) {
    const b = Math.min(dimensions.width, dimensions.length);
    const L = Math.max(dimensions.width, dimensions.length);
    
    const lc = 2 * b - (b * b) / L;
    return Math.min(lc, 100); // Ограничение по п.10.7
}

/**
 * Получение коэффициента kv из таблицы 10.2
 */
function getKvCoefficient(terrainType, januaryTemp, windSpeed) {
    // Определяем температурную категорию согласно таблице 10.2
    let tempCategory;
    if (januaryTemp >= -15 && januaryTemp < -5) {
        tempCategory = 'temp1'; // -15 ≤ T < -5
    } else if (januaryTemp >= -25 && januaryTemp < -15) {
        tempCategory = 'temp2'; // -25 ≤ T < -15
    } else if (januaryTemp < -25) {
        tempCategory = 'temp3'; // T < -25
    } else {
        // Для температур выше -5°C kv не применяется (п.10.9а)
        return 1.0;
    }
    
    // Определяем категорию скорости ветра
    let windCategory;
    if (windSpeed > 3 && windSpeed <= 4) {
        windCategory = 'wind1'; // 3 < v ≤ 4
    } else if (windSpeed > 4 && windSpeed <= 6) {
        windCategory = 'wind2'; // 4 < v ≤ 6
    } else if (windSpeed > 6) {
        windCategory = 'wind3'; // v > 6
    } else {
        windCategory = 'wind1'; // По умолчанию для v ≤ 4
    }
    
    // Таблица 10.2 СП 20.13330.2016 с Изменением №5
    const kvTable = {
        'temp1': { // -15 ≤ T < -5
            'wind1': { 'A': 1.4, 'B': 1.4 },
            'wind2': { 'A': 1.3, 'B': 1.4 },
            'wind3': { 'A': 1.3, 'B': 1.3 }
        },
        'temp2': { // -25 ≤ T < -15
            'wind1': { 'A': 1.4, 'B': 1.4 },
            'wind2': { 'A': 1.3, 'B': 1.4 },
            'wind3': { 'A': 1.2, 'B': 1.3 }
        },
        'temp3': { // T < -25
            'wind1': { 'A': 1.3, 'B': 1.4 },
            'wind2': { 'A': 1.2, 'B': 1.3 },
            'wind3': { 'A': 1.2, 'B': 1.2 }
        }
    };
    
    const kv = kvTable[tempCategory]?.[windCategory]?.[terrainType];
    return kv || 1.0;
}

/**
 * Получение коэффициента k из таблицы 11.2
 */
function getKcoefficient(terrainType, buildingHeight) {
    // Таблица 11.2 СП 20.13330.2016
    const kTable = [
        { height: 5, A: 0.75, B: 0.5, C: 0.4 },
        { height: 10, A: 1.0, B: 0.65, C: 0.4 },
        { height: 20, A: 1.25, B: 0.85, C: 0.55 },
        { height: 40, A: 1.5, B: 1.1, C: 0.8 },
        { height: 60, A: 1.7, B: 1.3, C: 1.0 },
        { height: 80, A: 1.85, B: 1.45, C: 1.15 },
        { height: 100, A: 2.0, B: 1.6, C: 1.25 },
        { height: 150, A: 2.25, B: 1.9, C: 1.55 },
        { height: 200, A: 2.45, B: 2.1, C: 1.8 },
        { height: 250, A: 2.65, B: 2.3, C: 2.0 },
        { height: 300, A: 2.75, B: 2.5, C: 2.2 }
    ];
    
    // Если высота меньше или равна минимальной
    if (buildingHeight <= kTable[0].height) {
        return kTable[0][terrainType];
    }
    
    // Если высота больше или равна максимальной
    if (buildingHeight >= kTable[kTable.length - 1].height) {
        return kTable[kTable.length - 1][terrainType];
    }
    
    // Линейная интерполяция между ближайшими значениями
    for (let i = 0; i < kTable.length - 1; i++) {
        const current = kTable[i];
        const next = kTable[i + 1];
        
        if (buildingHeight >= current.height && buildingHeight <= next.height) {
            const ratio = (buildingHeight - current.height) / (next.height - current.height);
            const kCurrent = current[terrainType];
            const kNext = next[terrainType];
            return kCurrent + (kNext - kCurrent) * ratio;
        }
    }
    
    return 1.0; // Значение по умолчанию
}

// ===== РАСЧЕТ μ ПО ПРИЛОЖЕНИЮ Б =====

/**
 * Расчет коэффициента перехода μ для различных типов покрытий
 */
function calculateMuForRoofType(roofType, angle, additionalParams = {}) {
    let result = {
        mu: 1.0,
        roofTypeName: getRoofTypeName(roofType),
        angle: angle,
        calculation: ''
    };
    
    switch(roofType) {
        case 'flat':
            result.mu = 1.0;
            result.calculation = 'Б.1: для плоских покрытий (уклон ≤ 2.5%) μ = 1.0';
            break;
            
        case 'single_slope':
            result.mu = calculateMuForSingleSlope(angle);
            result.calculation = getSingleSlopeCalculation(angle, result.mu);
            break;
            
        case 'pitched':
            const schemes = calculateMuSchemesForPitched(angle);
            result.mu = getMaxMuFromSchemes(schemes);
            result.schemes = schemes;
            result.calculation = 'Б.1: максимальное значение из всех схем распределения';
            break;
            
        case 'arched':
            result.mu = calculateMuForArched(angle, additionalParams.archRatio);
            result.calculation = getArchedCalculation(angle, additionalParams.archRatio, result.mu);
            break;
            
        case 'lancet_arches':
            result.mu = calculateMuForLancetArches(angle);
            result.calculation = getLancetArchesCalculation(angle, result.mu);
            break;
            
        default:
            result.mu = 1.0;
            result.calculation = 'Принято по умолчанию μ = 1.0';
    }
    
    return result;
}

/**
 * Расчет μ для односкатных покрытий (Б.1 схема 3)
 */
function calculateMuForSingleSlope(angle) {
    if (angle <= 30) {
        return 1.0;
    } else if (angle < 60) {
        // Линейная интерполяция между 30° и 60°
        return (60 - angle) / 30;
    } else {
        return 0;
    }
}

function getSingleSlopeCalculation(angle, mu) {
    if (angle <= 30) {
        return `Б.1 схема 3: при α ≤ 30° μ = 1.0`;
    } else if (angle < 60) {
        return `Б.1 схема 3: μ = (60 - ${angle})/30 = ${mu.toFixed(2)} (линейная интерполяция)`;
    } else {
        return `Б.1 схема 3: при α ≥ 60° μ = 0`;
    }
}

/**
 * Расчет μ для двускатных покрытий (Б.1 - все три схемы)
 */
function calculateMuSchemesForPitched(angle) {
    const schemes = {};
    
    // Схема 1 - равномерное распределение (Б.1 схема 1)
    if (angle <= 30) {
        schemes.scheme1 = { 
            name: "Схема 1 - Равномерное распределение",
            zones: {
                'zone1': { mu: 1.0, description: "μ₁ = 1,0 (α ≤ 30°)" },
                'zone2': { mu: 1.0, description: "μ₂ = 1,0 (α ≤ 30°)" }
            }
        };
    } else if (angle < 60) {
        // Линейная интерполяция между 30° и 60°
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
                'zone1': { mu: 0, description: "μ₁ = 0 (α ≥ 60°)" },
                'zone2': { mu: 0, description: "μ₂ = 0 (α ≥ 60°)" }
            }
        };
    }
    
    // Схема 2 - неравномерное распределение (Б.1 схема 2)
    // Применяется только при 15° ≤ α ≤ 40°
    if (angle < 15) {
        schemes.scheme2 = {
            name: "Схема 2 - Неравномерное распределение (не применяется)",
            zones: {
                'zone1': { mu: 0, description: "Схема не применяется при α < 15°" },
                'zone2': { mu: 0, description: "Схема не применяется при α < 15°" }
            }
        };
    } else if (angle <= 40) {
        // μ1 = 0.5, μ2 = 1.4 (по схеме 2)
        schemes.scheme2 = {
            name: "Схема 2 - Неравномерное распределение",
            zones: {
                'zone1': { mu: 0.5, description: "μ₁ = 0,5" },
                'zone2': { mu: 1.4, description: "μ₂ = 1,4" }
            }
        };
    } else {
        schemes.scheme2 = {
            name: "Схема 2 - Неравномерное распределение (не применяется)",
            zones: {
                'zone1': { mu: 0, description: "Схема не применяется при α > 40°" },
                'zone2': { mu: 0, description: "Схема не применяется при α > 40°" }
            }
        };
    }
    
    // Схема 3 - образование снегового мешка (Б.1 схема 3)
    // Применяется только при 10° ≤ α ≤ 30° и только при наличии устройств
    if (angle >= 10 && angle <= 30) {
        schemes.scheme3 = {
            name: "Схема 3 - Образование снегового мешка",
            zones: {
                'zone1': { mu: 0.75, description: "μ₁ = 0,75" },
                'zone2': { mu: 1.25, description: "μ₂ = 1,25" },
                'zone3': { mu: 1.0, description: "μ₃ = 1,0" },
                'zone4': { mu: 1.0, description: "μ₄ = 1,0" }
            },
            note: "Применяется только при наличии ходовых мостиков или светоаэрационных устройств по коньку покрытия"
        };
    } else {
        schemes.scheme3 = {
            name: "Схема 3 - Образование снегового мешка",
            zones: {
                'zone1': { mu: 0, description: "Схема применяется только при 10° ≤ α ≤ 30°" },
                'zone2': { mu: 0, description: "и наличии устройств по коньку" }
            }
        };
    }
    
    return schemes;
}

/**
 * Расчет μ для сводчатых покрытий (Б.2)
 */
function calculateMuForArched(angle, archRatio = 0.1) {
    // Упрощенный расчет по аналогии с односкатными покрытиями
    if (angle <= 30) {
        return 1.0;
    } else if (angle < 60) {
        return (60 - angle) / 30;
    } else {
        return 0;
    }
}

function getArchedCalculation(angle, archRatio, mu) {
    return `Б.2: для сводчатых покрытий при α = ${angle}° μ = ${mu.toFixed(2)} (упрощенный расчет)`;
}

/**
 * Расчет μ для стрельчатых арок (Б.2)
 */
function calculateMuForLancetArches(beta) {
    if (beta >= 15) {
        // Используем схему Б.1
        return calculateMuForSingleSlope(beta);
    } else {
        // Используем схему Б.2
        return calculateMuForArched(beta);
    }
}

function getLancetArchesCalculation(beta, mu) {
    if (beta >= 15) {
        return `Б.2: для стрельчатых арок при β = ${beta}° ≥ 15° используется схема Б.1, μ = ${mu.toFixed(2)}`;
    } else {
        return `Б.2: для стрельчатых арок при β = ${beta}° < 15° используется схема Б.2, μ = ${mu.toFixed(2)}`;
    }
}

/**
 * Расчет μ для продольных фонарей закрытых (Б.3)
 */
function calculateMuForClosedLanterns(angle, h, b, L) {
    const schemes = {};
    const ratio = h / b;
    
    // Схема для закрытых фонарей
    schemes.scheme1 = {
        name: "Схема для закрытых фонарей",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Основная",
                description: "μ₁ = 1,0 - основная зона покрытия" 
            },
            'zone2': { 
                mu: Math.min(1.0 + ratio, 1.4), 
                label: "У фонаря",
                description: `μ₂ = 1,0 + h/b = 1,0 + ${ratio.toFixed(2)} = ${(1.0 + ratio).toFixed(2)}` 
            },
            'zone3': { 
                mu: 1.4, 
                label: "Снег.мешок",
                description: "μ₃ = 1,4 - зона снегового мешка" 
            }
        }
    };
    
    return schemes;
}

/**
 * Расчет μ для продольных фонарей открытых (Б.3)
 */
function calculateMuForOpenLanterns(angle, h, b, L) {
    const schemes = {};
    const ratio = h / b;
    
    // Схема для открытых фонарей
    schemes.scheme1 = {
        name: "Схема для открытых фонарей",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Основная",
                description: "μ₁ = 1,0 - основная зона покрытия" 
            },
            'zone2': { 
                mu: Math.min(1.0 + 2 * ratio, 2.0), 
                label: "У фонаря",
                description: `μ₂ = 1,0 + 2h/b = 1,0 + 2×${ratio.toFixed(2)} = ${(1.0 + 2 * ratio).toFixed(2)}` 
            },
            'zone3': { 
                mu: 2.0, 
                label: "Снег.мешок",
                description: "μ₃ = 2,0 - зона снегового мешка в открытом фонаре" 
            }
        }
    };
    
    return schemes;
}

/**
 * Расчет μ для зенитных фонарей (Б.3)
 */
function calculateMuForSkylights(angle, h, a, spacing) {
    const ratio = h / a;
    
    if (ratio <= 0.5) {
        return 1.4;
    } else if (ratio <= 1.0) {
        // Линейная интерполяция между 1.4 и 2.0
        return 1.4 + (ratio - 0.5) * 1.2;
    } else {
        return 2.0;
    }
}

/**
 * Расчет μ для шедовых покрытий (Б.4)
 */
function calculateMuForShed(angle, h, b, spans) {
    const schemes = {};
    const ratio = h / b;
    
    schemes.scheme1 = {
        name: "Схема для шедовых покрытий",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Верх",
                description: "μ₁ = 1,0 - верхние зоны" 
            },
            'zone2': { 
                mu: Math.min(1.0 + ratio, 1.4), 
                label: "Низ",
                description: `μ₂ = 1,0 + h/b = 1,0 + ${ratio.toFixed(2)} = ${(1.0 + ratio).toFixed(2)}` 
            },
            'zone3': { 
                mu: 1.4, 
                label: "Углы",
                description: "μ₃ = 1,4 - угловые зоны" 
            }
        },
        note: `Для ${spans}-пролетного шедового покрытия`
    };
    
    return schemes;
}

/**
 * Расчет μ для многопролетных зданий с двускатными покрытиями (Б.5)
 */
function calculateMuForMultiSpanPitched(angle, spans, L, H) {
    const schemes = {};
    
    let maxMu = 1.0;
    if (spans === 2) {
        maxMu = 1.4;
    } else if (spans >= 3) {
        maxMu = 1.6;
    }
    
    schemes.scheme1 = {
        name: "Схема для многопролетных зданий",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Край",
                description: "μ₁ = 1,0 - крайние пролеты" 
            },
            'zone2': { 
                mu: maxMu, 
                label: "Средние",
                description: `μ₂ = ${maxMu.toFixed(1)} - средние пролеты` 
            },
            'zone3': { 
                mu: 1.0, 
                label: "Коньки",
                description: "μ₃ = 1,0 - зоны коньков" 
            }
        },
        note: `Для ${spans}-пролетного здания с шириной пролета ${L} м`
    };
    
    return schemes;
}

/**
 * Расчет μ для многопролетных сводчатых покрытий (Б.6)
 */
function calculateMuForMultiSpanArched(angle, spans, ratio, span) {
    const schemes = {};
    
    let maxMu = 1.0;
    if (spans === 2) {
        maxMu = 1.4;
    } else if (spans >= 3) {
        maxMu = 1.6;
    }
    
    // Корректировка в зависимости от отношения f/l
    if (ratio > 0.15) {
        maxMu = Math.min(maxMu + 0.2, 2.0);
    }
    
    schemes.scheme1 = {
        name: "Схема для многопролетных сводчатых покрытий",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Край",
                description: "μ₁ = 1,0 - крайние зоны" 
            },
            'zone2': { 
                mu: maxMu, 
                label: "Средние",
                description: `μ₂ = ${maxMu.toFixed(1)} - средние пролеты` 
            },
            'zone3': { 
                mu: 1.0, 
                label: "Коньки",
                description: "μ₃ = 1,0 - зоны коньков" 
            }
        },
        note: `Для ${spans}-пролетного сводчатого покрытия с f/l = ${ratio.toFixed(2)}`
    };
    
    return schemes;
}

/**
 * Расчет μ для многопролетных зданий с фонарями (Б.7)
 */
function calculateMuForMultiSpanLantern(roofType, angle, spans, h, lanternType) {
    const schemes = {};
    
    let baseMu = 1.0;
    if (spans === 2) {
        baseMu = 1.4;
    } else if (spans >= 3) {
        baseMu = 1.6;
    }
    
    // Корректировка для фонарей
    let lanternFactor = 1.0;
    if (lanternType === 'closed') {
        lanternFactor = 1.2;
    } else if (lanternType === 'open') {
        lanternFactor = 1.5;
    }
    
    const maxMu = Math.min(baseMu * lanternFactor, 2.0);
    
    schemes.scheme1 = {
        name: "Схема для многопролетных зданий с фонарями",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Основная",
                description: "μ₁ = 1,0 - основные зоны покрытия" 
            },
            'zone2': { 
                mu: maxMu, 
                label: "У фонарей",
                description: `μ₂ = ${maxMu.toFixed(1)} - зоны у фонарей` 
            },
            'zone3': { 
                mu: 1.0, 
                label: "Края",
                description: "μ₃ = 1,0 - краевые зоны" 
            }
        },
        note: `Для ${spans}-пролетного ${roofType === 'pitched' ? 'двускатного' : 'сводчатого'} покрытия с ${lanternType === 'closed' ? 'закрытыми' : 'открытыми'} фонарями`
    };
    
    return schemes;
}

/**
 * Расчет μ для перепада высоты (Б.8)
 */
function calculateMuForHeightDifference(h, l, alpha1, alpha2) {
    const schemes = {};
    const ratio = h / l;
    
    let snowDriftMu = 1.0;
    if (ratio <= 0.5) {
        snowDriftMu = 1.0 + ratio * 2;
    } else {
        snowDriftMu = 2.0;
    }
    
    schemes.scheme1 = {
        name: "Схема для перепада высоты",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Верх",
                description: "μ₁ = 1,0 - верхнее покрытие" 
            },
            'zone2': { 
                mu: snowDriftMu, 
                label: "Снег.мешок",
                description: `μ₂ = ${snowDriftMu.toFixed(1)} - зона снегового мешка` 
            },
            'zone3': { 
                mu: 1.0, 
                label: "Низ",
                description: "μ₃ = 1,0 - нижнее покрытие" 
            }
        },
        note: `Перепад высоты ${h} м, длина зоны снегоотложения ${l} м`
    };
    
    return schemes;
}

/**
 * Расчет μ для двух перепадов высоты (Б.9)
 */
function calculateMuForDoubleHeightDifference(h1, h2, L, l) {
    const schemes = {};
    
    // Расчет для первого перепада
    const ratio1 = h1 / l;
    let mu1 = 1.0;
    if (ratio1 <= 0.5) {
        mu1 = 1.0 + ratio1 * 2;
    } else {
        mu1 = 2.0;
    }
    
    // Расчет для второго перепада
    const ratio2 = h2 / l;
    let mu2 = 1.0;
    if (ratio2 <= 0.5) {
        mu2 = 1.0 + ratio2 * 2;
    } else {
        mu2 = 2.0;
    }
    
    // Учет взаимодействия между перепадами
    let interactionFactor = 1.0;
    if (L < 2 * l) {
        // Перепады расположены близко - усиление эффекта
        interactionFactor = 1.2;
    }
    
    const maxMu = Math.min(Math.max(mu1, mu2) * interactionFactor, 2.4);
    
    schemes.scheme1 = {
        name: "Схема для двух перепадов высоты",
        zones: {
            'zone1': { 
                mu: 1.0, 
                label: "Верх",
                description: "μ₁ = 1,0 - верхние покрытия" 
            },
            'zone2': { 
                mu: mu1, 
                label: "Перепад 1",
                description: `μ₂ = ${mu1.toFixed(1)} - зона первого перепада` 
            },
            'zone3': { 
                mu: mu2, 
                label: "Перепад 2",
                description: `μ₃ = ${mu2.toFixed(1)} - зона второго перепада` 
            },
            'zone4': { 
                mu: maxMu, 
                label: "Между",
                description: `μ₄ = ${maxMu.toFixed(1)} - зона между перепадами` 
            }
        },
        note: `Расстояние между перепадами ${L} м, длина зоны снегоотложения ${l} м`
    };
    
    return schemes;
}

/**
 * Расчет μ для висячих покрытий цилиндрической формы (Б.10)
 */
function calculateMuForCylindricalHanging(f, L, B) {
    const ratio = f / L;
    
    if (ratio <= 0.125) { // 1/8 = 0.125
        return 1.0;
    } else {
        // Для f/L > 1/8 требуется специальный расчет
        // Упрощенная формула для примерной оценки
        return Math.min(1.0 + (ratio - 0.125) * 4, 1.5);
    }
}

/**
 * Расчет μ для купольных круговых покрытий (Б.11)
 */
function calculateMuForDomeCircular(diameter, height) {
    const ratio = height / diameter;
    
    if (ratio <= 0.1) {
        return 1.0;
    } else if (ratio <= 0.2) {
        return 0.8 + ratio * 2;
    } else {
        return 1.2;
    }
}

/**
 * Расчет μ для конических круговых покрытий (Б.12)
 */
function calculateMuForConicalCircular(diameter, height, angle) {
    if (angle <= 30) {
        return 1.0;
    } else if (angle < 60) {
        return (60 - angle) / 30;
    } else {
        return 0;
    }
}

/**
 * Расчет μ для покрытий с парапетами (Б.13)
 */
function calculateMuForParapets(parapetHeight, roofWidth) {
    const ratio = parapetHeight / roofWidth;
    
    if (ratio <= 0.02) {
        return 1.0;
    } else if (ratio <= 0.1) {
        return 1.0 + (ratio - 0.02) * 6.25;
    } else {
        return 1.5;
    }
}

/**
 * Расчет μ для покрытий с надстройками (Б.14)
 */
function calculateMuForVentilationShafts(shaftHeight, shaftWidth, distance) {
    const ratio = shaftHeight / shaftWidth;
    
    if (ratio <= 1) {
        return 1.4;
    } else if (ratio <= 2) {
        return 1.4 + (ratio - 1) * 0.3;
    } else {
        return 1.7;
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

/**
 * Получение названия типа покрытия
 */
function getRoofTypeName(roofType) {
    const names = {
        'flat': 'Плоское покрытие',
        'single_slope': 'Односкатное покрытие',
        'pitched': 'Двускатное покрытие',
        'arched': 'Сводчатое покрытие',
        'lancet_arches': 'Стрельчатые арки',
        'shed': 'Шедовое покрытие',
        'multi_span': 'Многопролетное здание',
        'height_difference': 'Перепад высоты',
        'double_height_difference': 'Два перепада высоты',
        'cylindrical_hanging': 'Висячее цилиндрическое покрытие',
        'dome_circular': 'Купольное круговое покрытие',
        'conical_circular': 'Коническое круговое покрытие',
        'parapets': 'Покрытие с парапетами',
        'ventilation_shafts': 'Покрытие с надстройками'
    };
    return names[roofType] || roofType;
}

/**
 * Поиск максимального коэффициента μ из всех схем
 */
function getMaxMuFromSchemes(schemes) {
    let maxMu = 0;
    Object.values(schemes).forEach(scheme => {
        Object.values(scheme.zones).forEach(zone => {
            if (zone.mu > maxMu) maxMu = zone.mu;
        });
    });
    return maxMu;
}

/**
 * Расчет горизонтальной нагрузки от сползания снега (п.10.13)
 */
function calculateHorizontalSnowLoad(s0, slopeAngle, frictionCoefficient, slipLength) {
    const kx = 0.9; // п.10.13: коэффициент, учитывающий таяние снега
    
    // Перевод угла в радианы
    const alphaRad = slopeAngle * Math.PI / 180;
    
    const sinAlpha = Math.sin(alphaRad);
    const cosAlpha = Math.cos(alphaRad);
    const bracketValue = sinAlpha - frictionCoefficient * cosAlpha;
    
    // Если значение в скобках отрицательное, нагрузка не возникает
    if (bracketValue <= 0) {
        return 0;
    }

    return kx * s0 * bracketValue * slipLength;
}

/**
 * Расчет пониженной снеговой нагрузки для деформаций (п.10.11)
 */
function calculateReducedSnowLoad(s0, januaryTemp) {
    if (januaryTemp <= -5) {
        // Для холодных регионов - пониженная нагрузка 0.5 * S0
        return 0.5 * s0;
    } else {
        // Для теплых регионов пониженная нагрузка не учитывается
        return null;
    }
}

// ===== ЭКСПОРТ ФУНКЦИЙ ДЛЯ ИСПОЛЬЗОВАНИЯ В HTML =====

// Функции для расчета Ce
window.calculateCeNewRules = calculateCeNewRules;
window.checkCeReductionConditions = checkCeReductionConditions;
window.calculateCharacteristicSize = calculateCharacteristicSize;
window.getKvCoefficient = getKvCoefficient;
window.getKcoefficient = getKcoefficient;

// Функции для расчета μ
window.calculateMuForRoofType = calculateMuForRoofType;
window.calculateMuForSingleSlope = calculateMuForSingleSlope;
window.calculateMuSchemesForPitched = calculateMuSchemesForPitched;
window.calculateMuForArched = calculateMuForArched;
window.calculateMuForLancetArches = calculateMuForLancetArches;
window.calculateMuForClosedLanterns = calculateMuForClosedLanterns;
window.calculateMuForOpenLanterns = calculateMuForOpenLanterns;
window.calculateMuForSkylights = calculateMuForSkylights;
window.calculateMuForShed = calculateMuForShed;
window.calculateMuForMultiSpanPitched = calculateMuForMultiSpanPitched;
window.calculateMuForMultiSpanArched = calculateMuForMultiSpanArched;
window.calculateMuForMultiSpanLantern = calculateMuForMultiSpanLantern;
window.calculateMuForHeightDifference = calculateMuForHeightDifference;
window.calculateMuForDoubleHeightDifference = calculateMuForDoubleHeightDifference;
window.calculateMuForCylindricalHanging = calculateMuForCylindricalHanging;
window.calculateMuForDomeCircular = calculateMuForDomeCircular;
window.calculateMuForConicalCircular = calculateMuForConicalCircular;
window.calculateMuForParapets = calculateMuForParapets;
window.calculateMuForVentilationShafts = calculateMuForVentilationShafts;

// Вспомогательные функции
window.getRoofTypeName = getRoofTypeName;
window.getMaxMuFromSchemes = getMaxMuFromSchemes;
window.calculateHorizontalSnowLoad = calculateHorizontalSnowLoad;
window.calculateReducedSnowLoad = calculateReducedSnowLoad;

// Константы
window.GAMMA_F = GAMMA_F;

console.log('Calculations.js loaded successfully');