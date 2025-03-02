## EcoEats 

Ever open your fridge or pantry and wonder, *What the heck do I do with all these ingredients?* That's where EcoEats comes in. We help you reduce food waste by making it easy to turn what’s in your kitchen into delicious meals. 

You simply take a picture of your fridge or pantry, and we’ll do the rest. EcoEats uses **Google’s Gemini 1.5 Prof** to automatically detect and label ingredients

Using **Gemini 2.0 Flash**, EcoEats generates personalized recipes based on the ingredients you have, your dietary preferences, and any restrictions you might have. No more scrambling to figure out dinner or tossing out forgotten produce!

By eliminating food waste, EcoEats not only helps you make the most of what’s in your kitchen but also promotes sustainable eating practices for a healthier planet.


## Table of Contents

1. [Installation](#installation)
    - [Frontend (Next.js)](#frontend-nextjs)
    - [Backend (Python - Uvicorn)](#backend-python---uvicorn)
2. [Running the Application](#running-the-application)
3. [Technologies Used](#technologies-used)
4. [License](#license)

## Installation

### Frontend (Next.js)

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ecoeats.git
    ```

2. Navigate to the frontend directory:

    ```bash
    cd ecoeats/frontend
    ```

3. Install the necessary dependencies:

    ```bash
    npm install
    ```

4. Run the development server:

    ```bash
    npm run dev
    ```

    The frontend should now be running at [http://localhost:3000](http://localhost:3000).

### Backend (Python - Uvicorn)

1. Navigate to the backend directory:

    ```bash
    cd ecoeats/backend
    ```

2. Create a virtual environment (recommended):

    ```bash
    python -m venv venv
    ```

3. Activate the virtual environment:

    - On Windows:
    
      ```bash
      .\venv\Scripts\activate
      ```

    - On macOS/Linux:
    
      ```bash
      source venv/bin/activate
      ```

4. Install the necessary dependencies from the `requirements.txt`:

    ```bash
    pip install -r requirements.txt
    ```

5. Start the backend server with Uvicorn:

    ```bash
    uvicorn app.main:app --reload
    ```

    The backend should now be running at [http://localhost:8000](http://localhost:8000).

## Running the Application

1. Start the frontend (Next.js) and the backend (Uvicorn) servers as described in the installation steps.

2. You can now access the application in your browser:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)


## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS (if used)
- **Backend**: Python, Uvicorn, FastAPI (or your chosen framework)
- **Machine Learning**: Google's Gemini 1.5 Prof & 2.0 Flash
- **Authentication**: OAuth

## Demo video 
[https://youtu.be/G_tm_ybPa-Y]
