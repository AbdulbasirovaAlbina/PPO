const { jsPDF } = window.jspdf;
const recordsContainer = document.getElementById('medicalRecords');
const form = document.getElementById('medicalForm');
const petSelect = document.getElementById('petSelect');
const petNameInput = document.getElementById('petName');
const petOwnerInput = document.getElementById('petOwner');
const ownerAddressInput = document.getElementById('ownerAddress');
const ownerPhoneInput = document.getElementById('ownerPhone');
const petSpeciesInput = document.getElementById('petSpecies');
const petBirthDateInput = document.getElementById('petBirthDate');
const petGenderInput = document.getElementById('petGender');
const petColorInput = document.getElementById('petColor');
const searchOwnerInput = document.getElementById('searchOwner');
const searchPetNameInput = document.getElementById('searchPetName');
const ownerSuggestions = document.getElementById('ownerSuggestions');
const petNameSuggestions = document.getElementById('petNameSuggestions');
const visitDateInput = document.getElementById('visitDate');
const temperatureInput = document.getElementById('temperature');
const diagnosisInput = document.getElementById('diagnosis');
const treatmentInput = document.getElementById('treatment');
const addButton = document.getElementById('addButton');
const saveButton = document.getElementById('saveButton');

let selectedOwner = '';
let selectedPetName = '';
let allRecords = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
let editingIndex = null; // Для отслеживания редактируемой записи

// Форматирование телефона в +7 (XXX) XXX-XX-XX
const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, ''); // Удаляем все не-цифры
  let formatted = '';

  if (digits.length > 0) {
    formatted = '+7';
  }
  if (digits.length > 1) {
    formatted += ' (' + digits.slice(1, 4);
  }
  if (digits.length >= 4) {
    formatted += ') ' + digits.slice(4, 7);
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(7, 9);
  }
  if (digits.length >= 9) {
    formatted += '-' + digits.slice(9, 11);
  }

  return formatted;
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

// Форматирование температуры в XX.X
const formatTemperature = (value) => {
  const digits = value.replace(/\D/g, ''); // Удаляем все не-цифры
  let formatted = '';

  if (digits.length > 0) {
    formatted = digits.slice(0, 2);
  }
  if (digits.length >= 3) {
    formatted += '.' + digits.slice(2, 3);
  }

  return formatted;
};

// Обработчик ввода для телефона
ownerPhoneInput.addEventListener('input', (e) => {
  const cursorPosition = e.target.selectionStart;
  const oldValue = e.target.value;
  const formatted = formatPhoneNumber(e.target.value);
  e.target.value = formatted;

  // Корректировка позиции курсора
  const diff = formatted.length - oldValue.length;
  const newCursorPosition = cursorPosition + diff;
  e.target.setSelectionRange(newCursorPosition, newCursorPosition);
});

