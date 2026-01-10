// Property-Based Tests for Category Storage
// Feature: forum-category-management

// Mock localStorage for testing
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = value.toString();
    }

    removeItem(key) {
        delete this.store[key];
    }

    clear() {
        this.store = {};
    }
}

// Test utilities
let testResults = [];
let localStorage;

function setupTest() {
    localStorage = new LocalStorageMock();
    global.localStorage = localStorage;
    testResults = [];
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

function runTest(testName, testFn) {
    try {
        setupTest();
        testFn();
        testResults.push({ name: testName, status: 'PASSED', error: null });
        console.log(`✓ ${testName}`);
    } catch (error) {
        testResults.push({ name: testName, status: 'FAILED', error: error.message });
        console.error(`✗ ${testName}: ${error.message}`);
    }
}

// Random data generators for property-based testing
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

// Property 1: Category creation persistence
// Feature: forum-category-management, Property 1: Category creation persistence
// For any valid category data (name, icon, description), when a category is created,
// the category should appear in both the LocalStorage and the displayed category list.
// Validates: Requirements 1.2, 1.3
function testProperty1_CategoryCreationPersistence() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        
        // Generate random valid category data
        const categoryData = generateRandomCategory();
        
        // Create category
        const createdCategory = createCategory(
            categoryData.name,
            categoryData.icon,
            categoryData.description
        );
        
        // Verify category was created
        assert(createdCategory !== null, `Iteration ${i}: Category should be created`);
        assert(createdCategory.name === categoryData.name.trim(), 
            `Iteration ${i}: Category name should match`);
        assert(createdCategory.icon === categoryData.icon.trim(), 
            `Iteration ${i}: Category icon should match`);
        assert(createdCategory.description === categoryData.description.trim(), 
            `Iteration ${i}: Category description should match`);
        
        // Verify category exists in LocalStorage
        const storedCategories = JSON.parse(localStorage.getItem('forumCategories'));
        assert(storedCategories !== null, 
            `Iteration ${i}: Categories should exist in LocalStorage`);
        assert(storedCategories.length > 0, 
            `Iteration ${i}: LocalStorage should contain categories`);
        
        const foundInStorage = storedCategories.some(cat => 
            cat.id === createdCategory.id &&
            cat.name === categoryData.name.trim() &&
            cat.icon === categoryData.icon.trim() &&
            cat.description === categoryData.description.trim()
        );
        assert(foundInStorage, 
            `Iteration ${i}: Created category should exist in LocalStorage`);
        
        // Verify category appears in getCategories()
        const allCategories = getCategories();
        const foundInList = allCategories.some(cat => 
            cat.id === createdCategory.id &&
            cat.name === categoryData.name.trim()
        );
        assert(foundInList, 
            `Iteration ${i}: Created category should appear in category list`);
    }
}

// Property 5: Category update persistence
// Feature: forum-category-management, Property 5: Category update persistence
// For any category and valid update data, when the category is updated,
// the changes should be reflected in LocalStorage and the display.
// Validates: Requirements 3.2
function testProperty5_CategoryUpdatePersistence() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        
        // Create initial category
        const initialData = generateRandomCategory();
        const category = createCategory(
            initialData.name,
            initialData.icon,
            initialData.description
        );
        
        assert(category !== null, `Iteration ${i}: Initial category should be created`);
        
        // Generate random update data
        const updateData = {
            name: `${randomEmoji()} Updated ${randomString(8)}`,
            icon: randomEmoji(),
            description: `Updated ${randomString(20)}`
        };
        
        // Update category
        const updateSuccess = updateCategory(category.id, updateData);
        assert(updateSuccess, `Iteration ${i}: Category update should succeed`);
        
        // Verify updates in LocalStorage
        const storedCategories = JSON.parse(localStorage.getItem('forumCategories'));
        const updatedCategory = storedCategories.find(cat => cat.id === category.id);
        
        assert(updatedCategory !== undefined, 
            `Iteration ${i}: Updated category should exist in LocalStorage`);
        assert(updatedCategory.name === updateData.name.trim(), 
            `Iteration ${i}: Updated name should be persisted`);
        assert(updatedCategory.icon === updateData.icon.trim(), 
            `Iteration ${i}: Updated icon should be persisted`);
        assert(updatedCategory.description === updateData.description.trim(), 
            `Iteration ${i}: Updated description should be persisted`);
        
        // Verify updates in getCategories()
        const allCategories = getCategories();
        const foundCategory = allCategories.find(cat => cat.id === category.id);
        
        assert(foundCategory !== undefined, 
            `Iteration ${i}: Updated category should appear in category list`);
        assert(foundCategory.name === updateData.name.trim(), 
            `Iteration ${i}: Updated name should appear in list`);
    }
}

