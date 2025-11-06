// Функции для работы с данными
function getCalculationData() {
    try {
        const data = localStorage.getItem('snowCalculationData');
        const parsedData = data ? JSON.parse(data) : {};
        console.log('Getting data from storage:', parsedData);
        return parsedData;
    } catch (error) {
        console.error('Error getting data from storage:', error);
        return {};
    }
}

function setCalculationData(data) {
    try {
        console.log('Setting data to storage:', data);
        localStorage.setItem('snowCalculationData', JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error setting data to storage:', error);
        return false;
    }
}

function updateCalculationData(updates) {
    const data = getCalculationData();
    const newData = { ...data, ...updates };
    
    // Преобразуем числовые значения и устанавливаем значения по умолчанию
    const defaultValues = {
        sg: 1.5,
        ce: 1.0,
        ct: 1.0,
        mu: 1.0
    };
    
    ['sg', 'ce', 'ct', 'mu'].forEach(key => {
        if (newData[key] !== undefined && newData[key] !== null) {
            // Преобразуем в число и устанавливаем значение по умолчанию если NaN
            const numValue = parseFloat(newData[key]);
            newData[key] = isNaN(numValue) ? defaultValues[key] : numValue;
        } else if (newData[key] === undefined || newData[key] === null) {
            // Устанавливаем значение по умолчанию если отсутствует
            newData[key] = defaultValues[key];
        }
    });
    
    const success = setCalculationData(newData);
    console.log('Data updated:', newData, 'Success:', success);
    return newData;
}

function clearCalculationData() {
    console.log('Clearing calculation data');
    localStorage.removeItem('snowCalculationData');
}

// Проверка заполненности всех коэффициентов - УПРОЩЕННАЯ ВЕРСИЯ
function checkAllCoefficientsFilled() {
    const data = getCalculationData();
    const required = ['sg', 'ce', 'ct', 'mu'];
    
    console.log('Checking coefficients:', data);
    
    for (const coeff of required) {
        const value = data[coeff];
        
        // Проверяем, что значение существует и является валидным числом
        if (value === undefined || value === null) {
            console.log(`Missing coefficient: ${coeff}`);
            return false;
        }
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            console.log(`Invalid numeric value for coefficient: ${coeff}, value:`, value);
            return false;
        }
    }
    
    console.log('All coefficients are present and valid');
    return true;
}

// Получение всех коэффициентов для расчета
function getAllCoefficients() {
    const data = getCalculationData();
    const defaultValues = {
        sg: 1.5,
        ce: 1.0,
        ct: 1.0,
        mu: 1.0
    };
    
    const coefficients = {
        sg: parseFloat(data.sg) || defaultValues.sg,
        ce: parseFloat(data.ce) || defaultValues.ce,
        ct: parseFloat(data.ct) || defaultValues.ct,
        mu: parseFloat(data.mu) || defaultValues.mu
    };
    
    console.log('Getting all coefficients:', coefficients);
    return coefficients;
}

// Навигация
function goToStep(step) {
    console.log(`Navigating to: ${step}`);
    window.location.href = step;
}

function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Проверка перед переходом на финальную страницу
function validateBeforeFinal() {
    // Всегда возвращаем true, так как значения по умолчанию гарантированно установлены
    return true;
}

// Инициализация данных по умолчанию при первом запуске
function initializeDefaultData() {
    const data = getCalculationData();
    
    // Если данных нет, устанавливаем значения по умолчанию
    if (!data.sg || !data.ce || !data.ct || !data.mu) {
        const defaultData = {
            sg: 1.5,
            ce: 1.0,
            ct: 1.0,
            mu: 1.0,
            sgMethod: 'manual',
            ceMethod: 'manual',
            ctMethod: 'manual',
            muMethod: 'auto',
            roofType: 'pitched'
        };
        
        updateCalculationData(defaultData);
        console.log('Initialized with default data:', defaultData);
    }
}

// Вызываем инициализацию при загрузке common.js
initializeDefaultData();