// Обработчики ввода для дат
[petBirthDateInput, visitDateInput].forEach(input => {
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

// Обработчик ввода для температуры
temperatureInput.addEventListener('input', (e) => {
  const cursorPosition = e.target.selectionStart;
  const oldValue = e.target.value;
  const formatted = formatTemperature(e.target.value);
  e.target.value = formatted;

  // Корректировка позиции курсора
  const diff = formatted.length - oldValue.length;
  const newCursorPosition = cursorPosition + diff;
  e.target.setSelectionRange(newCursorPosition, newCursorPosition);
});

const loadPets = (filteredRecords = null) => {
  const records = filteredRecords || allRecords;
  const uniquePets = [];
  const seen = new Set();

  records.forEach(record => {
    const identifier = `${record.petName}|${record.petOwner || 'Не указано'}|${record.petBirthDate || 'Не указано'}`;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniquePets.push(record);
    }
  });

  petSelect.innerHTML = '<option value="">-- Выберите питомца --</option>';
  uniquePets.forEach((record, index) => {
    const identifier = `${index}`;
    const displayText = `Кличка: ${record.petName}, Владелец: ${record.petOwner || 'Не указано'}, Дата рождения: ${record.petBirthDate || 'Не указано'}`;
    const option = document.createElement('option');
    option.value = identifier;
    option.textContent = displayText;
    petSelect.appendChild(option);
  });
};

const loadRecords = (filteredRecords = null) => {
  const records = filteredRecords || allRecords;
  recordsContainer.innerHTML = '';
  const groupedRecords = {};
  records.forEach(record => {
    const identifier = `${record.petName}|${record.petOwner || 'Не указано'}|${record.petBirthDate || 'Не указано'}`;
    if (!groupedRecords[identifier]) {
      groupedRecords[identifier] = [];
    }
    groupedRecords[identifier].push(record);
  });

  const identifiers = Object.keys(groupedRecords);
  identifiers.forEach((identifier, idx) => {
    if (idx > 0) {
      const separator = document.createElement('div');
      separator.className = 'patient-separator';
      recordsContainer.appendChild(separator);
    }

    const groupDiv = document.createElement('div');
    groupDiv.className = 'record-group';
    const [petName, petOwner, petBirthDate] = identifier.split('|');
    const staticInfo = `
      <div class="static-info">
        <p><strong>ФИО владельца:</strong> ${petOwner}</p>
        <p><strong>Адрес:</strong> ${groupedRecords[identifier][0].ownerAddress || 'Не указан'}</p>
        <p><strong>Телефон:</strong> ${groupedRecords[identifier][0].ownerPhone || 'Не указан'}</p>
        <p><strong>Животное вида:</strong> ${groupedRecords[identifier][0].petSpecies || 'Не указан'}</p>
        <p><strong>Дата рождения:</strong> ${petBirthDate}</p>
        <p><strong>Кличка:</strong> ${petName}</p>
        <p><strong>Пол:</strong> ${groupedRecords[identifier][0].petGender || 'Не указан'}</p>
        <p><strong>Окрас:</strong> ${groupedRecords[identifier][0].petColor || 'Не указан'}</p>
        <div class="button-group">
          <button class="print-btn" onclick="printPetRecords('${identifier}')">Распечатать</button>
        </div>
      </div>
    `;
    let visitHistory = `
      <div class="visit-history">
        <h3>История посещений</h3>
        <ol>
    `;

    groupedRecords[identifier].forEach((record, index) => {
      const globalIndex = allRecords.indexOf(record);
      const displayDate = record.visitDate || 'Не указано';
      const displayTemp = record.temperature || 'Не указано';
      visitHistory += `
        <li>
          <strong>Дата:</strong> ${displayDate}<br>
          <strong>Температура:</strong> ${displayTemp}<br>
          <strong>Диагноз:</strong> ${record.diagnosis}<br>
          <strong>Назначение лечения:</strong> ${record.treatment}<br>
          <div class="button-group">
            <button class="delete-btn" onclick="deleteRecord(${globalIndex})">Удалить</button>
            <button class="edit-btn" onclick="editRecord(${globalIndex})">Редактировать</button>
          </div>
        </li>
      `;
    });

    visitHistory += `</ol></div>`;
    groupDiv.innerHTML = `
      <div class="record-details">
        ${staticInfo}
        ${visitHistory}
      </div>
    `;

    recordsContainer.appendChild(groupDiv);
  });
  recordsContainer.style.display = identifiers.length > 0 ? 'block' : 'none';
};

const showSuggestions = (input, suggestionsList, items, type) => {
  suggestionsList.innerHTML = '';
  const inputValue = input.value.trim().toLowerCase();

  const filteredItems = inputValue
    ? items.filter(item => item.toLowerCase().includes(inputValue))
    : items;

  if (filteredItems.length === 0 && inputValue) {
    suggestionsList.style.display = 'none';
    return;
  }

  filteredItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.addEventListener('click', () => {
      input.value = item;
      suggestionsList.innerHTML = '';
      suggestionsList.style.display = 'none';
      if (type === 'owner') {
        selectedOwner = item;
        selectedPetName = '';
        searchPetNameInput.value = '';
      } else {
        selectedPetName = item;
      }
      filterRecords();
    });
    suggestionsList.appendChild(li);
  });
  suggestionsList.style.display = filteredItems.length > 0 ? 'block' : 'none';
};

