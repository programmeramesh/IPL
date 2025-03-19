// Initialize data from index-data.js if not in localStorage
if (!localStorage.getItem("teamArray")) {
    localStorage.setItem("teamArray", JSON.stringify(teamData));
}

if (!localStorage.getItem("playerArray")) {
    localStorage.setItem("playerArray", JSON.stringify(playerData));
}

// Load data from localStorage
let detailofTeam = JSON.parse(localStorage.getItem("teamArray"));
let detailofPlayer = JSON.parse(localStorage.getItem("playerArray"));

// Ensure arrays exist and have data
if (!detailofTeam || detailofTeam.length === 0) {
    detailofTeam = teamData;
    localStorage.setItem("teamArray", JSON.stringify(teamData));
}
if (!detailofPlayer || detailofPlayer.length === 0) {
    detailofPlayer = playerData;
    localStorage.setItem("playerArray", JSON.stringify(playerData));
}

// Function to create team cards with edit/delete functionality
function createTeamCards() {
    const teamsContainer = document.getElementById("container_teams");
    if (!teamsContainer) return;

    teamsContainer.innerHTML = ''; // Clear existing cards

    detailofTeam.forEach(team => {
        const teamCard = document.createElement("div");
        teamCard.className = "team";
        
        // Make the entire card clickable except for the action buttons
        teamCard.innerHTML = `
            <div class="team-content" onclick="window.location.href='teams.html?name=${team.sName}'">
                <div class="team-img">
                    <img src="${team.teamIcon}" alt="${team.teamFullName}">
                    <div class="overlay"></div>
                </div>

                <div class="team-info">
                    <p class="team-name">${team.teamFullName}</p>
                    <p class="Count">Won Count : ${team.WonCount}</p>
                </div>
            </div>
            <div class="team-actions">
                <button onclick="event.stopPropagation(); editTeam(${team.id})" class="edit-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="event.stopPropagation(); deleteTeam(${team.id})" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        // Add hover effect
        teamCard.querySelector('.team-content').addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
            this.querySelector('.overlay').style.opacity = '0.3';
        });

        teamCard.querySelector('.team-content').addEventListener('mouseleave', function() {
            this.querySelector('.overlay').style.opacity = '0';
        });

        teamsContainer.appendChild(teamCard);
    });
}

// Function to edit team
function editTeam(teamId) {
    window.location.href = `editTeam.html?id=${teamId}`;
}

// Function to delete team
function deleteTeam(teamId) {
    if (confirm('Are you sure you want to delete this team?')) {
        // Check if team has players
        const teamToDelete = detailofTeam.find(t => t.id === teamId);
        const hasPlayers = detailofPlayer.some(p => p.playerTeam === teamToDelete.teamFullName);
        
        if (hasPlayers) {
            alert('Cannot delete team: Please remove or reassign all players from this team first.');
            return;
        }

        // Remove team from array
        detailofTeam = detailofTeam.filter(t => t.id !== teamId);
        
        // Update localStorage
        localStorage.setItem("teamArray", JSON.stringify(detailofTeam));
        
        // Refresh the display
        createTeamCards();
    }
}

// Call createTeamCards when page loads
document.addEventListener('DOMContentLoaded', () => {
    createTeamCards();
    populateTeamsDropdown();

    // Add Team Form Submit
    var addTeamForm = document.getElementById("addTeamForm");
    if (addTeamForm) {
        addTeamForm.onsubmit = (e) => {
            e.preventDefault();
            
            let teamName = document.getElementById("teamName").value;
            let teamIcon = document.getElementById("teamIcon").value;
            let teamCode = document.getElementById("teamCode").value.toUpperCase();
            let wonCount = document.getElementById("wonCount").value;
            let topBatsman = document.getElementById("topBatsman").value;
            let topBowler = document.getElementById("topBowler").value;

            let teamObj = {
                id: detailofTeam.length,
                teamFullName: teamName,
                sName: teamCode,
                teamIcon: teamIcon,
                WonCount: wonCount,
                topBatsman: topBatsman,
                topBowler: topBowler
            };

            detailofTeam.push(teamObj);
            localStorage.setItem("teamArray", JSON.stringify(detailofTeam));

            location.href = "./index.html";
        };
    }

    // Add Player Form Submit
    var addPlayerForm = document.getElementById("addPlayerForm");
    if (addPlayerForm) {
        // Populate teams dropdown when form loads
        populateTeamsDropdown();
        
        addPlayerForm.onsubmit = (e) => {
            e.preventDefault();
            
            let playerName = document.getElementById("inp1").value;
            let price = document.getElementById("inp2").value;
            let isPlaying = document.getElementById("inp3").checked;
            let description = document.getElementById("inp4").value;
            let playerImg = document.getElementById("inp5").value;
            let playerTeam = document.getElementById("inp6").value;
            
            // Get statistics values
            let matches = parseInt(document.getElementById("matches").value) || 0;
            let runs = parseInt(document.getElementById("runs").value) || 0;
            let wickets = parseInt(document.getElementById("wickets").value) || 0;
            let average = parseFloat(document.getElementById("average").value) || 0;

            let getTeamCode;
            for (var i = 0; i < detailofTeam.length; i++) {
                if (detailofTeam[i].teamFullName == playerTeam) {
                    getTeamCode = detailofTeam[i].sName;
                }
            }

            let playerObj = {
                id: detailofPlayer.length,
                playerName: playerName,
                from: getTeamCode,
                price: price + " Cr",
                isPlaying: isPlaying,
                description: description,
                playerImg: playerImg,
                playerTeam: playerTeam,
                statistics: {
                    matches: matches,
                    runs: runs,
                    wickets: wickets,
                    average: average
                }
            };

            detailofPlayer.push(playerObj);
            localStorage.setItem("playerArray", JSON.stringify(detailofPlayer));

            location.href = "./index.html";
        };
    }

    // Edit Player Form
    var editPlayerForm = document.getElementById("editPlayerForm");
    if (editPlayerForm) {
        // Get player ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const playerId = urlParams.get('id');
        
        // Find player details
        let playerDetails = detailofPlayer.find(player => player.id == playerId);
        if (!playerDetails) {
            location.href = "./index.html";
            return;
        }

        // Populate teams dropdown first
        populateTeamsDropdown();

        // Then populate form with existing data
        document.getElementById("inp1").value = playerDetails.playerName;
        document.getElementById("inp2").value = parseFloat(playerDetails.price);
        document.getElementById("inp3").checked = playerDetails.isPlaying;
        document.getElementById("inp4").value = playerDetails.description;
        document.getElementById("inp5").value = playerDetails.playerImg;
        document.getElementById("inp6").value = playerDetails.playerTeam;

        // Populate statistics
        if (playerDetails.statistics) {
            document.getElementById("matches").value = playerDetails.statistics.matches;
            document.getElementById("runs").value = playerDetails.statistics.runs;
            document.getElementById("wickets").value = playerDetails.statistics.wickets;
            document.getElementById("average").value = playerDetails.statistics.average;
        }

        editPlayerForm.onsubmit = (e) => {
            e.preventDefault();
            
            let updatedPlayer = {
                ...playerDetails,
                playerName: document.getElementById("inp1").value,
                price: document.getElementById("inp2").value + " Cr",
                isPlaying: document.getElementById("inp3").checked,
                description: document.getElementById("inp4").value,
                playerImg: document.getElementById("inp5").value,
                playerTeam: document.getElementById("inp6").value,
                from: detailofTeam.find(t => t.teamFullName === document.getElementById("inp6").value)?.sName || '',
                statistics: {
                    matches: parseInt(document.getElementById("matches").value) || 0,
                    runs: parseInt(document.getElementById("runs").value) || 0,
                    wickets: parseInt(document.getElementById("wickets").value) || 0,
                    average: parseFloat(document.getElementById("average").value) || 0
                }
            };

            // Update player in array
            let index = detailofPlayer.findIndex(p => p.id == playerId);
            if (index !== -1) {
                detailofPlayer[index] = updatedPlayer;
                localStorage.setItem("playerArray", JSON.stringify(detailofPlayer));
            }

            location.href = "./playerDetails.html?name=" + updatedPlayer.playerName;
        };
    }

    // Edit Team Form
    var editTeamForm = document.getElementById("editTeamForm");
    if (editTeamForm) {
        // Get team ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const teamId = urlParams.get('id');
        
        // Find team details
        let teamDetails = detailofTeam.find(team => team.id == teamId);
        if (!teamDetails) {
            location.href = "./index.html";
        }

        // Populate form with existing data
        document.getElementById("teamName").value = teamDetails.teamFullName;
        document.getElementById("teamIcon").value = teamDetails.teamIcon;
        document.getElementById("teamCode").value = teamDetails.sName;
        document.getElementById("wonCount").value = teamDetails.WonCount;
        document.getElementById("topBatsman").value = teamDetails.topBatsman || '';
        document.getElementById("topBowler").value = teamDetails.topBowler || '';

        // Handle form submission
        editTeamForm.onsubmit = (e) => {
            e.preventDefault();
            
            let updatedTeam = {
                ...teamDetails,
                teamFullName: document.getElementById("teamName").value,
                teamIcon: document.getElementById("teamIcon").value,
                sName: document.getElementById("teamCode").value.toUpperCase(),
                WonCount: document.getElementById("wonCount").value,
                topBatsman: document.getElementById("topBatsman").value,
                topBowler: document.getElementById("topBowler").value
            };

            // Update team in array
            let index = detailofTeam.findIndex(t => t.id == teamId);
            if (index !== -1) {
                detailofTeam[index] = updatedTeam;
                localStorage.setItem("teamArray", JSON.stringify(detailofTeam));
            }

            location.href = "./teams.html";
        };
    }
});

// Populate teams dropdown whenever it exists
function populateTeamsDropdown() {
    const teamsDropdown = document.getElementById("inp6");
    if (teamsDropdown) {
        // Clear existing options
        teamsDropdown.innerHTML = '<option value="">Select a team</option>';
        
        // Add teams from localStorage
        detailofTeam.forEach(team => {
            const option = document.createElement("option");
            option.value = team.teamFullName;
            option.textContent = team.teamFullName;
            teamsDropdown.appendChild(option);
        });
    }
}

// --------------------- SLIDER FUNCTIONALITY STARTS HERE --------------------- //

let slider_list = document.querySelector(".slider .slider-list");
let slider_item = document.querySelectorAll(
  ".slider .slider-list .slider-item"
);
let dots = document.querySelectorAll(".slider .dots li");
let prev = document.getElementById("prev");
let next = document.getElementById("next");

let active1 = 0;
let lengthItems = slider_item.length - 1;

next.onclick = function () {
  if (active1 + 1 > lengthItems) {
    active1 = 0;
  } else {
    active1 = active1 + 1;
  }
  reloadSlider();
};

prev.onclick = function () {
  if (active1 - 1 < 0) {
    active1 = lengthItems;
  } else {
    active1 = active1 - 1;
  }
  reloadSlider();
};

let refreshSlider = setInterval(() => {
  next.click();
}, 3000);

function reloadSlider() {
  let checkLeft = slider_item[active1].offsetLeft;
  slider_list.style.left = -checkLeft + "px";

  // Find the currently active dot and remove its class
  const dots = document.querySelectorAll(".slider .dots li");
  dots.forEach(dot => dot.classList.remove("active1"));
  
  // Add active1 class to the current dot
  if (dots[active1]) {
    dots[active1].classList.add("active1");
  }

  clearInterval(refreshSlider);
  refreshSlider = setInterval(() => {
    next.click();
  }, 3000);
}

dots.forEach((li, key) => {
  li.addEventListener("click", function () {
    active1 = key;
    reloadSlider();
  });
});

// --------------------- SLIDER FUNCTIONALITY ENDS HERE --------------------- //

// ---------------------  --------------------- //

var teamGrid = document.getElementById("container_teams");

// ---------------------  --------------------- //

// --------------------- SEARCH FUNCTIONALITY STARTS HERE --------------------- //

var suggestArray = [];
for (var i = 0; i < detailofTeam.length; i++) {
  suggestArray.push(detailofTeam[i].sName);
}
let searchBar = document.querySelector(".search-input");
let inputBox = searchBar.querySelector("input");
let suggBox = searchBar.querySelector(".autocom-box");
let icon = searchBar.querySelector(".icon");

inputBox.onkeyup = (e) => {
  if (e.keyCode == 13) {
    icon.click();
  }
  let userData = e.target.value;
  let emptyArray = [];
  if (userData) {
    emptyArray = suggestArray.filter((data) => {
      return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
    });
    emptyArray = emptyArray.map((data) => {
      return (data = `<li>${data}</li>`);
    });
    searchBar.classList.add("active");
    showSuggestions(emptyArray);
    let allList = suggBox.querySelectorAll("li");
    for (let i = 0; i < allList.length; i++) {
      allList[i].setAttribute("onclick", "currentLi(this)");
    }
  } else {
    searchBar.classList.remove("active");
  }
};
function currentLi(element) {
  let selectData = element.textContent;
  inputBox.value = selectData;
  icon.onclick = () => {
    window.open(`./teams.html?name=${element.textContent}`, "_self");
  };
  searchBar.classList.remove("active");
}
function showSuggestions(list) {
  let listData;
  if (!list.length) {
    userValue = inputBox.value;
    listData = `<li>${userValue}</li>`;
  } else {
    listData = list.join("");
  }
  suggBox.innerHTML = listData;
}

// --------------------- SEARCH FUNCTIONALITY ENDS HERE --------------------- //

// --------------------- CARD RENDERING STARTS HERE --------------------- //

var teamMainBox = document.getElementById("container_teams");
for (var i = 0; i < detailofTeam.length; i++) {
  teamMainBox.innerHTML += `

 <div class="team" onclick="makethisinclick('${i}')">
    <div class="team-img">
        <img src="${detailofTeam[i].teamIcon}" alt="${detailofTeam[i].sName}">
        <div class="overlay"></div>
    </div>

    <div class="team-info">
        <p class="team-name">${detailofTeam[i].teamFullName}</p>
        <p class="Count">Won Count : ${detailofTeam[i].WonCount} </p>
    </div>
</div>

`;
}

// Interactive card effects
document.addEventListener('mousemove', function(e) {
  document.querySelectorAll('.team').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update mouse position for lighting effect
    card.style.setProperty('--mouse-x', x + 'px');
    card.style.setProperty('--mouse-y', y + 'px');
  });
});

// --------------------- CARD RENDERING ENDS HERE --------------------- //

// --------------------- CARD CLICK -> TEAM DETAILS PAGE --------------------- //

function makethisinclick(res) {
  var clickedCard = detailofTeam[res].sName;

  window.open(`./teams.html?name=${clickedCard}`, "_self");
}

// ------------------------------------------ //

var addteamclicked = () => {
  window.open("./addTeam.html", "_self");
};
var addPlayerClicked = () => {
  window.open("./addPlayer.html", "_self");
};
