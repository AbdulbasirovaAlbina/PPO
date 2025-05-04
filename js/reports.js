const reportTypeSelect = document.getElementById('reportType');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');

function generateReport() {
  const reportType = reportTypeSelect.value;

  // Имитация данных
  const visitsData = [
    { date: '2025-05-01', vet: 'Иванов И.И.', visits: 5 },
    { date: '2025-05-01', vet: 'Петров П.П.', visits: 3 }
  ];
  const revenueData = [
    { date: '2025-05-01', service: 'Диагностика', revenue: 2500 },
    { date: '2025-05-01', service: 'Вакцинация', revenue: 3000 }
  ];

  // Очистка таблицы
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  if (reportType === 'visits') {
    // Отчет по посещаемости
    tableHead.innerHTML = '<tr><th>Дата</th><th>Врач</th><th>Посещений</th></tr>';
    visitsData.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.date}</td><td>${item.vet}</td><td>${item.visits}</td>`;
      tableBody.appendChild(row);
    });
  } else if (reportType === 'revenue') {
    // Отчет по выручке
    tableHead.innerHTML = '<tr><th>Дата</th><th>Услуга</th><th>Выручка (руб)</th></tr>';
    revenueData.forEach((item) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.date}</td><td>${item.service}</td><td>${item.revenue}</td>`;
      tableBody.appendChild(row);
    });
  }

  alert(`Отчет "${reportType === 'visits' ? 'Посещаемость' : 'Выручка'}" сформирован!`);
}

// Инициализация с пустой таблицей
generateReport();