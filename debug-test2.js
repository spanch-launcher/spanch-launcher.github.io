// Debug test for Property 6

global.localStorage = {
    store: {},
    getItem(key) {
        return this.store[key] || null;
    },
    setItem(key, value) {
        this.store[key] = value.toString();
    },
    removeItem(key) {
        delete this.store[key];
    },
    clear() {
        this.store = {};
    }
};

global.alert = function(message) {
    console.log('ALERT:', message);
};

const fs = require('fs');
const path = require('path');

const storageCode = fs.readFileSync(path.join(__dirname, 'categoryStorage.js'), 'utf8');
eval(storageCode);

function randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function randomEmoji() {
    const emojis = ['😀', '🎉', '💬', '📋', '🏢', '💼', '🎨', '❓', '🐛', '🤝', '⭐', '👑'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function generateRandomCategory() {
    return {
        name: `${randomEmoji()} ${randomString(8)}`,
        icon: randomEmoji(),
        description: randomString(20)
    };
}

// Test Property 6
console.log('Testing Property 6...');
localStorage.clear();
initializeCategories();

const categoryData = generateRandomCategory();
console.log('Category data:', categoryData);

const category = createCategory(
    categoryData.name,
    categoryData.icon,
    categoryData.description
);
console.log('Created category:', category);

const retrievedCategory = getCategoryById(category.id);
console.log('Retrieved category:', retrievedCategory);

console.log('\nComparison:');
console.log('category.name:', category.name);
console.log('categoryData.name.trim():', categoryData.name.trim());
console.log('Match:', category.name === categoryData.name.trim());
