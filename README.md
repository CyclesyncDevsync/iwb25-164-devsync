# CircularSync

**AI-Powered Circular Economy Platform**

CircularSync is an enterprise-grade platform that transforms industrial waste management through intelligent material matching, real-time auctions, and comprehensive workflow automation. Built with Ballerina microservices, Next.js 14+, and deployed on Choreo Platform.

## Overview

CircularSync revolutionizes the circular economy by connecting industrial waste suppliers with buyers through an intelligent marketplace. Our platform combines real-time auctions, AI-powered quality assessment, field agent verification, and secure payment processing to create a seamless waste-to-resource transformation ecosystem.

### Core Value Proposition
- **Environmental Impact:** Divert industrial waste from landfills
- **Economic Efficiency:** Transform waste into valuable resources with transparent pricing
- **Quality Assurance:** Google Vision API-powered assessment with field agent verification
- **Real-time Operations:** Live auctions, instant notifications, and real-time chat

##  System Architecture

<img width="1025" height="757" alt="image" src="https://github.com/user-attachments/assets/2fed5ddb-51a9-4625-9222-ef38ac17c885" />

##  Features

###  Multi-Role Platform
- **Super Admin:** Complete platform oversight and admin management
- **Admin:** System monitoring, dispute resolution, agent management  
- **Field Agents:** Mobile verification app with offline capability
- **Suppliers:** Individual & organizational waste material providers
- **Buyers:** Advanced search, real-time bidding, order management

###  Core Functionality
- **Material Registration:** Multi-step submission with AI-powered categorization
- **Quality Assessment:** Google Vision API integration for automated analysis
- **Auction System:** Multiple auction types (Standard, Buy It Now, Reserve, Dutch, Bulk)
- **Payment Processing:** Secure multi-wallet system with escrow protection
- **Real-time Features:** WebSocket-powered chat and live auction updates
- **Notification System:** Multi-channel delivery (In-app)

##  Technology Stack

### Frontend (Next.js 14+)
- **Framework:** Next.js 14+ with App Router and React 19.1.0
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS with custom design system
- **State Management:** Redux Toolkit with RTK Query
- **Real-time:** Socket.io client for WebSocket
- **Authentication:** Asgardeo React SDK
- **PWA:** Next-PWA with service workers
- **Forms:** React Hook Form with Zod validation

