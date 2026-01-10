// Данные форума
const forumCategories = {
    general: { name: '💬 Общие обсуждения', icon: '💬', description: 'Обсуждай игровые механики, делись советами и стратегиями' },
    team: { name: '🤝 Поиск команды', icon: '🤝', description: 'Найди напарников для совместной игры' },
    factions: { name: '🏢 Фракции и организации', icon: '🏢', description: 'Обсуждения фракций, набор участников' },
    trade: { name: '💼 Торговля', icon: '💼', description: 'Покупка и продажа имущества, транспорта' },
    creative: { name: '🎨 Творчество', icon: '🎨', description: 'Скриншоты, видео, истории из игры' },
    help: { name: '❓ Вопросы и помощь', icon: '❓', description: 'Задай вопрос или помоги другим игрокам' },
    bugs: { name: '🐛 Баги и предложения', icon: '🐛', description: 'Сообщи о баге или предложи улучшение' }
};

// Инициализация форума с примерами тем
function initForum() {
    let topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    
    // Добавляем примеры тем, если форум пустой
    if (topics.length === 0) {
        topics = [
            {
                id: 1,
                category: 'general',
                title: 'Как быстро заработать первые деньги?',
                author: 'Новичок2024',
                message: 'Привет всем! Только начал играть на сервере. Подскажите, какие работы лучше всего подходят для новичков? Хочу быстро накопить на первую машину.',
                date: new Date('2024-01-08').toLocaleString('ru-RU'),
                replies: [
                    { author: 'ПроИгрок', message: 'Советую начать с таксиста или курьера. Платят неплохо и не требуют особых навыков.', date: new Date('2024-01-08').toLocaleString('ru-RU') },
                    { author: 'Veteran123', message: 'Еще можно попробовать рыбалку, там спокойно и стабильно зарабатываешь.', date: new Date('2024-01-09').toLocaleString('ru-RU') }
                ]
            },
            {
                id: 2,
                category: 'team',
                title: 'Ищу напарника для ограблений',
                author: 'CrimeBoss',
                message: 'Ищу опытного игрока для совместных ограблений. Желательно с микрофоном и знанием механик. Делим добычу 50/50.',
                date: new Date('2024-01-09').toLocaleString('ru-RU'),
                replies: [
                    { author: 'ShadowMan', message: 'Интересно! Пишу в Discord: ShadowMan#1234', date: new Date('2024-01-09').toLocaleString('ru-RU') }
                ]
            },
            {
                id: 3,
                category: 'factions',
                title: 'Набор в полицию LSPD',
                author: 'ChiefPolice',
                message: 'Департамент полиции Лос-Сантоса объявляет набор новых сотрудников! Требования: возраст персонажа от 18 лет, отсутствие судимостей, активность минимум 3 часа в день. Обращаться в мэрию.',
                date: new Date('2024-01-07').toLocaleString('ru-RU'),
                replies: []
            },
            {
                id: 4,
                category: 'trade',
                title: 'Продаю Elegy Retro Custom',
                author: 'CarDealer',
                message: 'Продаю Elegy Retro Custom в отличном состоянии. Полный тюнинг, все улучшения. Цена: 850,000$. Торг уместен.',
                date: new Date('2024-01-10').toLocaleString('ru-RU'),
                replies: [
                    { author: 'Buyer1', message: 'За 750к возьму прямо сейчас', date: new Date('2024-01-10').toLocaleString('ru-RU') }
                ]
            },
            {
                id: 5,
                category: 'help',
                title: 'Не могу зайти на сервер',
                author: 'HelpMe',
                message: 'При попытке зайти на сервер выдает ошибку подключения. Что делать?',
                date: new Date('2024-01-10').toLocaleString('ru-RU'),
                replies: [
                    { author: 'TechSupport', message: 'Попробуй перезапустить FiveM и проверь интернет-соединение.', date: new Date('2024-01-10').toLocaleString('ru-RU') }
                ]
            }
        ];
        localStorage.setItem('forumTopics', JSON.stringify(topics));
    }
    
    loadCategories();
}

// Загрузка категорий
function loadCategories() {
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const categoryList = document.getElementById('categoryList');
    
    let html = '';
    for (const [key, category] of Object.entries(forumCategories)) {
        const categoryTopics = topics.filter(t => t.category === key);
        const topicCount = categoryTopics.length;
        const replyCount = categoryTopics.reduce((sum, t) => sum + (t.replies?.length || 0), 0);
        
        html += `
            <div class="category-item" onclick="openCategory('${key}')">
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
    }
    
    categoryList.innerHTML = html;
}

// Открыть категорию
function openCategory(categoryKey) {
    const category = forumCategories[categoryKey];
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
    
    if (!topic) return;
    
    let html = `
        <div class="topic-detail">
            <h2>${topic.title}</h2>
            <div class="topic-meta">
                <span>👤 ${topic.author}</span>
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
                    <div class="reply-author">👤 ${reply.author}</div>
                    <div class="reply-date">📅 ${reply.date}</div>
                    <div class="reply-message">${reply.message}</div>
                </div>
            `;
        });
    } else {
        html += '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">Пока нет ответов</p>';
    }
    
    html += `
            </div>
            
            <div class="reply-form">
                <h3>Ответить</h3>
                <form onsubmit="addReply(event, ${topicId})">
                    <div class="form-group">
                        <input type="text" id="replyAuthor" placeholder="Ваш ник" required>
                    </div>
                    <div class="form-group">
                        <textarea id="replyMessage" rows="4" placeholder="Ваш ответ..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Отправить ответ</button>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('topicContent').innerHTML = html;
    document.getElementById('topicView').style.display = 'block';
    document.getElementById('categoryView').style.display = 'none';
}

// Добавить ответ
function addReply(event, topicId) {
    event.preventDefault();
    
    const author = document.getElementById('replyAuthor').value;
    const message = document.getElementById('replyMessage').value;
    
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const topic = topics.find(t => t.id === topicId);
    
    if (topic) {
        if (!topic.replies) topic.replies = [];
        topic.replies.push({
            author,
            message,
            date: new Date().toLocaleString('ru-RU')
        });
        
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        openTopic(topicId);
    }
}

// Показать форму создания темы
function showCreateTopicForm() {
    document.getElementById('createTopicModal').style.display = 'block';
}

// Создать тему
function createTopic(event) {
    event.preventDefault();
    
    const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
    const newTopic = {
        id: Date.now(),
        category: document.getElementById('topicCategory').value,
        title: document.getElementById('topicTitle').value,
        author: document.getElementById('authorName').value,
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
