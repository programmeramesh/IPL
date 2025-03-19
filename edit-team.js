// Get team ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const teamId = parseInt(urlParams.get('id'));

// Get form elements
const form = document.getElementById('editTeamForm');
const deleteBtn = document.getElementById('deleteTeam');
const updateBtn = document.getElementById('updateBtn');
const statusMessage = document.getElementById('statusMessage');

// Form input elements
const inputs = {
    teamFullName: document.getElementById('teamFullName'),
    sName: document.getElementById('sName'),
    teamIcon: document.getElementById('teamIcon'),
    wonCount: document.getElementById('wonCount')
};

// Load team data from localStorage
let teams = JSON.parse(localStorage.getItem('teamArray')) || [];

// Find the team to edit
const team = teams.find(t => t.id === teamId);

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
    setTimeout(() => {
        statusMessage.style.display = 'none';
        statusMessage.className = '';
    }, 5000);
}

// Validate individual input
function validateInput(input) {
    const formGroup = input.parentElement;
    let isValid = true;

    // Reset previous validation state
    formGroup.classList.remove('error', 'success');

    switch (input.id) {
        case 'teamFullName':
            isValid = /^[A-Za-z\s]{3,50}$/.test(input.value.trim());
            break;
        case 'sName':
            isValid = /^[A-Z]{2,5}$/.test(input.value);
            break;
        case 'teamIcon':
            isValid = /^https?:\/\/.+/.test(input.value.trim());
            break;
        case 'wonCount':
            isValid = !isNaN(input.value) && parseInt(input.value) >= 0;
            break;
    }

    formGroup.classList.add(isValid ? 'success' : 'error');
    return isValid;
}

// Setup real-time validation
Object.values(inputs).forEach(input => {
    input.addEventListener('input', () => validateInput(input));
    input.addEventListener('blur', () => validateInput(input));
});

// If team exists, populate the form
if (team) {
    inputs.teamFullName.value = team.teamFullName;
    inputs.sName.value = team.sName;
    inputs.teamIcon.value = team.teamIcon;
    inputs.wonCount.value = team.WonCount;

    // Validate initial values
    Object.values(inputs).forEach(input => validateInput(input));
} else {
    showStatus('Team not found', 'error');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Check for duplicate team data
function checkDuplicates(teamData) {
    const otherTeams = teams.filter(t => t.id !== teamId);
    
    if (otherTeams.some(t => t.teamFullName.toLowerCase() === teamData.teamFullName.toLowerCase())) {
        throw new Error('A team with this name already exists');
    }
    if (otherTeams.some(t => t.sName.toLowerCase() === teamData.sName.toLowerCase())) {
        throw new Error('A team with this short name already exists');
    }
}

// Handle form submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Validate all inputs first
    const isValid = Object.values(inputs).every(input => validateInput(input));
    if (!isValid) {
        showStatus('Please fix the validation errors', 'error');
        return;
    }

    try {
        updateBtn.classList.add('loading');
        
        // Prepare updated team data
        const updatedTeam = {
            ...team,
            teamFullName: inputs.teamFullName.value.trim(),
            sName: inputs.sName.value.trim(),
            teamIcon: inputs.teamIcon.value.trim(),
            WonCount: parseInt(inputs.wonCount.value)
        };
        updatedTeam.fullSname = `${updatedTeam.sName} (${updatedTeam.teamFullName})`;

        // Check for duplicates
        checkDuplicates(updatedTeam);

        // Validate icon URL by trying to load the image
        await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = () => reject(new Error('Invalid team icon URL. Please provide a valid image URL.'));
            img.src = updatedTeam.teamIcon;
        });

        // Update team in array
        const index = teams.findIndex(t => t.id === teamId);
        if (index !== -1) {
            teams[index] = updatedTeam;
            localStorage.setItem('teamArray', JSON.stringify(teams));
            showStatus('Team updated successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        showStatus(error.message, 'error');
    } finally {
        updateBtn.classList.remove('loading');
    }
});

// Handle team deletion
deleteBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this team?')) {
        try {
            deleteBtn.classList.add('loading');

            // Check if team has players
            const playerArray = JSON.parse(localStorage.getItem('playerArray')) || [];
            const hasPlayers = playerArray.some(p => p.playerTeam === team.teamFullName);
            
            if (hasPlayers) {
                throw new Error('Cannot delete team: Please remove or reassign all players from this team first.');
            }

            // Remove team from array
            const index = teams.findIndex(t => t.id === teamId);
            if (index !== -1) {
                teams.splice(index, 1);
                localStorage.setItem('teamArray', JSON.stringify(teams));
                showStatus('Team deleted successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            deleteBtn.classList.remove('loading');
        }
    }
});
