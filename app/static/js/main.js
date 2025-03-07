document.addEventListener('DOMContentLoaded', function() {
    // Initialize drag and drop functionality if we're on a puzzle page
    if (document.querySelector('.puzzle-board')) {
        // Add color coding instructions
        addColorInstructions();
        
        // Initialize functionality
        initDragAndDrop();
        initNoteTaking();
        initHintSystem();
        
        // Add buttons
        addControlButtons();
        
        // Load saved state if available, otherwise arrange in grid
        if (!loadSavedState()) {
            arrangeCardsInGrid();
        }
    }
});

function initDragAndDrop() {
    const wordCards = document.querySelectorAll('.word-card');
    const dropZones = document.querySelectorAll('.drop-zone');
    const puzzleBoard = document.querySelector('.puzzle-board');
    
    // Performance optimization: Use requestAnimationFrame for smoother animations
    let draggedElement = null;
    let offsetX, offsetY;
    let rafId = null;
    
    // Initialize draggable elements
    wordCards.forEach(card => {
        card.setAttribute('draggable', 'true');
        
        // Use mousedown/mousemove/mouseup for smoother dragging
        card.addEventListener('mousedown', handleMouseDown);
        
        // Keep the original drag events as fallback for mobile
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        
        // Add event listener for color coding with right-click
        card.addEventListener('contextmenu', handleRightClick);
    });
    
    // Initialize drop zones
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
    
    // Make the entire puzzle board a drop zone
    puzzleBoard.addEventListener('dragover', handleDragOver);
    puzzleBoard.addEventListener('drop', handleDrop);
    
    // Mouse-based dragging for smoother performance
    function handleMouseDown(e) {
        // Only handle left mouse button
        if (e.button !== 0) return;
        
        // Prevent default to avoid text selection
        e.preventDefault();
        
        draggedElement = this;
        
        // Calculate the offset of the mouse pointer from the element's top-left corner
        const rect = draggedElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Add dragging class
        draggedElement.classList.add('dragging');
        
        // Set position to absolute for free movement
        draggedElement.style.position = 'absolute';
        
        // Move to front
        draggedElement.style.zIndex = '1000';
        
        // Add event listeners for mouse movement and release
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Initial position update
        updateElementPosition(e);
    }
    
    function handleMouseMove(e) {
        if (!draggedElement) return;
        
        // Use requestAnimationFrame for smoother animation
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
            updateElementPosition(e);
        });
    }
    
    function updateElementPosition(e) {
        if (!draggedElement) return;
        
        const boardRect = puzzleBoard.getBoundingClientRect();
        
        // Calculate new position relative to the puzzle board
        let x = e.clientX - boardRect.left - offsetX;
        let y = e.clientY - boardRect.top - offsetY;
        
        // Keep the element within the puzzle board boundaries
        x = Math.max(0, Math.min(x, boardRect.width - draggedElement.offsetWidth));
        y = Math.max(0, Math.min(y, boardRect.height - draggedElement.offsetHeight));
        
        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;
    }
    
    function handleMouseUp(e) {
        if (!draggedElement) return;
        
        // Check if dropped over a drop zone
        const dropZone = getDropZoneAtPosition(e.clientX, e.clientY);
        
        if (dropZone) {
            // Append to drop zone
            dropZone.appendChild(draggedElement);
            draggedElement.style.position = 'relative';
            draggedElement.style.left = '0';
            draggedElement.style.top = '0';
        } else {
            // Keep at current position on the board
            puzzleBoard.appendChild(draggedElement);
        }
        
        // Clean up
        draggedElement.classList.remove('dragging');
        draggedElement.style.zIndex = '';
        draggedElement = null;
        
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Cancel any pending animation frame
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        
        // Save the current state
        saveCurrentState();
    }
    
    function getDropZoneAtPosition(x, y) {
        for (const zone of dropZones) {
            const rect = zone.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return zone;
            }
        }
        return null;
    }
    
    // Original drag event handlers (kept for compatibility)
    function handleDragStart(e) {
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.id);
        e.dataTransfer.effectAllowed = 'move';
    }
    
    function handleDragEnd(e) {
        this.classList.remove('dragging');
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        
        // Remove drag-over class from all drop zones
        document.querySelectorAll('.drag-over').forEach(zone => {
            zone.classList.remove('drag-over');
        });
        
        // Get the dragged element
        const id = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(id);
        
        if (!draggedElement) return;
        
        // If dropped on a drop zone, append to that zone
        if (this.classList.contains('drop-zone')) {
            this.appendChild(draggedElement);
            draggedElement.style.position = 'relative';
            draggedElement.style.left = '0';
            draggedElement.style.top = '0';
        } 
        // If dropped on the puzzle board, position at drop coordinates
        else if (this.classList.contains('puzzle-board')) {
            const boardRect = this.getBoundingClientRect();
            const x = e.clientX - boardRect.left - (draggedElement.offsetWidth / 2);
            const y = e.clientY - boardRect.top - (draggedElement.offsetHeight / 2);
            
            draggedElement.style.position = 'absolute';
            draggedElement.style.left = `${x}px`;
            draggedElement.style.top = `${y}px`;
            
            this.appendChild(draggedElement);
        }
        
        // Save the current state
        saveCurrentState();
    }
}

