document.addEventListener('DOMContentLoaded', function() {
    // Initialize drag and drop functionality if we're on a puzzle page
    if (document.querySelector('.puzzle-board')) {
        initDragAndDrop();
    }
});

function initDragAndDrop() {
    const wordCards = document.querySelectorAll('.word-card');
    const dropZones = document.querySelectorAll('.drop-zone');
    const puzzleBoard = document.querySelector('.puzzle-board');
    
    // Initialize draggable elements
    wordCards.forEach(card => {
        card.setAttribute('draggable', 'true');
        
        // Add event listeners for drag events
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
}

// Drag event handlers
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

// Save the current state of the puzzle
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
        
        // Check if card is in a drop zone
        if (card.parentElement.classList.contains('drop-zone')) {
            cardState.dropZone = card.parentElement.id;
        }
        
        state.cards.push(cardState);
    });
    
    // Save to localStorage for now
    localStorage.setItem('puzzleState', JSON.stringify(state));
    
    // In a real app, we would send this to the server
    // fetch('/api/save_progress', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(state)
    // });
}

// Load saved state
function loadSavedState() {
    const savedState = localStorage.getItem('puzzleState');
    if (!savedState) return;
    
    const state = JSON.parse(savedState);
    
    state.cards.forEach(cardState => {
        const card = document.getElementById(cardState.id);
        if (!card) return;
        
        // Set position
        if (cardState.position.left && cardState.position.top) {
            card.style.position = 'absolute';
            card.style.left = cardState.position.left;
            card.style.top = cardState.position.top;
            document.querySelector('.puzzle-board').appendChild(card);
        }
        
        // Set color
        if (cardState.color) {
            const colors = ['yellow', 'green', 'blue', 'purple'];
            colors.forEach(color => {
                card.classList.remove(color);
            });
            card.classList.add(cardState.color);
        }
        
        // Move to drop zone if needed
        if (cardState.dropZone) {
            const dropZone = document.getElementById(cardState.dropZone);
            if (dropZone) {
                dropZone.appendChild(card);
            }
        }
    });
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