<h1 align="center">ShiftMaster Client</h1>

<p align="center">A web-based application for efficient shift scheduling and management</p>

<div>
  <img src="https://github.com/user-attachments/assets/3b24f633-fed5-498a-ba72-4db8b1156e87" alt="Screenshot 1" style="width:800px; height:auto;">
   <img src="https://github.com/user-attachments/assets/dd99e44f-1744-468b-af60-0654287fcb8f" alt="Screenshot 5" style="width:800px; height:auto;">
  <img src="https://github.com/user-attachments/assets/02a1cba6-d8c2-454b-be44-4ccd676d43c5" alt="Screenshot 2" style="width:800px; height:auto;">
  <img src="https://github.com/user-attachments/assets/f27ec0c5-8f4b-4e2a-88da-6f34bdfb4df4" alt="Screenshot 3" style="width:800px; height:auto;">
  <img src="https://github.com/user-attachments/assets/6633d128-f6d0-49ec-9742-fa5ff3ff2ef6" alt="Screenshot 4" style="width:800px; height:auto;">
</div>

<h2>🚀 Overview</h2>

ShiftMaster Client is a comprehensive web application designed to streamline the process of generating and managing weekly shift schedules for workers. It offers an intuitive interface for both managers and workers, ensuring efficient and fair allocation of shifts while adhering to real-world scheduling constraints.

<h2>✨ Features</h2>

- 📅 **Weekly Shift Generation**: Automatically create shift schedules based on available workers
- ✏️ **Shift Editing**: Manually adjust shifts and highlight specific ones for better visibility
- 🔐 **User Authentication**: Secure login for managers and workers
- ⚡ **Real-Time Adjustments**: Make on-the-fly changes to the schedule as needed
- 📣 **Notifications**: Alert workers about their schedules and any updates
- ⚖️ **Compliance**: Ensure shift schedules comply with labor laws and worker preferences

<h2>🗂️ Project Structure</h2>

- `index.html`: Home page of the application
- `create_schedule.html`: Interface for generating and managing weekly shift schedules
- `weekly_shifts.html`: View the generated weekly shifts
- `enter_shifts_script.js`: Main JavaScript file for handling shifts and user interactions
- `styles.css`: CSS file for styling the application

<h2>🖥️ Usage</h2>

Generate Weekly Schedule: Click on the "Generate Weekly Schedule" button to automatically create shifts based on available workers.
Edit Shifts: Right-click on a shift to open the context menu. Select "Edit" to make changes to the shift. Click "Save" to submit the changes.
Highlight Shifts: Right-click on a shift and select "Highlight" to mark it for special attention.
View Weekly Shifts: Navigate to the "Weekly Shifts" page to view the generated shifts for the week.
Submit Shifts: Click on the "Submit" button to save the shifts and notify workers.

<h2>🔗 API Endpoints</h2>

The application interacts with the backend server through the following endpoints:

<h3>Users API</h3>

- `POST /superapp/users`: Create a new user
- `GET /superapp/users/login/{superapp}/{email}`: Login valid user and retrieve user details
- `PUT /superapp/users/{superapp}/{userEmail}`: Update user details

<h3>SuperApp Objects API</h3>

- `POST /superapp/objects`: Create an object
- `PUT /superapp/objects/{superapp}/{id}`: Update an object
- `GET /superapp/objects/{superapp}/{id}`: Retrieve object
- `GET /superapp/objects`: Get all objects

<h3>MiniApp Command API</h3>

- `POST /superapp/miniapp/{miniAppName}`: Invoke a Command

<h3>Admin API</h3>

- `DELETE /superapp/admin/users`: Delete all users in the superapp
- `DELETE /superapp/admin/objects`: Delete all objects in the superapp
- `DELETE /superapp/admin/miniapp`: Delete all commands history
- `GET /superapp/admin/users`: Export all users
- `GET /superapp/admin/miniapp`: Export all MiniApps Commands history
- `GET /superapp/admin/miniapp/{miniAppName}`: Export Commands history of a specific MiniApp
