// --- DOM Elements ---
/** @type {HTMLElement} The section of the page for user login. */
const loginSection = document.getElementById('loginSection');
/** @type {HTMLInputElement} The input field for the username. */
const usernameInput = document.getElementById('username');
/** @type {HTMLButtonElement} The button to log in. */
const loginButton = document.getElementById('loginButton');

/** @type {HTMLElement} The main section of the game, visible after login. */
const gameSection = document.getElementById('gameSection');
/** @type {HTMLElement} Displays a welcome message to the logged-in user. */
const welcomeMessage = document.getElementById('welcomeMessage');
/** @type {HTMLButtonElement} The button to log out. */
const logoutButton = document.getElementById('logoutButton');
/** @type {HTMLButtonElement} The button to switch to editing the bingo sheet. */
const editSheetButton = document.getElementById('editSheetButton');

/** @type {HTMLElement} The area where the bingo sheet (input or display) is shown. */
const bingoSheetArea = document.getElementById('bingoSheetArea');
/** @type {HTMLElement} The grid container for bingo sheet input fields. */
const bingoSheetInputGrid = document.getElementById('bingoSheetInputGrid');
/** @type {HTMLElement} The grid container for displaying the bingo sheet tiles. */
const bingoSheetDisplayGrid = document.getElementById('bingoSheetDisplayGrid');
/** @type {HTMLButtonElement} The button to save the entered bingo sheet phrases. */
const saveSheetButton = document.getElementById('saveSheetButton');
/** @type {HTMLElement} Displays status messages related to the bingo sheet (e.g., "saved"). */
const sheetStatusMessage = document.getElementById('sheetStatusMessage');

/** @const {number} The size of the bingo grid (e.g., 5 for a 5x5 grid). */
const BINGO_SIZE = 4;

// --- localStorage Helper ---
/**
 * Retrieves application data from localStorage.
 * @returns {object} The application data, or a default structure if no data is found.
 */
function getStoredData() {
    const data = localStorage.getItem('bingoAppData_singlePlayer');
    return data ? JSON.parse(data) : { users: {}, loggedInUser: null };
}

/**
 * Saves the provided application data to localStorage.
 * @param {object} data - The application data to save.
 */
function saveData(data) {
    localStorage.setItem('bingoAppData_singlePlayer', JSON.stringify(data));
}

// --- Initialization and UI State Management ---
/**
 * Initializes the application.
 * Checks if a user is already logged in and loads their session,
 * otherwise shows the login screen.
 * Also sets up the event listener for the edit sheet button.
 */
function init() {
    const appData = getStoredData();
    if (appData.loggedInUser && appData.users[appData.loggedInUser]) {
        loadUserSession(appData.loggedInUser, appData);
    } else {
        showLoginScreen();
    }
    // Add event listener for the edit button
    /**
     * Handles the click event for the 'Edit Sheet' button.
     * Retrieves the current user's data and renders the sheet input view
     * pre-filled with their existing bingo sheet phrases.
     */
    editSheetButton.addEventListener('click', () => {
        const appData = getStoredData();
        const currentUserData = appData.users[appData.loggedInUser];
        if (currentUserData) {
            renderSheetInput(currentUserData.bingoSheet);
        }
    });
}

/**
 * Handles the click event for the 'Login' button.
 * Validates the username, creates a new user if one doesn't exist,
 * sets the logged-in user, saves data, and loads the user's session.
 */
loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) {
        alert("Please enter your name.");
        return;
    }

    const appData = getStoredData();
    if (!appData.users[username]) {
        // New user: initialize with an empty sheet structure
        appData.users[username] = {
            username: username,
            bingoSheet: createEmptySheetData(BINGO_SIZE)
        };
    }
    appData.loggedInUser = username;
    saveData(appData);
    loadUserSession(username, appData);
});

/**
 * Handles the click event for the 'Logout' button.
 * Clears the logged-in user from app data, saves the change,
 * and shows the login screen.
 */
