
const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
const attemptsView = document.getElementById('attempts');
const resetBtn = document.getElementById('reset');

let attempts = 0;
let correctPin = null;

// Storage functions
const store = (key, value) => localStorage.setItem(key, value);
const retrieve = (key) => localStorage.getItem(key);
const clearStorage = () => localStorage.clear();

// Generate random 3-digit number
function getRandomPin() {
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

// SHA256 hash function
async function sha256(message) {
    try {
        const msgBuffer = new TextEncoder().encode(String(message));
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error('Error generating hash:', error);
        return null;
    }
}

// Initialize or retrieve hash
async function initHash() {
    let storedHash = retrieve('sha256');
    let storedPin = retrieve('pin');
    
    if (storedHash && storedPin) {
        correctPin = storedPin;
        return storedHash;
    }

    correctPin = getRandomPin();
    const newHash = await sha256(correctPin);
    
    store('pin', correctPin);
    store('sha256', newHash);
    store('attempts', '0');
    
    return newHash;
}

// Display hash and setup
async function main() {
    sha256HashView.textContent = 'Generating hash...';
    const hash = await initHash();
    sha256HashView.textContent = hash;
    attempts = parseInt(retrieve('attempts')) || 0;
    attemptsView.textContent = attempts;
}

// Validate user input
async function validateGuess() {
    const pin = pinInput.value;
    
    if (pin.length !== 3) {
        showResult('Please enter exactly 3 digits', 'error');
        return;
    }

    attempts++;
    store('attempts', attempts);
    attemptsView.textContent = attempts;

    const hashedPin = await sha256(pin);
    const currentHash = sha256HashView.textContent;

    if (hashedPin === currentHash) {
        showResult(` Correct! The PIN was ${correctPin}`, 'success');
        disableInput(true);
    } else {
        showResult(' Incorrect. Try again!', 'error');
    }
}

// Show result message
function showResult(message, type) {
    resultView.textContent = message;
    resultView.className = type;
    resultView.classList.remove('hidden');
}

// Reset game state
function resetGame() {
    clearStorage();
    pinInput.value = '';
    pinInput.disabled = false;
    resultView.classList.add('hidden');
    document.getElementById('check').disabled = false;
    main();
}

// Disable/enable input
function disableInput(disabled) {
    pinInput.disabled = disabled;
    document.getElementById('check').disabled = disabled;
}

// Event listeners
pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
});

document.getElementById('check').addEventListener('click', validateGuess);
resetBtn.addEventListener('click', resetGame);

// Initialize
main();
