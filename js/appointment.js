const appointmentForm = document.getElementById('appointmentForm');
const vetSelect = document.getElementById('vet');
const dateSelect = document.getElementById('date');
const timeSelect = document.getElementById('time');
const petNameInput = document.getElementById('petName');
const calendarBody = document.getElementById('calendarBody');
const appointmentTableBody = document.getElementById('appointmentTableBody');

let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
let editingIndex = null;

// Рабочие часы клиники (9:00–18:00, шаг 30 минут)
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// Генерация дат (сегодня + 7 дней)
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Обновление списка дат
const updateDateOptions = () => {
  const dates = generateDates();
  dateSelect.innerHTML = '<option value="">Выберите дату</option>';
  dates.forEach(date => {
    const option = document.createElement('option');
    option.value = date;
    option.textContent = new Date(date).toLocaleDateString('ru-RU');
    dateSelect.appendChild(option);
  });
};

// Обновление списка времени
const updateTimeOptions = () => {
  const selectedDate = dateSelect.value;
  const selectedVet = vetSelect.value;
  timeSelect.innerHTML = '<option value="">Выберите время</option>';

  if (selectedDate && selectedVet) {
    const takenSlots = appointments
      .filter(appt => appt.date === selectedDate && appt.vet === selectedVet)
      .map(appt => appt.time);

    timeSlots.forEach(slot => {
      if (!takenSlots.includes(slot)) {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSelect.appendChild(option);
      }
    });
  }
};

// Обновление календаря
const updateCalendar = () => {
  const selectedDate = dateSelect.value;
  calendarBody.innerHTML = '';

  timeSlots.forEach(slot => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${slot}</td>`;

    ['1', '2'].forEach(vetId => {
      const isTaken = appointments.some(
        appt => appt.date === selectedDate && appt.time === slot && appt.vet === vetId
      );
      const cell = document.createElement('td');
      cell.textContent = isTaken ? 'Занято' : 'Свободно';
      cell.style.color = isTaken ? 'red' : 'green';
      if (!isTaken) {
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', () => {
          vetSelect.value = vetId;
          timeSelect.value = slot;
        });
      }
      row.appendChild(cell);
    });

    calendarBody.appendChild(row);
  });
};

// Обновление таблицы записей
const updateAppointmentTable = () => {
  appointmentTableBody.innerHTML = '';
  appointments.forEach((appt, index) => {
    const row = document.createElement('tr');
    const vetName = appt.vet === '1' ? 'Иванов И.И.' : 'Петров П.П.';
    row.innerHTML = `
      <td>${appt.petName}</td>
      <td>${new Date(appt.date).toLocaleDateString('ru-RU')}</td>
      <td>${appt.time}</td>
      <td>${vetName}</td>
      <td>
        <button onclick="editAppointment(${index})">Изменить</button>
        <button onclick="cancelAppointment(${index})">Отменить</button>
      </td>
    `;
    appointmentTableBody.appendChild(row);
  });
};

// Проверка корректности ввода
const validateInput = (date, time, vet, petName) => {
  const today = new Date().toISOString().split('T')[0];
  const nameRegex = /^[А-Яа-яЁё\s\-]+$/;

  if (!date || !time || !vet || !petName) {
    alert('Пожалуйста, заполните все поля!');
    return false;
  }
  if (date < today) {
    alert('Дата должна быть сегодня или в будущем!');
    return false;
  }
  if (!timeSlots.includes(time)) {
    alert('Выберите время в рабочем диапазоне (9:00–18:00)!');
    return false;
  }
  if (!nameRegex.test(petName)) {
    alert('Кличка питомца должна содержать только буквы и пробелы!');
    return false;
  }
  return true;
};

// Имитация уведомления
const sendNotification = (appointment) => {
  const vetName = appointment.vet === '1' ? 'Иванов И.И.' : 'Петров П.П.';
  const message = `Запись на ${appointment.date} в ${appointment.time} к врачу ${vetName} для ${appointment.petName} подтверждена.`;
  alert(message);
  console.log(`Уведомление отправлено (SMS/Email): ${message}`);
};

// Передача данных в A2 и A4
const syncWithModules = (appointment, appointmentId) => {
  // A2: Передача в медкарты
  const medicalSync = {
    ID_Pet: appointment.petName, // Упрощение, в реальной БД нужен ID
    ID_Appointment: appointmentId
  };
  let medicalRecords = JSON.parse(localStorage.getItem('medicalRecordsSync') || '[]');
  medicalRecords.push(medicalSync);
  localStorage.setItem('medicalRecordsSync', JSON.stringify(medicalRecords));

  // A4: Передача в отчеты
  const reportSync = {
    ID_Appointment: appointmentId,
    Date: appointment.date
  };
  let reportRecords = JSON.parse(localStorage.getItem('reportRecordsSync') || '[]');
  reportRecords.push(reportSync);
  localStorage.setItem('reportRecordsSync', JSON.stringify(reportRecords));

  console.log('Синхронизация с A2:', medicalSync);
  console.log('Синхронизация с A4:', reportSync);
};

// Обработчик формы
appointmentForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const date = dateSelect.value;
  const time = timeSelect.value;
  const vet = vetSelect.value;
  const petName = petNameInput.value.trim();

  if (!validateInput(date, time, vet, petName)) return;

  const isSlotTaken = appointments.some(
    appt => appt.date === date && appt.time === time && appt.vet === vet
  );

  if (isSlotTaken) {
    alert('Этот слот занят, выберите другое время или врача.');
    return;
  }

  const appointment = { date, time, vet, petName };

  if (editingIndex !== null) {
    appointments[editingIndex] = appointment;
    alert(`Запись для ${petName} обновлена: ${date}, ${time}, Врач: ${vet}`);
    editingIndex = null;
  } else {
    appointments.push(appointment);
    sendNotification(appointment);
    syncWithModules(appointment, appointments.length - 1);
  }

  localStorage.setItem('appointments', JSON.stringify(appointments));
  appointmentForm.reset();
  updateTimeOptions();
  updateCalendar();
  updateAppointmentTable();
});

// Отмена записи
window.cancelAppointment = (index) => {
  if (confirm('Вы уверены, что хотите отменить запись?')) {
    const appointment = appointments[index];
    appointments.splice(index, 1);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    alert(`Запись для ${appointment.petName} отменена.`);
    updateTimeOptions();
    updateCalendar();
    updateAppointmentTable();
  }
};

// Изменение записи
window.editAppointment = (index) => {
  const appointment = appointments[index];
  vetSelect.value = appointment.vet; // Подставляем врача
  petNameInput.value = appointment.petName; // Подставляем кличку питомца
  // Дата и время не подставляются, чтобы пользователь выбрал их заново
  updateTimeOptions();
  editingIndex = index;
};

// Обработчики событий
vetSelect.addEventListener('change', updateTimeOptions);
dateSelect.addEventListener('change', () => {
  updateTimeOptions();
  updateCalendar();
});

// Инициализация
updateDateOptions();
updateAppointmentTable();