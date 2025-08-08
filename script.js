const transactions = [];

function renderTransactions() {
  const tbody = document.querySelector('#trans-table tbody');
  tbody.innerHTML = '';
  transactions.forEach(tx => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tx.desc}</td>
      <td>${tx.amount}</td>
      <td>${tx.type === 'purchase' ? 'دين' : 'سداد'}</td>
      <td>${tx.client}</td>
    `;
    tbody.appendChild(tr);
  });
}

function addTransaction() {
  const client = document.getElementById('client-name').value.trim();
  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;

  if (!client || !desc || isNaN(amount) || amount <= 0) {
    alert('الرجاء إدخال جميع الحقول بشكل صحيح.');
    return;
  }

  transactions.push({ client, desc, amount, type });
  renderTransactions();

  // Clear form
  document.getElementById('client-name').value = '';
  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
}