searchOwnerInput.addEventListener('input', () => {
  const owners = [...new Set(allRecords.map(record => record.petOwner || 'Не указано'))];
  showSuggestions(searchOwnerInput, ownerSuggestions, owners, 'owner');
});

searchPetNameInput.addEventListener('input', () => {
  const petNames = [...new Set(
    allRecords
      .filter(record => !selectedOwner || (record.petOwner || '') === selectedOwner)
      .map(record => record.petName || 'Не указано')
  )];
  showSuggestions(searchPetNameInput, petNameSuggestions, petNames, 'pet');
});

document.addEventListener('click', (e) => {
  if (!searchOwnerInput.contains(e.target) && !ownerSuggestions.contains(e.target)) {
    ownerSuggestions.style.display = 'none';
  }
  if (!searchPetNameInput.contains(e.target) && !petNameSuggestions.contains(e.target)) {
    petNameSuggestions.style.display = 'none';
  }
});

petOwnerInput.addEventListener('input', () => {
  if (petOwnerInput.value.trim() !== '') {
    recordsContainer.style.display = 'block';
    filterRecords();
  } else {
    recordsContainer.style.display = 'none';
  }
});

const filterRecords = () => {
  const filteredRecords = allRecords.filter(record => {
    const ownerMatch = !selectedOwner || (record.petOwner || '').toLowerCase() === selectedOwner.toLowerCase();
    const petNameMatch = !selectedPetName || (record.petName || '').toLowerCase() === selectedPetName.toLowerCase();
    return ownerMatch && petNameMatch;
  });
  loadPets(filteredRecords);
  loadRecords(filteredRecords);
};

window.fillPetDetails = () => {
  const selectedIndex = petSelect.value;
  const uniquePets = [];
  const seen = new Set();

  allRecords.forEach(record => {
    const identifier = `${record.petName}|${record.petOwner || 'Не указано'}|${record.petBirthDate || 'Не указано'}`;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniquePets.push(record);
    }
  });

  const petRecord = uniquePets[selectedIndex] || allRecords[selectedIndex]; // Поправка для совместимости

  if (petRecord) {
    petNameInput.value = petRecord.petName || '';
    petOwnerInput.value = petRecord.petOwner || '';
    ownerAddressInput.value = petRecord.ownerAddress || '';
    ownerPhoneInput.value = petRecord.ownerPhone || '';
    petSpeciesInput.value = petRecord.petSpecies || '';
    petBirthDateInput.value = petRecord.petBirthDate || '';
    petGenderInput.value = petRecord.petGender || '';
    petColorInput.value = petRecord.petColor || '';
    visitDateInput.value = petRecord.visitDate || '';
    temperatureInput.value = petRecord.temperature || '';
    diagnosisInput.value = petRecord.diagnosis || '';
    treatmentInput.value = petRecord.treatment || '';
  } else {
    form.reset(); // Очищаем форму, если запись не выбрана
    visitDateInput.value = '';
    temperatureInput.value = '';
    diagnosisInput.value = '';
    treatmentInput.value = '';
  }
};

window.deleteRecord = (index) => {
  if (confirm('Вы уверены, что хотите удалить запись?')) {
    allRecords.splice(index, 1);
    localStorage.setItem('medicalRecords', JSON.stringify(allRecords));
    loadPets();
    loadRecords();
    if (allRecords.length === 0) {
      recordsContainer.innerHTML = '';
      recordsContainer.style.display = 'none';
    }
    fillPetDetails(); // Обновляем форму после удаления
  }
};

