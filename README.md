# CircularSync 🌍♻️

**Transform Industrial Waste into Valuable Resources**

CircularSync is a comprehensive circular economy platform that connects industrial waste suppliers with potential buyers through an intelligent marketplace. Built with modern web technologies and featuring PWA capabilities for mobile-first experiences.

![CircularSync Banner](./docs/images/banner.png)

## 🚀 Overview

CircularSync revolutionizes waste management by creating a marketplace where one industry's waste becomes another's treasure. Our platform features AI-powered matching, quality verification through field agents, and secure auction-based trading.

### 🎯 Core Value Proposition
- **Environmental Impact:** Divert 70%+ industrial waste from landfills
- **Economic Benefit:** Create new revenue streams for suppliers, cost savings for buyers
- **Quality Assurance:** Professional field verification ensures material standards
- **Fair Pricing:** Competitive auction system with escrow protection

## ✨ Key Features

### 👥 Multi-Role Platform
- **Super Admin:** Platform oversight and admin management
- **Admin:** System monitoring, dispute resolution, agent management
- **Field Agents:** On-site quality verification and inventory management
- **Suppliers:** Individual & organizational waste material providers
- **Buyers:** Material procurement through competitive auctions

### 🔧 Core Functionality
- **Smart Material Matching:** AI-powered supplier-buyer connections
- **Quality Verification:** Field agent photo documentation and assessment
- **Real-time Auctions:** Live bidding with automatic payment processing
- **Multi-Wallet System:** Secure payment management with escrow protection
- **Communication Hub:** Integrated chat between all stakeholders
- **Intelligent Notifications:** Multi-channel alerts (in-app, email, SMS, WhatsApp)

### 📱 Progressive Web App (PWA)
- **Offline Capability:** Field agents can work without internet connection
- **Mobile Optimized:** Touch-friendly interface for all device types
- **Push Notifications:** Real-time updates even when app is closed
- **App-like Experience:** Home screen installation and native feel
- **Fast Loading:** Optimized performance for mobile networks

## 🏗️ Technology Stack

### Frontend
- **Framework:** Next.js 14+ (React 18+)
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with MongoDB Atlas theme
- **Notifications:** react-hot-toast
- **PWA:** Next.js built-in PWA support
- **Authentication:** Asgardio React SDK
- **Real-time:** WebSocket integration

### Backend
- **Runtime:** Ballerina Swan Lake
- **Database:** PostgreSQL (Choreo managed)
- **Authentication:** Asgardio Identity Server
- **Payment Processing:** Choreo Payment Service
- **File Storage:** Choreo Object Storage
- **Deployment:** Choreo Platform

### Infrastructure
- **Cloud Platform:** Choreo (WSO2)
- **CDN:** Choreo integrated CDN
- **Monitoring:** Choreo analytics and logging
- **Security:** OAuth2/OIDC with role-based access

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Ballerina Swan Lake 2201.8.0+
- PostgreSQL 14+ (or Choreo database)
- Asgardio tenant account
- Choreo platform account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/circularsync.git
   cd circularsync
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure environment variables (see below)
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   bal build
   cp Config.toml.example Config.toml
   # Configure database and service settings
   bal run
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   psql -h your-db-host -U username -d circularsync -f database/migrations/init.sql
   ```

### Environment Variables

**Frontend (.env.local)**
```bash
# Asgardio Configuration
NEXT_PUBLIC_ASGARDIO_CLIENT_ID=your_client_id
NEXT_PUBLIC_ASGARDIO_BASE_URL=https://asgardio.io/t/your-org
NEXT_PUBLIC_ASGARDIO_REDIRECT_URL=http://localhost:3000/callback

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:9001

# PWA Configuration
NEXT_PUBLIC_APP_NAME=CircularSync
NEXT_PUBLIC_APP_DESCRIPTION=Circular Economy Marketplace
```

**Backend (Config.toml)**
```toml
[database]
host = "localhost"
port = 5432
name = "circularsync"
username = "postgres"
password = "your_password"

[asgardio]
client_id = "your_client_id"
client_secret = "your_client_secret"
introspection_url = "https://asgardio.io/t/your-org/oauth2/introspect"

[choreo]
payment_api_key = "your_payment_key"
storage_api_key = "your_storage_key"
base_url = "https://api.choreo.dev"

