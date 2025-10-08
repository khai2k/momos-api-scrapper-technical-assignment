const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('data-test.json', 'utf8'));

// Function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Multiply each URL by 5
const multipliedUrls = [];
for (let i = 0; i < 5; i++) {
    multipliedUrls.push(...data.urls);
}

// Shuffle the multiplied URLs
const shuffledUrls = shuffleArray(multipliedUrls);

// Create new data object
const newData = {
    totalUrls: shuffledUrls.length,
    urls: shuffledUrls,
    timestamp: new Date().toISOString()
};

// Write to new file
fs.writeFileSync('data-test-multiplied-shuffled.json', JSON.stringify(newData, null, 2));

console.log(`Original URLs: ${data.urls.length}`);
console.log(`Multiplied and shuffled URLs: ${shuffledUrls.length}`);
console.log('Output saved to: data-test2-multiplied-shuffled.json');
