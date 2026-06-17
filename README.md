# AI Course Generation Platform

This repository contains the full-stack AI Course Generation Platform, which includes a Spring Boot backend (running on Java 25), a Vite React frontend, and a PostgreSQL database.

---

## Running the Application with Docker

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Quick Start
1. Navigate to the root directory of the project.
2. Build and start all services (Database, Backend, and Frontend) in the background:
   ```bash
   docker-compose up --build -d
   ```
3. To view logs and monitor progress:
   ```bash
   docker-compose logs -f
   ```
4. To stop the application:
   ```bash
   docker-compose down
   ```

### Accessing the Services

* **Frontend UI**: Open [http://localhost:3000](http://localhost:3000) in your web browser.
* **Backend API**: The API runs on [http://localhost:8080](http://localhost:8080).
* **Database**: PostgreSQL is exposed locally on port `5432` (Username: `postgres`, Password: `password`, Database: `aicourse`).

---

# API Documentation

This document provides a comprehensive list of all backend API endpoints available in the AI CourseGen Spring Boot
application. All endpoints are prefixed with the base URL (default: `http://localhost:8080`).

---

## 1. Authentication & User Profile

Manages security, session, and user metadata.

### Register User

* **Method**: `POST`
* **URL**: `/api/auth/register`
* **Request Body**: `{"username": "johndoe", "password": "password123"}`
* **Success (201)**: `{"token": "JWT", "user": { "id": 1, "username": "johndoe", ... }}`

### Login

* **Method**: `POST`
* **URL**: `/api/auth/login`
* **Request Body**: `{"username": "...", "password": "..."}`
* **Success (200)**: Returns user object and fresh JWT token.

### Get Session Info (Me)

* **Method**: `GET`
* **URL**: `/api/auth/me`
* **Description**: Returns basic info for the logged-in user.

### Detailed Profile (About)

* **Method**: `GET`
* **URL**: `/api/about/profile`
* **Success (200)**: `{"id": 1, "username": "...", "displayName": "...", "about": "...", "token": "..."}`

### Update Profile

* **Method**: `PUT`
* **URL**: `/api/about/profile`
* **Request Body**: `{"displayName": "...", "about": "..."}`

---

## 2. Course Management

Core logic for generating and managing AI courses.

### AI Course Generation (Full)

* **Method**: `POST`
* **URL**: `/api/courses/create`
* **Request Body**: `{"title": "Intro to Java", "difficulty": "BEGINNER"}`
* **Description**: Triggers full course generation including curriculum structure.

### Generate Outline Only

* **Method**: `POST`
* **URL**: `/api/courses/generate-outline`
* **Description**: Returns the module structure without generating lesson content.

### Get My Courses

* **Method**: `GET`
* **URL**: `/api/courses/my-courses`

### Get Specific Course

* **Method**: `GET`
* **URL**: `/api/courses/{id}`

### Manage Modules

* **Add**: `POST /api/courses/{courseId}/modules` (`{"title": "..."}`)
* **Rename**: `PUT /api/courses/{courseId}/modules/{moduleId}`
* **Delete**: `DELETE /api/courses/{courseId}/modules/{moduleId}`

---

## 3. Lesson Content & Progress

### Generate Lesson Content (AI)

* **Method**: `POST`
* **URL**: `/api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/generate`
* **Description**: Generates detailed content blocks (text, code, exercises) for a lesson.

### Track Progress

* **Complete**: `PUT /api/progress/lessons/{lessonId}/complete?courseId={id}`
* **Incomplete**: `PUT /api/progress/lessons/{lessonId}/incomplete?courseId={id}`
* **Get Status**: `GET /api/progress/courses/{courseId}`

### Quiz Attempts

* **Method**: `POST`
* **URL**: `/api/progress/lessons/{lessonId}/quiz-attempts?courseId={id}`
* **Request Body**: `{"quizIndex": 0, "correct": true}`

---

## 4. Workspaces & Projects

Organize courses into themed containers.

### Create Project

* **Method**: `POST`
* **URL**: `/api/projects`
* **Request Body**: `{"name": "Semester 1", "description": "...", "color": "#ff0000"}`

### Associate Course

* **Method**: `POST`
* **URL**: `/api/projects/{id}/courses/{courseId}`

---

## 5. Sharing & Direct Invites

### Generate Public/Private Share Link

* **Method**: `POST`
* **URL**: `/api/courses/{courseId}/share/generate`
* **Body**: `{"linkType": "PUBLIC" | "PRIVATE", "maxEnrollments": 5}`

### Send Invite Notification

* **Method**: `POST`
* **URL**: `/api/courses/{courseId}/share/invite`
* **Body**: `{"emails": ["..."], "identifier": "username"}`

### Resolve/Join Link

* **Resolve**: `GET /api/join/{token}`
* **Enroll**: `POST /api/join/{token}/enroll`

---

## 6. AI Coach (Contextual Assistant)

### Chat Response

* **Method**: `POST`
* **URL**: `/api/coach/respond`
* **Body**: `{"message": "...", "courseId": 123, "history": [...]}`

### Streaming Response (SSE)

* **Method**: `POST`
* **URL**: `/api/coach/respond/stream`
* **Accept**: `text/event-stream`

---

## 7. Media & Assets

### Asset Upload

* **Method**: `POST`
* **URL**: `/api/media/upload`
* **Form Data**: `file` (Multipart), `lessonId` (Long)

### View Asset

* **Method**: `GET`
* **URL**: `/api/media/view/{filename}`

---

## 8. Search & Leaderboard

### Global Search

* **Method**: `GET`
* **URL**: `/api/search?q=query&types=COURSE,USER`

### Autocomplete Prefix

* **Method**: `GET`
* **URL**: `/api/search/autocomplete?q=prefix`

### Leaderboard Standing

* **Global**: `GET /api/leaderboard/global`
* **My Rank**: `GET /api/leaderboard/me`

---

## 9. System & Admin

### Feature Flags (Usage Limits)

* **Method**: `GET`
* **URL**: `/api/features/me`

### LLM Health (Admin Only)

* **Method**: `GET`
* **URL**: `/api/admin/llm/health`

### MCP Tool Execution

* **Method**: `POST`
* **URL**: `/api/mcp/execute`
* **Body**: `{"tool": "name", "input": {...}}`

---

## Error Handling Guide

| Status Code | Meaning      | Common Cause                                                     |
|-------------|--------------|------------------------------------------------------------------|
| `200`       | OK           | Successful fetch/update.                                         |
| `201`       | Created      | Successful resource creation.                                    |
| `204`       | No Content   | Successful deletion or empty success.                            |
| `304`       | Not Modified | Cached content (handled automatically).                          |
| `400`       | Bad Request  | Missing/Invalid fields in request body.                          |
| `401`       | Unauthorized | Token missing, expired, or invalid.                              |
| `403`       | Forbidden    | Insufficient permissions (e.g., student trying to access admin). |
| `404`       | Not Found    | Resource ID does not exist.                                      |
| `500`       | Server Error | Internal AI failure or database exception.                       |

*Generated by Antigravity AI - System Documentation Module*
