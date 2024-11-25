# Changelog Generator

The Changelog Generator is a web application that allows users to generate and view changelogs for GitHub repositories. Users can input a repository URL and a starting point (commit or date) to generate a changelog. The application fetches commit logs from the repository, summarizes them using a language model, and displays the summarized changelog to the user.

---

## Features
- **Generate Changelogs:** Input a GitHub repository URL and starting point to create a changelog.
- **Summarize Commit Messages:** Uses the Hugging Face Inference API to summarize commit logs for readability.
- **View Generated Changelogs:** Access a list of previously generated changelogs via a user-friendly interface.
- **Persistent Storage:** Changelogs are stored in a SQLite database for future reference.

---

## Technologies Used
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Next.js, SQLite
- **API Integration:** Hugging Face Inference API for summarization

---

## Prerequisites
- **Node.js**: Version 14 or higher
- **npm**: Version 6 or higher
- A **Hugging Face API Key**

---

## Installation

### 1. Clone the repository
```sh
git clone https://github.com/ishanbhat2004/changelog-generator.git
cd changelog-generator
2. Set up Hugging Face API Key
Sign up at Hugging Face and log in to your account.
Navigate to your account settings and generate an API key.
Create a .env file in the root of the project and add the following:
HUGGING_FACE_API_KEY=your_hugging_face_api_key
3. Install dependencies
npm install
4. Start the development server
npm run dev
The application will be available at http://localhost:3000.

Usage
Generate Changelogs
Navigate to the /developer endpoint.
Input the repository URL and starting point (commit or date) to generate a changelog.
The application fetches commits, summarizes them using Hugging Face API, and saves the changelog.
View Changelogs
Navigate to the /changelogs endpoint.
View the list of previously generated changelogs.


Endpoints
/developer
Allows users to generate new changelogs.
Inputs required: GitHub repository URL and starting point (commit or date).
/changelogs
Displays a list of previously generated changelogs.
