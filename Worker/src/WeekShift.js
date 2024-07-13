class WeekShift {
    constructor() {
        this.startDate = this.calculateNextMonday();
        // Initialize a 3x7 matrix for the shifts (morning, evening, night for each day of the week)
        this.shifts = Array.from({ length: 7 }, () => Array(3).fill(null));  // fill with null instead of 0
    }

    // Helper method to calculate next Monday
    calculateNextMonday() {
        const now = new Date();
        now.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7)); // Adjust to the next Monday
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Method to set a shift as available (username) or unavailable (null)
    setShift(dayIndex, shiftIndex, value) {
        if (dayIndex < 0 || dayIndex > 6 || shiftIndex < 0 || shiftIndex > 2) {
            throw new Error("Invalid day or shift index");
        }
        this.shifts[dayIndex][shiftIndex] = value;  // value can be the username or null
    }

    // Convert to JSON for easy storage or transmission
    toJSON() {
        return JSON.stringify({
            startDate: this.startDate.toISOString().slice(0, 10), // Format as YYYY-MM-DD
            shifts: this.shifts
        });
    }
}