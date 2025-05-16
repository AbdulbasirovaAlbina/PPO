const serviceForm = document.getElementById('serviceForm');
const serviceTable = document.getElementById('serviceTable');
const totalElement = document.getElementById('total');
let services = JSON.parse(localStorage.getItem('services') || '[]');
let total = services.reduce((sum, service) => sum + (service.price * service.quantity), 0);

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
    const serviceTotal = service.price * service.quantity;
    row.innerHTML = `<td>${service.name}</td><td>${service.quantity}</td><td>${service.price} руб</td><td>${serviceTotal} руб</td>`;
    serviceTable.appendChild(row);
  });

  total = services.reduce((sum, service) => sum + (service.price * service.quantity), 0);
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
  let nameToAdd = serviceName;

  if (serviceName === 'Анализы') {
    const analysisType = analysisTypeSelect.value;
    if (!analysisType) {
      alert('Пожалуйста, выберите тип анализа.');
      return;
    }
    servicePrice = analysisPrices[analysisType];
    nameToAdd = analysisType;
  }

  // Проверяем, есть ли уже такая услуга в чеке
  const existingService = services.find(service => service.name === nameToAdd);
  if (existingService) {
    // Если услуга уже есть, увеличиваем количество
    existingService.quantity += 1;
  } else {
    // Если услуги нет, добавляем новую с количеством 1
    services.push({ name: nameToAdd, price: servicePrice, quantity: 1 });
  }

  updateReceipt();
  serviceForm.reset();
  analysisSelection.style.display = 'none'; // Скрываем выбор анализа после добавления
});

window.clearReceipt = () => {
  services = [];
  total = 0;
  localStorage.removeItem('services');
  updateReceipt();
};

window.printReceipt = () => {
  const printContent = document.getElementById('print-content').innerHTML;

  // Создаем iframe для печати
  const printFrame = document.createElement('iframe');
  printFrame.style.display = 'none';
  document.body.appendChild(printFrame);
  const frameDoc = printFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(`
    <html>
      <head>
        <title>Печать чека</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f2f2f2; }
          h1, p { text-align: center; }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  frameDoc.close();
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();

  // Удаляем iframe после печати
  printFrame.parentNode.removeChild(printFrame);
};

updateReceipt();