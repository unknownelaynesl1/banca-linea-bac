// Base de datos simulada en LocalStorage
const DEFAULT_ADMIN = {
    name: "Administrador BAC",
    email: "admin@baccredomatic.com",
    username: "admin",
    password: "2026",
    accountNumber: "BAC-999999",
    balance: 5000.00,
    avatar: null,
    movements: [
        { date: new Date().toLocaleDateString(), description: "Apertura de Cuenta", type: "Ingreso", amount: 5000.00 }
    ]
};

let currentUser = null;
let slideIndex = 0;
let slideInterval;

// EFECTO DINÁMICO: Resplandor siguiendo el cursor del mouse
document.addEventListener("mousemove", (e) => {
    const glow = document.getElementById("cursor-glow");
    if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
    }
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    initDatabase();
    startCarousel();
});

// LÓGICA DEL CARRUSEL (Cambio automático cada 4 segundos)
function startCarousel() {
    showSlides();
    slideInterval = setInterval(nextSlide, 4000);
}

function nextSlide() {
    slideIndex++;
    showSlides();
}

function currentSlide(n) {
    clearInterval(slideInterval);
    slideIndex = n;
    showSlides();
    slideInterval = setInterval(nextSlide, 4000);
}

function showSlides() {
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".dot");

    if (slides.length === 0) return;

    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;

    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    if (slides[slideIndex]) slides[slideIndex].classList.add("active");
    if (dots[slideIndex]) dots[slideIndex].classList.add("active");
}

function initDatabase() {
    let users = JSON.parse(localStorage.getItem("bac_users")) || [];
    const adminExists = users.some(u => u.username === "admin");
    
    if (!adminExists) {
        users.push(DEFAULT_ADMIN);
        localStorage.setItem("bac_users", JSON.stringify(users));
    }
}

// Navegación de secciones
function showSection(sectionId) {
    const sections = [
        'services-section', 
        'register-section', 
        'login-section', 
        'dashboard-section',
        'noticias-section',
        'seguridad-section',
        'tutoriales-section',
        'micasa-section',
        'ubicanos-section'
    ];
    
    sections.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) sec.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.remove('hidden');
}

function showTab(tabId) {
    const tabs = ['transfers-tab', 'services-tab', 'movements-tab'];
    tabs.forEach(id => {
        const tab = document.getElementById(id);
        if (tab) tab.classList.add('hidden');
    });
    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.remove('hidden');
}

// Registro de Usuario
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const balance = parseFloat(document.getElementById("reg-balance").value);

    let users = JSON.parse(localStorage.getItem("bac_users")) || [];

    if (users.some(u => u.username === username)) {
        alert("El nombre de usuario ya existe. Intenta con otro.");
        return;
    }

    const newUser = {
        name,
        email,
        username,
        password,
        accountNumber: "BAC-" + Math.floor(100000 + Math.random() * 900000),
        balance: balance,
        avatar: null,
        movements: [
            { date: new Date().toLocaleDateString(), description: "Depósito Inicial", type: "Ingreso", amount: balance }
        ]
    };

    users.push(newUser);
    localStorage.setItem("bac_users", JSON.stringify(users));

    alert(`¡Registro exitoso! Tu número de cuenta asignado es: ${newUser.accountNumber}`);
    document.getElementById("register-form").reset();
    showSection('login-section');
}

// Inicio de Sesión
function handleLogin(e) {
    e.preventDefault();
    const userIn = document.getElementById("login-user").value;
    const passIn = document.getElementById("login-pass").value;

    let users = JSON.parse(localStorage.getItem("bac_users")) || [];
    const foundUser = users.find(u => u.username === userIn && u.password === passIn);

    if (foundUser) {
        currentUser = foundUser;
        updateDashboardUI();
        showSection('dashboard-section');
        
        document.getElementById('btn-show-login').classList.add('hidden');
        document.getElementById('btn-show-register').classList.add('hidden');
        document.getElementById('btn-logout').classList.remove('hidden');
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

// Actualización del Dashboard
function updateDashboardUI() {
    document.getElementById("client-name").innerText = `Bienvenido, ${currentUser.name}`;
    document.getElementById("account-number").innerText = currentUser.accountNumber;
    document.getElementById("client-balance").innerText = `Q${currentUser.balance.toFixed(2)}`;
    
    // Foto de Perfil
    const avatarImg = document.getElementById("user-avatar");
    if (currentUser.avatar) {
        avatarImg.src = currentUser.avatar;
    } else {
        avatarImg.src = "https://via.placeholder.com/80/eef2f6/94a3b8?text=👤";
    }

    renderMovements();
}

// Subir Foto de Perfil
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        currentUser.avatar = base64Image;
        document.getElementById("user-avatar").src = base64Image;
        saveCurrentUserData();
        alert("¡Foto de perfil actualizada correctamente!");
    };
    reader.readAsDataURL(file);
}

