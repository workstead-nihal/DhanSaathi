function planTax() {
  const grossIncome = parseFloat(document.getElementById('grossIncome').value);
  const deductions = parseFloat(document.getElementById('deductions').value);
  const taxRate = parseFloat(document.getElementById('taxRate').value);

  const resultDiv = document.getElementById('result');

  if (isNaN(grossIncome) || isNaN(deductions) || isNaN(taxRate)) {
    resultDiv.textContent = "Please enter valid numbers.";
    return;
  }

  const taxableIncome = grossIncome - deductions;
  const taxLiability = (taxableIncome * taxRate) / 100;
  const netIncome = grossIncome - taxLiability;

  resultDiv.innerHTML = `
    <strong>Tax Planner Summary:</strong><br>
    Gross Income: ₹${grossIncome.toFixed(2)}<br>
    Deductions: ₹${deductions.toFixed(2)}<br>
    <strong>Taxable Income:</strong> ₹${taxableIncome.toFixed(2)}<br>
    Tax Liability (@${taxRate.toFixed(2)}%): ₹${taxLiability.toFixed(2)}<br>
    <strong>Net Income After Tax:</strong> ₹${netIncome.toFixed(2)}
  `;
}