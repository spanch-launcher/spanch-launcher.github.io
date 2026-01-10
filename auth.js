// Инициализация пользователей
function initUsers() {
    let users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    
    // Создаем основателя, если его нет
    if (!users.find(u => u.username === 'admin')) {
        users.push({
            username: 'admin',
            password: 'admin123',
            nickname: 'Основатель',
            role: 'founder',
            registeredAt: new Date().toLocaleString('ru-RU')
        });
        localStorage.setItem('forumUsers', JSON.stringify(users));
    }
}

// Показать форму регистрации
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Показать форму входа
function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Вход
function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Сохраняем текущего пользователя
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`Добро пожаловать, ${user.nickname}!`);
        window.location.href = 'forum.html';
    } else {
        alert('Неверный логин или пароль!');
    }
}

// Регистрация
function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const nickname = document.getElementById('regNickname').value;
    
    // Проверка паролей
    if (password !== passwordConfirm) {
        alert('Пароли не совпадают!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    
    // Проверка существования пользователя
    if (users.find(u => u.username === username)) {
        alert('Пользователь с таким логином уже существует!');
        return;
    }
    
    // Создаем нового пользователя с ролью "игрок"
    const newUser = {
        username,
        password,
        nickname,
        role: 'player',
        registeredAt: new Date().toLocaleString('ru-RU')
    };
    
    users.push(newUser);
    localStorage.setItem('forumUsers', JSON.stringify(users));
    
    alert('Регистрация успешна! Теперь вы можете войти.');
    showLogin();
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initUsers);
