const reportForm = document.getElementById('reportForm');
const reportTypeSelect = document.getElementById('reportType');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const filterSelect = document.getElementById('filter');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');

// Расширенные данные для тестирования
const sampleAppointments = [
  { ID_Appointment: 1, Date: '2025-05-01', vet: '1', petName: 'Барсик' },
  { ID_Appointment: 2, Date: '2025-05-01', vet: '1', petName: 'Мурзик' },
  { ID_Appointment: 3, Date: '2025-05-02', vet: '1', petName: 'Рекс' },
  { ID_Appointment: 4, Date: '2025-04-15', vet: '2', petName: 'Шарик' },
  { ID_Appointment: 5, Date: '2025-04-01', vet: '1', petName: 'Тузик' },
  { ID_Appointment: 6, Date: '2025-05-14', vet: '1', petName: 'Луна' },
  { ID_Appointment: 7, Date: '2025-05-14', vet: '2', petName: 'Солнце' },
  { ID_Appointment: 8, Date: '2025-05-13', vet: '1', petName: 'Звезда' },
  { ID_Appointment: 9, Date: '2025-05-03', vet: '2', petName: 'Макс' },
  { ID_Appointment: 10, Date: '2025-05-03', vet: '1', petName: 'Белка' },
  { ID_Appointment: 11, Date: '2025-04-20', vet: '2', petName: 'Стрелка' },
  { ID_Appointment: 12, Date: '2025-04-25', vet: '1', petName: 'Пушок' },
  { ID_Appointment: 13, Date: '2025-05-10', vet: '1', petName: 'Кекс' },
  { ID_Appointment: 14, Date: '2025-05-10', vet: '2', petName: 'Боня' },
  { ID_Appointment: 15, Date: '2025-05-11', vet: '1', petName: 'Лео' },
  { ID_Appointment: 16, Date: '2025-03-15', vet: '2', petName: 'Гера' },
  { ID_Appointment: 17, Date: '2025-03-20', vet: '1', petName: 'Мия' },
  { ID_Appointment: 18, Date: '2025-05-05', vet: '1', petName: 'Том' },
  { ID_Appointment: 19, Date: '2025-05-06', vet: '2', petName: 'Джерри' },
  { ID_Appointment: 20, Date: '2025-05-07', vet: '1', petName: 'Ника' }
];

const sampleServices = [
  { ID_Service: 1, ID_Appointment: 1, name: 'Вакцинация', Cost: 1000 },
  { ID_Service: 2, ID_Appointment: 2, name: 'Диагностика', Cost: 1500 },
  { ID_Service: 3, ID_Appointment: 3, name: 'УЗИ', Cost: 1500 },
  { ID_Service: 4, ID_Appointment: 4, name: 'Чистка зубов', Cost: 1200 },
  { ID_Service: 5, ID_Appointment: 5, name: 'Консультация', Cost: 800 },
  { ID_Service: 6, ID_Appointment: 6, name: 'Консультация', Cost: 1200 },
  { ID_Service: 7, ID_Appointment: 7, name: 'Вакцинация', Cost: 1000 },
  { ID_Service: 8, ID_Appointment: 8, name: 'Диагностика', Cost: 1500 },
  { ID_Service: 9, ID_Appointment: 9, name: 'УЗИ', Cost: 1500 },
  { ID_Service: 10, ID_Appointment: 10, name: 'Вакцинация', Cost: 1000 },
  { ID_Service: 11, ID_Appointment: 11, name: 'Чистка зубов', Cost: 1200 },
  { ID_Service: 12, ID_Appointment: 12, name: 'Консультация', Cost: 800 },
  { ID_Service: 13, ID_Appointment: 13, name: 'Диагностика', Cost: 1500 },
  { ID_Service: 14, ID_Appointment: 14, name: 'Вакцинация', Cost: 1000 },
  { ID_Service: 15, ID_Appointment: 15, name: 'УЗИ', Cost: 1500 },
  { ID_Service: 16, ID_Appointment: 16, name: 'Чистка зубов', Cost: 1200 },
  { ID_Service: 17, ID_Appointment: 17, name: 'Консультация', Cost: 800 },
  { ID_Service: 18, ID_Appointment: 18, name: 'Вакцинация', Cost: 1000 },
  { ID_Service: 19, ID_Appointment: 19, name: 'Диагностика', Cost: 1500 },
  { ID_Service: 20, ID_Appointment: 20, name: 'УЗИ', Cost: 1500 }
];

