var userData;
const daysMap = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const shiftsMap = ['morning', 'evening', 'night'];
let nextMonday;
let shiftScheduleCreated = false;
let scheduleGenerator = null;


document.addEventListener('DOMContentLoaded', async function() {
    // Get next week's dates and display them
    const weekDatesElement = document.getElementById('week-dates');
    weekDatesElement.textContent = getNextWeekDates();

    // Fetch user data from local storage
    userData = JSON.parse(localStorage.getItem('loggedInUser'));
    console.log("USER DATA: " + userData.superapp, userData.userEmail, userData.username);

   const userNameButton = document.getElementById('user-name-button');
    if (userNameButton) {
        userNameButton.textContent = userData.username;
    }

    try {
        // Await the asynchronous call to getShiftScheduleOfNextWeek
        let weekSchedule = await getShiftScheduleOfNextWeek();
        console.log("Schedule received: ", weekSchedule);

        // Check if a schedule was returned and update the UI accordingly
        if (weekSchedule.length>0) {
            shiftScheduleCreated = true;  
            document.getElementById('week-container').style.display = 'block';
            console.log( weekSchedule[0].objectDetails.shiftSchedule);
            initShiftsUI(weekSchedule[0].objectDetails.shiftSchedule);  // Adjusted for correct property access
        }
    } catch (error) {
        console.error("Failed to fetch week schedule: ", error);
    }

    initShiftsRightClick();
});

function getNextWeekDates() {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    // Find the next Monday
    const daysUntilNextMonday = (1 - currentDay + 7) % 7;
    nextMonday = new Date(currentDate.getTime() + daysUntilNextMonday * 24 * 60 * 60 * 1000);
console.log(nextMonday);
    // End of the week (Sunday)
    const nextSunday = new Date(nextMonday.getTime() + 6 * 24 * 60 * 60 * 1000);

    const format = date => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    return `${format(nextMonday)} - ${format(nextSunday)}`;
}




//ONCLICK OF THE GENERATE SCHEDULE BUTTON 
const generateBtn = document.getElementById('generate-schedule-button');
if (generateBtn) {
    generateBtn.addEventListener('click', async function() {  // Make the function async
        try {
            scheduleGenerator = new ScheduleGenerator();
            // First, change the user role (assuming this function is synchronous or its result is not needed immediately)
            changeUserRole(userData.superapp, userData.userEmail , "MINIAPP_USER");

            // Await the promise from getAllWorkersAvailableShifts before using forEach
            const allWorkersAvailableShifts = await getAllWorkersAvailableShifts("availableShifts", userData.superapp, userData.userEmail);
            changeUserRole(userData.superapp, userData.userEmail , "SUPERAPP_USER")
            
            allWorkersAvailableShifts.forEach(object => {
                console.log(object.objectDetails.availableShifts);
                scheduleGenerator.mergeShiftsData(object.objectDetails.availableShifts);
            });
            console.log("AFTER MERGING: ")
            console.log( scheduleGenerator.shifts)
            


            scheduleGenerator.generateSchedule();
            console.log("AFTER ALGO: ")
            console.log( scheduleGenerator.shifts)
            updateShiftDisplay(scheduleGenerator);
            makeShiftsEditable(scheduleGenerator);
            enableSaveButtonOnClickListener(scheduleGenerator);
         
        } catch (error) {
            console.error('Error handling shifts:', error);
        }
    });
}

//GET ALL WORKERS AVAILABLE SHIFTS

