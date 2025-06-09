# ClosetIQ Backend - Node.js TypeScript API

A robust, scalable Node.js backend API for ClosetIQ's AI-powered fashion platform. Built with TypeScript, Express.js, and modern development practices, this API provides comprehensive fashion intelligence services including AI classification, outfit recommendations, and wardrobe management.

## **Features**

- **AI Fashion Intelligence**: Advanced clothing classification and style analysis
- **Smart Outfit Recommendations**: Personalized outfit suggestions based on weather, preferences, and wardrobe
- **Digital Wardrobe Management**: Complete wardrobe organization and tracking system
- **Real-time Chat**: AI-powered fashion advice and styling assistance
- **Weather Integration**: Weather-based outfit recommendations
- **User Authentication**: Secure Firebase-based authentication system
- **Cloud Storage**: Cloudinary integration for image management
- **Real-time Communication**: Socket.io for live interactions

## **Tech Stack**

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Cloud Storage**: Cloudinary
- **Real-time**: Socket.io
- **Testing**: Jest
- **API Documentation**: Swagger/OpenAPI
- **Development**: Nodemon, Prettier

## **Project Structure**

```
backend-nodejs-closetiq/
├── scripts/                    # Database and utility scripts
├── src/
│   ├── config/                # Configuration files
│   │   ├── cloudinary.ts      # Cloudinary setup
│   │   ├── database.ts        # MongoDB connection
│   │   ├── firebase.ts        # Firebase configuration
│   │   └── socket.ts          # Socket.io configuration
│   ├── controllers/           # Request handlers
│   │   ├── aiController.ts    # AI classification endpoints
│   │   ├── authController.ts  # Authentication logic
│   │   ├── chatController.ts  # Chat functionality
│   │   ├── clothingController.ts # Clothing item management
│   │   ├── outfitController.ts   # Outfit operations
│   │   ├── userController.ts     # User management
│   │   ├── wardrobeController.ts # Wardrobe operations
│   │   └── weatherController.ts  # Weather integration
│   ├── middleware/            # Custom middleware
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── errorHandler.ts   # Global error handling
│   │   ├── security.ts       # Security middleware
│   │   └── validation.ts     # Request validation
│   ├── models/               # Database schemas
│   │   ├── ChatSession.ts    # Chat session model
│   │   ├── ClothingItem.ts   # Clothing item schema
│   │   ├── Outfit.ts         # Outfit model
│   │   ├── OutfitRecommendation.ts # Recommendation schema
│   │   ├── User.ts           # User model
│   │   └── Wardrobe.ts       # Wardrobe schema
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic services
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── app.ts                # Express application setup
│   ├── server.ts             # Server entry point
│   └── test-server.ts        # Testing server
├── tests/                    # Test files
├── uploads/                  # File upload directory
├── .env                      # Environment variables
├── jest.config.js           # Jest configuration
├── nodemon.json             # Nodemon configuration
├── package.json             # Dependencies and scripts
├── swagger.json             # API documentation
└── tsconfig.json            # TypeScript configuration
```

## **Prerequisites**

- **Node.js** 18.0 or higher
- **MongoDB** 6.0 or higher
- **Firebase** project with Admin SDK
- **Cloudinary** account for image storage

## **Installation \& Setup**

### **1. Clone the Repository**

```bash
git clone <repository-url>
cd backend-nodejs-closetiq
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Configuration**

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/closetiq
DB_NAME=closetiq

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# External APIs
WEATHER_API_KEY=your-weather-api-key
AI_SERVICE_URL=http://localhost:5000/api/ai

# Security
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:3000

# Socket.io
SOCKET_PORT=5001
```

### **4. Firebase Setup**

Place your Firebase Admin SDK service account key file in the root directory and update the filename in your configuration.

### **5. Database Setup**

```bash
# Start MongoDB service
mongod

# Run database setup script
npm run setup:db

# Seed initial data (optional)
npm run seed
```

### **6. Start Development Server**

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:5000`

## **Available Scripts**

```bash
# Development
npm run dev              # Start development server with nodemon
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server
npm run debug            # Start server in debug mode

# Database
npm run setup:db         # Initialize database
npm run seed             # Seed database with sample data

# Testing
npm test                 # Run test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier

