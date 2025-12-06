// =========================================================================
// !!! SECURITY WARNING !!!
// Storing your GitHub Personal Access Token (PAT) directly in client-side 
// JavaScript is HIGHLY INSECURE. Anyone who views the source code of your 
// website can steal this token and use it to modify your repository!
// Only use this method for private repositories or for learning/personal 
// projects where security is not a major concern.
// =========================================================================

// --- 1. CONFIGURE GITHUB SETTINGS HERE ---
const GITHUB_TOKEN = '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; // <<< CHANGE THIS (Ensure this is a valid token)
const REPO_OWNER = 'pitamar123';           // <<< CONFIGURED
const REPO_NAME = 'pita-schedule';         // <<< CONFIGURED
const FILE_PATH = 'script.js';             // File to update (this file)

// --- 2. CUSTOMIZE YOUR INITIAL SCHEDULE DATA HERE ---
// NOTE: This initial data will be overwritten by changes saved via the web.
const scheduleData = {
    'Monday': [
        { name: 'Algebra II', start: '08:00', end: '09:15' },
        { name: 'Physics', start: '09:25', end: '10:40' },
        { name: 'Lunch', start: '10:40', end: '11:20' },
        { name: 'English Literature', start: '11:30', end: '12:45' },
        { name: 'Gym', start: '12:55', end: '14:10' },
    ],
    'Tuesday': [
        { name: 'AP History', start: '08:00', end: '09:15' },
        { name: 'Physics Lab', start: '09:25', end: '10:40' },
        { name: 'Lunch', start: '10:40', end: '11:20' },
        { name: 'Digital Art', start: '11:30', end: '12:45' },
        { name: 'Study Hall', start: '12:55', end: '14:10' },
    ],
    'Wednesday': [
        { name: 'Algebra II', start: '08:00', end: '09:15' },
        { name: 'Physics', start: '09:25', end: '10:40' },
        { name: 'Lunch', start: '10:40', end: '11:20' },
        { name: 'English Literature', start: '11:30', end: '12:45' },
        { name: 'Clubs/Activities', start: '12:55', end: '14:10' },
    ],
    'Thursday': [
        { name: 'AP History', start: '08:00', end: '09:15' },
        { name: 'Physics Lab', start: '09:25', end: '10:40' },
        { name: 'Lunch', start: '10:40', end: '11:20' },
        { name: 'Digital Art', start: '11:30', end: '12:45' },
        { name: 'Study Hall', start: '12:55', 'end': '14:10' },
    ],
    'Friday': [
        { name: 'Class Meeting', start: '08:00', end: '08:30' },
        { name: 'All Classes (Shorter)', start: '08:35', end: '12:00' },
        { name: 'Weekend Starts!', start: '12:00', end: '16:00' },
    ],
    'Saturday': [
        { name: 'Weekend!', start: '00:00', end: '23:59' }
    ],
    'Sunday': [
        { name: 'Weekend!', start: '00:00', end: '23:59' }
    ]
};
// --- END CUSTOMIZATION ---

// =========================================================================
// --- 3. CORE SCHEDULE RENDERING LOGIC ---
// =========================================================================

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const scheduleContainer = document.querySelector('.schedule-container');
const currentDayElement = document.getElementById('currentDay');

