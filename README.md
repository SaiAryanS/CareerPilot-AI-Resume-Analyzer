# CareerPilot AI: Resume Analyzer

CareerPilot AI is an intelligent web application designed to help job seekers analyze their resumes against specific job descriptions. By leveraging generative AI, it provides a detailed analysis that goes beyond simple keyword matching, offering users a match score, a breakdown of matching and missing skills, and an overall status to help them improve their candidacy for a role.

## Core Features

-   **Dynamic Job Description Selection**: Users can choose from a curated list of job descriptions for various tech roles.
-   **Easy Resume Upload**: A simple interface allows users to upload their resumes in PDF format.
-   **Advanced AI Analysis**: Utilizes a sophisticated AI prompt to perform a deep, contextual analysis of the user's resume against the selected job description. The AI is instructed to be harsh and realistic, mimicking a real recruiter. The analysis identifies:
    -   `matchScore`: A percentage score (0-100) based on a weighted system that heavily prioritizes "core" required skills over "preferred" skills.
    -   `matchingSkills`: A list of skills present in both the resume and job description.
    -   `missingSkills`: A list of skills required by the job but absent from the resume.
    -   `impliedSkills`: A narrative explanation of skills the AI inferred from the resume's context (e.g., inferring "Node.js" from a project using "Express.js").
    -   `status`: A qualitative assessment ("Approved", "Needs Improvement", "Not a Match") based on the weighted score.
-   **Visual Results Display**: The analysis results are presented in a clear, easy-to-understand format with color-coded feedback based on the match score.
-   **Downloadable Reports**: Users can download a PDF of their analysis results.
-   **Privacy-Focused Analysis History**: Securely saves a summary of each analysis (resume filename, job title, and score) to a MongoDB database for future reference, without storing the full resume content.

## Technology Stack

-   **Frontend**: [Next.js](https://nextjs.org/) with React & TypeScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components
-   **AI & Backend**: [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models) for AI-powered analysis
-   **PDF Parsing**: [pdfjs-dist](https://mozilla.github.io/pdf.js/) for client-side text extraction from resumes
-   **Database**: [MongoDB](https://www.mongodb.com/) for storing analysis results

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (version 18 or higher)
-   npm or yarn
-   A MongoDB database (either a local installation or a free cloud instance from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of your project and add your Gemini API key, MongoDB connection string, and admin credentials.

    ```env
    # Obtain a Gemini API key from Google AI Studio: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY=your_gemini_api_key_here

    # Add your MongoDB connection string below.
    # Choose ONE of the options (Atlas or Local).
    MONGODB_URI=your_mongodb_connection_string_here

    # Add your predefined admin credentials below.
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=your_secure_admin_password
    ```
    
    #### Option A: MongoDB Atlas (Cloud)
    This is the recommended option for easy setup.
    1. Get your connection string from the MongoDB Atlas dashboard.
    2. It should look like: `mongodb+srv://<username>:<password>@clustername.mongodb.net/your_db_name?retryWrites=true&w=majority`
    3. Replace `<username>`, `<password>`, and `your_db_name` with your credentials.

    #### Option B: Local MongoDB Instance
    Use this option if you have MongoDB installed and running on your machine.
    1. The standard local connection string is `mongodb://localhost:27017/your_db_name`.
    2. Replace `your_db_name` with the name you want for your database (e.g., `career-pilot`).

### Running the Application

Once the dependencies are installed and the environment variables are set, you can run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.
