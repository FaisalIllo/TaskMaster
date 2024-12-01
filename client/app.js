const API_URL = 'http://localhost:3000/api'; // Replace with your server's URL

document.addEventListener('DOMContentLoaded', () => {
  // Detect which page is loaded
  const isLoginPage = document.getElementById('auth-section') !== null;
  const isTaskPage = document.getElementById('task-section') !== null;

  if (isLoginPage) {
    initializeLoginPage();
  } else if (isTaskPage) {
    initializeTaskPage();
  }
});

// Utility: Clear and set token in localStorage
const clearAndSetToken = (newToken) => {
  localStorage.clear();
  localStorage.setItem('token', newToken);
};

// Utility: Fetch user information from the server
const fetchUserInfo = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/user`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to fetch user information.');

    const { username } = await response.json();
    return username;
  } catch (error) {
    console.error('Error fetching user info:', error);
    alert('Failed to load user information. Please log in again.');
    localStorage.clear();
    window.location.href = 'index.html'; // Redirect to login page
  }
};

// Initialize login/register page
const initializeLoginPage = () => {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  // Tab toggle logic
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

  // Register user
  document.getElementById('register-btn').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) return alert('Passwords do not match.');
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (!response.ok) throw new Error('Registration failed.');
      alert('Registration successful! Please log in.');
      loginTab.click();
    } catch (error) {
      alert(error.message);
    }
  });

  // Login user
  document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed.');
      clearAndSetToken(data.token); // Set token in localStorage
      window.location.href = 'task.html'; // Redirect to task page
    } catch (error) {
      alert(error.message);
    }
  });
};

// Initialize task management page
const initializeTaskPage = async () => {
  const token = localStorage.getItem('token');
  if (!token) return window.location.href = 'index.html'; // Redirect if no token found

  // Fetch and display user info
  const username = await fetchUserInfo();
  document.getElementById('greeting').textContent = `Hi, ${username}`;

  // Logout functionality
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      window.location.href = 'index.html';
    }
  });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { tasks, token: newToken } = await response.json();
      clearAndSetToken(newToken); // Update token

      const taskList = document.getElementById('tasks');
      taskList.innerHTML = '';
      tasks.forEach((task) => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.dataset.id = task._id;
        taskItem.innerHTML = `
          <div class="task-info">
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>Priority: ${task.priority}</p>
            <p>Deadline: ${task.deadline}</p>
          </div>
          <div class="task-actions">
            <button class="btn edit-btn">Edit</button>
            <button class="btn delete-btn">Delete</button>
          </div>
        `;
        taskList.appendChild(taskItem);
      });
    } catch (error) {
      alert('Failed to fetch tasks.');
    }
  };

  fetchTasks();

  // Add task
  document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const deadline = document.getElementById('task-deadline').value;
    const priority = document.getElementById('task-priority').value;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, deadline, priority }),
      });
      const { token: newToken } = await response.json();
      clearAndSetToken(newToken);
      fetchTasks(); // Refresh tasks
    } catch (error) {
      alert('Failed to add task.');
    }
  });

  // Edit/Delete task actions
  document.getElementById('tasks').addEventListener('click', async (e) => {
    const taskId = e.target.closest('.task-item')?.dataset.id;

    if (e.target.classList.contains('edit-btn')) {
      const updatedTask = {
        title: prompt('Update task title:'),
        description: prompt('Update task description:'),
        deadline: prompt('Update deadline (YYYY-MM-DD):'),
        priority: prompt('Update priority (low, medium, high):'),
      };
      try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTask),
        });
        const { token: newToken } = await response.json();
        clearAndSetToken(newToken);
        fetchTasks(); // Refresh tasks
      } catch (error) {
        alert('Failed to update task.');
      }
    }

    if (e.target.classList.contains('delete-btn')) {
      if (confirm('Are you sure you want to delete this task?')) {
        try {
          const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          const { token: newToken } = await response.json();
          clearAndSetToken(newToken);
          fetchTasks(); // Refresh tasks
        } catch (error) {
          alert('Failed to delete task.');
        }
      }
    }
  });
};