// Инициализация данных в localStorage
localStorage.setItem('reportRecordsSync', JSON.stringify(sampleAppointments));
localStorage.setItem('services', JSON.stringify(sampleServices));

// Логирование ошибок
const logError = (message) => {
  const errors = JSON.parse(localStorage.getItem('reportErrors') || '[]');
  errors.push({ timestamp: new Date().toISOString(), message });
  localStorage.setItem('reportErrors', JSON.stringify(errors));
  console.error(message);
};

// Форматирование даты в ДД.ММ.ГГГГ
const formatDate = (value) => {
  const digits = value.replace(/\D/g, ''); // Удаляем все не-цифры
  let formatted = '';

  if (digits.length > 0) {
    formatted = digits.slice(0, 2);
  }
  if (digits.length >= 3) {
    formatted += '.' + digits.slice(2, 4);
  }
  if (digits.length >= 5) {
    formatted += '.' + digits.slice(4, 8);
  }

  return formatted;
};

// Обработчики ввода для дат
[startDateInput, endDateInput].forEach(input => {
  input.addEventListener('input', (e) => {
    const cursorPosition = e.target.selectionStart;
    const oldValue = e.target.value;
    const formatted = formatDate(e.target.value);
    e.target.value = formatted;

    // Корректировка позиции курсора
    const diff = formatted.length - oldValue.length;
    const newCursorPosition = cursorPosition + diff;
    e.target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
});

// Обновление фильтров
const updateFilters = () => {
  const reportType = reportTypeSelect.value;
  filterSelect.innerHTML = '<option value="">Выберите фильтр</option>';

  if (reportType === 'visits') {
    const vets = ['Иванов И.И.', 'Петров П.П.'];
    vets.forEach((vet, index) => {
      const option = document.createElement('option');
      option.value = (index + 1).toString();
      option.textContent = vet;
      filterSelect.appendChild(option);
    });
  } else if (reportType === 'revenue') {
    const services = ['Вакцинация', 'Диагностика', 'УЗИ', 'Чистка зубов', 'Консультация'];
    services.forEach((service, index) => {
      const option = document.createElement('option');
      option.value = service; // Используем название услуги как значение
      option.textContent = service;
      filterSelect.appendChild(option);
    });
  }
};

// Получение данных за период
const getDataForPeriod = (data, startDateStr, endDateStr, key) => {
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
    return [];
  }

  const [startDay, startMonth, startYear] = startDateStr.split('.').map(Number);
  const [endDay, endMonth, endYear] = endDateStr.split('.').map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  endDate.setDate(endDate.getDate() + 1);

  return data.filter(item => {
    const itemDate = new Date(item[key]);
    return itemDate >= startDate && itemDate < endDate;
  });
};

// Генерация отчета
const generateReport = (type, startDate, endDate, filter) => {
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  let data = [];
  let summary = 0; // Для подсчета итогов

  if (type === 'visits') {
    const appointments = JSON.parse(localStorage.getItem('reportRecordsSync') || '[]');
    data = getDataForPeriod(appointments, startDate, endDate, 'Date');
    if (filter) {
      data = data.filter(item => item.vet === filter);
    }
    const groupedData = data.reduce((acc, item) => {
      const key = `${item.Date}_${item.vet}`;
      if (!acc[key]) {
        acc[key] = { date: item.Date, vet: item.vet === '1' ? 'Иванов И.И.' : 'Петров П.П.', visits: 0 };
      }
      acc[key].visits += 1;
      return acc;
    }, {});

    const groupedArray = Object.values(groupedData);
    summary = groupedArray.reduce((sum, item) => sum + item.visits, 0); // Общее количество посещений

    tableHead.innerHTML = '<tr><th>Дата</th><th>Врач</th><th>Посещений</th></tr>';
    groupedArray.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.date}</td><td>${item.vet}</td><td>${item.visits}</td>`;
      tableBody.appendChild(row);
    });

    // Добавляем строку с итогом
    const summaryRow = document.createElement('tr');
    summaryRow.style.fontWeight = 'bold';
    summaryRow.innerHTML = `<td colspan="2">Итого посещений:</td><td>${summary}</td>`;
    tableBody.appendChild(summaryRow);
  } else if (type === 'revenue') {
    const services = JSON.parse(localStorage.getItem('services') || '[]');
    const appointments = JSON.parse(localStorage.getItem('reportRecordsSync') || '[]');
    const appointmentDates = appointments.reduce((acc, appt) => {
      acc[appt.ID_Appointment] = appt.Date;
      return acc;
    }, {});
    data = services.map(service => ({
      ...service,
      date: appointmentDates[service.ID_Appointment] || 'Неизвестно'
    }));
    data = getDataForPeriod(data, startDate, endDate, 'date');
    if (filter) {
      data = data.filter(item => item.name === filter); // Фильтрация по названию услуги
    }

    summary = data.reduce((sum, item) => sum + item.Cost, 0); // Общая выручка

    tableHead.innerHTML = '<tr><th>Дата</th><th>Услуга</th><th>Выручка (руб)</th></tr>';
    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.date}</td><td>${item.name}</td><td>${item.Cost}</td>`;
      tableBody.appendChild(row);
    });

    // Добавляем строку с итогом
    const summaryRow = document.createElement('tr');
    summaryRow.style.fontWeight = 'bold';
    summaryRow.innerHTML = `<td colspan="2">Итого выручка (руб):</td><td>${summary}</td>`;
    tableBody.appendChild(summaryRow);
  }

  if (tableBody.children.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3">Нет данных для отчета</td></tr>';
  }

  return summary; // Возвращаем итог для использования в экспорте
};