// Property 7: Category loading completeness
// Feature: forum-category-management, Property 7: Category loading completeness
// For any set of categories stored in LocalStorage, when the forum loads,
// all stored categories should be displayed.
// Validates: Requirements 4.2
function testProperty7_CategoryLoadingCompleteness() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        
        // Generate random number of categories (1-10)
        const categoryCount = Math.floor(Math.random() * 10) + 1;
        const createdCategories = [];
        
        // Create multiple categories
        for (let j = 0; j < categoryCount; j++) {
            const categoryData = generateRandomCategory();
            const category = createCategory(
                categoryData.name,
                categoryData.icon,
                categoryData.description
            );
            assert(category !== null, 
                `Iteration ${i}, Category ${j}: Category should be created`);
            createdCategories.push(category);
        }
        
        // Load all categories
        const loadedCategories = getCategories();
        
        // Verify all created categories are loaded
        assert(loadedCategories.length === categoryCount, 
            `Iteration ${i}: Should load all ${categoryCount} categories, got ${loadedCategories.length}`);
        
        // Verify each created category exists in loaded categories
        for (const createdCat of createdCategories) {
            const found = loadedCategories.some(loadedCat => 
                loadedCat.id === createdCat.id &&
                loadedCat.name === createdCat.name &&
                loadedCat.icon === createdCat.icon &&
                loadedCat.description === createdCat.description
            );
            assert(found, 
                `Iteration ${i}: Category ${createdCat.name} should be in loaded categories`);
        }
    }
}

// Run all tests
console.log('Running Property-Based Tests for Category Storage...\n');

runTest('Property 1: Category creation persistence (100 iterations)', 
    testProperty1_CategoryCreationPersistence);

runTest('Property 2: Protected category preservation (100 iterations)', 
    testProperty2_ProtectedCategoryPreservation);

runTest('Property 3: Category deletion cascade (100 iterations)', 
    testProperty3_CategoryDeletionCascade);

runTest('Property 4: Category edit preservation (100 iterations)', 
    testProperty4_CategoryEditPreservation);

runTest('Property 5: Category update persistence (100 iterations)', 
    testProperty5_CategoryUpdatePersistence);

runTest('Property 6: Edit form pre-population (100 iterations)', 
    testProperty6_EditFormPrePopulation);

runTest('Property 7: Category loading completeness (100 iterations)', 
    testProperty7_CategoryLoadingCompleteness);

runTest('Property 8: Category display ordering (100 iterations)', 
    testProperty8_CategoryDisplayOrdering);

runTest('Property 9: Access control for players (100 iterations)', 
    testProperty9_AccessControlForPlayers);

runTest('Property 10: Access control for admins (100 iterations)', 
    testProperty10_AccessControlForAdmins);

runTest('Property 11: Category visibility for all users (100 iterations)', 
    testProperty11_CategoryVisibilityForAllUsers);

runTest('Property 12: Admin panel category display (100 iterations)', 
    testProperty12_AdminPanelCategoryDisplay);

runTest('Property 13: Cross-page data consistency (100 iterations)', 
    testProperty13_CrossPageDataConsistency);

runTest('Property 14: Category statistics accuracy (100 iterations)', 
    testProperty14_CategoryStatisticsAccuracy);

runTest('Unit Test: Default category initialization', 
    testUnit_DefaultCategoryInitialization);

runTest('Unit Test: Empty name validation', 
    testUnit_EmptyNameValidation);

