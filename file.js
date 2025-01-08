// Add event listeners to each box to display the appropriate form
document.getElementById('cabinetBox').addEventListener('click', function () {
  showForm('Cabinet');
});

document.getElementById('employerBox').addEventListener('click', function () {
  showForm('Employer');
});

document.getElementById('customerBox').addEventListener('click', function () {
  showForm('Customer');
});

// Function to display the selected form
function showForm(type) {
  // Display the form container
  document.getElementById('formContainer').style.display = 'block';
  document.getElementById('formTitle').textContent = `${type} Login/Signup`;

  // Hide all forms initially
  document.getElementById('cabinetForm').style.display = 'none';
  document.getElementById('employerForm').style.display = 'none';
  document.getElementById('customerForm').style.display = 'none';

  // Show the form based on the type
  if (type === 'Cabinet') {
    document.getElementById('cabinetForm').style.display = 'block';
  } else if (type === 'Employer') {
    document.getElementById('employerForm').style.display = 'block';
  } else if (type === 'Customer') {
    document.getElementById('customerForm').style.display = 'block';
  }
}

// Handle Cabinet Login
document.getElementById('cabinetLoginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('cabinetUsername').value;
  const password = document.getElementById('cabinetPassword').value;

  const response = await fetch('/cabinet/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if (result.success) {
    alert('Login successful! Redirecting to Cabinet dashboard...');
    window.location.href = 'cabinet.html';
  } else {
    alert(result.message);
  }
});

// Handle Employer Login
document.getElementById('employerLoginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('employerUsername').value;
  const password = document.getElementById('employerPassword').value;

  const response = await fetch('/employer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if (result.success) {
    alert('Login successful! Redirecting to Employer dashboard...');
    window.location.href = 'employer.html';
  } else {
    alert(result.message);
  }
});

// Handle Customer Signup
document.getElementById('customerSignupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('customerUsername').value;
  const password = document.getElementById('customerPassword').value;

  const response = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  alert(result.message);

  if (result.message === 'Customer signed up successfully!') {
    document.getElementById('customerSignupForm').style.display = 'none';
    document.getElementById('customerLoginForm').style.display = 'block';
  }
});

// Handle Customer Login
document.getElementById('customerLoginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('customerLoginUsername').value;
  const password = document.getElementById('customerLoginPassword').value;

  const response = await fetch('/customer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if (result.success) {
    alert('Login successful! Redirecting to Customer dashboard...');
    window.location.href = 'customer.html';
  } else {
    alert(result.message);
  }
});