async function changeUserRole(superapp, userEmail, roleOfUser){
    
   console.log(roleOfUser)

    const updatedUserObject = {
        role: roleOfUser,  // Assuming you want to update the role; adjust as necessary
    };

    try {
       await axios.put(`http://localhost:8084/superapp/users/${superapp}/${userEmail}`, updatedUserObject, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
       
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Error updating user: ' + error.message);
    }



}

async function getAllWorkersAvailableShifts(type, superapp, userEmail) {
    let response;
    try {
        response = await axios.get(`http://localhost:8084/superapp/objects/search/byType/${type}`, {
            params: {
                userSuperapp: superapp,
                userEmail: userEmail,
                size: 10,  // Assuming a fixed page size for simplicity
                page: 0    // Assuming you're querying the first page
            }
        });
        console.log("Response data:", response.data);  // Log to see what data is returned
        return response.data;  // Make sure this is the array or part of the response containing the array
    } catch (error) {
        console.error('Error fetching objects:', error);
        throw error;  // Rethrow or handle error appropriately
    }
}

//POST THE SHIFT SCHEDULE: 

async function shiftSchedularPostRequest(scheduleGenerator){

    var nextMonday2 = calculateNextMonday();
  
    const shiftObjectBoundary = {
        type: "shiftSchedule" + "#" + nextMonday2.toDateString() ,
        alias: nextMonday2.toDateString(),
        location: {
            lat: null,
            lng: null
        },
        active: true,
        createdBy: {
            userId: {
                superapp: userData.superapp,
                email: userData.userEmail
            }
        },
        objectDetails: {
            "shiftSchedule": scheduleGenerator.shifts  // our object shifts
        }
    };

    try {
      
         axios.post("http://localhost:8084/superapp/objects", shiftObjectBoundary, {
            headers: {
                'Content-Type': 'application/json'
            }
        });


    

    } catch (error) {
        console.error('Error:', error);
        alert('Error Creating Week Schedule ' + error.message);
    }
    alert('Weekly shifts have been published successfully!');
 }


 async function getShiftScheduleOfNextWeek() {
    var nextMonday = calculateNextMonday();
    const type = `shiftSchedule#${nextMonday.toDateString()}`;
    console.log("Requesting type:", type);

    try {
        const response = await axios.get(`http://localhost:8084/superapp/objects/search/byType/${encodeURIComponent(type)}`, {
            params: {
                userSuperapp: userData.superapp,
                userEmail: userData.userEmail,
                size: 1,
                page: 0
            }
        });

        console.log("194 Response data:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching objects:', error.response ? error.response.data : error.message);
        throw error;
    }
}


 

  
async function editWeekSchedule(scheduleGenerator, data) {
    try {
        const shiftObjectBoundary = {
            objectId: {
                superapp: data[0].objectId.superapp,
                id: data[0].objectId.id
            },
            type: data[0].type,
            alias: data[0].alias,
            location: data[0].location,
            active: true,
            creationTimestamp: data[0].creationTimestamp,
            createdBy: data[0].createdBy,
            objectDetails: {
                shiftSchedule: scheduleGenerator.shifts
            }
        };

        const url = `http://localhost:8084/superapp/objects/${shiftObjectBoundary.objectId.superapp}/${shiftObjectBoundary.objectId.id}`;

        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                userSuperapp: userData.superapp,
                userEmail: userData.userEmail
            }
        };

        const response = await axios.put(url, shiftObjectBoundary, config);
        console.log('Schedule updated successfully:', response.data);
    } catch (error) {
        console.error('Error updating schedule:', error);
        alert('Error updating schedule: ' + (error.response?.data?.message || error.message));
    }
}





   
//UI CHANGES: 

function updateShiftDisplay(schedule) {
    document.getElementById('week-container').style.display = 'block';
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shiftTypes = ['morning', 'evening', 'night'];

    days.forEach((day, dayIndex) => {
        shiftTypes.forEach((type, typeIndex) => {
            const shiftId = `${day}-${type}`;
            const shiftElement = document.getElementById(shiftId);
            if (shiftElement) {
                const workersPara = shiftElement.querySelector('p:nth-child(3)'); // Assuming the third <p> tag is for workers
                const workers = schedule.shifts[dayIndex][typeIndex];
                if (workers && workers.length > 0) {
                    workersPara.textContent = `Workers: ${workers.join(', ')}`;
                } else {
                    workersPara.textContent = 'Workers: None assigned';
                }
            }
        });
    });
}


function makeShiftsEditable(scheduleGenerator) {
    const workerElements = document.querySelectorAll('.shift p:nth-child(3)'); // Selects the worker paragraphs
    workerElements.forEach(element => {
        element.contentEditable = "true";
        element.style.border = "1px solid #ccc"; // Style to indicate that the element is editable
        element.style.padding = "5px";
        element.addEventListener('blur', function() {
            // Remove the prefix "Workers: " and then trim any leading/trailing whitespace
            const cleanedText = this.textContent.replace("Workers: ", "").trim();
            // Save changes when the user finishes editing
            updateShiftData(scheduleGenerator, this.closest('.shift').id, cleanedText);
        });
    });
}

// Function to update shift data, no changes needed here, it processes the cleaned text
function updateShiftData(scheduleGenerator, shiftId, newText) {
    const [day, shiftType] = shiftId.split('-'); // e.g., "monday-morning"
    const dayIndex = daysMap.indexOf(day);
    const shiftIndex = shiftsMap.indexOf(shiftType);

    if (dayIndex === -1 || shiftIndex === -1) {
        console.error('Invalid shift or day ID');
        return;
    }

    // Convert the new text to an array of workers
    const workers = newText.split(',').map(worker => worker.trim()).filter(Boolean);

    // Update the scheduleGenerator's shifts array
    scheduleGenerator.shifts[dayIndex][shiftIndex] = workers;
    console.log(`Updated ${day} ${shiftType} shift with workers:`, workers);
    
}



function enableSaveButtonOnClickListener(scheduleGenerator) {
    const publishBtn = document.getElementById('publish-schedule-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', async function() {
            const workerElements = document.querySelectorAll('.shift p:nth-child(3)');
            workerElements.forEach(element => {
                element.contentEditable = "false";
                element.style.border = "none";
                element.style.padding = "0";
            });
           
            if (shiftScheduleCreated === false) {
                await shiftSchedularPostRequest(scheduleGenerator);
                shiftScheduleCreated = true;
            } else {
                try {
                    const data = await getShiftScheduleOfNextWeek();
                    console.log("Response from getShiftScheduleOfNextWeek:", data);
                    if (data && data.length > 0) {
                       await editWeekSchedule(scheduleGenerator, data);
                    } else {
                        console.log("No existing schedule found, creating a new one.");
                        //await shiftSchedularPostRequest(scheduleGenerator);
                    }
                } catch (error) {
                    console.error("Error updating/creating schedule:", error);
                    alert("Error updating/creating schedule: " + error.message);
                }
            }
            
            console.log(scheduleGenerator.shifts);
            showSuccessMessage("Schedule saved and published successfully");
        });
    }
    
}


