let total = 0;
const totalDisplay = document.getElementById('total');
const form = document.getElementById('serviceForm');

const prices = {
  'Диагностика': 500,
  'Вакцинация': 1000,
  'Лечение': 1500
};

// Загрузка сохраненного счета
const loadTotal = () => {
  total = parseFloat(localStorage.getItem('serviceTotal') || '0');
  totalDisplay.textContent = `Итого: ${total} руб`;
};

// Добавление услуги
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const service = document.getElementById('service').value;

  if (!service) {
    alert('Пожалуйста, выберите услугу!');
    return;
  }

  if (service in prices) {
    total += prices[service];
    totalDisplay.textContent = `Итого: ${total} руб`;
    localStorage.setItem('serviceTotal', total);
    alert(`Добавлена услуга: ${service}, ${prices[service]} руб`);
  }
});

// Инициализация
loadTotal();