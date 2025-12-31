BeyondChats - AI Content Curator

An automated full-stack pipeline that scrapes blog content, processes it using an asynchronous worker node (simulating AI enhancement), and displays the results in a real-time React dashboard.

Flow Explanation:
1. Seeding: The Backend scrapes the source website and saves raw HTML to MongoDB.
2. Queueing: Articles are saved with a Pending status.
3. Processing: The separate Worker Node continuously polls the API for pending articles.
4. Enhancement: The Worker processes the text (via OpenAI or fallback logic) and updates the status to Completed.
5. Display: The React Frontend polls the backend to update the UI in real-time.

Features:
Robust Web Scraper: Smartly identifies and extracts content from blog URLs.
Asynchronous Processing: Worker node handles heavy lifting independently of the main API.
Real-time Updates: Frontend polls for status changes (Pending → Processing → Completed).
Resilient Deployment: configured with "Keep-Alive" servers for cloud hosting (Render).
Security: Implements Helmet headers, Rate Limiting, and MongoDB Sanitization.

Tech Stack

Frontend:
React (Vite): Fast, modern UI library.
Axios: For API communication.
Lucide React: Beautiful, lightweight icons.
CSS3: Custom responsive styling (Flexbox/Grid).

Backend:
Node.js & Express: RESTful API server.
MongoDB & Mongoose: NoSQL database for flexible content storage.
Cheerio: For parsing and scraping HTML.
Helmet & Rate-Limit: Security middleware.

Worker:
Node.js: Independent runtime.
OpenAI API: (Optional) For content summarization.

Prerequisites
Before running this project, ensure you have:
~Node.js (v16 or higher)
~Git
~A MongoDB Atlas Connection String.

Local Installation & Setup
Follow these steps to run the entire system locally.

1. Clone the Repository
git clone [https://github.com/your-username/BeyondChats-Assignment.git](https://github.com/your-username/BeyondChats-Assignment.git)
cd BeyondChats-Assignment

2. Setup Backend
cd backend
npm install
# Create .env file (see below)
node server.js

The backend runs on http://localhost:5000

3. Setup Worker (Open a new terminal)
cd worker_node
npm install
# Create .env file (see below)
node index.js

The worker will start polling the backend.

4. Setup Frontend (Open a new terminal)
cd client
npm install
npm run dev

Deployment:
This project is deployed live!

Frontend (Vercel): [https://beyond-chats-task.vercel.app](https://beyond-chats-task.vercel.app/)
Backend (Render): [https://beyondchat-backend-f67f.onrender.com](https://beyondchat-backend-f67f.onrender.com)
Worker (Render): Background Service

