PDFGigs: Your Sheet Music Inventory  

Welcome to the Overworld of sheet music management!

PDFGigs is a robust frontend application designed for musicians to organize, upload, and manage their PDF sheet music files. We have transformed the user experience into a nostalgic journey with a user interface entirely inspired by Minecraft.
___
🔗 Project Ecosystem (The Whole World)
This repository contains the Frontend component of the system. PDFGigs consumes a dedicated RESTful API to handle all data and authentication, forming a complete application ecosystem.
___
## 📸 In-Game Screenshots (The View)

*Here is a glimpse of the pixelated interface and key components in action.*

| 🔒 Login | 📚 User Register |
| :---: | :---: |
| <img width="300" alt="Login screen with Minecraft style" src="https://github.com/user-attachments/assets/727c6c7e-0d85-45f7-b2b8-978159e3a554" /> | <img width="300" alt="User list of scores in Minecraft style" src="https://github.com/user-attachments/assets/8299341e-af96-433a-9340-6155aa06b0e9" /> |
| **⚒️ User Panel** | **⚒️ Admin Panel** |
| <img width="300" alt="Admin dashboard view" src="https://github.com/user-attachments/assets/eb591776-80be-41c5-8578-84c40d7b504a" /> | <img width="300" alt="Minecraft style alert modal" src="https://github.com/user-attachments/assets/2cbbe604-b7ab-49e9-8e74-31902c047201" /> |
___
💎 Features (Key Blocks)  
👤 For Musicians (Adventurers)  
📤 Sheet Music Crafting (CreatePdf.jsx): Easily upload new PDF files to your personal library.  
- 📚 Personal Inventory (PdfList.jsx): A clear, filterable list of only your scores.
- 📝 Resource Editing and Mining: Edit metadata and use the 🗑️ Delete button to permanently mine (delete) a file.
___
👑 For Administrators (System Architects)
- ⚒️ Admin Panel (DashboardAdmin.jsx): Control center with navigation to Manage Scores and Manage Users.
- 📚 Total Score Management (AdminPdfList.jsx): Access and control over ALL scores uploaded to the system.
- 👥 User Management (Implied): Tools to promote or demote user roles.
___
🛠️ Technology (Crafting Tools)
- React: Main library for building the user interface.
- React Router DOM: For navigation and protected routes.
- Context API: Used for global authentication state management.
- Axios / axiosInstance: For secure communication with the Reactive RESTful API.
- Plain CSS/Modules: Thematic design based on the pixel-art style.
___
🚀 Installation (Building Your World)  
To run the project locally, follow these steps:  
1.- Install and Run the Backend: Clone and configure the backend repository first, as the frontend application relies on it to function.
```java
git clone https://github.com/adolcc/pdgigs
cd pdgigs # or your backend folder name
# Follow the backend README instructions (dependencies, DB setup, etc.)
# Start the API
```
2.- Clone the Frontend Repository (This one):
```java
git clone https://github.com/adolcc/pdgigs-frontend
cd pdgigs-frontend
```
3.- Install Dependencies:
```java
npm install # or yarn
```
4.- Configure Environment Variables: Ensure your .env file in the project root points to the URL where the backend is running (typically http://localhost:8080/api):
```java
VITE_API_URL=http://localhost:8080/api
```
5.- Run the Frontend Application:
```java
npm run dev # or yarn dev
```
___
🎮 Usage (Let's Play)
- Log In: Use your Musician (User) or Administrator account.
- Musician: Access the 🎵 My Sheet Music Library (DashboardUser.jsx) to manage your scores.
- Administrator: Access the ⚒️ Administration Panel (DashboardAdmin.jsx) to manage scores and users globally.