# API Documentation
npm run docs             # Generate API documentation
```

## **API Endpoints**

### **Authentication**

```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/profile      # Get user profile
PUT    /api/auth/profile      # Update user profile
```

### **Clothing Management**

```
GET    /api/clothing          # Get all clothing items
POST   /api/clothing          # Add new clothing item
GET    /api/clothing/:id      # Get specific clothing item
PUT    /api/clothing/:id      # Update clothing item
DELETE /api/clothing/:id      # Delete clothing item
POST   /api/clothing/classify # Classify clothing image
```

### **Wardrobe Operations**

```
GET    /api/wardrobe          # Get user's wardrobe
POST   /api/wardrobe/items    # Add item to wardrobe
PUT    /api/wardrobe/items/:id # Update wardrobe item
DELETE /api/wardrobe/items/:id # Remove item from wardrobe
GET    /api/wardrobe/stats    # Get wardrobe statistics
```

### **Outfit Recommendations**

```
GET    /api/outfits           # Get outfit recommendations
POST   /api/outfits/generate  # Generate new outfit
GET    /api/outfits/:id       # Get specific outfit
POST   /api/outfits/save      # Save outfit
DELETE /api/outfits/:id       # Delete outfit
```

### **AI Services**

```
POST   /api/ai/classify       # Classify fashion items
POST   /api/ai/recommend      # Get AI recommendations
POST   /api/ai/compatibility  # Check style compatibility
POST   /api/ai/analyze        # Analyze wardrobe trends
```

### **Chat Interface**

```
GET    /api/chat/sessions     # Get chat sessions
POST   /api/chat/message      # Send chat message
GET    /api/chat/history/:id  # Get chat history
DELETE /api/chat/session/:id  # Delete chat session
```

### **Weather Integration**

```
GET    /api/weather/current   # Get current weather
GET    /api/weather/forecast  # Get weather forecast
POST   /api/weather/outfit    # Get weather-based outfit suggestions
```

## **Database Models**

### **User Model**

```typescript
interface User {
  _id: ObjectId;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}
```

### **ClothingItem Model**

```typescript
interface ClothingItem {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  category: string;
  subcategory: string;
  color: string[];
  brand?: string;
  size: string;
  imageUrl: string;
  attributes: ClothingAttributes;
  createdAt: Date;
}
```

### **Outfit Model**

```typescript
interface Outfit {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  items: ObjectId[];
  occasion: string;
  weather?: WeatherConditions;
  rating?: number;
  createdAt: Date;
}
```

## **Middleware**

### **Authentication Middleware**

Validates Firebase JWT tokens and attaches user information to requests[^1].

### **Error Handling Middleware**

Centralized error handling with proper HTTP status codes and error messages[^1].

### **Security Middleware**

Implements security best practices including CORS, rate limiting, and input sanitization[^3].

### **Validation Middleware**

Request validation using Joi or similar validation libraries.

## **Testing**

The project uses Jest for comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### **Test Structure**

- **Unit Tests**: Individual function and method testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and query testing

## **Development Best Practices**

### **Code Organization**

- **Modular Structure**: Each feature has its own controller, service, and route files[^1]
- **Separation of Concerns**: Clear separation between controllers, services, and data access[^1]
- **TypeScript**: Strong typing for better code quality and maintainability

### **Error Handling**

```typescript
// Proper async error handling
app.get("/api/users/:id", async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});
```

### **Environment Variables**

All configuration is managed through environment variables for security and flexibility[^1].

### **Asynchronous Operations**

Consistent use of async/await for clean asynchronous code[^1].

## **Security Features**

- **Firebase Authentication**: Secure user authentication and authorization
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Sensitive data protection

## **Performance Optimization**

- **Database Indexing**: Optimized database queries with proper indexing
- **Caching**: Redis caching for frequently accessed data
- **Image Optimization**: Cloudinary for optimized image delivery
- **Compression**: Response compression for faster API responses

## **Deployment**

### **Production Build**

```bash
npm run build
npm start
```

### **Environment Setup**

1. Set `NODE_ENV=production`[^3]
2. Configure production database
3. Set up proper logging
4. Configure monitoring and health checks

### **Docker Deployment**

```bash
# Build container
docker build -t closetiq-backend .

# Run container
docker run -p 5000:5000 closetiq-backend
```

## **API Documentation**

API documentation is available via Swagger UI at `/api-docs` when the server is running. The documentation is automatically generated from the `swagger.json` file.

## **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Follow TypeScript and ESLint conventions
4. Write tests for new functionality
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Create a Pull Request

## **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## **Support**

For questions and support, please open an issue in the repository or contact the development team.
