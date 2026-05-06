# codeColab

codeColab is a real-time collaborative code editor application.

## 📁 Project Structure

```
codeCollabe/
├── client/                 # Frontend React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend Node.js application
│   ├── package.json
│   └── server.js
├── dockerfile              # Docker configuration for building and running the app
└── README.md
```

## 🛠️ Technologies Used

### Frontend
- **React** (via Vite)
- **TailwindCSS** for styling
- **Monaco Editor** for the code editing experience
- **Yjs** & **y-socket.io** for real-time collaboration (CRDT)

### Backend
- **Node.js** & **Express**
- **Socket.IO** for WebSocket communication
- **y-socket.io** to sync Yjs documents

## 🐳 Docker Configuration

This project includes a multi-stage `dockerfile` to build and serve both the frontend and backend in a single container.

1. **Frontend Builder Stage**: Installs dependencies and builds the Vite React app (`/client/dist`).
2. **Production Stage**: Copies the backend code, installs backend dependencies, and copies the built frontend assets into the backend's `public` directory.
3. The server then runs both the Express API/WebSockets and serves the static frontend files.

**To build and run with Docker:**
```bash
docker build -t codecolab .
docker run -p 3000:3000 codecolab
```

## ☁️ AWS Deployment

To deploy this application to AWS, you can use several services since it is dockerized. Here are a few common approaches:

1. **Amazon ECS (Elastic Container Service) with Fargate**: 
   - Push your built Docker image to Amazon ECR (Elastic Container Registry).
   - Create an ECS task definition using your ECR image and run it on AWS Fargate.
2. **AWS Elastic Beanstalk**: 
   - You can deploy the Docker container directly to Elastic Beanstalk using the provided `dockerfile`.
3. **AWS App Runner**: 
   - Connect your ECR image or GitHub repository to App Runner for a fully managed container deployment.

*Note: Ensure that you map the correct ports (e.g., 3000) in your AWS security groups to allow web traffic.*
