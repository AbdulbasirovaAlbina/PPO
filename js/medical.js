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

let selectedOwner = '';
let selectedPetName = '';
let allRecords = JSON.parse(localStorage.getItem('medicalRecords') || '[]');

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

  const petRecord = uniquePets[selectedIndex];

  if (petRecord) {
    petNameInput.value = petRecord.petName;
    petOwnerInput.value = petRecord.petOwner || '';
    ownerAddressInput.value = petRecord.ownerAddress || '';
    ownerPhoneInput.value = petRecord.ownerPhone || '';
    petSpeciesInput.value = petRecord.petSpecies || '';
    petBirthDateInput.value = petRecord.petBirthDate || '';
    petGenderInput.value = petRecord.petGender || '';
    petColorInput.value = petRecord.petColor || '';
  } else {
    petNameInput.value = '';
    petOwnerInput.value = '';
    ownerAddressInput.value = '';
    ownerPhoneInput.value = '';
    petSpeciesInput.value = '';
    petBirthDateInput.value = '';
    petColorInput.value = '';
    petGenderInput.value = '';
  }
};

window.deleteRecord = (index) => {
  allRecords.splice(index, 1);
  localStorage.setItem('medicalRecords', JSON.stringify(allRecords));
  loadPets();
  loadRecords();
  if (allRecords.length === 0) {
    recordsContainer.innerHTML = '';
    recordsContainer.style.display = 'none';
  }
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

  allRecords.push(newRecord);
  localStorage.setItem('medicalRecords', JSON.stringify(allRecords));

  alert(`Добавлена запись: ${petName}, Диагноз: ${diagnosis}, Лечение: ${treatment}`);
  form.reset();

  selectedOwner = '';
  selectedPetName = '';
  searchOwnerInput.value = '';
  searchPetNameInput.value = '';
  loadPets();
  loadRecords();
});

window.exportToPDF = () => {
  const doc = new jsPDF();
  const margin = 15;
  let y = 15;
  const maxWidth = 180;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  doc.setFontSize(16);
  doc.text("АМБУЛАТОРНАЯ КАРТА", 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(12);

  const groupedRecords = {};
  allRecords.forEach(record => {
    const identifier = `${record.petName}|${record.petOwner || 'Не указано'}|${record.petBirthDate || 'Не указано'}`;
    if (!groupedRecords[identifier]) {
      groupedRecords[identifier] = [];
    }
    groupedRecords[identifier].push(record);
  });

  const identifiers = Object.keys(groupedRecords);
  identifiers.forEach((identifier, idx) => {
    if (idx > 0) {
      doc.addPage();
      y = 15;
    }

    const [petName, petOwner, petBirthDate] = identifier.split('|');
    const petData = groupedRecords[identifier][0];

    doc.setFont("helvetica", "bold");
    doc.text("Информация о владельце и питомце", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");

    const staticInfo = [
      `ФИО владельца: ${petOwner}`,
      `Адрес: ${petData.ownerAddress || 'Не указан'}`,
      `Телефон: ${petData.ownerPhone || 'Не указан'}`,
      `Животное вида: ${petData.petSpecies || 'Не указан'}`,
      `Дата рождения: ${petBirthDate}`,
      `Кличка: ${petName}`,
      `Пол: ${petData.petGender || 'Не указан'}`,
      `Окрас: ${petData.petColor || 'Не указан'}`
    ];

    staticInfo.forEach(line => {
      if (y + 10 > 280) {
        doc.addPage();
        y = 15;
      }
      const splitText = doc.splitTextToSize(line, maxWidth);
      doc.text(splitText, margin, y);
      y += splitText.length * 7;
    });

    y += 5;

    doc.setFont("helvetica", "bold");
    doc.text("История посещений", margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");

    groupedRecords[identifier].forEach((record, index) => {
      const visitInfo = [
        `Посещение ${index + 1}:`,
        `  Дата: ${record.visitDate || 'Не указано'}`,
        `  Температура: ${record.temperature || 'Не указано'}`,
        `  Диагноз: ${record.diagnosis}`,
        `  Назначение лечения: ${record.treatment}`
      ];

      visitInfo.forEach(line => {
        if (y + 10 > 280) {
          doc.addPage();
          y = 15;
        }
        const splitText = doc.splitTextToSize(line, maxWidth);
        doc.text(splitText, margin, y);
        y += splitText.length * 7;
      });

      y += 5;
    });
  });

  if (identifiers.length === 0) {
    doc.text("Нет записей для экспорта.", margin, y);
  }

  doc.save("Амбулаторная_карта.pdf");
};

loadPets();
loadRecords();