[server]
host = "localhost"
port = 8080
cors_allowed_origins = ["http://localhost:3000"]
```

### Development Workflow

1. **Start Development Servers**
   ```bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev

   # Terminal 2 - Backend
   cd backend && bal run

   # Terminal 3 - Database (if local)
   pg_ctl -D /usr/local/var/postgres start
   ```

2. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/docs

3. **Testing**
   ```bash
   # Frontend tests
   cd frontend && npm test

   # Backend tests
   cd backend && bal test

   # E2E tests
   npm run test:e2e
   ```

## 📱 PWA Features

### Installation
- Users can install CircularSync as a mobile app
- Works offline for field agents in remote locations
- Automatic updates when new versions are available

### Offline Functionality
- **Field Agents:** Complete verification forms offline
- **Cached Data:** Recently viewed materials and auctions
- **Sync on Connect:** Automatic data synchronization when online
- **Offline Indicators:** Clear UI feedback for connection status

### Push Notifications
- **Auction Alerts:** Bid notifications and auction endings
- **Assignment Notifications:** New verification tasks for agents
- **Payment Updates:** Transaction confirmations and receipts
- **Chat Messages:** Real-time communication alerts

## 🔌 API Documentation

### Authentication
All API endpoints require Asgardio authentication tokens:
```bash
Authorization: Bearer <asgardio_access_token>
```

### Core Endpoints

**User Management**
```
GET    /api/users/profile      # Get user profile
PUT    /api/users/profile      # Update user profile
POST   /api/admin/agents       # Add field agent (admin only)
```

**Material Management**
```
GET    /api/materials          # List materials with filters
POST   /api/materials          # Register new material
GET    /api/materials/{id}     # Get material details
PUT    /api/materials/{id}     # Update material
```

**Auction System**
```
GET    /api/auctions           # List active auctions
POST   /api/auctions/{id}/bid  # Place bid
GET    /api/auctions/{id}/bids # Get auction bids
```

**Wallet & Payments**
```
GET    /api/wallet/balance     # Get wallet balance
POST   /api/wallet/topup       # Add funds to wallet
GET    /api/transactions       # Transaction history
POST   /api/payments/process   # Process payment
```

**Chat & Notifications**
```
GET    /api/conversations      # Get user conversations
POST   /api/conversations/{id}/messages  # Send message
GET    /api/notifications      # Get notifications
PUT    /api/notifications/read # Mark as read
```

### WebSocket Events
```javascript
// Connect to real-time services
const notificationWS = new WebSocket('ws://localhost:9001/notifications');
const chatWS = new WebSocket('ws://localhost:9002/chat');

// Listen for events
notificationWS.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Handle real-time notification
};
```

## 🚀 Deployment

### Choreo Platform Deployment

1. **Build Application**
   ```bash
   # Frontend build
   cd frontend && npm run build

   # Backend build  
   cd backend && bal build
   ```

2. **Deploy to Choreo**
   ```bash
   # Upload backend service to Choreo
   # Configure environment variables in Choreo console
   # Set up database connection strings
   # Configure custom domains and SSL
   ```

3. **Environment Configuration**
   - Set production environment variables
   - Configure Asgardio production tenant
   - Set up Choreo payment and storage services
   - Configure monitoring and alerts

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented
- [ ] Performance optimization complete
- [ ] Security audit passed

## 📊 Monitoring & Analytics

### Performance Metrics
- Page load times and Core Web Vitals
- API response times and error rates
- Database query performance
- WebSocket connection stability

### Business Metrics
- User registration and engagement
- Material posting and verification rates
- Auction completion percentages
- Revenue and transaction volumes

### Monitoring Tools
- Choreo built-in monitoring dashboard
- Google Analytics for user behavior
- Sentry for error tracking
- Custom business intelligence dashboards

## 🤝 Contributing

### Development Guidelines
1. **Code Style:** Follow ESLint and Prettier configurations
2. **Git Workflow:** Feature branches with pull request reviews
3. **Testing:** Write unit tests for new features
4. **Documentation:** Update README and API docs for changes

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open pull request with detailed description

### Issue Reporting
- Use GitHub Issues for bug reports and feature requests
- Include steps to reproduce for bugs
- Provide clear acceptance criteria for features
- Label issues appropriately (bug, enhancement, documentation)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [User Manual](./docs/user-guide.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Contact
- **Technical Support:** tech@circularsync.com
- **Business Inquiries:** business@circularsync.com
- **Documentation Issues:** [GitHub Issues](https://github.com/your-org/circularsync/issues)

### Community
- [Discord Server](https://discord.gg/circularsync)
- [Developer Forum](https://forum.circularsync.com)
- [LinkedIn Page](https://linkedin.com/company/circularsync)

## 🗺️ Roadmap

### Phase 1 (Current) - Core Platform
- [x] User authentication and role management
- [x] Material registration and verification
- [x] Auction system with payment integration
- [x] Chat and notification systems
- [x] PWA implementation

### Phase 2 - Advanced Features
- [ ] AI-powered recommendation engine
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (Sinhala/Tamil)

### Phase 3 - Enterprise Features
- [ ] API marketplace for third-party integrations
- [ ] Blockchain supply chain tracking
- [ ] IoT sensor integration
- [ ] International expansion tools

## 📈 Project Stats

![GitHub stars](https://img.shields.io/github/stars/your-org/circularsync)
![GitHub forks](https://img.shields.io/github/forks/your-org/circularsync)
![GitHub issues](https://img.shields.io/github/issues/your-org/circularsync)
![GitHub license](https://img.shields.io/github/license/your-org/circularsync)

---

**Built with ❤️ by the CircularSync Team**

*Transforming waste into resources, one transaction at a time.*