function initShiftsUI(schedule) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shifts = ['morning', 'evening', 'night'];

    days.forEach((day, dayIndex) => {
        shifts.forEach((shift, shiftIndex) => {
            const shiftId = `${day}-${shift}`;
            const shiftElement = document.getElementById(shiftId);
            if (shiftElement) {
                const workersText = schedule[dayIndex][shiftIndex].join(', ') || 'None assigned';
                const workersPara = shiftElement.querySelector('p:nth-child(3)');
                workersPara.textContent = `Workers: ${workersText}`;
               
            }
        });
    });
}
function calculateNextMonday() {
    const now = new Date();
    now.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7)); // Adjust to the next Monday
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

let selectedShiftId = null;

function initShiftsRightClick() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const shifts = ['morning', 'evening', 'night'];

    days.forEach((day, dayIndex) => {
        shifts.forEach((shift, shiftIndex) => {
            const shiftId = `${day}-${shift}`;
            const shiftElement = document.getElementById(shiftId);
            if (shiftElement) {
                shiftElement.addEventListener('contextmenu', function(event) {
                    event.preventDefault();
                    showContextMenu(event.pageX, event.pageY, this.id);
                });
            }
        });
    });
}

function showContextMenu(x, y, shiftId) {
    const menu = document.getElementById('context-menu');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
    selectedShiftId = shiftId; // Store the ID of the right-clicked shift
}

// Hide the context menu when clicking elsewhere
document.addEventListener('click', function(event) {
    const menu = document.getElementById('context-menu');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    }
});

function highlight() {
    if (selectedShiftId) {
        const shiftElement = document.getElementById(selectedShiftId);
        if (shiftElement) {
            if (shiftElement.getAttribute('data-highlighted') === 'true') {
                // If already highlighted, reset to normal
                shiftElement.style.border = '1px solid #a8c3ae';
                shiftElement.setAttribute('data-highlighted', 'false');
            } else {
                // Otherwise, set highlight border
                shiftElement.style.border = '2px solid #D92E20';
                shiftElement.setAttribute('data-highlighted', 'true');
            }
        }
    }
}

function editShift() {
    if (selectedShiftId) {
        makeShiftsEditableForEditOneShift(selectedShiftId);
    }
}

function makeShiftsEditableForEditOneShift(shiftId, scheduleGenerator) {
    const shiftElement = document.getElementById(shiftId);
    if (shiftElement) {
        const workerElement = shiftElement.querySelector('p:nth-child(3)'); // Selects the worker paragraph
        workerElement.contentEditable = "true";
        workerElement.style.border = "1px solid #ccc"; // Style to indicate that the element is editable
        workerElement.style.padding = "5px";
        workerElement.addEventListener('blur', function() {
            // Remove the prefix "Workers: " and then trim any leading/trailing whitespace
            const cleanedText = this.textContent.replace("Workers: ", "").trim();
            // Save changes when the user finishes editing
            updateShiftData(shiftElement.id, cleanedText);
        });
    }
}

async function updateShiftData( shiftId, newText) {
    const [day, shiftType] = shiftId.split('-'); // e.g., "monday-morning"
    const dayIndex = daysMap.indexOf(day);
    const shiftIndex = shiftsMap.indexOf(shiftType);

    if (dayIndex === -1 || shiftIndex === -1) {
        console.error('Invalid shift or day ID');
        return;
    }

    // Convert the new text to an array of workers
    const workers = newText.split(',').map(worker => worker.trim()).filter(Boolean);

    // Update the scheduleGenerator's shifts array
    scheduleGenerator = new ScheduleGenerator();

    try {
        const data = await getShiftScheduleOfNextWeek();
        console.log("Response from getShiftScheduleOfNextWeek:", data);
        if (data && data.length > 0) {
            scheduleGenerator.shifts[dayIndex][shiftIndex] = workers;
           await editWeekSchedule(scheduleGenerator, data);

        } else {
            console.log("No existing schedule found, creating a new one.");
        }
    } catch (error) {
        console.error("Error updating/creating schedule:", error);
        alert("Error updating/creating schedule: " + error.message);
    }
    showSuccessMessage("Schedule was edited successfully")

}

function showSuccessMessage(message) {
    const messageText = document.getElementById('message-text');
    messageText.textContent = message;

    const messageContainer = document.getElementById('message-container');
    messageContainer.style.display = 'block'; // Make it visible in the layout
    setTimeout(() => {
        messageContainer.style.opacity = '1'; // Fade in
    }, 10); // Short delay to ensure the display block is rendered first

    // Automatically fade out after 3 seconds
    setTimeout(() => {
        messageContainer.style.opacity = '0'; // Start fade out
        // Wait for fade out to finish before hiding the element
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 500); // This should match the transition time in CSS
    }, 3000);
}