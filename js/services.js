const serviceForm = document.getElementById('serviceForm');
const serviceTable = document.getElementById('serviceTable');
const totalElement = document.getElementById('total');
let services = JSON.parse(localStorage.getItem('services') || '[]');
let total = services.reduce((sum, service) => sum + service.total, 0);

const servicePrices = {
  'Вакцинация': 1000,
  'УЗИ': 1500,
  'Анализы': 800,
  'Чистка зубов': 1500,
  'Консультация': 1200
};

const analysisPrices = {
  'Общий анализ крови': 800,
  'Биохимический анализ крови': 1500,
  'Анализ мочи': 500
};

const serviceSelect = document.getElementById('service');
const analysisSelection = document.getElementById('analysis-selection');
const analysisTypeSelect = document.getElementById('analysis-type');

serviceSelect.addEventListener('change', () => {
  if (serviceSelect.value === 'Анализы') {
    analysisSelection.style.display = 'block';
  } else {
    analysisSelection.style.display = 'none';
  }
});

const updateReceipt = () => {
  serviceTable.innerHTML = '<tr><th>Наименование</th><th>Кол-во</th><th>Цена</th><th>Итог</th></tr>';
  services.forEach(service => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${service.name}</td><td>1</td><td>${service.price} руб</td><td>${service.total} руб</td>`;
    serviceTable.appendChild(row);
  });

  totalElement.textContent = `Итого: ${total} руб`;
  localStorage.setItem('services', JSON.stringify(services));

  const signatureBlock = document.querySelector('.signature-block');
  const today = new Date().toLocaleDateString('ru-RU');
  signatureBlock.innerHTML = `<p>Получено лицом, ответственным за совершение операции и правильность её оформления</p>
                              <p>М.П. _____________ (подпись) ${today}</p>`;
};

serviceForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const serviceName = serviceSelect.value;
  let servicePrice = servicePrices[serviceName];
  let serviceTotal = servicePrice;

  if (serviceName === 'Анализы') {
    const analysisType = analysisTypeSelect.value;
    if (!analysisType) {
      alert('Пожалуйста, выберите тип анализа.');
      return;
    }
    servicePrice = analysisPrices[analysisType];
    serviceTotal = servicePrice;
    services.push({ name: analysisType, price: servicePrice, total: serviceTotal });
  } else {
    services.push({ name: serviceName, price: servicePrice, total: serviceTotal });
  }

  total += serviceTotal;
  updateReceipt();
  serviceForm.reset();
});

window.clearReceipt = () => {
  services = [];
  total = 0;
  localStorage.removeItem('services');
  updateReceipt();
};

window.printReceipt = () => {
  const printContent = document.getElementById('print-content').innerHTML;
  const originalContent = document.body.innerHTML;
  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;
};

updateReceipt();