## Harate – Secure SODE Chat

Harate (which means *chit-chat* in Kannada) is a full MERN stack messaging experience with a WhatsApp-inspired UI that is restricted exclusively to verified `@sode-edu.in` Google accounts. It ships with domain-locked Google Sign-In, JWT-protected APIs, Socket.IO real-time transport, group chat support, presence & typing indicators, and Cloudinary-backed media uploads.

### Stack
- **Frontend:** React (Vite + TypeScript), Tailwind CSS, Zustand, React Router, Socket.IO client, Google Identity Services.
- **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), Socket.IO, Cloudinary, Multer memory storage, Google Auth Library.
- **State & Auth:** JWT tokens stored client-side, Zustand stores, protected Express middleware.

### Feature Highlights
- ✨ Domain-restricted Google Sign-In with friendly rejection message for non `@sode-edu.in` accounts.
- 💬 One-to-one and group chats with last-message previews, timestamps, search, and responsive layout.
- ⚡ Socket.IO delivers instant messages, live typing indicators, and online/offline badges.
- 🖼️ Image messaging with file-size/type validation, Cloudinary uploads, and MongoDB storing URLs only.
- 🔒 JWT-guarded routes; backend re-validates that every request belongs to an authenticated institutional account.
- 👤 User search, group creation modal, logout, and profile banner showing name/email/avatar.

### Repository Layout
```
HARATE/
├── client/        # React + Vite frontend (TypeScript + Tailwind)
├── server/        # Express + Socket.IO backend (MongoDB, Cloudinary)
└── README.md
```

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string
- Google Cloud OAuth Client ID (Web)
- Cloudinary credentials (or adapt `uploadMessageImage` for Firebase Storage)

### Environment Variables
Copy the sample files and fill in secrets:
```
server/env.example  -> server/.env
client/env.example  -> client/.env
```

**Server (.env):**
```
PORT=5000
CLIENT_URL=http://localhost:5173,https://your-frontend-domain
MONGODB_URI=...
GOOGLE_CLIENT_ID=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Client (.env):**
```
VITE_GOOGLE_CLIENT_ID=...
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Local Development
```bash
# install deps
cd server && npm install
cd ../client && npm install

# dev servers
cd ../server && npm run dev      # http://localhost:5000
cd ../client && npm run dev      # http://localhost:5173
```

### Production Builds
```bash
cd client && npm run build       # outputs to client/dist
cd ../server && npm run start    # serves Express/Socket.IO
```

### Deployment Notes
- **Frontend:** Deploy `client` on Vercel/Netlify. Set the Vite env vars in the dashboard. Point to the backend REST root in `VITE_API_URL` and Socket origin in `VITE_SOCKET_URL`.
- **Backend:** Deploy `server` on Render/Railway. Use `npm install` and `npm run start`. Configure all `.env` values. Ensure the deployed frontend origin is included in `CLIENT_URL` (comma-separated if multiple origins) so CORS and Socket.IO both accept it.
- **Images:** Keep Cloudinary credentials only on the backend. The client never sees the secret.

### Key API Routes
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/google` | Verify Google credential, enforce domain, issue JWT |
| GET | `/api/auth/me` | Fetch current authenticated profile |
| GET/POST | `/api/chats` | Fetch chats / access-or-create one-to-one chat |
| POST | `/api/chats/group` | Create a new group conversation |
| PUT | `/api/chats/group/rename` | Rename group (admin only) |
| GET | `/api/chats/users/search?term=` | Search users by name/email |
| GET | `/api/messages/:chatId` | Fetch chat history (authorized participants only) |
| POST | `/api/messages` | Send a text/image message reference |
| POST | `/api/messages/upload/image` | Upload chat image → returns Cloudinary URL |

### Socket.IO Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `setup` | client → server | `{ id, name }` | Register socket + mark online |
| `join_chat` | client → server | `chatId` | Join room for real-time updates |
| `typing` / `stop_typing` | client ↔ server | `{ chatId, userId }` | Show/hide typing indicator |
| `new_message` | client → server | `message` | Push freshly sent message |
| `message_received` | server → client | `message` | Deliver message to chat peers |
| `user_online` / `user_offline` | server → client | `userId` | Presence badges |

### Manual Test Checklist
- ✅ Attempt login with non `@sode-edu.in` Google account → should display rejection banner.
- ✅ Open two browser sessions with valid users → observe online/offline transitions.
- ✅ Send text + image messages between direct and group chats → expect instant delivery without reloads.
- ✅ Watch typing indicator while another user types → indicator appears/disappears in real-time.
- ✅ Upload >5 MB or non-image file → backend blocks with validation error.
- ✅ Disconnect a socket → last-seen timestamp updates and badge flips offline.

### Next Steps
- Hook CI/CD pipelines to lint/test before deploying.
- Add push notifications or message read receipts if needed.
- Monitor socket/back-end health via Render/Railway dashboards after deployment.

Happy chatting! 💬

