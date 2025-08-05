# CareerPilot AI: Resume Analyzer

CareerPilot AI is an intelligent web application designed to help job seekers analyze their resumes against specific job descriptions. By leveraging generative AI, it provides a detailed analysis that goes beyond simple keyword matching, offering users a match score, a breakdown of matching and missing skills, and an overall status to help them improve their candidacy for a role.

## Core Features

-   **Dynamic Job Description Selection**: Users can choose from a curated list of job descriptions for various tech roles.
-   **Easy Resume Upload**: A simple interface allows users to upload their resumes in PDF format.
-   **Advanced AI Analysis**: Utilizes a sophisticated AI prompt to perform a deep, contextual analysis of the user's resume against the selected job description. The analysis identifies:
    -   `matchScore`: A percentage score (0-100) indicating the resume's relevance.
    -   `matchingSkills`: A list of skills present in both the resume and job description.
    -   `missingSkills`: A list of skills required by the job but absent from the resume.
    -   `status`: A qualitative assessment ("Approved", "Needs Improvement", "Not a Match").
-   **Visual Results Display**: The analysis results are presented in a clear, easy-to-understand format with color-coded feedback based on the match score.

## Technology Stack

-   **Frontend**: [Next.js](https://nextjs.org/) with React & TypeScript
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/) components
-   **AI & Backend**: [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models) for AI-powered analysis
-   **PDF Parsing**: [pdfjs-dist](https://mozilla.github.io/pdf.js/) for extracting text from resumes

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/en) (version 18 or higher)
-   npm or yarn

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
    Create a `.env` file in the root of your project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```
    You can obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

Once the dependencies are installed and the environment variables are set, you can run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.
