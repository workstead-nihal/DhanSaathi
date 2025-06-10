document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const resultElement = document.getElementById('login-result');

  // Sdummy later replace
  if (username === 'admin' && password === 'password') {
    resultElement.textContent = 'Login successful! Welcome.';
    resultElement.style.color = 'green';
    // You could redirect to the dashboard here
  } else {
    resultElement.textContent = 'Invalid username or password.';
    resultElement.style.color = 'red';
  }
});