logoutButton.addEventListener('click', () => {
    const appData = getStoredData();
    appData.loggedInUser = null;
    saveData(appData);
    showLoginScreen();
});

/**
 * Loads and displays the game interface for a given user.
 * It then checks if the user's bingo sheet is empty. If so, it renders the input view.
 * Otherwise, it renders the display view of their filled sheet.
 * @param {string} username - The username of the user whose session is to be loaded.
 * @param {object} appData - The entire application data object.
 */
function loadUserSession(username, appData) {
    const userData = appData.users[username];
    loginSection.style.display = 'none';
    gameSection.style.display = 'block';
    welcomeMessage.textContent = `♡ ${userData.username}'s Bingo Sheet ♡`;

    // Check if the sheet is empty (all tile texts are empty strings)
    const isSheetEmpty = userData.bingoSheet.every(row => row.every(tile => tile.text === ""));

    if (isSheetEmpty) {
        sheetStatusMessage.textContent = "Your bingo sheet is empty. Please fill in your phrases.";
        renderSheetInput(userData.bingoSheet); // Show input fields
        editSheetButton.style.display = 'none'; // Hide edit button when creating
    } else {
        renderSheetDisplay(userData.bingoSheet, userData.username); // Show filled sheet
        editSheetButton.style.display = 'inline-block'; // Show edit button
    }
}

/**
 * Displays the login screen and hides the game section.
 */
function showLoginScreen() {
    loginSection.style.display = 'block';
    gameSection.style.display = 'none';
    usernameInput.value = '';
    sheetStatusMessage.textContent = '';
}

// --- Bingo Sheet Data & Rendering ---
/**
 * Creates an empty data structure for a bingo sheet.
 * Each cell is an object with 'text' (empty string) and 'marked' (false) properties.
 * @param {number} size - The dimension of the square bingo sheet (e.g., 5 for 5x5).
 * @returns {Array<Array<object>>} A 2D array representing the empty bingo sheet.
 */
function createEmptySheetData(size) {
    const sheet = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push({ text: "", marked: false });
        }
        sheet.push(row);
    }
    return sheet;
}

/**
 * Renders the input fields for the bingo sheet.
 * @param {Array<Array<object>>} sheetData - The current data for the bingo sheet.
 */