### Backend (Ballerina)
- **Runtime:** Ballerina Swan Lake 2201.12.7
- **Architecture:** Microservices with central orchestration
- **Database:** PostgreSQL (Neon Cloud)
- **Cache:** Redis for session and data caching
- **Authentication:** Asgardeo Identity Server (WSO2)
- **External APIs:** Google Vision API, OpenStreetmaps
- **WebSocket:** Real-time bidding 
- **Deployment:** Choreo Platform (WSO2)

  ![WhatsApp Image 2025-09-01 at 01 52 29_3e7f0fee](https://github.com/user-attachments/assets/6bf153d0-8e09-403e-a37a-f66dade264c7)
  ![WhatsApp Image 2025-09-01 at 01 52 56_15e9f180](https://github.com/user-attachments/assets/73e45daf-2776-4e16-a8ed-3057a61bdf03)



### Infrastructure & Security
- **Cloud:** Choreo Platform with auto-scaling
- **Database:** Neon PostgreSQL with connection pooling
- **Authentication:** OAuth2/OIDC with JWT tokens
- **Security:** Role-based access control, input validation
- **Monitoring:** Built-in Choreo observability

##  Quick Start Guide

### Prerequisites
- **Node.js 18+** and npm
- **Ballerina Swan Lake 2201.12.7+** 
- **PostgreSQL 13+** 
- **Asgardeo tenant** account
- **Google Cloud Platform** account (for Vision API)

###  Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/CyclesyncDevsync/iwb25-164-devsync.git
cd iwb25-164-devsync
```

#### 2. Backend Configuration
```bash
cd backend

# Copy configuration template
cp Config.toml.template Config.toml

# Edit Config.toml with your credentials
nano Config.toml
```

**Required Config.toml Settings:**
```toml
# Database Configuration
[circularsyncdb.database]
host = "your-neon-host.neon.tech"
port = 5432
name = "circularsync"
username = "your-username"
password = "your-password"

# Asgardeo Authentication
ASGARDEO_CLIENT_ID = "your-client-id"
ASGARDEO_CLIENT_SECRET = "your-client-secret"
ASGARDEO_TOKEN_ENDPOINT = "https://api.asgardeo.io/t/your-org/oauth2/token"

# External Services
GOOGLE_APPLICATION_CREDENTIALS = "path/to/service-account.json"
REDIS_HOST = "localhost"
REDIS_PORT = 6379
```

#### 3. Start Backend Services
```bash
# Install Ballerina dependencies
bal build

# Start all microservices
bal run

# Services will start on:
# Main API: http://localhost:8080
# Quality Assessment: http://localhost:8082
# Chatbot WebSocket: ws://localhost:8083
# Demand Prediction: http://localhost:8084
# Dynamic Pricing: http://localhost:8085
# Material Workflow: http://localhost:8086
# Agent Assignment: http://localhost:8087
```

#### 4. Frontend Configuration
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Required .env.local Settings:**
```bash
# Backend APIs
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CHATBOT_WS_URL=ws://localhost:8083
NEXT_PUBLIC_AUCTION_API_URL=http://localhost:8096

# Asgardeo Configuration
NEXT_PUBLIC_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your-org
NEXT_PUBLIC_ASGARDEO_CLIENT_ID=your-client-id
ASGARDEO_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_ASGARDEO_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Session
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-secret
```

#### 5. Start Frontend
```bash
npm run dev

# Application available at:
# http://localhost:3000
```

###  Verification
1. **Check Backend Health:**
   ```bash
   curl http://localhost:8080/health
   ```

2. **Access Application:**
   - Open http://localhost:3000
   - Click "Get Started" to begin authentication

3. **Test Features:**
   - Register as supplier and submit material
   - View live auctions
   - Test real-time chat

##  API Documentation

### Authentication
All API endpoints require Bearer token:
```bash
Authorization: Bearer <asgardeo_access_token>
```

### Core Endpoints

**Materials**
```
POST   /materials/submit          # Submit new material
GET    /materials                 # List materials
GET    /materials/{id}            # Get material details
PUT    /materials/{id}/verify     # Agent verification
```

**Auctions**
```
GET    /auctions                  # List active auctions
POST   /auctions/{id}/bid         # Place bid
GET    /auctions/{id}/bids        # Get bid history
POST   /auctions/create           # Create auction (admin)
```

**Agent Operations**
```
GET    /agents/assignments        # Get assignments
POST   /agents/reports/{id}       # Submit verification
GET    /agents/locations          # Get nearby tasks
```

**Notifications**
```
GET    /notifications             # Get notifications
PUT    /notifications/{id}/read   # Mark as read
POST   /notifications/preferences # Update preferences
```

### WebSocket Events
```javascript
// Auction WebSocket
const ws = new WebSocket('ws://localhost:8083/auctions/{auctionId}');

// Events
ws.on('bid_placed', (data) => { /* New bid */ });
ws.on('auction_ended', (data) => { /* Auction complete */ });
ws.on('price_update', (data) => { /* Price change */ });
```

##  Deployment

### Choreo Platform Deployment

1. **Build Applications**
   ```bash
   # Backend
   cd backend && bal build --cloud=choreo

   # Frontend  
   cd frontend && npm run build
   ```

2. **Deploy to Choreo**
   - Push to GitHub repository
   - Connect repository in Choreo Console
   - Configure environment variables
   - Deploy services

3. **Production Configuration**
   - Set production database credentials
   - Configure Asgardeo production tenant
   - Set up custom domains
   - Enable monitoring and alerts

##  Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Follow code style guidelines
4. Write tests for new features
5. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


### Contact
- **GitHub Issues:** [Report bugs or request features](https://github.com/CyclesyncDevsync/Cyclesync/issues)
- **Technical Support:** tech@circularsync.com
- **Business Inquiries:** business@circularsync.com


**Built with ❤️ by the CircularSync Team**

*Transforming waste into resources, powering the circular economy.*
