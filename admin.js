// Проверка прав администратора
function checkAdminAccess() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Необходимо войти в аккаунт!');
        window.location.href = 'auth.html';
        return null;
    }
    if (currentUser.role !== 'admin' && currentUser.role !== 'founder') {
        alert('Доступ запрещен! Только для администраторов и основателя.');
        window.location.href = 'index.html';
        return null;
    }
    return currentUser;
}

// Загрузка списка пользователей
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Нет зарегистрированных пользователей</td></tr>';
        return;
    }
    
    let html = '';
    users.forEach(user => {
        const roleIcon = user.role === 'founder' ? '⭐' : user.role === 'admin' ? '👑' : '🎮';
        const roleName = user.role === 'founder' ? 'Основатель' : user.role === 'admin' ? 'Администратор' : 'Игрок';
        const roleClass = user.role === 'founder' ? 'role-founder' : user.role === 'admin' ? 'role-admin' : 'role-player';
        
        html += `
            <tr>
                <td>${user.username}</td>
                <td>${user.nickname}</td>
                <td><span class="role-badge ${roleClass}">${roleIcon} ${roleName}</span></td>
                <td>${user.registeredAt}</td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="openRoleModal('${user.username}')">
                        Изменить роль
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Обновить список пользователей
function refreshUsers() {
    loadUsers();
    alert('Список пользователей обновлен!');
}

// Открыть модальное окно для изменения роли
let selectedUsername = null;

function openRoleModal(username) {
    const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    const user = users.find(u => u.username === username);
    
    if (!user) {
        alert('Пользователь не найден!');
        return;
    }
    
    selectedUsername = username;
    document.getElementById('modalUsername').textContent = user.username;
    document.getElementById('modalNickname').textContent = user.nickname;
    document.getElementById('newRole').value = user.role;
    document.getElementById('roleModal').style.display = 'block';
}

// Закрыть модальное окно
function closeRoleModal() {
    document.getElementById('roleModal').style.display = 'none';
    selectedUsername = null;
}

// Изменить роль пользователя
function changeUserRole() {
    if (!selectedUsername) return;
    
    const newRole = document.getElementById('newRole').value;
    const users = JSON.parse(localStorage.getItem('forumUsers')) || [];
    const userIndex = users.findIndex(u => u.username === selectedUsername);
    
    if (userIndex === -1) {
        alert('Пользователь не найден!');
        return;
    }
    
    // Обновляем роль
    users[userIndex].role = newRole;
    localStorage.setItem('forumUsers', JSON.stringify(users));
    
    // Если изменяем роль текущего пользователя, обновляем его данные
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.username === selectedUsername) {
        currentUser.role = newRole;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    alert(`Роль пользователя ${users[userIndex].nickname} успешно изменена!`);
    closeRoleModal();
    loadUsers();
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const admin = checkAdminAccess();
    if (!admin) return;
    
    // Initialize categories
    initializeCategories();
    
    // Показываем информацию об администраторе
    const roleText = admin.role === 'founder' ? '⭐ Основатель' : '👑 Администратор';
    const navButtons = document.getElementById('navButtons');
    navButtons.innerHTML = `
        <div class="user-info">
            <span>👤 ${admin.nickname}</span>
            <span class="user-role">${roleText}</span>
            <button class="btn btn-secondary" onclick="logout()">Выход</button>
        </div>
    `;
    
    loadCategories();
    loadUsers();
});

// Загрузка категорий
function loadCategories() {
    const categories = getCategories();
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const tbody = document.getElementById('categoriesTableBody');
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Нет категорий</td></tr>';
        return;
    }
    
    let html = '';
    categories.forEach(category => {
        const categoryTopics = topics.filter(t => t.category === category.key);
        const topicCount = categoryTopics.length;
        const replyCount = categoryTopics.reduce((sum, t) => sum + (t.replies?.length || 0), 0);
        
        const protectedBadge = category.protected ? '<span class="role-badge role-founder">🔒 Защищена</span>' : '';
        const deleteButton = category.protected ? '' : `<button class="btn btn-small btn-secondary" onclick="deleteCategoryConfirm(${category.id})">Удалить</button>`;
        
        html += `
            <tr>
                <td style="font-size: 24px;">${category.icon}</td>
                <td>${category.name} ${protectedBadge}</td>
                <td>${category.description}</td>
                <td>${topicCount}</td>
                <td>${replyCount}</td>
                <td>
                    <button class="btn btn-small btn-secondary" onclick="showEditCategoryModal(${category.id})">Редактировать</button>
                    ${deleteButton}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Показать модальное окно создания категории
function showCreateCategoryModal() {
    document.getElementById('createCategoryModal').style.display = 'block';
}

// Закрыть модальное окно создания категории
function closeCategoryModal() {
    document.getElementById('createCategoryModal').style.display = 'none';
    document.getElementById('createCategoryForm').reset();
}

// Создать категорию из формы
function createCategoryFromForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    const description = document.getElementById('categoryDescription').value;
    
    const category = createCategory(name, icon, description);
    
    if (category) {
        alert('Категория успешно создана!');
        closeCategoryModal();
        loadCategories();
    }
}

// Показать модальное окно редактирования категории
function showEditCategoryModal(categoryId) {
    const category = getCategoryById(categoryId);
    
    if (!category) {
        alert('Категория не найдена!');
        return;
    }
    
    document.getElementById('editCategoryId').value = category.id;
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryIcon').value = category.icon;
    document.getElementById('editCategoryDescription').value = category.description;
    document.getElementById('editCategoryModal').style.display = 'block';
}

// Закрыть модальное окно редактирования категории
function closeEditCategoryModal() {
    document.getElementById('editCategoryModal').style.display = 'none';
    document.getElementById('editCategoryForm').reset();
}

// Редактировать категорию из формы
function editCategoryFromForm(event) {
    event.preventDefault();
    
    const id = parseInt(document.getElementById('editCategoryId').value);
    const name = document.getElementById('editCategoryName').value;
    const icon = document.getElementById('editCategoryIcon').value;
    const description = document.getElementById('editCategoryDescription').value;
    
    const success = updateCategory(id, { name, icon, description });
    
    if (success) {
        alert('Категория успешно обновлена!');
        closeEditCategoryModal();
        loadCategories();
    }
}

// Подтверждение удаления категории
function deleteCategoryConfirm(categoryId) {
    const category = getCategoryById(categoryId);
    
    if (!category) {
        alert('Категория не найдена!');
        return;
    }
    
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const categoryTopics = topics.filter(t => t.category === category.key);
    
    const message = categoryTopics.length > 0
        ? `Вы уверены, что хотите удалить категорию "${category.name}"? Все темы (${categoryTopics.length}) в этой категории также будут удалены.`
        : `Вы уверены, что хотите удалить категорию "${category.name}"?`;
    
    if (confirm(message)) {
        const success = deleteCategory(categoryId);
        if (success) {
            alert('Категория успешно удалена!');
            loadCategories();
        }
    }
}

// Выход
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

