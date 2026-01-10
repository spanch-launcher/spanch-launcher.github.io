// Category Storage Module
// Manages forum categories in LocalStorage

const STORAGE_KEY = 'forumCategories';

/**
 * Generate a unique key from category name
 * @param {string} name - Category name
 * @returns {string} - Unique key
 */
function generateCategoryKey(name) {
    // Remove emoji and special characters, convert to lowercase
    const cleanName = name.replace(/[^\w\s]/gi, '').trim().toLowerCase();
    // Replace spaces with hyphens
    const key = cleanName.replace(/\s+/g, '-');
    // Add timestamp to ensure uniqueness
    return key ? `${key}-${Date.now()}` : `category-${Date.now()}`;
}

/**
 * Validate category data
 * @param {string} name - Category name
 * @param {string} icon - Category icon
 * @param {string} description - Category description
 * @returns {Object} - Validation result {valid: boolean, error: string}
 */
function validateCategoryData(name, icon, description) {
    if (!name || name.trim() === '') {
        return { valid: false, error: 'Название категории не может быть пустым' };
    }
    if (!icon || icon.trim() === '') {
        return { valid: false, error: 'Иконка категории обязательна' };
    }
    if (!description || description.trim() === '') {
        return { valid: false, error: 'Описание категории не может быть пустым' };
    }
    return { valid: true, error: null };
}

/**
 * Get all categories from LocalStorage
 * @returns {Array} - Array of category objects
 */
function getCategories() {
    try {
        const categories = localStorage.getItem(STORAGE_KEY);
        return categories ? JSON.parse(categories) : [];
    } catch (error) {
        console.error('Error loading categories:', error);
        return [];
    }
}

/**
 * Get category by key
 * @param {string} key - Category key
 * @returns {Object|null} - Category object or null if not found
 */
function getCategoryByKey(key) {
    const categories = getCategories();
    return categories.find(cat => cat.key === key) || null;
}

/**
 * Get category by id
 * @param {number} id - Category id
 * @returns {Object|null} - Category object or null if not found
 */
function getCategoryById(id) {
    const categories = getCategories();
    return categories.find(cat => cat.id === id) || null;
}

/**
 * Save categories to LocalStorage
 * @param {Array} categories - Array of category objects
 * @returns {boolean} - Success status
 */
function saveCategories(categories) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
        return true;
    } catch (error) {
        console.error('Error saving categories:', error);
        alert('Ошибка сохранения данных. Проверьте настройки браузера');
        return false;
    }
}

/**
 * Create a new category
 * @param {string} name - Category name
 * @param {string} icon - Category icon (emoji)
 * @param {string} description - Category description
 * @returns {Object|null} - Created category object or null if validation fails
 */
function createCategory(name, icon, description) {
    // Validate input
    const validation = validateCategoryData(name, icon, description);
    if (!validation.valid) {
        alert(validation.error);
        return null;
    }

    const categories = getCategories();
    
    // Create new category
    const newCategory = {
        id: Date.now(),
        key: generateCategoryKey(name),
        name: name.trim(),
        icon: icon.trim(),
        description: description.trim(),
        createdAt: new Date().toLocaleString('ru-RU'),
        protected: false
    };

    categories.push(newCategory);
    
    if (saveCategories(categories)) {
        return newCategory;
    }
    
    return null;
}

/**
 * Update an existing category
 * @param {number} id - Category id
 * @param {Object} updates - Object with fields to update
 * @returns {boolean} - Success status
 */
function updateCategory(id, updates) {
    const categories = getCategories();
    const index = categories.findIndex(cat => cat.id === id);
    
    if (index === -1) {
        alert('Категория не найдена');
        return false;
    }

    // Validate if name, icon, or description are being updated
    if (updates.name !== undefined || updates.icon !== undefined || updates.description !== undefined) {
        const currentCategory = categories[index];
        const validation = validateCategoryData(
            updates.name !== undefined ? updates.name : currentCategory.name,
            updates.icon !== undefined ? updates.icon : currentCategory.icon,
            updates.description !== undefined ? updates.description : currentCategory.description
        );
        
        if (!validation.valid) {
            alert(validation.error);
            return false;
        }
    }

    // Update category (preserve protected status and key)
    categories[index] = {
        ...categories[index],
        ...updates,
        id: categories[index].id, // Don't allow id change
        key: categories[index].key, // Don't allow key change
        protected: categories[index].protected, // Don't allow protected status change
        createdAt: categories[index].createdAt // Don't allow createdAt change
    };

    return saveCategories(categories);
}

/**
 * Delete a category
 * @param {number} id - Category id
 * @returns {boolean} - Success status
 */
function deleteCategory(id) {
    const categories = getCategories();
    const category = categories.find(cat => cat.id === id);
    
    if (!category) {
        alert('Категория не найдена');
        return false;
    }

    if (category.protected) {
        alert('Невозможно удалить защищенную категорию');
        return false;
    }

    // Remove category
    const updatedCategories = categories.filter(cat => cat.id !== id);
    
    if (saveCategories(updatedCategories)) {
        // Also delete all topics in this category
        try {
            const topics = JSON.parse(localStorage.getItem('forumTopics')) || [];
            const updatedTopics = topics.filter(topic => topic.category !== category.key);
            localStorage.setItem('forumTopics', JSON.stringify(updatedTopics));
        } catch (error) {
            // If topics don't exist or there's an error, continue anyway
            console.error('Error deleting topics:', error);
        }
        return true;
    }
    
    return false;
}

/**
 * Initialize default categories if none exist
 */
function initializeCategories() {
    const categories = getCategories();
    
    // If no categories exist, create the default "Общие правила" category
    if (categories.length === 0) {
        const defaultCategory = {
            id: Date.now(),
            key: 'general-rules',
            name: '📋 Общие правила',
            icon: '📋',
            description: 'Правила сервера и важные объявления',
            createdAt: new Date().toLocaleString('ru-RU'),
            protected: true
        };
        
        saveCategories([defaultCategory]);
    } else {
        // Ensure "Общие правила" category always exists
        const hasGeneralRules = categories.some(cat => cat.key === 'general-rules');
        if (!hasGeneralRules) {
            const defaultCategory = {
                id: Date.now(),
                key: 'general-rules',
                name: '📋 Общие правила',
                icon: '📋',
                description: 'Правила сервера и важные объявления',
                createdAt: new Date().toLocaleString('ru-RU'),
                protected: true
            };
            categories.unshift(defaultCategory); // Add at the beginning
            saveCategories(categories);
        }
    }
}
