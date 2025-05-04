document.getElementById('appointmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const vet = document.getElementById('vet').value;
  
    if (!date || !time || !vet) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }
  
    // Имитация проверки занятых слотов
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const isSlotTaken = appointments.some(
      (appt) => appt.date === date && appt.time === time && appt.vet === vet
    );
  
    if (isSlotTaken) {
      alert('Этот слот занят, выберите другое время или врача.');
      return;
    }
  
    // Сохранение записи
    appointments.push({ date, time, vet });
    localStorage.setItem('appointments', JSON.stringify(appointments));
    alert(`Запись создана: ${date}, ${time}, Врач: ${vet}`);
    document.getElementById('appointmentForm').reset();
  });