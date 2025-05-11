const tableBody = document.getElementById('medicalTableBody');
const form = document.getElementById('medicalForm');

// Загрузка существующих записей
const loadRecords = () => {
  const records = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
  tableBody.innerHTML = '';
  records.forEach((record) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${record.petName}</td><td>${record.diagnosis}</td><td>${record.treatment}</td>`;
    tableBody.appendChild(row);
  });
};

// Добавление новой записи
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const petName = document.getElementById('petName').value;
  const diagnosis = document.getElementById('diagnosis').value;
  const treatment = document.getElementById('treatment').value;

  if (!petName || !diagnosis || !treatment) {
    alert('Пожалуйста, заполните все поля!');
    return;
  }

  const records = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
  records.push({ petName, diagnosis, treatment });
  localStorage.setItem('medicalRecords', JSON.stringify(records));

  alert(`Добавлена запись: ${petName}, ${diagnosis}, ${treatment}`);
  form.reset();
  loadRecords();
});

// Инициализация
loadRecords();