window.editRecord = (index) => {
  editingIndex = index;
  const record = allRecords[index];

  petNameInput.value = record.petName || '';
  petOwnerInput.value = record.petOwner || '';
  ownerAddressInput.value = record.ownerAddress || '';
  ownerPhoneInput.value = record.ownerPhone || '';
  petSpeciesInput.value = record.petSpecies || '';
  petBirthDateInput.value = record.petBirthDate || '';
  petGenderInput.value = record.petGender || '';
  petColorInput.value = record.petColor || '';
  visitDateInput.value = record.visitDate || '';
  temperatureInput.value = record.temperature || '';
  diagnosisInput.value = record.diagnosis || '';
  treatmentInput.value = record.treatment || '';

  // Переключаем форму в режим редактирования
  addButton.style.display = 'none';
  saveButton.style.display = 'inline-block';
};

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const petOwner = petOwnerInput.value.trim();
  const ownerAddress = ownerAddressInput.value.trim();
  const ownerPhone = ownerPhoneInput.value.trim();
  const petSpecies = petSpeciesInput.value.trim();
  const petBirthDate = petBirthDateInput.value.trim();
  const petName = petNameInput.value.trim();
  const petGender = petGenderInput.value;
  const petColor = petColorInput.value.trim();
  const visitDate = visitDateInput.value.trim();
  const temperature = temperatureInput.value.trim();
  const diagnosis = diagnosisInput.value.trim();
  const treatment = treatmentInput.value.trim();

  const nameRegex = /^[А-Яа-яЁё\s\-]+$/;
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  const tempRegex = /^\d{2}([.,]\d)?$/;

  if (!nameRegex.test(petOwner)) {
    alert('Поле "Ф.И.О. владельца" должно содержать только буквы и пробелы.');
    return;
  }
  if (!nameRegex.test(petName)) {
    alert('Поле "Кличка питомца" должно содержать только буквы и пробелы.');
    return;
  }
  if (petBirthDate && !dateRegex.test(petBirthDate)) {
    alert('Дата рождения должна быть в формате ДД.ММ.ГГГГ.');
    return;
  }
  if (visitDate && !dateRegex.test(visitDate)) {
    alert('Дата посещения должна быть в формате ДД.ММ.ГГГГ.');
    return;
  }
  if (temperature && !tempRegex.test(temperature)) {
    alert('Температура должна быть числом, например: 36.9');
    return;
  }

  if (!petName || !diagnosis || !treatment) {
    alert('Пожалуйста, заполните обязательные поля: кличка питомца, диагноз и назначение лечения!');
    return;
  }

  const newRecord = {
    petOwner,
    ownerAddress,
    ownerPhone,
    petSpecies,
    petBirthDate,
    petName,
    petGender,
    petColor,
    visitDate,
    temperature,
    diagnosis,
    treatment
  };

  if (editingIndex !== null) {
    // Режим редактирования
    allRecords[editingIndex] = newRecord;
    alert(`Запись обновлена: ${petName}, Диагноз: ${diagnosis}, Лечение: ${treatment}`);
    editingIndex = null;
    addButton.style.display = 'inline-block';
    saveButton.style.display = 'none';
  } else {
    // Режим добавления
    allRecords.push(newRecord);
    alert(`Добавлена запись: ${petName}, Диагноз: ${diagnosis}, Лечение: ${treatment}`);
  }

  localStorage.setItem('medicalRecords', JSON.stringify(allRecords));
  form.reset();
  selectedOwner = '';
  selectedPetName = '';
  searchOwnerInput.value = '';
  searchPetNameInput.value = '';
  loadPets();
  loadRecords();
  fillPetDetails(); // Очищаем форму после добавления
});