// Color coding with right-click
function handleRightClick(e) {
    e.preventDefault();
    
    // Cycle through colors: none -> yellow -> green -> blue -> purple -> none
    const colors = ['yellow', 'green', 'blue', 'purple'];
    
    // Remove all color classes first
    colors.forEach(color => {
        this.classList.remove(color);
    });
    
    // Find current color index
    let currentColorIndex = -1;
    for (let i = 0; i < colors.length; i++) {
        if (this.classList.contains(colors[i])) {
            currentColorIndex = i;
            break;
        }
    }
    
    // Set next color
    const nextColorIndex = (currentColorIndex + 1) % colors.length;
    this.classList.add(colors[nextColorIndex]);
    
    // Save the current state
    saveCurrentState();
}

// Function to load saved state
function loadSavedState() {
    const savedState = localStorage.getItem('puzzleState');
    if (!savedState) return false;
    
    try {
        const state = JSON.parse(savedState);
        const puzzleBoard = document.querySelector('.puzzle-board');
        
        // Process each card in the saved state
        state.cards.forEach(cardState => {
            const card = document.getElementById(cardState.id);
            if (!card) return;
            
            // Set position if available
            if (cardState.position && cardState.position.left && cardState.position.top) {
                card.style.position = 'absolute';
                card.style.left = cardState.position.left;
                card.style.top = cardState.position.top;
                puzzleBoard.appendChild(card);
            }
            
            // Set color if available
            if (cardState.color) {
                const colors = ['yellow', 'green', 'blue', 'purple'];
                colors.forEach(color => {
                    card.classList.remove(color);
                });
                card.classList.add(cardState.color);
            }
        });
        
        // Also load notes if available
        const savedNote = localStorage.getItem('puzzleNote');
        if (savedNote && document.getElementById('note-text')) {
            document.getElementById('note-text').value = savedNote;
        }
        
        return true; // Successfully loaded state
    } catch (error) {
        console.error('Error loading saved state:', error);
        return false; // Failed to load state
    }
}

// Function to save the current state
function saveCurrentState() {
    const state = {
        cards: []
    };
    
    document.querySelectorAll('.word-card').forEach(card => {
        const cardState = {
            id: card.id,
            text: card.textContent.trim(),
            position: {
                left: card.style.left,
                top: card.style.top
            },
            color: null
        };
        
        // Check for color class
        const colors = ['yellow', 'green', 'blue', 'purple'];
        for (const color of colors) {
            if (card.classList.contains(color)) {
                cardState.color = color;
                break;
            }
        }
        
        state.cards.push(cardState);
    });
    
    // Save to localStorage
    localStorage.setItem('puzzleState', JSON.stringify(state));
}

// Initialize note-taking functionality
function initNoteTaking() {
    const noteButton = document.getElementById('note-button');
    const noteContainer = document.getElementById('note-container');
    const noteText = document.getElementById('note-text');
    const saveNoteButton = document.getElementById('save-note');
    
    if (!noteButton || !noteContainer || !noteText || !saveNoteButton) return;
    
    // Show/hide note container
    noteButton.addEventListener('click', () => {
        noteContainer.classList.toggle('hidden');
        
        // Load saved note
        const savedNote = localStorage.getItem('puzzleNote');
        if (savedNote) {
            noteText.value = savedNote;
        }
    });
    
    // Save note
    saveNoteButton.addEventListener('click', () => {
        localStorage.setItem('puzzleNote', noteText.value);
        noteContainer.classList.add('hidden');
    });
}

