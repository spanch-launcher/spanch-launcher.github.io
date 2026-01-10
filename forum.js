// Categories are now managed dynamically through categoryStorage.js

// Проверка авторизации
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Необходимо войти в аккаунт!');
        window.location.href = 'auth.html';
        return null;
    }
    return currentUser;
}

// Получить текущего пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Выход
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

// Инициализация форума
function initForum() {
    const user = checkAuth();
    if (!user) return;
    
    // Initialize categories (creates default "Общие правила" if none exist)
    initializeCategories();
    
    // Показываем информацию о пользователе
    updateUserInfo(user);
    
    loadCategories();
}

// Загрузка категорий
function loadCategories() {
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const categoryList = document.getElementById('categoryList');
    
    // Load categories from storage
    const categories = getCategories();
    
    let html = '';
    categories.forEach(category => {
        const categoryTopics = topics.filter(t => t.category === category.key);
        const topicCount = categoryTopics.length;
        const replyCount = categoryTopics.reduce((sum, t) => sum + (t.replies?.length || 0), 0);
        
        html += `
            <div class="category-item" onclick="openCategory('${category.key}')">
                <div class="category-header">
                    <div class="category-info">
                        <div class="category-icon">${category.icon}</div>
                        <div>
                            <h3>${category.name}</h3>
                            <p>${category.description}</p>
                        </div>
                    </div>
                    <div class="category-stats">
                        <span>${topicCount} тем</span>
                        <span>${replyCount} сообщений</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    categoryList.innerHTML = html;
}

// Открыть категорию
function openCategory(categoryKey) {
    const category = getCategoryByKey(categoryKey);
    if (!category) {
        alert('Категория не найдена');
        return;
    }
    
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const categoryTopics = topics.filter(t => t.category === categoryKey);
    
    let html = `
        <h2>${category.name}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">${category.description}</p>
        <div class="topics-list">
    `;
    
    if (categoryTopics.length === 0) {
        html += '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Пока нет тем в этой категории. Будьте первым!</p>';
    } else {
        categoryTopics.forEach(topic => {
            html += `
                <div class="topic-item" onclick="openTopic(${topic.id})">
                    <div class="topic-info">
                        <h3>${topic.title}</h3>
                        <div class="topic-meta">
                            <span>👤 ${topic.author}</span>
                            <span>📅 ${topic.date}</span>
                            <span>💬 ${topic.replies?.length || 0} ответов</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    
    document.getElementById('categoryContent').innerHTML = html;
    document.getElementById('categoryView').style.display = 'block';
}

// Открыть тему
function openTopic(topicId) {
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const topic = topics.find(t => t.id === topicId);
    const user = getCurrentUser();
    
    if (!topic) return;
    
    let html = `
        <div class="topic-detail">
            <h2>${topic.title}</h2>
            <div class="topic-meta">
                <span>👤 ${topic.author} ${topic.authorRole === 'founder' ? '<span class="founder-badge">⭐ Основатель</span>' : topic.authorRole === 'admin' ? '<span class="admin-badge">👑 Админ</span>' : ''}</span>
                <span>📅 ${topic.date}</span>
            </div>
            <div class="topic-message">
                ${topic.message}
            </div>
            
            <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Ответы (${topic.replies?.length || 0})</h3>
            <div class="replies-list">
    `;
    
    if (topic.replies && topic.replies.length > 0) {
        topic.replies.forEach(reply => {
            html += `
                <div class="reply-item">
                    <div class="reply-author">👤 ${reply.author} ${reply.authorRole === 'founder' ? '<span class="founder-badge">⭐ Основатель</span>' : reply.authorRole === 'admin' ? '<span class="admin-badge">👑 Админ</span>' : ''}</div>
                    <div class="reply-date">📅 ${reply.date}</div>
                    <div class="reply-message">${reply.message}</div>
                </div>
            `;
        });
    } else {
        html += '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Пока нет ответов</p>';
    }
    
    html += '</div>';
    
    // Форма ответа только для админов и основателя
    if (user.role === 'admin' || user.role === 'founder') {
        html += `
            <div class="reply-form">
                <h3>Ответить</h3>
                <form onsubmit="addReply(event, ${topicId})">
                    <div class="form-group">
                        <textarea id="replyMessage" rows="4" placeholder="Ваш ответ..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Отправить ответ</button>
                </form>
            </div>
        `;
    } else {
        html += `
            <div class="reply-form">
                <p style="color: var(--text-secondary); text-align: center; padding: 1.5rem; background: var(--card-bg); border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.2);">
                    ℹ️ Только администраторы и основатель могут отвечать на темы.<br>
                    Вы можете создавать свои темы, нажав кнопку "Создать тему".
                </p>
            </div>
        `;
    }
    
    html += '</div>';
    
    document.getElementById('topicContent').innerHTML = html;
    document.getElementById('topicView').style.display = 'block';
    document.getElementById('categoryView').style.display = 'none';
}

// Добавить ответ
function addReply(event, topicId) {
    event.preventDefault();
    
    const user = getCurrentUser();
    if (user.role !== 'admin' && user.role !== 'founder') {
        alert('Только администраторы и основатель могут отвечать на темы!');
        return;
    }
    
    const message = document.getElementById('replyMessage').value;
    
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const topic = topics.find(t => t.id === topicId);
    
    if (topic) {
        if (!topic.replies) topic.replies = [];
        topic.replies.push({
            author: user.nickname,
            authorRole: user.role,
            message,
            date: new Date().toLocaleString('ru-RU')
        });
        
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        openTopic(topicId);
    }
}

// Показать форму создания темы
function showCreateTopicForm() {
    const user = getCurrentUser();
    // Все пользователи могут создавать темы
    
    // Populate category dropdown dynamically
    const categorySelect = document.getElementById('topicCategory');
    const categories = getCategories();
    
    categorySelect.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.key;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    document.getElementById('createTopicModal').style.display = 'block';
}

// Создать тему
function createTopic(event) {
    event.preventDefault();
    
    const user = getCurrentUser();
    // Все пользователи могут создавать темы
    
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const newTopic = {
        id: Date.now(),
        category: document.getElementById('topicCategory').value,
        title: document.getElementById('topicTitle').value,
        author: user.nickname,
        authorRole: user.role,
        message: document.getElementById('topicMessage').value,
        date: new Date().toLocaleString('ru-RU'),
        replies: []
    };
    
    topics.push(newTopic);
    localStorage.setItem('forumTopics', JSON.stringify(topics));
    
    closeModal();
    loadCategories();
    
    alert('Тема успешно создана!');
}

// Закрыть модальные окна
function closeModal() {
    document.getElementById('createTopicModal').style.display = 'none';
    document.getElementById('createTopicForm').reset();
}

function closeCategoryView() {
    document.getElementById('categoryView').style.display = 'none';
}

function closeTopicView() {
    document.getElementById('topicView').style.display = 'none';
    const categoryView = document.getElementById('categoryView');
    if (categoryView.style.display === 'block') {
        // Если была открыта категория, возвращаемся к ней
    } else {
        loadCategories();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initForum);


// Обновить информацию о пользователе
function updateUserInfo(user) {
    const roleText = user.role === 'founder' ? '⭐ Основатель' : user.role === 'admin' ? '👑 Администратор' : '🎮 Игрок';
    const userInfoHTML = `
        <div class="user-info">
            <span>👤 ${user.nickname}</span>
            <span class="user-role">${roleText}</span>
            <button class="btn btn-secondary" onclick="logout()">Выход</button>
        </div>
    `;
    
    // Добавляем информацию о пользователе в навигацию
    const navButtons = document.querySelector('.nav-buttons');
    if (navButtons) {
        navButtons.innerHTML = userInfoHTML;
    }
}
