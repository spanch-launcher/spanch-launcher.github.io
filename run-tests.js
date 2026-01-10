// Simple test runner for Node.js
// Run with: node run-tests.js

// Mock localStorage for Node.js environment
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

// Mock alert for Node.js environment
global.alert = function(message) {
    // Silently ignore alerts in tests
};

// Load the category storage module
const fs = require('fs');
const path = require('path');

// Read and execute categoryStorage.js
const storageCode = fs.readFileSync(path.join(__dirname, 'categoryStorage.js'), 'utf8');
eval(storageCode);

// Read and execute test file
const testCode = fs.readFileSync(path.join(__dirname, 'categoryStorage.test.js'), 'utf8');
eval(testCode);

console.log('\nTests completed!');
const failedCount = (typeof testResults !== 'undefined') ? testResults.filter(r => r.status === 'FAILED').length : 0;
process.exit(failedCount > 0 ? 1 : 0);