// Initialize hint system
function initHintSystem() {
    const hintButton = document.getElementById('hint-button');
    const hintLevelSelect = document.getElementById('hint-level');
    const hintDisplay = document.getElementById('hint-display');
    
    if (!hintButton || !hintLevelSelect || !hintDisplay) return;
    
    hintButton.addEventListener('click', () => {
        const level = hintLevelSelect.value;
        const puzzleDate = document.querySelector('.puzzle-board').dataset.date;
        
        fetch(`/api/hint/${puzzleDate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ level })
        })
        .then(response => response.json())
        .then(data => {
            hintDisplay.textContent = data.hint;
            hintDisplay.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error fetching hint:', error);
        });
    });
}

// Function to add color coding instructions
function addColorInstructions() {
    const puzzleContainer = document.querySelector('.puzzle-container');
    const puzzleBoard = document.querySelector('.puzzle-board');
    
    const instructions = document.createElement('div');
    instructions.className = 'color-instructions';
    instructions.innerHTML = `
        <p><strong>Right-click</strong> or <strong>long-press</strong> a card to cycle through colors:
        <span class="color-sample color-yellow"></span> Yellow,
        <span class="color-sample color-green"></span> Green,
        <span class="color-sample color-blue"></span> Blue,
        <span class="color-sample color-purple"></span> Purple
        </p>
    `;
    
    puzzleContainer.insertBefore(instructions, puzzleBoard.nextSibling);
}

// Function to add control buttons
function addControlButtons() {
    // Remove existing drop zones
    const dropZones = document.querySelector('.drop-zones');
    if (dropZones) {
        dropZones.remove();
    }
    
    // Create or get tools section
    let toolsSection = document.querySelector('.tools');
    if (!toolsSection) {
        toolsSection = document.createElement('div');
        toolsSection.className = 'tools';
        const puzzleContainer = document.querySelector('.puzzle-container');
        puzzleContainer.appendChild(toolsSection);
    } else {
        // Clear existing tools
        toolsSection.innerHTML = '';
    }
    
    // Create reset button (4x4 grid)
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.className = 'btn btn-reset';
    resetButton.textContent = 'Reset Grid';
    resetButton.addEventListener('click', arrangeCardsInGrid);
    
    // Create shuffle button
    const shuffleButton = document.createElement('button');
    shuffleButton.id = 'shuffle-button';
    shuffleButton.className = 'btn btn-shuffle';
    shuffleButton.textContent = 'Shuffle';
    shuffleButton.addEventListener('click', shuffleCards);
    
    // Create note button
    const noteButton = document.createElement('button');
    noteButton.id = 'note-button';
    noteButton.className = 'btn btn-note btn-secondary';
    noteButton.textContent = 'Notes';
    noteButton.addEventListener('click', function() {
        const noteContainer = document.getElementById('note-container');
        if (noteContainer) {
            noteContainer.classList.toggle('hidden');
            
            // Load saved note
            const savedNote = localStorage.getItem('puzzleNote');
            if (savedNote) {
                document.getElementById('note-text').value = savedNote;
            }
        }
    });
    
    // Create hint button and dropdown
    const hintContainer = document.createElement('div');
    hintContainer.style.display = 'flex';
    hintContainer.style.alignItems = 'center';
    
    const hintSelect = document.createElement('select');
    hintSelect.id = 'hint-level';
    hintSelect.className = 'form-select';
    hintSelect.innerHTML = `
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
    `;
    
    const hintButton = document.createElement('button');
    hintButton.id = 'hint-button';
    hintButton.className = 'btn btn-hint btn-primary';
    hintButton.textContent = 'Get Hint';
    hintButton.addEventListener('click', function() {
        const level = document.getElementById('hint-level').value;
        const puzzleDate = document.querySelector('.puzzle-board').dataset.date;
        
        fetch(`/api/hint/${puzzleDate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ level })
        })
        .then(response => response.json())
        .then(data => {
            const hintDisplay = document.getElementById('hint-display');
            if (hintDisplay) {
                hintDisplay.textContent = data.hint;
                hintDisplay.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching hint:', error);
        });
    });
    
    hintContainer.appendChild(hintSelect);
    hintContainer.appendChild(hintButton);
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.id = 'submit-button';
    submitButton.className = 'btn btn-submit btn-success';
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', prepareSubmission);
    
    // Add buttons to tools section
    toolsSection.appendChild(resetButton);
    toolsSection.appendChild(shuffleButton);
    toolsSection.appendChild(noteButton);
    toolsSection.appendChild(hintContainer);
    toolsSection.appendChild(submitButton);
}

