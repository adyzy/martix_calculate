document.addEventListener('DOMContentLoaded', () => {

    // --- Элементы управления ---
    const generateABtn = document.getElementById('generate-a-btn');
    const generateBBtn = document.getElementById('generate-b-btn');
    const executeBtn = document.getElementById('execute-btn');
    const operationSelect = document.getElementById('operation-select');
    const resultOutput = document.getElementById('result-output');
    const swapBtn = document.getElementById('swap-btn');

    // --- Элементы матриц ---
    const rowsA = document.getElementById('rows-a');
    const colsA = document.getElementById('cols-a');
    const gridA = document.getElementById('matrix-a-grid');

    const rowsB = document.getElementById('rows-b');
    const colsB = document.getElementById('cols-b');
    const gridB = document.getElementById('matrix-b-grid');

    // --- Слушатели для кнопок "Создать" ---
    generateABtn.addEventListener('click', () => {
        generateGrid(gridA, rowsA.value, colsA.value);
    });

    generateBBtn.addEventListener('click', () => {
        generateGrid(gridB, rowsB.value, colsB.value);
    });

    // --- Слушатель для кнопки "Смена" ---
    swapBtn.addEventListener('click', () => {
        const dimsA = { rows: rowsA.value, cols: colsA.value };
        const dimsB = { rows: rowsB.value, cols: colsB.value };
        
        const dataA = readGridValues(gridA, dimsA.rows, dimsA.cols);
        const dataB = readGridValues(gridB, dimsB.rows, dimsB.cols);

        rowsA.value = dimsB.rows;
        colsA.value = dimsB.cols;
        rowsB.value = dimsA.rows;
        colsB.value = dimsA.cols;

        generateGrid(gridA, rowsA.value, colsA.value);
        generateGrid(gridB, rowsB.value, colsB.value);

        populateGrid(gridA, dataB);
        populateGrid(gridB, dataA);
    });

    // --- Слушатель для кнопки "Выполнить" ---
    executeBtn.addEventListener('click', () => {
        try {
            const operation = operationSelect.value;
            if (!operation) {
                throw new Error('Пожалуйста, выберите операцию.');
            }

            const matrixA = getMatrixFromGrid(gridA, rowsA.value, colsA.value);
            const matrixB = getMatrixFromGrid(gridB, rowsB.value, colsB.value);

            let result;

            switch (operation) {
                case 'determinant':
                    result = math.det(matrixA);
                    break;
                case 'transpose':
                    result = math.transpose(matrixA);
                    break;
                case 'inverse':
                    result = math.inv(matrixA);
                    break;
                case 'add':
                    result = math.add(matrixA, matrixB);
                    break;
                case 'subtract':
                    result = math.subtract(matrixA, matrixB);
                    break;
                case 'multiply':
                    result = math.multiply(matrixA, matrixB);
                    break;
                case 'solve-sle':
                    result = math.lusolve(matrixA, matrixB);
                    break;
                default:
                    throw new Error('Неизвестная операция.');
            }

            // ★★★ ИЗМЕНЕНИЕ ЗДЕСЬ ★★★
            // Вместо math.format используем нашу новую функцию
            const formattedResult = formatMatrixForDisplay(result);
            resultOutput.textContent = formattedResult;
            resultOutput.classList.remove('error');

        } catch (error) {
            resultOutput.textContent = `Ошибка: ${error.message}`;
            resultOutput.classList.add('error');
        }
    });

    // --- Вспомогательные функции ---

    /**
     * Создает сетку из полей <input> для матрицы.
     */
    function generateGrid(gridContainer, rows, cols) {
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `[${i+1},${j+1}]`;
                gridContainer.appendChild(input);
            }
        }
    }

    /**
     * Считывает значения из сетки для ВЫЧИСЛЕНИЙ (преобразует в числа).
     */
    function getMatrixFromGrid(gridContainer, rows, cols) {
        const matrix = [];
        const inputs = gridContainer.querySelectorAll('input');
        if (inputs.length === 0) {
            throw new Error('Матрица не создана или пуста.');
        }
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                const input = inputs[i * cols + j];
                const value = parseFloat(input.value.replace(',', '.'));
                row.push(isNaN(value) ? 0 : value);
            }
            matrix.push(row);
        }
        return matrix;
    }

    /**
     * Считывает текстовые значения из сетки <input> (для смены).
     */
    function readGridValues(gridContainer, rows, cols) {
        const data = [];
        const inputs = gridContainer.querySelectorAll('input');
        if (inputs.length === 0) return [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                const inputIndex = i * Number(cols) + j;
                if (inputs[inputIndex]) {
                    row.push(inputs[inputIndex].value);
                } else {
                    row.push("");
                }
            }
            data.push(row);
        }
        return data;
    }

    /**
     * Заполняет существующую сетку <input> данными из 2D массива строк (для смены).
     */
    function populateGrid(gridContainer, data) {
        const inputs = gridContainer.querySelectorAll('input');
        if (inputs.length === 0) return;
        
        const currentGridRows = gridContainer.id === 'matrix-a-grid' ? rowsA.value : rowsB.value;
        const currentGridCols = gridContainer.id === 'matrix-a-grid' ? colsA.value : colsB.value;

        if (inputs.length !== currentGridRows * currentGridCols) {
            return;
        }

        for (let i = 0; i < currentGridRows; i++) {
            const dataRow = data[i] || [];
            for (let j = 0; j < currentGridCols; j++) {
                const inputIndex = i * currentGridCols + j;
                if (inputs[inputIndex]) {
                    inputs[inputIndex].value = dataRow[j] || "";
                }
            }
        }
    }

    // ★★★ НОВАЯ ФУНКЦИЯ ДЛЯ ФОРМАТИРОВАНИЯ ★★★
    /**
     * Преобразует результат вычисления (число или матрицу) в красивую строку
     * без скобок и с выравниванием.
     * @param {number | Matrix | Array} result - Результат из math.js
     * @returns {string} - Отформатированная строка для <pre>
     */
    function formatMatrixForDisplay(result) {
        let data;

        // 1. Проверяем, не объект ли это матрицы math.js
        if (math.isMatrix(result)) {
            data = result.toArray(); // Преобразуем в обычный массив
        } 
        // 2. Проверяем, не обычный ли это массив
        else if (Array.isArray(result)) {
            data = result;
        }
        // 3. Проверяем, не число ли это (например, определитель)
        else if (typeof result === 'number') {
            return math.round(result, 4).toString(); // Округляем и возвращаем
        }
        // 4. На всякий случай
        else {
            return result.toString();
        }

        // Теперь 'data' — это 2D-массив (например, [[1], [2]] или [[1, 2], [3, 4]])
        let output = '';
        
        if (Array.isArray(data)) {
            // Проходим по каждой строке
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                let rowString = '';
                
                // Проходим по каждому элементу в строке
                if (Array.isArray(row)) {
                    for (let j = 0; j < row.length; j++) {
                        // Округляем, превращаем в строку и добавляем отступ
                        // padEnd(10) заставит каждое число занять 10 символов
                        // (добавив пробелы), что выровнит столбцы.
                        rowString += String(math.round(row[j], 4)).padEnd(10, ' ');
                    }
                } else {
                    // Если это 1D-массив (маловероятно, но возможно)
                    rowString += String(math.round(row, 4)).padEnd(10, ' ');
                }
                
                output += rowString;
                
                // Добавляем перенос строки после каждой строки, кроме последней
                if (i < data.length - 1) {
                    output += '\n';
                }
            }
        }
        return output;
    }

    // --- Инициализация ---
    generateGrid(gridA, 3, 3);
    generateGrid(gridB, 3, 1);
});