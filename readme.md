# Online Course Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to deliver a comprehensive online learning experience. This platform enables users to browse, enroll in, and engage with courses, offering tailored functionalities for students, instructors, and administrators. It is built with scalability, security, and user experience in mind, making it ideal for educational institutions or independent educators.

## Table of Contents
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Project Overview
The Online Course Platform facilitates seamless course creation, management, and participation. It supports three user roles—students, instructors, and administrators—with role-based access control (RBAC) to ensure appropriate permissions. Students can browse and enroll in courses, instructors can create and manage course content, and administrators have full control over platform operations, including user management. The platform integrates Cloudinary for media storage and uses a modern, responsive UI built with Chakra UI.

Key highlights include:
- Secure user authentication with JWT.
- Rich course content with multimedia support.
- Role-specific dashboards for streamlined user experiences.
- Optimized media delivery for fast loading.

## Technologies Used
- **Frontend**: React, Chakra UI, Axios, React Router, DOMPurify
- **Backend**: Node.js, Express.js, MongoDB (with Mongoose), Cloudinary (for media management), bcryptjs, JSON Web Tokens (JWT)
- **Deployment**: Render (for frontend and backend), MongoDB Atlas (for database hosting)
- **Other**: Docker (for containerization), Winston (for logging), Express Validator (for input validation)

## Features

- **User Authentication and Authorization**
  - Secure registration and login for students, instructors, and administrators.
  - Role-based access control (RBAC) with roles: `student`, `instructor`, `admin`.
  - JWT-based authentication for secure API access.

- **Course Management**
  - Instructors and admins can create, update, and delete courses.
  - Courses include titles, descriptions, and lessons with rich text content (rendered via DOMPurify to prevent XSS).
  - Admins have full access to manage all courses, while instructors can manage only their own.

- **Lesson Management**
  - Instructors and admins can add, edit, or delete lessons within courses.
  - Lessons support rich text content and multimedia (videos and images) hosted on Cloudinary.
  - Video playback optimized with native `<video>` elements, supporting MP4 and WebM formats.

- **Enrollment System**
  - Students can browse the course catalog and enroll in courses with a single click.
  - Instructors and admins can view enrolled students for each course.

- **Role-Specific Dashboards**
  - **Student Dashboard**: View enrolled courses and track lesson completion.
  - **Instructor Dashboard**: Manage owned courses and lessons (no Cloudinary Usage section).
  - **Admin Dashboard**: Manage users (edit username, email, password, role) and view platform-wide statistics, including Cloudinary usage.

- **User Management (Admin-Only)**
  - Admins can edit user details (username, email, password, role) via a modal interface.
  - Supports secure password updates with bcrypt hashing.

- **Course Catalog**
  - Publicly accessible course catalog with search functionality by title or description.
  - Properly renders HTML content (e.g., `<p>test</p>` as `test`) using DOMPurify.

- **Media Integration**
  - Seamless upload and management of course media (images, videos) via Cloudinary.
  - Optimized delivery with `f_auto` and `q_auto` transformations for browser compatibility.

- **Notifications**
  - In-app notifications for user actions (e.g., successful enrollment, user updates) using a notification context.

- **Reporting (Admin and Instructor)**
  - Platform statistics (total users, courses, enrollments) for admins and instructors.
  - Cloudinary usage reports (plan, storage, transformations, bandwidth) for admins only.

- **Responsive UI**
  - Navigation bar with light green background (`green.100`) and blue text (`blue.500`).
  - Mobile-friendly design with Chakra UI components.

- **Attendance Tracking**
  - Allow instructors to mark student attendance for lessons.
  - Enable students to view their attendance records.

- **Progress Tracking**
  - Track student progress through courses and lessons.
  - Issue certificates upon course completion.



## Setup Instructions

### Local Development
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jasonjpulikkottil/mern_online_course_platform.git
   cd mern_online_course_platform
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file with the following variables:
     ```plaintext
     MONGO_URI=mongodb://localhost:27017/online-course-platform
     JWT_SECRET=your_jwt_secret
     PORT=5000
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Frontend Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file with the following variable:
     ```plaintext
     REACT_APP_API_URL=http://localhost:5000/api
     ```
   - Start the frontend development server:
     ```bash
     npm start
     ```

4. **Access the Application**:
   - Open your browser and go to `http://localhost:3000`.

### Database Seeding
To reset your database and seed it with initial data, follow these steps:

1.  **Drop the Database**:
    Connect to your MongoDB instance and drop the `online-course-platform` database. You can use `mongosh`:
    ```bash
    mongosh "mongodb://localhost:27017" --eval "db.getSiblingDB('online-course-platform').dropDatabase()"
    ```

2.  **Run Seeders**:
    From the `backend` directory, run the following commands:
    ```bash
    npm run seed
    npm run seed-courses
    ```

### Deployment
1. **Database**:
   - Set up a MongoDB Atlas cluster and update `MONGO_URI` in the backend's environment variables.

2. **Backend Deployment (Render)**:
   - Create a new Web Service on [Render](https://render.com).
   - Connect your GitHub repository and select the `backend` directory.
   - Set environment variables (`MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`).
   - Use the build command `npm install` and start command `node server.js`.

3. **Frontend Deployment (Render)**:
   - Create a new Static Site on [Render](https://render.com).
   - Connect your GitHub repository and select the `frontend` directory.
   - Set the build command to `npm install && npm run build` and publish directory to `build`.
   - Add the environment variable `REACT_APP_API_URL` with the backend's deployed URL (e.g., `https://your-backend.onrender.com/api/`).

4. **Verify**:
   - Access the deployed frontend URL (e.g., `https://your-frontend.onrender.com`) and ensure it connects to the backend.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request on GitHub.

Please ensure your code follows the project's coding standards and includes tests where applicable.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.