window.printPetRecords = (identifier) => {
  const printContent = document.getElementById('print-content');
  printContent.innerHTML = ''; // Очищаем перед заполнением

  const groupedRecords = {};
  allRecords.forEach(record => {
    const key = `${record.petName}|${record.petOwner || 'Не указано'}|${record.petBirthDate || 'Не указано'}`;
    if (!groupedRecords[key]) {
      groupedRecords[key] = [];
    }
    groupedRecords[key].push(record);
  });

  const [petName, petOwner, petBirthDate] = identifier.split('|');
  const petData = groupedRecords[identifier][0];

  let htmlContent = `
    <h2 style="text-align: center; font-family: Arial, sans-serif;">АМБУЛАТОРНАЯ КАРТА</h2>
    <p style="text-align: center; font-family: Arial, sans-serif;">Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
    <h3 style="font-family: Arial, sans-serif;">Информация о владельце и питомце</h3>
    <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, sans-serif;">
      <tr><td style="padding: 8px;"><strong>ФИО владельца:</strong></td><td style="padding: 8px;">${petOwner}</td></tr>
      <tr><td style="padding: 8px;"><strong>Адрес:</strong></td><td style="padding: 8px;">${petData.ownerAddress || 'Не указан'}</td></tr>
      <tr><td style="padding: 8px;"><strong>Телефон:</strong></td><td style="padding: 8px;">${petData.ownerPhone || 'Не указан'}</td></tr>
      <tr><td style="padding: 8px;"><strong>Животное вида:</strong></td><td style="padding: 8px;">${petData.petSpecies || 'Не указан'}</td></tr>
      <tr><td style="padding: 8px;"><strong>Дата рождения:</strong></td><td style="padding: 8px;">${petBirthDate}</td></tr>
      <tr><td style="padding: 8px;"><strong>Кличка:</strong></td><td style="padding: 8px;">${petName}</td></tr>
      <tr><td style="padding: 8px;"><strong>Пол:</strong></td><td style="padding: 8px;">${petData.petGender || 'Не указан'}</td></tr>
      <tr><td style="padding: 8px;"><strong>Окрас:</strong></td><td style="padding: 8px;">${petData.petColor || 'Не указан'}</td></tr>
    </table>
  `;

  htmlContent += `
    <h3 style="font-family: Arial, sans-serif;">История посещений</h3>
    <table border="1" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
      <tr>
        <th style="padding: 8px; background-color: #f2f2f2;">Дата</th>
        <th style="padding: 8px; background-color: #f2f2f2;">Температура</th>
        <th style="padding: 8px; background-color: #f2f2f2;">Диагноз</th>
        <th style="padding: 8px; background-color: #f2f2f2;">Назначение лечения</th>
      </tr>
  `;

  groupedRecords[identifier].forEach((record) => {
    htmlContent += `
      <tr>
        <td style="padding: 8px;">${record.visitDate || 'Не указано'}</td>
        <td style="padding: 8px;">${record.temperature || 'Не указано'}</td>
        <td style="padding: 8px;">${record.diagnosis}</td>
        <td style="padding: 8px;">${record.treatment}</td>
      </tr>
    `;
  });

  htmlContent += '</table>';

  htmlContent += `
    <div class="signature-block" style="margin-top: 20px; text-align: center; font-family: Arial, sans-serif;">
      <p>Получено лицом, ответственным за совершение операции и правильность её оформления</p>
      <p>М.П. _____________ (подпись) ${new Date().toLocaleDateString('ru-RU')}</p>
    </div>
  `;

  printContent.innerHTML = htmlContent;

  // Создаем iframe для печати
  const printFrame = document.createElement('iframe');
  printFrame.style.display = 'none';
  document.body.appendChild(printFrame);
  const frameDoc = printFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`
    <html>
      <head>
        <title>Печать</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f2f2f2; }
          h2, h3, p { text-align: center; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `);
  frameDoc.close();
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();

  // Удаляем iframe после печати и восстанавливаем состояние
  printFrame.parentNode.removeChild(printFrame);
  loadPets();
  loadRecords();
  fillPetDetails();
};