// Экспорт в Excel
window.exportToExcel = () => {
  try {
    const type = reportTypeSelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const filter = filterSelect.value;

    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      alert('Пожалуйста, введите даты в формате ДД.ММ.ГГГГ!');
      return;
    }

    const [startDay, startMonth, startYear] = startDate.split('.').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('.').map(Number);
    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    const endDateObj = new Date(endYear, endMonth - 1, endDay);

    if (startDateObj > endDateObj) {
      alert('Дата "С" должна быть меньше или равна дате "По"!');
      return;
    }

    const summary = generateReport(type, startDate, endDate, filter);

    const worksheetData = [];
    const rows = Array.from(tableBody.children);
    rows.forEach(row => {
      const cells = Array.from(row.children);
      if (cells.length === 3) {
        if (type === 'visits') {
          if (cells[0].textContent.includes('Итого')) {
            worksheetData.push({ Дата: 'Итого посещений:', Врач: '', Посещений: summary });
          } else {
            worksheetData.push({
              Дата: cells[0].textContent,
              Врач: cells[1].textContent,
              Посещений: cells[2].textContent
            });
          }
        } else {
          if (cells[0].textContent.includes('Итого')) {
            worksheetData.push({ Дата: 'Итого выручка (руб):', Услуга: '', 'Выручка (руб)': summary });
          } else {
            worksheetData.push({
              Дата: cells[0].textContent,
              Услуга: cells[1].textContent,
              'Выручка (руб)': cells[2].textContent
            });
          }
        }
      }
    });

    if (worksheetData.length === 0 || worksheetData[0].Дата === 'Нет данных для отчета') {
      alert('Нет данных для экспорта в Excel.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'visits' ? 'Посещаемость' : 'Выручка');
    XLSX.writeFile(wb, `report_${type}_${startDate}_${endDate}.xlsx`);
  } catch (error) {
    logError(`Ошибка экспорта в Excel: ${error.message}`);
    alert('Ошибка при экспорте в Excel. Проверьте консоль.');
  }
};

// Экспорт в PDF
window.exportToPDF = () => {
  try {
    const type = reportTypeSelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const filter = filterSelect.value;

    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      alert('Пожалуйста, введите даты в формате ДД.ММ.ГГГГ!');
      return;
    }

    const [startDay, startMonth, startYear] = startDate.split('.').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('.').map(Number);
    const startDateObj = new Date(startYear, startMonth - 1, startDay);
    const endDateObj = new Date(endYear, endMonth - 1, endDay);

    if (startDateObj > endDateObj) {
      alert('Дата "С" должна быть меньше или равна дате "По"!');
      return;
    }

    const summary = generateReport(type, startDate, endDate, filter);

    const rows = Array.from(tableBody.children);
    if (rows.length === 0 || rows[0].textContent === 'Нет данных для отчета') {
      alert('Нет данных для экспорта в PDF.');
      return;
    }

    // Создание HTML для печати
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Отчет: ${type === 'visits' ? 'Посещаемость' : 'Выручка'}</h1>
        <p>Период: с ${startDate} по ${endDate}</p>
        ${filter ? `<p>Фильтр: ${type === 'visits' ? (filter === '1' ? 'Иванов И.И.' : 'Петров П.П.') : filter}</p>` : ''}
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background-color: #3498db; color: white;">
            <th style="border: 1px solid #ddd; padding: 10px;">${type === 'visits' ? 'Дата' : 'Дата'}</th>
            <th style="border: 1px solid #ddd; padding: 10px;">${type === 'visits' ? 'Врач' : 'Услуга'}</th>
            <th style="border: 1px solid #ddd; padding: 10px;">${type === 'visits' ? 'Посещений' : 'Выручка (руб)'}</th>
          </tr>
          ${rows.map(row => `
            <tr style="${row.style.fontWeight === 'bold' ? 'font-weight: bold;' : ''}">
              ${Array.from(row.children).map(cell => `<td style="border: 1px solid #ddd; padding: 10px;">${cell.textContent}</td>`).join('')}
            </tr>
          `).join('')}
        </table>
        <p style="margin-top: 20px;">ООО "Ветеринарная клиника 'Айболит'"</p>
        <p>г. Уфа, ул. Лесной проезд, д. 12</p>
        <p>ИНН 0275123456, КПП 027501001, БИК 048073601</p>
        <p>Получено лицом, ответственным за совершение операции</p>
        <p>М.П. _____________ (подпись) ${new Date().toLocaleDateString('ru-RU')}</p>
      </div>
    `;

    // Печать через iframe
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(`
      <html>
        <head>
          <title>Отчет</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
            th { background-color: #3498db; color: white; }
            h1, p { text-align: center; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    frameDoc.close();
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    printFrame.parentNode.removeChild(printFrame);
  } catch (error) {
    logError(`Ошибка экспорта в PDF: ${error.message}`);
    alert('Ошибка при экспорте в PDF. Проверьте консоль.');
  }
};

// Обработчик формы
reportForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = reportTypeSelect.value;
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  const filter = filterSelect.value;

  if (!type) {
    alert('Выберите тип отчета!');
    return;
  }

  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    alert('Пожалуйста, введите даты в формате ДД.ММ.ГГГГ!');
    return;
  }

  const [startDay, startMonth, startYear] = startDate.split('.').map(Number);
  const [endDay, endMonth, endYear] = endDate.split('.').map(Number);
  const startDateObj = new Date(startYear, startMonth - 1, startDay);
  const endDateObj = new Date(endYear, endMonth - 1, endDay);

  if (startDateObj > endDateObj) {
    alert('Дата "С" должна быть меньше или равна дате "По"!');
    return;
  }

  generateReport(type, startDate, endDate, filter);
});

// Обработчик смены типа отчета
reportTypeSelect.addEventListener('change', updateFilters);

// Инициализация
updateFilters();
generateReport('visits', '01.05.2025', '14.05.2025', '1'); // Инициализация для Иванова