// Плавная прокрутка для навигации
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Изменение навигации при прокрутке
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Анимация появления элементов при прокрутке
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за карточками
document.querySelectorAll('.about-card, .feature-item, .rule-card, .donate-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Счетчик для статистики
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + '+';
        }
    }, 16);
}

// Запуск счетчика при загрузке страницы
window.addEventListener('load', () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        setTimeout(() => {
            animateCounter(statNumbers[0], 500);
        }, 500);
    }
});

// Добавление эффекта частиц на фон (опционально)
function createParticles() {
    const hero = document.querySelector('.hero');
    const particlesCount = 50;
    
    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 5}s infinite ease-in-out;
            pointer-events: none;
        `;
        hero.appendChild(particle);
    }
}

// CSS для анимации частиц
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
        }
        50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.8;
        }
    }
`;
document.head.appendChild(style);

// Запуск создания частиц
createParticles();

// Мобильное меню (если нужно)
const createMobileMenu = () => {
    const navbar = document.querySelector('.navbar .container');
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-btn';
    menuButton.innerHTML = '☰';
    menuButton.style.cssText = `
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
    `;
    
    if (window.innerWidth <= 768) {
        menuButton.style.display = 'block';
        navbar.appendChild(menuButton);
        
        menuButton.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.right = '0';
            navMenu.style.background = 'rgba(15, 23, 42, 0.98)';
            navMenu.style.padding = '1rem';
        });
    }
};

window.addEventListener('resize', createMobileMenu);
createMobileMenu();

console.log('NLRP Website loaded successfully! 🎮');


// Обработка формы форума
const forumForm = document.getElementById('forumForm');
if (forumForm) {
    forumForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем данные формы
        const formData = {
            nickname: document.getElementById('nickname').value,
            category: document.getElementById('category').value,
            title: document.getElementById('title').value,
            message: document.getElementById('message').value,
            contact: document.getElementById('contact').value,
            timestamp: new Date().toLocaleString('ru-RU')
        };
        
        // Здесь можно отправить данные на сервер
        console.log('Отправка темы на форум:', formData);
        
        // Показываем сообщение об успехе
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = '✓ Ваша тема успешно отправлена! Модераторы рассмотрят её в ближайшее время.';
        
        const formContainer = document.querySelector('.forum-form-container');
        formContainer.insertBefore(successMessage, forumForm);
        
        // Очищаем форму
        forumForm.reset();
        
        // Прокручиваем к сообщению
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Удаляем сообщение через 5 секунд
        setTimeout(() => {
            successMessage.style.transition = 'opacity 0.5s';
            successMessage.style.opacity = '0';
            setTimeout(() => successMessage.remove(), 500);
        }, 5000);
    });
}
