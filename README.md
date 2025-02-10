# StockTrack

**StockTrack** is a web-based platform that allows users to track stock market performance, view real-time stock data, and manage their watchlist. Users can create accounts, log in securely, and store their preferred stocks for easy access. The app is built with a full-stack setup using Node.js, React, PostgreSQL, and Redux.

---

## Features

- **User Authentication:** Secure account registration and login using JWT authentication.
- **Watchlist Management:** Add, view, and remove stocks from a personalized watchlist.
- **Real-Time Stock Data:** Fetch live stock data using the Polygon.io API.
- **Responsive Design:** Optimized for both desktop and mobile viewing.
- **State Management:** Redux is used to manage global state.

---

## Tech Stack

### Frontend:

- React (Vite setup)
- TypeScript
- Redux (for state management)
- CSS (custom styling)

### Backend:

- Node.js (Express)
- TypeScript
- PostgreSQL (hosted on NeonDB)
- JWT for authentication
- API integration with Polygon.io

### Database:

- PostgreSQL with NeonDB
- Tables for users, watchlists, and stocks

---

## Project Structure

```
StockTrack/
├── backend/
│   └── src/
│        └── server.ts
├── frontend/
│   └── src/
│        ├── App.tsx
│        └── main.tsx
├── types/
└── .gitignore
```

---

## Installation

### Prerequisites:

- Node.js (v16 or higher)
- PostgreSQL (or access to NeonDB)

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd StockTrack/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   POLYGON_API_KEY=your_polygon_api_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd StockTrack/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`, and the backend at `http://localhost:3000`.

---

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive a JWT token

### Watchlist

- `GET /watchlist` - Fetch the user's watchlist (requires authentication)
- `POST /watchlist` - Add a new stock to the watchlist (requires authentication)
- `DELETE /watchlist/:ticker` - Remove a stock from the watchlist (requires authentication)

---

## Development Workflow

1. Use `Redux Dev Tools` for testing and debugging global state.
2. Ensure the frontend is synchronized with backend API endpoints.
3. Use `ES6` or `ES2016` standards for JavaScript development.

---

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push the changes:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For questions or feedback, please contact [[galomer6708@gmail.com](mailto\:galomer6708@gmail.com)].

