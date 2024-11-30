const API_URL = 'http://localhost:3000'; // Replace with your server's URL
let token = null;

// DOM Elements
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerUsername = document.getElementById('register-username');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirmPassword = document.getElementById('register-confirm-password');
const loginTogglePassword = document.getElementById('login-toggle-password');
const registerTogglePassword = document.getElementById('register-toggle-password');
const registerToggleConfirmPassword = document.getElementById('register-toggle-confirm-password');

// Toggle between Login and Register tabs
loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

// Password visibility toggle
const togglePasswordVisibility = (input, toggleIcon) => {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  toggleIcon.classList.toggle('fa-eye-slash');
};

loginTogglePassword.addEventListener('click', () =>
  togglePasswordVisibility(loginPassword, loginTogglePassword)
);
registerTogglePassword.addEventListener('click', () =>
  togglePasswordVisibility(registerPassword, registerTogglePassword)
);
registerToggleConfirmPassword.addEventListener('click', () =>
  togglePasswordVisibility(registerConfirmPassword, registerToggleConfirmPassword)
);

// Form validation
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;
  return regex.test(password);
};

// Register user
const registerUser = async () => {
  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;

  if (!validateEmail(email)) return alert('Invalid email format.');
  if (!validatePassword(password))
    return alert('Password must be at least 4 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
  if (password !== confirmPassword) return alert('Passwords do not match.');

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) throw new Error('Registration failed');
    alert('Registration successful. Please login.');
  } catch (error) {
    alert(error.message);
  }
};

// Login user
const loginUser = async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!validateEmail(email)) return alert('Invalid email format.');

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    token = data.token;
    alert('Login successful!');
    // Redirect or show tasks section...
  } catch (error) {
    alert(error.message);
  }
};

// Event Listeners
document.getElementById('register-btn').addEventListener('click', registerUser);
document.getElementById('login-btn').addEventListener('click', loginUser);
