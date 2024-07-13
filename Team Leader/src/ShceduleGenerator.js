class ScheduleGenerator {
    constructor() {
        this.startDate = this.calculateNextMonday();
        // Initialize a 7x3 matrix for the shifts (morning, evening, night for each day of the week)
        // Each position in the matrix starts as an empty array to hold names of workers
        this.shifts = Array.from({ length: 7 }, () => Array(3).fill().map(() => []));
        this.workerDays = Array.from({ length: 7 }, () => Array(3).fill().map(() => []));
        this.totalWorkers = 0;
        this.maxWorkersPerShift = 0;
    }

    // Helper method to calculate next Monday
    calculateNextMonday() {
        const now = new Date();
        now.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7)); // Adjust to the next Monday
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Method to serialize the week shifts to JSON for easy storage or transmission
    toJSON() {
        return JSON.stringify({
            startDate: this.getFormattedStartDate(),
            shifts: this.shifts
        });
    }

    getFormattedStartDate() {
        return `${this.startDate.getFullYear()}-${this.startDate.getMonth() + 1}-${this.startDate.getDate()}`;
    }

    // Merges new shifts data into the existing week's shifts and calculates the maximum number of workers per shift
    mergeShiftsData(newShifts) {
        console.log(newShifts[0].length);
        for (let i = 0; i < newShifts.length; i++) {
            for (let j = 0; j < newShifts[i].length; j++) {
                if (!isBlank(newShifts[i][j])) {
                    this.shifts[i][j].push(newShifts[i][j]);
                    this.totalWorkers++;
                }
            }
        }
        this.calculateMaxWorkersPerShift();
    }

    // Calculate the maximum number of workers per shift
    calculateMaxWorkersPerShift() {
        const totalShifts = 7 * 3; // 7 days, 3 shifts per day
        this.maxWorkersPerShift = Math.max(1, Math.floor(this.totalWorkers / totalShifts));
    }

    generateSchedule() {
        for (let day = 0; day < 7; day++) {
            this.workerDays[day] = [];
            for (let shiftType = 0; shiftType < 3; shiftType++) {
                this.generateShift(day, shiftType);
            }
        }
    }

    generateShift(dayIndex, shiftType) {
        let potentialWorkers = this.shifts[dayIndex][shiftType];
        let finalWorkers = [];

        // Shuffle the potentialWorkers array
        this.shuffleArray(potentialWorkers);

        for (let worker of potentialWorkers) {
            if (this.canWorkThisShift(worker, dayIndex, shiftType)) {
                finalWorkers.push(worker);
                this.workerDays[dayIndex].push(worker);
                // Check if we have reached the maximum number of workers for this shift
                if (finalWorkers.length >= this.maxWorkersPerShift) {
                    break;
                }
            }
        }

        this.shifts[dayIndex][shiftType] = finalWorkers;
    }

    canWorkThisShift(worker, dayIndex, shiftType) {
        // Check if the worker has already worked today
        if (this.workerDays[dayIndex].includes(worker)) {
            return false;
        }

        // Check if the worker worked the night shift the previous day
        if (dayIndex > 0 && this.shifts[dayIndex - 1][2].includes(worker) && (shiftType === 0 || shiftType === 1)) {
            return false; // Can't work morning or evening after a night shift
        }

        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
            [array[i], array[j]] = [array[j], array[i]]; // swap elements
        }
    }
}

function isBlank(str) {
    return !str || str.trim().length === 0;
}