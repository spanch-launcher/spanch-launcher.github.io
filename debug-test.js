// Debug test to find the issue

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

// Test deletion
console.log('Testing category deletion...');
localStorage.clear();
initializeCategories();

const cat = createCategory('Test', '🎉', 'Test desc');
console.log('Created category:', cat);

const topics = [
    {
        id: Date.now(),
        category: cat.key,
        title: 'Test topic',
        author: 'Test',
        message: 'Test',
        date: new Date().toLocaleString('ru-RU'),
        replies: []
    }
];

localStorage.setItem('forumTopics', JSON.stringify(topics));
console.log('Topics before deletion:', localStorage.getItem('forumTopics'));

const result = deleteCategory(cat.id);
console.log('Delete result:', result);
console.log('Topics after deletion:', localStorage.getItem('forumTopics'));
console.log('Categories after deletion:', getCategories());