function renderMovements() {
    const tbody = document.getElementById("movements-list");
    tbody.innerHTML = "";

    currentUser.movements.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${m.date}</td>
            <td>${m.description}</td>
            <td style="color: ${m.type === 'Ingreso' ? '#10B981' : '#E31837'}; font-weight: bold;">${m.type}</td>
            <td>Q${m.amount.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Transferencias
function handleTransfer(e) {
    e.preventDefault();
    let rawAccountInput = document.getElementById("trans-account").value.trim().toUpperCase();
    const amount = parseFloat(document.getElementById("trans-amount").value);

    if (amount <= 0 || isNaN(amount)) {
        alert("Ingresa un monto válido mayor a Q0.00.");
        return;
    }

    let formattedAccount = rawAccountInput.startsWith("BAC-") ? rawAccountInput : "BAC-" + rawAccountInput;

    if (formattedAccount === currentUser.accountNumber) {
        alert("No puedes realizar una transferencia a tu propia cuenta.");
        return;
    }

    if (amount > currentUser.balance) {
        alert("Error: Saldo insuficiente para realizar esta operación.");
        return;
    }

    let users = JSON.parse(localStorage.getItem("bac_users")) || [];
    
    const targetUserIndex = users.findIndex(u => {
        const cleanUserAcc = u.accountNumber.replace(/[^0-9]/g, '');
        const cleanInputAcc = rawAccountInput.replace(/[^0-9]/g, '');
        return cleanUserAcc === cleanInputAcc;
    });

    if (targetUserIndex === -1) {
        alert("Error: La cuenta de destino no existe en el sistema BAC.");
        return;
    }

    const targetUser = users[targetUserIndex];

    // 1. Emisor
    currentUser.balance -= amount;
    currentUser.movements.unshift({
        date: new Date().toLocaleDateString(),
        description: `Transferencia a cuenta ${targetUser.accountNumber}`,
        type: "Egreso",
        amount: amount
    });

    // 2. Receptor
    targetUser.balance += amount;
    if (!targetUser.movements) targetUser.movements = [];
    targetUser.movements.unshift({
        date: new Date().toLocaleDateString(),
        description: `Transferencia recibida de ${currentUser.name} (${currentUser.accountNumber})`,
        type: "Ingreso",
        amount: amount
    });

    // 3. Guardar cambios
    const currentUserIndex = users.findIndex(u => u.username === currentUser.username);
    if (currentUserIndex !== -1) {
        users[currentUserIndex] = currentUser;
    }
    users[targetUserIndex] = targetUser;

    localStorage.setItem("bac_users", JSON.stringify(users));

    updateDashboardUI();
    alert(`¡Transferencia de Q${amount.toFixed(2)} realizada exitosamente a la cuenta ${targetUser.accountNumber} de ${targetUser.name}!`);
    e.target.reset();
}

// Pago de Servicios
function handlePayService(e) {
    e.preventDefault();
    const serviceType = document.getElementById("service-type").value;
    const ref = document.getElementById("service-ref").value;
    const amount = parseFloat(document.getElementById("service-amount").value);

    if (amount > currentUser.balance) {
        alert("Error: Saldo insuficiente.");
        return;
    }

    currentUser.balance -= amount;
    currentUser.movements.unshift({
        date: new Date().toLocaleDateString(),
        description: `Pago servicio (${serviceType}) Ref: ${ref}`,
        type: "Egreso",
        amount: amount
    });

    saveCurrentUserData();
    updateDashboardUI();
    alert(`¡Pago de ${serviceType} por Q${amount.toFixed(2)} realizado con éxito!`);
    e.target.reset();
}

// Generación de Estado de Cuenta
function generateStatement() {
    window.print();
}

// Guardar datos en LocalStorage
function saveCurrentUserData() {
    let users = JSON.parse(localStorage.getItem("bac_users")) || [];
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem("bac_users", JSON.stringify(users));
    }
}

// Logout
function logout() {
    currentUser = null;
    document.getElementById('btn-show-login').classList.remove('hidden');
    document.getElementById('btn-show-register').classList.remove('hidden');
    document.getElementById('btn-logout').classList.add('hidden');
    showSection('services-section');
}