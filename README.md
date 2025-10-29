# Stack used and reasoning

I am most familiar with this tech stack, built around Next.js, React and PostgreSQL, as it provides a modern full-stack solution. React serves as the core UI library, chosen for its component-based architecture which allows for the creation of highly modular and easily maintainable interfaces. The application leverages Next.js as the full-featured framework, providing robust Server-Side Rendering (SSR) for performance and a unified TypeScript/JavaScript environment for both frontend and backend. Finally, PostgreSQL was selected for its standard reliability and data integrity, while Prisma (ORM) ensures secure, type-safe communication with the database.

# Project Setup & Documentation

This document provides all necessary instructions to set up, run, and understand the core status of the project.


------------------------------------------------------------------------------------------------------


## ⚙️ Prerequisites

Before you begin the setup process, ensure you have the following essential software installed on your system:

**ToolPurposeNode.js & npmJavaScript** - runtime and package manager (https://nodejs.org/en/download)
**Docker Desktop** - Required to run the PostgreSQL database container (https://docs.docker.com/desktop/setup/install/windows-install/)

### ⚠️ IMPORTANT: Environment Variables

**Environment variables** (including database credentials) should have been sent to you via email. Before proceeding with the setup, be sure to set these variables in the **`.env`** file located in the project's root directory.


------------------------------------------------------------------------------------------------------


## 💻 Local Setup Guide

Follow these steps sequentially to initialize the database and run the application locally.

1.  **Install Dependencies**
    Installs all packages listed in `package.json`.
    ```bash
    npm i
    ```

2.  **Start Database Container**
    Starts the PostgreSQL database server in a Docker container in detached mode (`-d`).

    ```bash
    docker compose up -d
    ```

3.  **Run Database Migrations**
    Migrates the Prisma schema to the database, applying any pending changes.
    ```bash
    npx prisma migrate dev
    ```

4.  **Generate Prisma Client**
    Generates the type-safe Prisma client necessary for the application to interact with the database.
    ```bash
    npx prisma generate
    ```

5.  **Seed the Database**
    Populates the database with initial data (e.g., country/list data).
    ```bash
    npx prisma db seed
    ```

6.  **Launch Prisma Studio (Optional)**
    Starts the web UI for database management.
    ```bash
    npx prisma studio
    ```
    *Access the Database UI directly at: **`localhost:5555`***

7.  **Start the Project**
    Starts the application locally in development mode.
    ```bash
    npm run dev
    ```


------------------------------------------------------------------------------------------------------


## 🕒 Development Status & Notes

### Time Investment
* **Time Taken:** Approximately 30ish hours.

### Scope & Limitations

I covered most of the core requirements. Below are specific notes regarding project scope and design choices:

* **Missing Features:**
    * Backend/Frontend documentation.
    * Unit tests.
    * Basic Authentication (The files are present but commented out and currently unused. I was actively working on this process). Please ignore the commented-out authentication files.

* **Limitations:**
    * Cross-browser testing was not performed.
    * Pagination is **only implemented for the Airport List** (`/protected/airports`) to demonstrate knowledge of the feature. Other lists (Airlines, etc.) would require a similar implementation. Also I set the default pagination value to 1 for easier functionality demonstration. 

* **Design Note on Lists:**
    The lists were created using a **custom list component solution** instead of utilizing MUI's Data Grid component. This choice was made specifically to showcase my knowledge of structuring reusable, scalable, and complex components from scratch.