let currentMonday;
var userData;
var weekContainer;
document.addEventListener('DOMContentLoaded', async function() {
    userData = JSON.parse(localStorage.getItem('loggedInUser'));
    console.log("USER DATA: " + userData.superapp, userData.userEmail, userData.username);

    const userNameButton = document.getElementById('user-name-button');
    if (userNameButton) {
        userNameButton.textContent = userData.username;
    }


    weekContainer = document.querySelector('.week-container');
    const weekDatesElement = document.getElementById('week-dates');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');

    currentMonday = calculateNextMonday();
    currentMonday.setDate(currentMonday.getDate() - 7); // Start with current week's Monday
    updateWeekDisplay();

    prevWeekBtn.addEventListener('click', () => {
        currentMonday.setDate(currentMonday.getDate() - 7);
        updateWeekDisplay();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentMonday.setDate(currentMonday.getDate() + 7);
        updateWeekDisplay();
    });

    // Fetch user data from local storage
    
});

function calculateNextMonday() {
    const now = new Date();
    now.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7)); // Adjust to the next Monday
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getWeekDates(mondayDate) {
    const monday = new Date(mondayDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const format = date => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    return `${format(monday)} - ${format(sunday)}`;
}

async function updateWeekDisplay() {
    const weekDatesElement = document.getElementById('week-dates');
    weekDatesElement.textContent = getWeekDates(currentMonday);

    try {
        let weekSchedule = await getShiftScheduleOfWeek(currentMonday);
        console.log("Schedule received: ", weekSchedule);

        if (weekSchedule.length > 0) {
            weekContainer.style.visibility = 'visible';
            shiftScheduleCreated = true;  
            console.log(weekSchedule[0].objectDetails.shiftSchedule);
            initShiftsUI(weekSchedule[0].objectDetails.shiftSchedule);
        } else {
            weekContainer.style.visibility = 'hidden';
            console.log("No schedule for this week");
        }
    } catch (error) {
        console.error("Failed to fetch week schedule: ", error);
    }
}

async function getShiftScheduleOfWeek(mondayDate) {
    const type = `shiftSchedule#${mondayDate.toDateString()}`;
    console.log("the type ------>  " + type);
    console.log(userData);


    try {
        const response = await axios.get(`http://localhost:8084/superapp/objects/search/byType/${encodeURIComponent(type)}`, {
            params: {
                userSuperapp: userData.superapp,
                userEmail: userData.userEmail,
                size: 1,
                page: 0
            }
        });
        return response.data;  
    } catch (error) {
        console.error('Error fetching objects:', error);
        throw error;
    }
}

function initShiftsUI(schedule) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shifts = ['morning', 'evening', 'night'];
    const weekContainer = document.querySelector('.week-container');
    weekContainer.innerHTML = ''; // Clear existing content

    days.forEach((day, dayIndex) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        dayColumn.innerHTML = `<h2>${day}</h2>`;

        shifts.forEach((shift, shiftIndex) => {
            const shiftDiv = document.createElement('div');
            shiftDiv.className = `shift ${shift}`;

            const shiftTitle = shift.charAt(0).toUpperCase() + shift.slice(1);
            const shiftTimes = {
                'morning': '7:00 - 15:30',
                'evening': '14:30 - 23:00',
                'night': '22:30 - 7:00'
            };

            const workers = schedule[dayIndex][shiftIndex];
            const workersText = workers.length > 0 ? workers.map(worker => {
                return worker === userData.username ? `<strong>${worker}</strong>` : worker;
            }).join(', ') : 'None assigned';

            shiftDiv.innerHTML = `
                <h3>${shiftTitle} Shift</h3>
                <p>${shiftTimes[shift]}</p>
                <p>Workers: ${workersText}</p>
            `;

            dayColumn.appendChild(shiftDiv);
        });

        weekContainer.appendChild(dayColumn);
    });
}