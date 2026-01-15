const API_URL = "http://localhost:3000/api/users";
const authSection = document.getElementById("auth-section");
const loginContainer = document.getElementById("login-container");
const signupContainer = document.getElementById("signup-container");
const dashboardSection = document.getElementById("dashboard-section");
const userTableBody = document.getElementById("user-table-body");
const userForm = document.getElementById("user-form");
const searchInput = document.getElementById("search-input");

let allUsers = [];

window.onload = () => {
  const token = localStorage.getItem("token");
  if (token) {
    showDashboard();
  }
};

// Toggle between Login and Signup UI
function toggleAuth() {
  loginContainer.classList.toggle("hidden");
  signupContainer.classList.toggle("hidden");
}

// Signup Logic
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-pass").value;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      alert("Registration successful! Please login.");
      toggleAuth(); // Switch to login form
    } else {
      const data = await res.json();
      alert(data.message || "Registration failed");
    }
  } catch (err) {
    console.error(err);
  }
});

// Login Logic
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-pass").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      showDashboard();
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error(err);
  }
});

function showDashboard() {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  fetchUsers();
}

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

// Fetch and Store Users
async function fetchUsers() {
  const token = localStorage.getItem("token");
  const res = await fetch(API_URL, {
    headers: { Authorization: token },
  });

  if (res.status === 401 || res.status === 400) return logout();

  allUsers = await res.json();
  renderTable(allUsers);
}

// Reusable Render Function
function renderTable(users) {
  userTableBody.innerHTML = users
    .map(
      (user) => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn-edit" onclick="editUser('${user._id}', '${user.name}', '${user.email}')">Edit</button>
                    <button class="btn-delete" onclick="deleteUser('${user._id}')">Delete</button>
                </td>
            </tr>
        `
    )
    .join("");
}

// Search Functionality
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filteredUsers = allUsers.filter((user) => {
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });
  renderTable(filteredUsers);
});

// Create / Update Logic
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("user-id").value;
  const name = document.getElementById("user-name").value;
  const email = document.getElementById("user-email").value;
  const token = localStorage.getItem("token");

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({ name, email }),
  });

  if (res.ok) {
    resetForm();
    fetchUsers();
  }
});

// Delete Logic
async function deleteUser(id) {
  if (!confirm("Are you sure?")) return;
  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: token },
  });
  fetchUsers();
}

function editUser(id, name, email) {
  document.getElementById("user-id").value = id;
  document.getElementById("user-name").value = name;
  document.getElementById("user-email").value = email;
  document.getElementById("submit-btn").innerText = "Update User";
  document.getElementById("cancel-btn").classList.remove("hidden");
}

function resetForm() {
  userForm.reset();
  document.getElementById("user-id").value = "";
  document.getElementById("submit-btn").innerText = "Add User";
  document.getElementById("cancel-btn").classList.add("hidden");
}