// Function to arrange cards in a 4x4 grid
function arrangeCardsInGrid() {
    const puzzleBoard = document.querySelector('.puzzle-board');
    const wordCards = document.querySelectorAll('.word-card');
    
    // Remove all cards from any containers and place them on the board
    wordCards.forEach(card => {
        // Reset position and styling
        card.style.position = 'absolute';
        puzzleBoard.appendChild(card);
    });
    
    // Get board dimensions
    const boardRect = puzzleBoard.getBoundingClientRect();
    const boardWidth = boardRect.width;
    
    // Calculate card dimensions including margin
    const cardWidth = 130; // Card width + margin
    const cardHeight = 70; // Card height + margin
    
    // Calculate grid positions (4x4 grid)
    const positions = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            // Calculate position with even spacing
            const x = (boardWidth / 4) * col + (boardWidth / 8) - (cardWidth / 2);
            const y = row * cardHeight + 20;
            
            positions.push({ left: x, top: y });
        }
    }
    
    // Position cards
    wordCards.forEach((card, index) => {
        if (index < positions.length) {
            card.style.left = `${positions[index].left}px`;
            card.style.top = `${positions[index].top}px`;
        }
    });
    
    // Save the new state
    saveCurrentState();
}

// Function to shuffle cards randomly
function shuffleCards() {
    const puzzleBoard = document.querySelector('.puzzle-board');
    const wordCards = document.querySelectorAll('.word-card');
    
    // Get board dimensions
    const boardRect = puzzleBoard.getBoundingClientRect();
    const boardWidth = boardRect.width;
    const boardHeight = boardRect.height;
    
    // Calculate usable area (leaving margin)
    const usableWidth = boardWidth - 140;
    const usableHeight = boardHeight - 80;
    
    // Shuffle cards to random positions
    wordCards.forEach(card => {
        // Reset position and styling
        card.style.position = 'absolute';
        
        // Random position within usable area
        const x = Math.random() * usableWidth + 10;
        const y = Math.random() * usableHeight + 10;
        
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        
        // Ensure card is on the board
        puzzleBoard.appendChild(card);
    });
    
    // Save the new state
    saveCurrentState();
}

// Function to prepare submission
function prepareSubmission() {
    // Group cards by color
    const yellowCards = Array.from(document.querySelectorAll('.word-card.yellow')).map(card => card.textContent.trim());
    const greenCards = Array.from(document.querySelectorAll('.word-card.green')).map(card => card.textContent.trim());
    const blueCards = Array.from(document.querySelectorAll('.word-card.blue')).map(card => card.textContent.trim());
    const purpleCards = Array.from(document.querySelectorAll('.word-card.purple')).map(card => card.textContent.trim());
    
    // Check if we have exactly 4 cards in each group
    const isValid = [yellowCards, greenCards, blueCards, purpleCards].every(group => group.length === 4);
    
    if (!isValid) {
        alert('Please assign all 16 cards to groups with exactly 4 cards in each color group.');
        return;
    }
    
    // Prepare submission data
    const submission = [yellowCards, greenCards, blueCards, purpleCards];
    
    // Get puzzle date
    const puzzleDate = document.querySelector('.puzzle-board').dataset.date;
    
    // Submit to server
    fetch(`/api/submit/${puzzleDate}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ submission })
    })
    .then(response => response.json())
    .then(data => {
        if (data.correct) {
            alert('Congratulations! Your answer is correct!');
        } else {
            alert('Sorry, that\'s not correct. Try again!');
        }
    })
    .catch(error => {
        console.error('Error submitting answer:', error);
    });
} 