window.exportToPDF = () => {
  const printContent = document.getElementById('print-content');
  printContent.innerHTML = ''; // Очищаем перед заполнением

  const groupedRecords = {};
  allRecords.forEach(record => {
    const identifier = `${record.petName}|${record.petOwner || 'Не указано'}|${record.petBirthDate || 'Не указано'}`;
    if (!groupedRecords[identifier]) {
      groupedRecords[identifier] = [];
    }
    groupedRecords[identifier].push(record);
  });

  const identifiers = Object.keys(groupedRecords);
  let htmlContent = `
    <h2 style="text-align: center;">АМБУЛАТОРНАЯ КАРТА</h2>
    <p style="text-align: center;">Дата: ${new Date().toLocaleDateString('ru-RU')}</p>
  `;

  identifiers.forEach((identifier, idx) => {
    if (idx > 0) {
      htmlContent += '<hr style="border: 1px solid #000; margin: 20px 0;">';
    }

    const [petName, petOwner, petBirthDate] = identifier.split('|');
    const petData = groupedRecords[identifier][0];

    htmlContent += `
      <h3>Информация о владельце и питомце</h3>
      <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td><strong>ФИО владельца:</strong></td><td>${petOwner}</td></tr>
        <tr><td><strong>Адрес:</strong></td><td>${petData.ownerAddress || 'Не указан'}</td></tr>
        <tr><td><strong>Телефон:</strong></td><td>${petData.ownerPhone || 'Не указан'}</td></tr>
        <tr><td><strong>Животное вида:</strong></td><td>${petData.petSpecies || 'Не указан'}</td></tr>
        <tr><td><strong>Дата рождения:</strong></td><td>${petBirthDate}</td></tr>
        <tr><td><strong>Кличка:</strong></td><td>${petName}</td></tr>
        <tr><td><strong>Пол:</strong></td><td>${petData.petGender || 'Не указан'}</td></tr>
        <tr><td><strong>Окрас:</strong></td><td>${petData.petColor || 'Не указан'}</td></tr>
      </table>
    `;

    htmlContent += `
      <h3>История посещений</h3>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <tr><th>Дата</th><th>Температура</th><th>Диагноз</th><th>Назначение лечения</th></tr>
    `;

    groupedRecords[identifier].forEach((record) => {
      htmlContent += `
        <tr>
          <td>${record.visitDate || 'Не указано'}</td>
          <td>${record.temperature || 'Не указано'}</td>
          <td>${record.diagnosis}</td>
          <td>${record.treatment}</td>
        </tr>
      `;
    });

    htmlContent += '</table>';
  });

  if (identifiers.length === 0) {
    htmlContent += '<p>Нет записей для экспорта.</p>';
  }

  htmlContent += `
    <div class="signature-block" style="margin-top: 20px; text-align: center;">
      <p>Получено лицом, ответственным за совершение операции и правильность её оформления</p>
      <p>М.П. _____________ (подпись) ${new Date().toLocaleDateString('ru-RU')}</p>
    </div>
  `;

  printContent.innerHTML = htmlContent;

  // Создаем iframe для печати
  const printFrame = document.createElement('iframe');
  printFrame.style.display = 'none';
  document.body.appendChild(printFrame);
  const frameDoc = printFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`
    <html>
      <head>
        <title>Печать</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f2f2f2; }
          h2, h3, p { text-align: center; }
        </style>
      </head>
      <body>${htmlContent}</body>
    </html>
  `);
  frameDoc.close();
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();

  // Удаляем iframe после печати и восстанавливаем состояние
  printFrame.parentNode.removeChild(printFrame);
  loadPets();
  loadRecords();
  fillPetDetails();
};

loadPets();
loadRecords();