function renderSchedule(data) {
    scheduleContainer.innerHTML = '';
    const today = new Date();
    const currentDayName = dayNames[today.getDay()];
    const currentTime = formatTime(today);

    currentDayElement.textContent = `Today is ${currentDayName}`;

    for (const day in data) {
        const classes = data[day];
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-schedule');
        
        if (day === currentDayName) {
            dayDiv.classList.add('current-day');
        }

        dayDiv.innerHTML = `<div class="day-title">${day}</div>`;

        classes.forEach(cls => {
            const classItem = document.createElement('div');
            classItem.classList.add('class-item');
            
            if (day === currentDayName && isClassActive(cls.start, cls.end, currentTime)) {
                classItem.classList.add('current-class');
            }

            classItem.innerHTML = `
                <div class="class-info">
                    <div class="class-name">${cls.name}</div>
                    <div class="class-time">${formatTimeDisplay(cls.start)} - ${formatTimeDisplay(cls.end)}</div>
                </div>
            `;
            dayDiv.appendChild(classItem);
        });

        scheduleContainer.appendChild(dayDiv);
    }
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatTimeDisplay(time24) {
    const [hours24, minutes] = time24.split(':').map(Number);
    const hours = hours24 % 12 || 12; 
    const ampm = hours24 < 12 ? 'AM' : 'PM';
    return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

function isClassActive(start, end, current) {
    return current >= start && current < end;
}

// Initial render
renderSchedule(scheduleData);
setInterval(() => renderSchedule(scheduleData), 60000); // Refresh every minute

// =========================================================================
// --- 4. GITHUB PERSISTENCE LOGIC ---
// =========================================================================

const editButton = document.getElementById('editButton');
const modal = document.getElementById('editModal');
const closeButton = document.querySelector('.close-button');
const jsonInput = document.getElementById('scheduleJsonInput');
const saveButton = document.getElementById('saveChangesButton');
const saveStatus = document.getElementById('saveStatus');

editButton.onclick = function() {
    // Populate the textarea with the current scheduleData object as a JSON string
    // Use the scheduleData variable from the global scope (which reflects the last saved state)
    jsonInput.value = JSON.stringify(scheduleData, null, 4); 
    modal.style.display = 'block';
    saveStatus.textContent = '';
};

closeButton.onclick = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

saveButton.onclick = async function() {
    saveStatus.textContent = 'Saving... Please wait for the commit to process.';
    
    try {
        const newScheduleJson = jsonInput.value;
        const newScheduleData = JSON.parse(newScheduleJson); // Validate JSON format

        // 1. Fetch the current file (to get its SHA)
        const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await fetch(fileUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch file SHA. Status: ${response.status}`);
        }
        
        const fileData = await response.json();
        const currentSha = fileData.sha;
        const currentContent = atob(fileData.content);

        // 2. Locate and replace the scheduleData in the file content
        const startMarker = 'const scheduleData = ';
        
        const startIndex = currentContent.indexOf(startMarker);

        // Find the index of the closing brace for the scheduleData object
        let braceCount = 0;
        let scheduleEndIndex = -1;
        for (let i = startIndex + startMarker.length; i < currentContent.length; i++) {
            if (currentContent[i] === '{') braceCount++;
            if (currentContent[i] === '}') {
                braceCount--;
                if (braceCount === 0) {
                    // Check if the next non-whitespace character is a semicolon, which confirms the end of the object declaration
                    const nextCharSegment = currentContent.substring(i + 1).trimStart();
                    if (nextCharSegment.startsWith(';')) {
                        scheduleEndIndex = i + 1 + (currentContent.substring(i + 1).indexOf(';') + 1); // Index right after the semicolon
                        break;
                    }
                }
            }
        }

        if (startIndex === -1 || scheduleEndIndex === -1) {
            throw new Error("Could not find the scheduleData block in the script.js file for replacement.");
        }

        // Reconstruct the file content with the new schedule data
        const prefix = currentContent.substring(0, startIndex + startMarker.length);
        const suffix = currentContent.substring(scheduleEndIndex);
        
        // The new content replaces the JSON structure between the start marker and the ending semicolon/line break.
        const newContent = prefix + JSON.stringify(newScheduleData, null, 4) + ';\n' + suffix;
        
        // 3. Commit the new file content back to GitHub
        const updateResponse = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update schedule from website',
                content: btoa(unescape(encodeURIComponent(newContent))), // Base64 encode the new content
                sha: currentSha
            })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`Failed to commit change. Status: ${updateResponse.status}. Error: ${errorData.message}`);
        }

        // Success! Reload to see the changes immediately
        saveStatus.textContent = '✅ Schedule saved successfully! Reloading page...';
        setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
        saveStatus.textContent = '❌ ERROR: ' + error.message;
        console.error('Save error:', error);
    }
};
