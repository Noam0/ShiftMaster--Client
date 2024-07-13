var userData;
var availableShiftResponse;

//date of shifts
document.addEventListener('DOMContentLoaded', async function() {
    userData = JSON.parse(localStorage.getItem('loggedInUser'));
    console.log("user details " + userData.superapp);
    const dateRangeElement = document.querySelector('#week-range');
    document.getElementById('user-name').textContent = userData.username;
    //InitUIByGetUserDetails
    availableShiftResponse = await getUserDetails(userData.userEmail, userData.superapp);
    console.log("inside the dom : " + availableShiftResponse.data.objectDetails.availableShifts);
    /*
    var objectFromJson = jsonToObjectBoundary(availableShiftResponse)
    console.log("coteret: " + objectFromJson.objectDavailableShiftResponseetails.availableShifts);
    console.log("coteret2: " + availableShiftResponse.data.objectDetails.availableShifts);
    */
    initShiftsUI(availableShiftResponse.data.objectDetails.availableShifts);
    
});

document.querySelector('.user-menu button').addEventListener('click', function() {
    const dropdown = document.querySelector('.user-menu .dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.user-menu .dropdown a').forEach(function(link) {
    link.addEventListener('click', function() {
        const dropdown = document.querySelector('.user-menu .dropdown');
        dropdown.style.display = 'none';
    });
});

function toggleShift(element) {
    element.classList.toggle('unavailable');
    element.classList.toggle('available');
    //  checkMinimumShifts();
}

/*
function checkMinimumShifts() {
    const selectedShifts = [];
    document.querySelectorAll('.day-column').forEach((column, dayIndex) => {
        selectedShifts[dayIndex] = [0, 0, 0]; // Initialize shifts for the day
        column.querySelectorAll('.shift').forEach((shift, shiftIndex) => {
            selectedShifts[dayIndex][shiftIndex] = shift.classList.contains('available') ? 1 : 0;
        });
    });

    const submitBtn = document.getElementById('submit-btn');
    const minimumShiftsSelected = selectedShifts.some(day => day.includes(1));
    submitBtn.disabled = !minimumShiftsSelected;
}

*/

//SUBMIT BUTTON ONCLICK
document.getElementById('submit-btn').addEventListener('click', function() {
    // Create an instance of the WeekShift class
    const weekShift = new WeekShift();

    // Populate the shifts matrix based on the current state of the UI
    document.querySelectorAll('.day-column').forEach((column, dayIndex) => {
        const shifts = column.querySelectorAll('.shift');
        shifts.forEach((shift, shiftIndex) => {
            // Set the shift with the username if available, otherwise null
            const isAvailable = shift.classList.contains('available') ? userData.username : null;
            weekShift.setShift(dayIndex, shiftIndex, isAvailable);
        });
    });

    // Log the resulting WeekShift object
    console.log("Week starting from:", weekShift.startDate.toDateString());
    console.log("Shift matrix:", weekShift.shifts);

    //console.log("availableshifts: " +availableShiftResponse.weekShift.shifts);
    // console.log("objectid: " + availableShiftResponse.objectId.id);
    // Optional: Submit the shifts via API or any other method
    putRequestSubmitAvailableShifts(weekShift
        ,availableShiftResponse.data.objectId.superapp
        //, "2024b.Tal.Mizrahi"
        , availableShiftResponse.data.objectId.id
        , userData.superapp
        , userData.userEmail);
});



//dates of shifts 
function getNextWeekRange() {
    const currentDate = new Date();
    const day = currentDate.getDay();
    const diffToMonday = currentDate.getDate() - day + (day === 0 ? -6:1);
    const start = new Date(currentDate.setDate(diffToMonday));
    start.setDate(start.getDate() + 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
        start: `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()}`,
        end: `${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`
    };
}

document.addEventListener('DOMContentLoaded', function() {
    const { start, end } = getNextWeekRange();
    const dateRangeElement = document.querySelector('#week-range');
    dateRangeElement.textContent = `${start} - ${end}`;

    const weekShift = new WeekShift();
    weekShift.setShift(0, 0, 1); 
    console.log("Week starting from:", weekShift.startDate.toDateString());
    console.log(weekShift.toJSON()); // Log the week's data
});

async function  getUserDetails(email, superapp){
    let response = null

    try {
        // Fetch the user details first to get the avatar (objectId)
        const userResponse = await axios.get(`http://localhost:8084/superapp/users/login/${superapp}/${email}`);
        const avatar = userResponse.data.avatar;
        const userId = userResponse.userId; // user Id
        // Extract the superapp and userId from the avatar
        const avatarParts = avatar.split('#');
        const objectId = avatarParts[1];
        
        // Fetch the object using the avatar (objectId)
        const objectResponse = await axios.get(`http://localhost:8084/superapp/objects/${superapp}/${objectId}`, {
            params: {
                superapp: superapp,
                id: objectId,//Object user id 
                userSuperapp: superapp,
                userEmail: email
            }
        });
        const availableShiftsParts = objectResponse.data.objectDetails.availableShifts.split('#');
        const availableShiftsID = availableShiftsParts[1];
        console.log("Available Shifts:", availableShiftsID);


        response = await axios.get(`http://localhost:8084/superapp/objects/${superapp}/${availableShiftsID}`, {
            params: {
                superapp: superapp,
                id: availableShiftsID,
                userSuperapp: superapp,
                userEmail: email
            }
        });
        console.log("inside the get user details" + response.data.objectDetails.availableShifts);
    }

    catch (error) {
    console.error('Error:', error);
    alert('Error Getting User ' + error.message);
}
    return response;
}

async function putRequestSubmitAvailableShifts(weekShift, superapp, id, userSuperapp, userEmail) {
    console.log ("FUNC VARIABLES: " + weekShift ,superapp, userSuperapp, userEmail );
    const url = `http://localhost:8084/superapp/objects/${superapp}/${id}`; // Using template literals to insert variables into the URL
    
    const objectDetails = {
        objectDetails: {
            "availableShifts": weekShift.shifts
        }
    }

    const config = {
        headers: {
            'Content-Type': 'application/json'
        },
        params: {
            superapp: superapp,
            id: id,
            userSuperapp: userSuperapp,
            userEmail: userEmail
        }
    };

    try {
        await axios.put(url,  objectDetails , config);
        showSuccessMessage();
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting shifts: ' + error.message);
    }
}


function initShiftsUI(submittedShifts) {
    console.log("Initializing UI with shifts data:", submittedShifts);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const shifts = ['morning', 'evening', 'night'];

    days.forEach((day, dayIndex) => {
        shifts.forEach((shift, shiftIndex) => {
            const shiftElementId = `${day}-${shift}`; // This should match the IDs set in your HTML
            const shiftElement = document.getElementById(shiftElementId);

            if (shiftElement) {
                shiftElement.classList.remove('available', 'unavailable'); // Reset classes

                if (submittedShifts[dayIndex] && submittedShifts[dayIndex][shiftIndex] === null) {
                    shiftElement.classList.add('unavailable');
                } else if (submittedShifts[dayIndex] && submittedShifts[dayIndex][shiftIndex] !== null) {
                    shiftElement.classList.add('available');
                }

                console.log(`Updated ${shiftElementId}: ${shiftElement.className}`);
            } else {
                console.error(`Shift element not found: ${shiftElementId}`);
            }
        });
    });

}


function showSuccessMessage() {
    const messageText = document.getElementById('message-text');
    messageText.textContent = 'Shifts submitted successfully!';

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