const API_URL = 'http://localhost:3000'; // Replace with your server's URL
let token = localStorage.getItem('token'); // Retrieve token from localStorage

// DOM Elements
const authSection = document.getElementById('auth-section');
const taskSection = document.getElementById('task-section');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');


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
// DOM Elements
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskPriority = document.getElementById('task-priority');
const taskDeadline = document.getElementById('task-deadline');
const createTaskBtn = document.getElementById('create-task-btn');
const searchBar = document.getElementById('search-bar');
const filterPriority = document.getElementById('filter-priority');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const taskList = document.getElementById('task-list');


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

// Toggle Views
const toggleSections = () => {
  if (token) {
    authSection.style.display = 'none';
    taskSection.style.display = 'block';
    fetchTasks(); // Load tasks for authenticated users
  } else {
    authSection.style.display = 'block';
    taskSection.style.display = 'none';
  }
};

// Register User
const registerUser = async () => {
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) throw new Error('Registration failed');
    alert('Registration successful. Please login.');
  } catch (error) {
    alert(error.message);
  }
};

// Login User
const loginUser = async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    token = data.token;
    localStorage.setItem('token', token); // Store token in localStorage
    toggleSections();
  } catch (error) {
    alert(error.message);
  }
};

// Logout User
const logoutUser = () => {
  token = null;
  localStorage.removeItem('token'); // Clear token from localStorage
  toggleSections();
};

// Fetch Tasks
const fetchTasks = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch tasks');
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    alert(error.message);
  }
};

// Render Tasks
const renderTasks = (tasks) => {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = ''; // Clear existing tasks

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.classList.add('task-item');
    li.innerHTML = `
      <div class="task-info">
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <small>Priority: ${task.priority} | Due: ${new Date(task.deadline).toLocaleDateString()}</small>
      </div>
      <div class="task-actions">
        <button class="btn edit-btn" onclick="editTask('${task._id}')">Edit</button>
        <button class="btn delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
};

// Event Listeners
registerBtn.addEventListener('click', registerUser);
loginBtn.addEventListener('click', loginUser);
logoutBtn.addEventListener('click', logoutUser);

// Initialize View
toggleSections();



// Create Task
const createTask = async () => {
  const title = taskTitle.value;
  const description = taskDescription.value;
  const priority = taskPriority.value;
  const deadline = taskDeadline.value;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, priority, deadline }),
    });

    if (!response.ok) throw new Error('Failed to create task');
    fetchTasks();
  } catch (error) {
    alert(error.message);
  }
};

// Delete Task
const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete task');
    fetchTasks();
  } catch (error) {
    alert(error.message);
  }
};

// Event Listeners
createTaskBtn.addEventListener('click', createTask);
applyFiltersBtn.addEventListener('click', fetchTasks);

// Event Listeners
document.getElementById('register-btn').addEventListener('click', registerUser);
document.getElementById('login-btn').addEventListener('click', loginUser);
