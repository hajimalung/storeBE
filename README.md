# Store Backend API

A RESTful API backend for an e-commerce store built with Node.js, Express, and JWT authentication.

## Features

- User authentication (register/login)
- JWT token-based authorization
- Protected routes
- File-based user storage
- CORS enabled for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd storeBE
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your_secret_key_here
```

## Project Structure

```
storeBE/
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Custom middleware
│   ├── routes/         # Route definitions
│   ├── services/       # Business logic
│   └── app.js         # Application entry point
├── users.json         # File-based user storage
└── package.json
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon

## API Endpoints

### Public Routes

- `POST /auth/register` - Register a new user

  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

- `POST /auth/login` - Login user
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### Protected Routes

- `GET /protected` - Example protected route (requires JWT token)

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## CORS Configuration

The API is configured to accept requests from `http://localhost:4200` by default. Update the CORS configuration in `src/app.js` if needed.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