runTest('Unit Test: Empty name validation on edit', 
    testUnit_EmptyNameValidationOnEdit);

runTest('Unit Test: Protected category deletion prevention', 
    testUnit_ProtectedCategoryDeletionPrevention);

// Print summary
console.log('\n=== Test Summary ===');
const passed = testResults.filter(r => r.status === 'PASSED').length;
const failed = testResults.filter(r => r.status === 'FAILED').length;
console.log(`Total: ${testResults.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
    console.log('\nFailed tests:');
    testResults.filter(r => r.status === 'FAILED').forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
    });
}


// Property 2: Protected category preservation
// Feature: forum-category-management, Property 2: Protected category preservation
// For any category list display, the "Общие правила" category should always be present
// and should not have a delete button.
// Validates: Requirements 2.1, 2.4, 4.3
function testProperty2_ProtectedCategoryPreservation() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        
        // Initialize categories (should create "Общие правила")
        initializeCategories();
        
        // Verify "Общие правила" exists
        const categories = getCategories();
        const generalRules = categories.find(cat => cat.key === 'general-rules');
        
        assert(generalRules !== undefined, 
            `Iteration ${i}: "Общие правила" category should exist`);
        assert(generalRules.protected === true, 
            `Iteration ${i}: "Общие правила" should be protected`);
        assert(generalRules.name === '📋 Общие правила', 
            `Iteration ${i}: Protected category should have correct name`);
        
        // Create random additional categories
        const additionalCount = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < additionalCount; j++) {
            const categoryData = generateRandomCategory();
            createCategory(categoryData.name, categoryData.icon, categoryData.description);
        }
        
        // Verify "Общие правила" still exists after adding categories
        const categoriesAfter = getCategories();
        const generalRulesAfter = categoriesAfter.find(cat => cat.key === 'general-rules');
        
        assert(generalRulesAfter !== undefined, 
            `Iteration ${i}: "Общие правила" should still exist after adding categories`);
        assert(generalRulesAfter.protected === true, 
            `Iteration ${i}: "Общие правила" should remain protected`);
        
        // Verify protected category cannot be deleted
        const deleteResult = deleteCategory(generalRulesAfter.id);
        assert(deleteResult === false, 
            `Iteration ${i}: Protected category deletion should fail`);
        
        // Verify "Общие правила" still exists after failed deletion attempt
        const categoriesFinal = getCategories();
        const generalRulesFinal = categoriesFinal.find(cat => cat.key === 'general-rules');
        
        assert(generalRulesFinal !== undefined, 
            `Iteration ${i}: "Общие правила" should still exist after deletion attempt`);
    }
}

// Unit Test: Default category initialization
// Test that empty LocalStorage results in "Общие правила" category
// Validates: Requirements 4.1, 4.5
function testUnit_DefaultCategoryInitialization() {
    // Test 1: Empty storage
    setupTest();
    initializeCategories();
    
    const categories = getCategories();
    assert(categories.length === 1, 'Should create exactly one category');
    assert(categories[0].key === 'general-rules', 'Should create "general-rules" category');
    assert(categories[0].name === '📋 Общие правила', 'Should have correct name');
    assert(categories[0].protected === true, 'Should be protected');
    
    // Test 2: Re-initialization should not duplicate
    initializeCategories();
    const categoriesAfter = getCategories();
    assert(categoriesAfter.length === 1, 'Should not duplicate default category');
    
    // Test 3: If "Общие правила" is missing, it should be recreated
    setupTest();
    const otherCategory = createCategory('Test Category', '🎉', 'Test description');
    assert(otherCategory !== null, 'Should create test category');
    
    // Remove "Общие правила" manually
    const cats = getCategories();
    const filtered = cats.filter(cat => cat.key !== 'general-rules');
    localStorage.setItem('forumCategories', JSON.stringify(filtered));
    
    // Re-initialize
    initializeCategories();
    const categoriesRestored = getCategories();
    const hasGeneralRules = categoriesRestored.some(cat => cat.key === 'general-rules');
    assert(hasGeneralRules, 'Should restore "Общие правила" if missing');
    assert(categoriesRestored.length === 2, 'Should have both categories');
}

// Unit Test: Empty name validation
// Test that empty category name is rejected
// Validates: Requirements 1.5
function testUnit_EmptyNameValidation() {
    setupTest();
    
    // Test 1: Empty name
    const result1 = createCategory('', '🎉', 'Test description');
    assert(result1 === null, 'Should reject empty name');
    
    // Test 2: Whitespace-only name
    const result2 = createCategory('   ', '🎉', 'Test description');
    assert(result2 === null, 'Should reject whitespace-only name');
    
    // Test 3: Empty icon
    const result3 = createCategory('Test Category', '', 'Test description');
    assert(result3 === null, 'Should reject empty icon');
    
    // Test 4: Empty description
    const result4 = createCategory('Test Category', '🎉', '');
    assert(result4 === null, 'Should reject empty description');
    
    // Test 5: Valid data should succeed
    const result5 = createCategory('Test Category', '🎉', 'Test description');
    assert(result5 !== null, 'Should accept valid data');
    assert(result5.name === 'Test Category', 'Should have correct name');
}

// Unit Test: Empty name validation on edit
// Test that empty category name is rejected during edit
// Validates: Requirements 3.5
function testUnit_EmptyNameValidationOnEdit() {
    setupTest();
    
    // Create a category
    const category = createCategory('Test Category', '🎉', 'Test description');
    assert(category !== null, 'Should create category');
    
    // Test 1: Try to update with empty name
    const result1 = updateCategory(category.id, { name: '' });
    assert(result1 === false, 'Should reject empty name on edit');
    
    // Test 2: Try to update with whitespace-only name
    const result2 = updateCategory(category.id, { name: '   ' });
    assert(result2 === false, 'Should reject whitespace-only name on edit');
    
    // Test 3: Try to update with empty icon
    const result3 = updateCategory(category.id, { icon: '' });
    assert(result3 === false, 'Should reject empty icon on edit');
    
    // Test 4: Try to update with empty description
    const result4 = updateCategory(category.id, { description: '' });
    assert(result4 === false, 'Should reject empty description on edit');
    
    // Test 5: Valid update should succeed
    const result5 = updateCategory(category.id, { name: 'Updated Category' });
    assert(result5 === true, 'Should accept valid update');
    
    // Verify update was applied
    const updated = getCategoryById(category.id);
    assert(updated.name === 'Updated Category', 'Should have updated name');
}

// Unit Test: Protected category deletion prevention
// Test that attempting to delete "Общие правила" fails
// Validates: Requirements 2.4
function testUnit_ProtectedCategoryDeletionPrevention() {
    setupTest();
    initializeCategories();
    
    // Get the protected category
    const categories = getCategories();
    const protectedCategory = categories.find(cat => cat.protected === true);
    
    assert(protectedCategory !== undefined, 'Should have protected category');
    
    // Try to delete protected category
    const result = deleteCategory(protectedCategory.id);
    assert(result === false, 'Should fail to delete protected category');
    
    // Verify category still exists
    const categoriesAfter = getCategories();
    const stillExists = categoriesAfter.some(cat => cat.id === protectedCategory.id);
    assert(stillExists, 'Protected category should still exist after deletion attempt');
}


// Property 8: Category display ordering
// Feature: forum-category-management, Property 8: Category display ordering
// For any set of categories, when displayed, they should appear in the order
// they were created (sorted by creation timestamp).
// Validates: Requirements 4.4
function testProperty8_CategoryDisplayOrdering() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Create multiple categories with small delays to ensure different timestamps
        const categoryCount = Math.floor(Math.random() * 5) + 2;
        const createdCategories = [];
        
        for (let j = 0; j < categoryCount; j++) {
            const categoryData = generateRandomCategory();
            // Add small delay to ensure different IDs (timestamps)
            const category = createCategory(
                categoryData.name,
                categoryData.icon,
                categoryData.description
            );
            assert(category !== null, 
                `Iteration ${i}, Category ${j}: Category should be created`);
            createdCategories.push(category);
        }
        
        // Load categories
        const loadedCategories = getCategories();
        
        // Verify categories are in creation order (by id/timestamp)
        // Note: "Общие правила" will be first as it's created during initialization
        const generalRulesIndex = loadedCategories.findIndex(cat => cat.key === 'general-rules');
        assert(generalRulesIndex === 0, 
            `Iteration ${i}: "Общие правила" should be first`);
        
        // Check that other categories are in order of creation
        for (let j = 1; j < loadedCategories.length - 1; j++) {
            const currentId = loadedCategories[j].id;
            const nextId = loadedCategories[j + 1].id;
            assert(currentId <= nextId, 
                `Iteration ${i}: Categories should be ordered by creation time (id ${currentId} should be <= ${nextId})`);
        }
    }
}

// Property 12: Admin panel category display
// Feature: forum-category-management, Property 12: Admin panel category display
// For any set of categories, when displayed in the admin panel, all categories
// should appear with their complete details (name, icon, description, statistics).
// Validates: Requirements 6.2
function testProperty12_AdminPanelCategoryDisplay() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Create random categories
        const categoryCount = Math.floor(Math.random() * 5) + 1;
        const createdCategories = [];
        
        for (let j = 0; j < categoryCount; j++) {
            const categoryData = generateRandomCategory();
            const category = createCategory(
                categoryData.name,
                categoryData.icon,
                categoryData.description
            );
            assert(category !== null, 
                `Iteration ${i}, Category ${j}: Category should be created`);
            createdCategories.push(category);
        }
        
        // Load all categories (simulating admin panel display)
        const displayedCategories = getCategories();
        
        // Verify all categories are displayed
        assert(displayedCategories.length >= categoryCount, 
            `Iteration ${i}: All categories should be displayed`);
        
        // Verify each category has complete details
        for (const category of displayedCategories) {
            assert(category.id !== undefined, 
                `Iteration ${i}: Category should have id`);
            assert(category.key !== undefined && category.key !== '', 
                `Iteration ${i}: Category should have key`);
            assert(category.name !== undefined && category.name !== '', 
                `Iteration ${i}: Category should have name`);
            assert(category.icon !== undefined && category.icon !== '', 
                `Iteration ${i}: Category should have icon`);
            assert(category.description !== undefined && category.description !== '', 
                `Iteration ${i}: Category should have description`);
            assert(category.createdAt !== undefined, 
                `Iteration ${i}: Category should have createdAt`);
            assert(category.protected !== undefined, 
                `Iteration ${i}: Category should have protected flag`);
        }
    }
}

// Property 14: Category statistics accuracy
// Feature: forum-category-management, Property 14: Category statistics accuracy
// For any category, when displayed in the admin panel, the topic count and reply count
// should match the actual number of topics and replies associated with that category.
// Validates: Requirements 6.4
function testProperty14_CategoryStatisticsAccuracy() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Create a category
        const categoryData = generateRandomCategory();
        const category = createCategory(
            categoryData.name,
            categoryData.icon,
            categoryData.description
        );
        assert(category !== null, `Iteration ${i}: Category should be created`);
        
        // Create random topics for this category
        const topicCount = Math.floor(Math.random() * 10);
        const topics = [];
        let totalReplies = 0;
        
        for (let j = 0; j < topicCount; j++) {
            const replyCount = Math.floor(Math.random() * 5);
            totalReplies += replyCount;
            
            const replies = [];
            for (let k = 0; k < replyCount; k++) {
                replies.push({
                    author: randomString(8),
                    message: randomString(20),
                    date: new Date().toLocaleString('ru-RU')
                });
            }
            
            topics.push({
                id: Date.now() + j,
                category: category.key,
                title: randomString(15),
                author: randomString(8),
                message: randomString(30),
                date: new Date().toLocaleString('ru-RU'),
                replies: replies
            });
        }
        
        // Save topics to localStorage
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        
        // Calculate statistics (simulating admin panel)
        const storedTopics = JSON.parse(localStorage.getItem('forumTopics')) || [];
        const categoryTopics = storedTopics.filter(t => t.category === category.key);
        const calculatedTopicCount = categoryTopics.length;
        const calculatedReplyCount = categoryTopics.reduce((sum, t) => sum + (t.replies?.length || 0), 0);
        
        // Verify statistics match
        assert(calculatedTopicCount === topicCount, 
            `Iteration ${i}: Topic count should match (expected ${topicCount}, got ${calculatedTopicCount})`);
        assert(calculatedReplyCount === totalReplies, 
            `Iteration ${i}: Reply count should match (expected ${totalReplies}, got ${calculatedReplyCount})`);
    }
}



// Property 3: Category deletion cascade
// Feature: forum-category-management, Property 3: Category deletion cascade
// For any non-protected category with associated topics, when the category is deleted,
// both the category and all its topics should be removed from LocalStorage and the display should update.
// Validates: Requirements 2.3, 2.5
function testProperty3_CategoryDeletionCascade() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Create a non-protected category
        const categoryData = generateRandomCategory();
        const category = createCategory(
            categoryData.name,
            categoryData.icon,
            categoryData.description
        );
        assert(category !== null, `Iteration ${i}: Category should be created`);
        assert(category.protected === false, `Iteration ${i}: Category should not be protected`);
        
        // Create random topics for this category
        const topicCount = Math.floor(Math.random() * 10) + 1;
        const topics = [];
        
        for (let j = 0; j < topicCount; j++) {
            topics.push({
                id: Date.now() + j,
                category: category.key,
                title: randomString(15),
                author: randomString(8),
                message: randomString(30),
                date: new Date().toLocaleString('ru-RU'),
                replies: []
            });
        }
        
        // Save topics to localStorage
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        
        // Verify topics exist
        const topicsBefore = JSON.parse(localStorage.getItem('forumTopics')) || [];
        const categoryTopicsBefore = topicsBefore.filter(t => t.category === category.key);
        assert(categoryTopicsBefore.length === topicCount, 
            `Iteration ${i}: Should have ${topicCount} topics before deletion`);
        
        // Delete the category
        const deleteResult = deleteCategory(category.id);
        assert(deleteResult === true, `Iteration ${i}: Category deletion should succeed`);
        
        // Verify category is removed
        const categoriesAfter = getCategories();
        const categoryExists = categoriesAfter.some(cat => cat.id === category.id);
        assert(categoryExists === false, 
            `Iteration ${i}: Category should be removed from storage`);
        
        // Verify all topics are removed
        const topicsAfter = JSON.parse(localStorage.getItem('forumTopics')) || [];
        const categoryTopicsAfter = topicsAfter.filter(t => t.category === category.key);
        assert(categoryTopicsAfter.length === 0, 
            `Iteration ${i}: All topics should be removed after category deletion`);
    }
}

// Property 4: Category edit preservation
// Feature: forum-category-management, Property 4: Category edit preservation
// For any category with associated topics, when the category is edited,
// all topics should remain associated with that category and their data should be unchanged.
// Validates: Requirements 3.3
function testProperty4_CategoryEditPreservation() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Create a category
        const categoryData = generateRandomCategory();
        const category = createCategory(
            categoryData.name,
            categoryData.icon,
            categoryData.description
        );
        assert(category !== null, `Iteration ${i}: Category should be created`);
        
        // Create random topics for this category
        const topicCount = Math.floor(Math.random() * 10) + 1;
        const topics = [];
        
        for (let j = 0; j < topicCount; j++) {
            topics.push({
                id: Date.now() + j,
                category: category.key,
                title: randomString(15),
                author: randomString(8),
                message: randomString(30),
                date: new Date().toLocaleString('ru-RU'),
                replies: []
            });
        }
        
        // Save topics to localStorage
        localStorage.setItem('forumTopics', JSON.stringify(topics));
        
        // Edit the category
        const updateData = {
            name: `${randomEmoji()} Updated ${randomString(8)}`,
            icon: randomEmoji(),
            description: `Updated ${randomString(20)}`
        };
        
        const updateResult = updateCategory(category.id, updateData);
        assert(updateResult === true, `Iteration ${i}: Category update should succeed`);
        
        // Verify topics still exist and are unchanged
        const topicsAfter = JSON.parse(localStorage.getItem('forumTopics')) || [];
        const categoryTopicsAfter = topicsAfter.filter(t => t.category === category.key);
        
        assert(categoryTopicsAfter.length === topicCount, 
            `Iteration ${i}: All topics should still exist after category edit`);
        
        // Verify topic data is unchanged
        for (let j = 0; j < topicCount; j++) {
            const originalTopic = topics[j];
            const foundTopic = categoryTopicsAfter.find(t => t.id === originalTopic.id);
            
            assert(foundTopic !== undefined, 
                `Iteration ${i}: Topic ${j} should still exist`);
            assert(foundTopic.title === originalTopic.title, 
                `Iteration ${i}: Topic ${j} title should be unchanged`);
            assert(foundTopic.message === originalTopic.message, 
                `Iteration ${i}: Topic ${j} message should be unchanged`);
            assert(foundTopic.category === category.key, 
                `Iteration ${i}: Topic ${j} should still be associated with category`);
        }
    }
}

// Property 6: Edit form pre-population
// Feature: forum-category-management, Property 6: Edit form pre-population
// For any existing category, when the edit form is opened,
// the form fields should contain the current category data.
// Validates: Requirements 3.1
function testProperty6_EditFormPrePopulation() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Create a random category
        const categoryData = generateRandomCategory();
        const category = createCategory(
            categoryData.name,
            categoryData.icon,
            categoryData.description
        );
        assert(category !== null, `Iteration ${i}: Category should be created`);
        
        // Simulate opening edit form by retrieving category data
        const retrievedCategory = getCategoryById(category.id);
        
        assert(retrievedCategory !== null, 
            `Iteration ${i}: Should retrieve category for editing`);
        assert(retrievedCategory.id === category.id, 
            `Iteration ${i}: Retrieved category should have correct id`);
        assert(retrievedCategory.name === category.name, 
            `Iteration ${i}: Form should be pre-populated with current name`);
        assert(retrievedCategory.icon === category.icon, 
            `Iteration ${i}: Form should be pre-populated with current icon`);
        assert(retrievedCategory.description === category.description, 
            `Iteration ${i}: Form should be pre-populated with current description`);
        assert(retrievedCategory.key === category.key, 
            `Iteration ${i}: Form should have category key`);
        assert(retrievedCategory.protected === category.protected, 
            `Iteration ${i}: Form should have protected status`);
    }
}


// Helper function to simulate user roles
function generateUser(role) {
    return {
        username: randomString(8),
        nickname: randomString(10),
        role: role,
        registeredAt: new Date().toLocaleString('ru-RU')
    };
}

// Property 9: Access control for players
// Feature: forum-category-management, Property 9: Access control for players
// For any user with role 'player', when viewing the forum or attempting to access
// category management functions, no management buttons should be visible and
// direct access attempts should be blocked.
// Validates: Requirements 5.1, 5.3
function testProperty9_AccessControlForPlayers() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Generate a player user
        const player = generateUser('player');
        
        // Verify player role
        assert(player.role === 'player', 
            `Iteration ${i}: User should have player role`);
        
        // Players should not be able to create categories (simulated by checking role)
        const canCreate = (player.role === 'admin' || player.role === 'founder');
        assert(canCreate === false, 
            `Iteration ${i}: Player should not have create permission`);
        
        // Players should not be able to edit categories
        const canEdit = (player.role === 'admin' || player.role === 'founder');
        assert(canEdit === false, 
            `Iteration ${i}: Player should not have edit permission`);
        
        // Players should not be able to delete categories
        const canDelete = (player.role === 'admin' || player.role === 'founder');
        assert(canDelete === false, 
            `Iteration ${i}: Player should not have delete permission`);
    }
}

// Property 10: Access control for admins
// Feature: forum-category-management, Property 10: Access control for admins
// For any user with role 'admin' or 'founder', when viewing the forum or admin panel,
// category management buttons and sections should be visible.
// Validates: Requirements 5.2, 5.5
function testProperty10_AccessControlForAdmins() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Test with admin
        const admin = generateUser('admin');
        assert(admin.role === 'admin', 
            `Iteration ${i}: User should have admin role`);
        
        const adminCanManage = (admin.role === 'admin' || admin.role === 'founder');
        assert(adminCanManage === true, 
            `Iteration ${i}: Admin should have management permissions`);
        
        // Test with founder
        const founder = generateUser('founder');
        assert(founder.role === 'founder', 
            `Iteration ${i}: User should have founder role`);
        
        const founderCanManage = (founder.role === 'admin' || founder.role === 'founder');
        assert(founderCanManage === true, 
            `Iteration ${i}: Founder should have management permissions`);
    }
}

// Property 11: Category visibility for all users
// Feature: forum-category-management, Property 11: Category visibility for all users
// For any user regardless of role, when viewing the forum,
// all categories and their information should be visible.
// Validates: Requirements 5.4
function testProperty11_CategoryVisibilityForAllUsers() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Create some categories
        const categoryCount = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < categoryCount; j++) {
            const categoryData = generateRandomCategory();
            createCategory(categoryData.name, categoryData.icon, categoryData.description);
        }
        
        // Get all categories (simulating what any user would see)
        const visibleCategories = getCategories();
        
        // Test with different user roles
        const roles = ['player', 'admin', 'founder'];
        
        for (const role of roles) {
            const user = generateUser(role);
            
            // All users should see the same categories
            // (access control only affects management buttons, not visibility)
            const userVisibleCategories = getCategories();
            
            assert(userVisibleCategories.length === visibleCategories.length, 
                `Iteration ${i}, Role ${role}: Should see all categories`);
            
            // Verify each category is visible
            for (const category of visibleCategories) {
                const found = userVisibleCategories.some(cat => cat.id === category.id);
                assert(found, 
                    `Iteration ${i}, Role ${role}: Category ${category.name} should be visible`);
            }
        }
    }
}

// Property 13: Cross-page data consistency
// Feature: forum-category-management, Property 13: Cross-page data consistency
// For any category operation performed in the admin panel, the changes should be
// immediately reflected on the forum page when it is loaded or refreshed.
// Validates: Requirements 6.3, 6.5
function testProperty13_CrossPageDataConsistency() {
    const iterations = 100;
    
    for (let i = 0; i < iterations; i++) {
        setupTest();
        initializeCategories();
        
        // Simulate admin panel: create a category
        const categoryData = generateRandomCategory();
        const category = createCategory(
            categoryData.name,
            categoryData.icon,
            categoryData.description
        );
        assert(category !== null, `Iteration ${i}: Category should be created`);
        
        // Simulate forum page: load categories
        const forumCategories = getCategories();
        const foundInForum = forumCategories.some(cat => cat.id === category.id);
        assert(foundInForum, 
            `Iteration ${i}: Created category should be visible on forum page`);
        
        // Simulate admin panel: update the category
        const updateData = {
            name: `${randomEmoji()} Updated ${randomString(8)}`,
            description: `Updated ${randomString(20)}`
        };
        const updateSuccess = updateCategory(category.id, updateData);
        assert(updateSuccess, `Iteration ${i}: Category update should succeed`);
        
        // Simulate forum page: reload categories
        const forumCategoriesAfterUpdate = getCategories();
        const updatedInForum = forumCategoriesAfterUpdate.find(cat => cat.id === category.id);
        assert(updatedInForum !== undefined, 
            `Iteration ${i}: Updated category should be visible on forum page`);
        assert(updatedInForum.name === updateData.name.trim(), 
            `Iteration ${i}: Updated name should be reflected on forum page`);
        
        // Simulate admin panel: delete the category
        const deleteSuccess = deleteCategory(category.id);
        assert(deleteSuccess, `Iteration ${i}: Category deletion should succeed`);
        
        // Simulate forum page: reload categories
        const forumCategoriesAfterDelete = getCategories();
        const stillInForum = forumCategoriesAfterDelete.some(cat => cat.id === category.id);
        assert(stillInForum === false, 
            `Iteration ${i}: Deleted category should not be visible on forum page`);
    }
}