function renderSheetInput(sheetData) {
    bingoSheetInputGrid.innerHTML = '';
    bingoSheetInputGrid.style.display = 'grid';
    bingoSheetDisplayGrid.style.display = 'none';
    saveSheetButton.style.display = 'inline-block';
    editSheetButton.style.display = 'none'; // Hide edit while in input mode

    for (let r = 0; r < BINGO_SIZE; r++) {
        for (let c = 0; c < BINGO_SIZE; c++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Phrase ${r * BINGO_SIZE + c + 1}`;
            input.value = sheetData[r][c].text || "";
            input.dataset.row = r;
            input.dataset.col = c;
            bingoSheetInputGrid.appendChild(input);
        }
    }
}

/**
 * Renders the display view of the bingo sheet.
 * @param {Array<Array<object>>} sheetData - The bingo sheet data to display.
 * @param {string} username - The username of the current player, used for tile click handling.
 */
function renderSheetDisplay(sheetData, username) {
    bingoSheetDisplayGrid.innerHTML = '';
    bingoSheetInputGrid.style.display = 'none';
    bingoSheetDisplayGrid.style.display = 'grid';
    saveSheetButton.style.display = 'none';
    editSheetButton.style.display = 'inline-block';

    sheetData.forEach((row, rIndex) => {
        row.forEach((tile, cIndex) => {
            const tileDiv = document.createElement('div');
            tileDiv.classList.add('bingo-tile');
            tileDiv.textContent = tile.text || "Empty";
            if (tile.marked) {
                tileDiv.classList.add('marked');
            }
            tileDiv.dataset.row = rIndex;
            tileDiv.dataset.col = cIndex;
            tileDiv.addEventListener('click', () => handleTileClick(username, rIndex, cIndex));
            bingoSheetDisplayGrid.appendChild(tileDiv);
        });
    });
}

/**
 * Handles the click event for the 'Save Sheet' button.
 * Updates the current user's bingo sheet data with these new phrases.
 * Saves the updated application data to localStorage.
 * Shows a success message and then switches to the display view of the sheet.
 */
saveSheetButton.addEventListener('click', () => {
    const appData = getStoredData();
    const currentUserData = appData.users[appData.loggedInUser];
    const newSheetData = createEmptySheetData(BINGO_SIZE); // Start with a fresh structure
    let allFilled = true;

    const inputs = bingoSheetInputGrid.querySelectorAll('input');
    inputs.forEach(input => {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        const text = input.value.trim();
        if (text === "") {
            allFilled = false;
        }
        newSheetData[r][c] = { text: text, marked: false }; // Reset marked status on save
    });

    if (!allFilled) {
        // You could alert the user, but for now, we'll allow saving partially filled sheets.
        // alert("Please fill in all 25 phrases for your bingo sheet.");
        // return;
    }

    currentUserData.bingoSheet = newSheetData;
    saveData(appData);

    sheetStatusMessage.textContent = "Bingo sheet saved successfully! ( • ̀ω•́ )✧";
    setTimeout(() => { sheetStatusMessage.textContent = ""; }, 3000);

    renderSheetDisplay(currentUserData.bingoSheet, currentUserData.username); // Switch to display mode
});

// --- Gameplay ---
/**
 * Handles a click event on a bingo tile in the display grid.
 * Toggles the 'marked' status of the clicked tile.
 * Saves the updated sheet data and re-renders the sheet display.
 * Checks if the move resulted in a win.
 * @param {string} username - The username of the current player.
 * @param {number} rIndex - The row index of the clicked tile.
 * @param {number} cIndex - The column index of the clicked tile.
 */
function handleTileClick(username, rIndex, cIndex) {
    const appData = getStoredData();
    const currentUserData = appData.users[username];
    const tile = currentUserData.bingoSheet[rIndex][cIndex];

    if (!tile.text) return; // Don't mark empty tiles

    tile.marked = !tile.marked;
    saveData(appData);
    renderSheetDisplay(currentUserData.bingoSheet, username); // Re-render to show change

    if (checkWin(currentUserData.bingoSheet)) {
        setTimeout(() => {
            alert(`BINGO! Congratulations, ${username}! You got 5 in a row!`);
        }, 100); // Timeout to allow UI update
    }
}

/**
 * Checks if the current state of the bingo sheet constitutes a win.
 * A win can be 5 marked, non-empty tiles in a row, column, or either of the two main diagonals.
 * @param {Array<Array<object>>} sheetData - The current bingo sheet data.
 * @returns {boolean} True if a winning condition is met, false otherwise.
 */
function checkWin(sheetData) {
    // Check rows
    for (let i = 0; i < BINGO_SIZE; i++) {
        if (sheetData[i].every(tile => tile.marked && tile.text !== "")) return true;
    }
    // Check columns
    for (let j = 0; j < BINGO_SIZE; j++) {
        let colWin = true;
        for (let i = 0; i < BINGO_SIZE; i++) {
            if (!sheetData[i][j].marked || sheetData[i][j].text === "") {
                colWin = false;
                break;
            }
        }
        if (colWin) return true;
    }
    // Check diagonal (top-left to bottom-right)
    let diag1Win = true;
    for (let i = 0; i < BINGO_SIZE; i++) {
        if (!sheetData[i][i].marked || sheetData[i][i].text === "") {
            diag1Win = false;
            break;
        }
    }
    if (diag1Win) return true;

    // Check diagonal (top-right to bottom-left)
    let diag2Win = true;
    for (let i = 0; i < BINGO_SIZE; i++) {
        if (!sheetData[i][BINGO_SIZE - 1 - i].marked || sheetData[i][BINGO_SIZE - 1 - i].text === "") {
            diag2Win = false;
            break;
        }
    }
    if (diag2Win) return true;

    return false;
}

// --- Start the app ---
/**
 * Calls the init function to start the application when the script loads.
 */
init();
