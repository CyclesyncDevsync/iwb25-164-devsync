// Copyright (c) 2025 CircularSync
// Chatbot Module - Platform Knowledge Base

import ballerina/log;

# Platform knowledge base for FAQ and general queries
public class KnowledgeBase {
    private final map<string> faqs;
    private final map<string[]> categories;
    private final map<json> platformData;

    public function init() {
        self.faqs = {
            // Platform Overview
            "what_is_circularsync": "CircularSync is a comprehensive circular economy platform that connects waste producers (suppliers) with waste consumers (buyers) to facilitate sustainable waste management and resource recovery. We enable efficient trading of recyclable materials through quality assessment, demand forecasting, and live auctions.",

            "platform_purpose": "CircularSync facilitates the circular economy by creating a marketplace where waste becomes a valuable resource. We connect those who have recyclable materials with those who need them, ensuring sustainable resource management.",

            "how_platform_works": "CircularSync operates in five main steps:\n1. Suppliers submit waste materials with details (type, quantity, location)\n2. Field agents verify and assess quality using AI-powered tools\n3. Materials are listed on the marketplace with quality scores\n4. Buyers browse, bid in auctions, or purchase directly\n5. Secure payment processing and logistics coordination\n\nEverything is managed through our integrated platform with real-time updates.",

            // Features
            "platform_features": "CircularSync offers:\n• AI-powered quality assessment using Google Vision API\n• Demand prediction and market trend analysis\n• Live auctions with real-time bidding\n• Dynamic pricing based on quality and market conditions\n• Integrated wallet system for secure transactions\n• Agent verification system for material quality\n• Real-time chat and notifications\n• Analytics dashboards\n• Google Calendar integration for scheduling",

            "quality_assessment": "Our quality assessment process:\n1. Field agents visit supplier locations\n2. Take photos of materials using our mobile app\n3. Google Vision API analyzes images for contamination, purity, and condition\n4. System generates quality score (0-100)\n5. Score determines pricing and listing placement\n\nHigher quality scores lead to better prices and faster sales.",

            "demand_prediction": "Our AI analyzes:\n• Historical transaction data\n• Seasonal patterns\n• Market trends\n• Regional demand\n• Price fluctuations\n\nThis helps suppliers time their listings optimally and buyers plan purchases effectively.",

            // Waste Types
            "waste_types": "CircularSync accepts six main waste categories:\n\n1. Plastic: PET bottles, HDPE containers, plastic films, packaging\n2. Paper: Cardboard, newspapers, office paper, magazines\n3. Metal: Aluminum cans, steel scrap, copper wire, brass\n4. Glass: Bottles, jars, flat glass\n5. Organic: Food waste, agricultural residue, biodegradable materials\n6. Hazardous: E-waste, batteries, chemicals (requires special handling)",

            // User Roles
            "user_roles": "CircularSync has four user roles:\n\n1. Suppliers: Submit and sell waste materials, receive payments\n2. Buyers: Browse marketplace, participate in auctions, purchase materials\n3. Agents: Verify material quality, conduct field assessments\n4. Admins: Manage platform operations, resolve disputes\n\nEach role has specific features and permissions.",

            "supplier_info": "As a Supplier, you can:\n• Submit material listings with photos and details\n• Get AI-powered quality assessments\n• Receive demand predictions for optimal pricing\n• Participate in auctions or sell directly\n• Track orders and manage logistics\n• Receive payments through integrated wallet\n• Access analytics on your sales",

            "buyer_info": "As a Buyer, you can:\n• Browse marketplace by material type and location\n• View quality scores and photos\n• Participate in live auctions\n• Purchase materials directly\n• Schedule pickups and deliveries\n• Make secure payments through wallet\n• Track your purchase history",

            "agent_info": "Field Agents are responsible for:\n• Visiting supplier locations\n• Taking photos and conducting quality inspections\n• Uploading assessment reports\n• Verifying material descriptions\n• Ensuring platform quality standards\n\nAgents are assigned based on location proximity.",

            // Pricing & Fees
            "pricing_model": "CircularSync pricing:\n\nSuppliers: 5% commission on successful sales\nBuyers: No additional fees beyond purchase price\nAgents: Paid per verification (platform funded)\n\nDynamic Pricing Factors:\n• Quality score (higher = better price)\n• Supply and demand\n• Market trends\n• Location and transportation costs",

            "payment_process": "Payment workflow:\n1. Buyers deposit funds into CircularSync wallet\n2. Purchase amount held in escrow\n3. Material delivered to buyer\n4. Upon confirmation, funds released to supplier\n5. Platform deducts 5% commission\n6. Suppliers can withdraw to bank account\n\nPayment methods: Credit/debit cards, bank transfers",

            "wallet_system": "CircularSync Wallet:\n• Secure balance management\n• Transaction history\n• Instant deposits\n• Withdrawals within 2-3 business days\n• Low transaction fees\n• Real-time balance updates",

            // Auctions
            "auction_process": "Live auctions on CircularSync:\n• Duration: 24-72 hours typically\n• Real-time bidding\n• Auto-bid feature available\n• Notifications for outbid events\n• Countdown timer\n• Highest bidder wins\n• Automatic payment from wallet",

            "bidding_tips": "Bidding strategies:\n• Review quality scores carefully\n• Check historical prices\n• Use demand prediction insights\n• Set maximum bid limits\n• Enable auto-bid for competitive markets\n• Consider transportation costs\n• Watch for last-minute bids",

            // Registration & Getting Started
            "how_to_register": "Registration process:\n1. Click 'Register' on homepage\n2. Choose your role (Supplier/Buyer/Agent)\n3. Provide business details and contact info\n4. Upload verification documents\n5. Wait for admin approval (24-48 hours)\n6. Receive confirmation email\n7. Start using the platform\n\nVerification required for security and trust.",

            "getting_started_supplier": "Quick start for Suppliers:\n1. Register and verify account\n2. Complete business profile\n3. Submit first material listing with photos\n4. Wait for agent verification\n5. Receive quality score\n6. Material goes live in marketplace\n7. Monitor bids/offers\n8. Complete sale and arrange pickup\n9. Receive payment in wallet",

            "getting_started_buyer": "Quick start for Buyers:\n1. Register and verify account\n2. Add funds to wallet\n3. Browse marketplace by category\n4. Check quality scores and photos\n5. Place bids or buy instantly\n6. Schedule delivery\n7. Confirm receipt\n8. Leave feedback",

            // Support
            "support": "Get help:\n• AI Chatbot: 24/7 (that's me!)\n• Live Support: Monday-Friday, 9 AM - 6 PM\n• Email: support@circularsync.com\n• Help Center: Comprehensive guides and FAQs\n• Video Tutorials: Step-by-step walkthroughs",

            "contact_info": "Contact CircularSync:\nEmail: support@circularsync.com\nLive Chat: Mon-Fri, 9 AM - 6 PM\nChatbot: 24/7 (available now)\n\nFor urgent issues, use live chat during business hours.",

            // Common Questions
            "how_to_list_materials": "To list materials:\n1. Go to Supplier Dashboard\n2. Click 'Submit Material'\n3. Select waste type\n4. Enter quantity and location\n5. Upload photos\n6. Add description\n7. Submit for verification\n8. Agent will inspect within 2-3 days\n9. Once approved, listing goes live",

            "how_to_buy": "To purchase materials:\n1. Browse marketplace\n2. Filter by type, location, quality\n3. View listing details and photos\n4. Either:\n   - Place bid in auction, or\n   - Buy instantly at listed price\n5. Complete payment from wallet\n6. Schedule pickup/delivery\n7. Confirm receipt",

            "about_platform": "CircularSync is a technology platform for the circular economy. We use AI, real-time bidding, and secure transactions to make waste trading efficient and transparent. Our mission is to reduce waste and promote sustainability by connecting the right buyers with the right suppliers."
        }.cloneReadOnly();

        self.categories = {
            "platform": ["what_is_circularsync", "how_platform_works"]
        }.cloneReadOnly();

        self.platformData = {}.cloneReadOnly();

        log:printInfo("Knowledge base initialized with platform documentation");
    }

    # Load FAQ data
    function loadFAQs() returns map<string> {
        return {
            // Platform Overview
            "what_is_circularsync": "CircularSync is a comprehensive circular economy platform that connects waste producers (suppliers) with waste consumers (buyers) to facilitate sustainable waste management and resource recovery. We enable efficient trading of recyclable materials through quality assessment, demand forecasting, and live auctions.",

            "how_platform_works": "CircularSync operates in four main steps:\n1. Suppliers submit waste materials with details (type, quantity, location)\n2. Field agents verify and assess quality using AI-powered image analysis\n3. Materials are listed on the marketplace with quality scores\n4. Buyers can browse, bid in auctions, or purchase directly\n5. Transactions are processed through secure payment systems\n6. Scheduling and logistics coordination for pickup/delivery",

            "platform_features": "CircularSync offers:\n• AI-powered quality assessment using Google Vision API\n• Demand prediction and market trend analysis\n• Live auctions with real-time bidding\n• Dynamic pricing based on quality and market conditions\n• Integrated wallet system for transactions\n• Agent assignment for field verification\n• Real-time chat and notifications\n• Analytics dashboards for insights\n• Google Calendar integration for scheduling",

            // User Roles
            "user_roles": "CircularSync has four main user roles:\n\n1. **Suppliers**: Submit waste materials, receive payments, manage listings\n2. **Buyers**: Browse marketplace, participate in auctions, purchase materials\n3. **Agents**: Verify material quality, conduct field assessments, upload inspection reports\n4. **Admins**: Manage platform operations, user verification, dispute resolution",

            "supplier_registration": "To register as a Supplier:\n1. Click 'Register' and select 'Supplier' role\n2. Provide business details (company name, address, contact)\n3. Upload business verification documents\n4. Complete profile with waste types you handle\n5. Wait for admin verification (typically 24-48 hours)\n6. Once approved, you can start submitting materials",

            "buyer_registration": "To register as a Buyer:\n1. Click 'Register' and select 'Buyer' role\n2. Provide company/individual details\n3. Add business verification documents\n4. Specify material types you're interested in\n5. Await admin approval\n6. Once verified, browse materials and participate in auctions",

            "agent_role": "Field Agents are responsible for:\n• Visiting supplier locations to verify materials\n• Taking photos and conducting quality inspections\n• Uploading assessment reports with quality scores\n• Ensuring material descriptions are accurate\n• Reporting any discrepancies or issues\n\nAgents are assigned automatically based on location proximity and workload.",

            // Material Submission
            "material_submission": "To submit materials:\n1. Go to Supplier Dashboard → 'Submit Material'\n2. Select waste type (Plastic, Paper, Metal, Glass, Organic, Hazardous)\n3. Enter quantity, location, and description\n4. Upload initial photos\n5. Submit for agent verification\n6. Wait for agent inspection (usually within 2-3 business days)\n7. Receive quality score and listing goes live",

            "waste_types": "CircularSync accepts six main waste categories:\n\n1. **Plastic**: PET bottles, HDPE containers, plastic films, packaging\n2. **Paper**: Cardboard, newspapers, office paper, magazines\n3. **Metal**: Aluminum cans, steel scrap, copper wire, brass\n4. **Glass**: Bottles, jars, flat glass, mixed glass\n5. **Organic**: Food waste, agricultural residue, biodegradable materials\n6. **Hazardous**: Electronic waste, batteries, chemicals (requires special handling)",

            "quality_assessment": "Our AI-powered quality assessment process:\n1. Agent takes multiple photos of the material\n2. Google Vision API analyzes images for:\n   - Contamination levels\n   - Material purity\n   - Condition and cleanliness\n   - Sorting accuracy\n3. System generates quality score (0-100)\n4. Score determines:\n   - Listing placement\n   - Recommended pricing\n   - Buyer confidence\n5. Higher scores = better prices and faster sales",

            // Pricing and Fees
            "pricing_model": "CircularSync uses dynamic pricing:\n• Base price determined by material type and market rates\n• Quality score multiplier (higher quality = higher price)\n• Supply and demand factors\n• Transportation costs based on distance\n• Seasonal variations and market trends\n\nPlatform Fees:\n• Suppliers: 5% commission on successful sales\n• Buyers: No additional fees beyond purchase price\n• Agents: Paid per verification (fixed rate by platform)",

            "payment_process": "Payment workflow:\n1. Buyers deposit funds into CircularSync wallet\n2. Winning bid/purchase amount is held in escrow\n3. Material delivery scheduled\n4. Upon delivery confirmation, funds released to supplier\n5. Platform deducts 5% commission\n6. Suppliers can withdraw to bank account anytime\n\nPayment methods supported:\n• Credit/Debit cards (Stripe integration)\n• Bank transfers\n• Digital wallets",

            "wallet_system": "CircularSync Wallet features:\n• Secure balance management\n• Transaction history tracking\n• Instant deposits and withdrawals\n• Low transaction fees\n• Support for multiple currencies\n• Real-time balance updates\n• Withdrawal to verified bank accounts within 2-3 business days",

            // Auctions
            "auction_process": "Live auction mechanism:\n1. Materials are listed with starting bid\n2. Auction duration: typically 24-72 hours\n3. Buyers place real-time bids\n4. Auto-bid feature available\n5. Notifications for outbid events\n6. Countdown timer for auction end\n7. Highest bidder wins\n8. Payment processed automatically from wallet",

            "bidding_strategy": "Smart bidding tips:\n• Review quality scores carefully\n• Check historical price data\n• Use demand prediction insights\n• Set maximum bid limits\n• Enable auto-bid for competitive markets\n• Monitor transportation costs\n• Consider bulk purchase discounts\n• Watch for last-minute bid wars",

            // Demand Prediction
            "demand_prediction": "Our AI-powered demand forecasting:\n• Analyzes historical transaction data\n• Considers seasonal patterns\n• Factors in market trends\n• Evaluates regional demand differences\n• Provides price recommendations\n• Forecasts for next 7, 30, 90 days\n• Helps suppliers time their listings optimally\n• Assists buyers in purchase planning",

            // Logistics and Scheduling
            "scheduling_pickup": "To schedule material pickup/delivery:\n1. After successful transaction\n2. Buyer and supplier coordinate timing\n3. Use integrated Google Calendar\n4. Schedule agent verification visit\n5. Arrange transportation\n6. Get real-time notifications\n7. Track delivery status\n8. Confirm receipt to release payment",

            "location_services": "Location-based features:\n• Automatic agent assignment by proximity\n• Transportation cost calculation\n• Regional market insights\n• Local demand patterns\n• Supplier/buyer matching by geography\n• Distance-based pricing adjustments",

            // Communication
            "chat_system": "Integrated communication:\n• Direct messaging between users\n• Role-based chat rooms (suppliers, buyers, agents)\n• Admin support channel\n• File sharing for documents/photos\n• Voice messages\n• Real-time typing indicators\n• Message translation\n• Notification system for important updates",

            // Support and Help
            "customer_support": "Get help:\n• In-app chatbot (24/7 automated support)\n• Live chat with support team (Mon-Fri, 9 AM - 6 PM)\n• Email: support@circularsync.com\n• FAQ section in Help Center\n• Video tutorials\n• Admin dispute resolution for transaction issues",

            "dispute_resolution": "If issues arise:\n1. Contact the other party via chat\n2. If unresolved, raise a dispute ticket\n3. Admin team reviews evidence\n4. Both parties provide documentation\n5. Admin makes binding decision\n6. Funds held in escrow until resolution\n7. Typical resolution time: 3-5 business days",

            // Security and Verification
            "security_measures": "Platform security:\n• SSL encryption for all data\n• Secure payment processing via Stripe\n• Two-factor authentication (2FA) available\n• User verification and KYC compliance\n• Regular security audits\n• Data privacy compliance (GDPR)\n• Transaction monitoring for fraud\n• Secure document storage",

            "verification_process": "Account verification:\n1. Submit government-issued ID\n2. Business registration documents (for companies)\n3. Proof of address\n4. Tax identification number\n5. Admin review (24-48 hours)\n6. Email confirmation once verified\n7. Full platform access granted",

            // Analytics and Reports
            "analytics_dashboard": "Dashboard features:\n• Sales/purchase history\n• Revenue tracking\n• Quality score trends\n• Market demand graphs\n• Bidding performance\n• Transaction summaries\n• Export reports to PDF/Excel\n• Custom date range filtering",

            // Technical
            "technical_requirements": "System requirements:\n• Modern web browser (Chrome, Firefox, Safari, Edge)\n• Internet connection (minimum 2 Mbps)\n• Mobile app available for iOS and Android\n• Camera required for agents (quality photos)\n• JavaScript enabled\n• Cookies enabled for session management",

            "mobile_app": "Mobile app features:\n• Full platform functionality\n• Push notifications\n• Offline mode for viewing\n• Camera integration for uploads\n• GPS for location services\n• QR code scanning\n• Available on iOS and Android",

            // Policies
            "terms_of_service": "Key terms:\n• Users must be 18+ years old\n• Accurate information required\n• Prohibited items: illegal materials, stolen goods\n• Platform reserves right to suspend accounts\n• 5% commission on supplier sales\n• Refund policy: case-by-case basis\n• Full terms at circularsync.com/terms",

            "privacy_policy": "We protect your data:\n• Collect only necessary information\n• Never sell personal data\n• Secure storage and encryption\n• GDPR and CCPA compliant\n• Users can request data deletion\n• Transparent data usage\n• Full policy at circularsync.com/privacy",

            // Getting Started
            "getting_started_supplier": "Quick start for Suppliers:\n1. Register and verify your account\n2. Complete business profile\n3. Submit your first material listing\n4. Wait for agent verification\n5. Receive quality score\n6. Material goes live in marketplace\n7. Monitor bids and offers\n8. Complete sale and schedule pickup\n9. Receive payment in wallet\n10. Withdraw funds or list more materials",

            "getting_started_buyer": "Quick start for Buyers:\n1. Register and verify account\n2. Add funds to wallet\n3. Browse marketplace by category\n4. Check quality scores and photos\n5. Place bids or buy instantly\n6. Win auction or complete purchase\n7. Schedule delivery\n8. Confirm receipt\n9. Payment released to supplier\n10. Leave feedback/rating"
        };
    }

    # Load FAQ categories
    function loadCategories() returns map<string[]> {
        return {
            "platform": [
                "what_is_circularsync",
                "how_platform_works",
                "platform_features",
                "technical_requirements"
            ],
            "users": [
                "user_roles",
                "supplier_registration",
                "buyer_registration",
                "agent_role",
                "verification_process"
            ],
            "materials": [
                "material_submission",
                "waste_types",
                "quality_assessment"
            ],
            "pricing": [
                "pricing_model",
                "payment_process",
                "wallet_system"
            ],
            "auctions": [
                "auction_process",
                "bidding_strategy"
            ],
            "features": [
                "demand_prediction",
                "scheduling_pickup",
                "location_services",
                "chat_system",
                "analytics_dashboard"
            ],
            "support": [
                "customer_support",
                "dispute_resolution",
                "security_measures"
            ],
            "policies": [
                "terms_of_service",
                "privacy_policy"
            ],
            "getting_started": [
                "getting_started_supplier",
                "getting_started_buyer"
            ]
        };
    }

    # Load structured platform data
    function loadPlatformData() returns map<json> {
        return {
            "waste_types": [
                {"name": "Plastic", "examples": ["PET bottles", "HDPE containers", "plastic films"], "code": "PL"},
                {"name": "Paper", "examples": ["Cardboard", "newspapers", "office paper"], "code": "PA"},
                {"name": "Metal", "examples": ["Aluminum cans", "steel scrap", "copper wire"], "code": "MT"},
                {"name": "Glass", "examples": ["Bottles", "jars", "flat glass"], "code": "GL"},
                {"name": "Organic", "examples": ["Food waste", "agricultural residue"], "code": "OR"},
                {"name": "Hazardous", "examples": ["E-waste", "batteries", "chemicals"], "code": "HZ"}
            ],
            "user_roles": [
                {"role": "Supplier", "description": "Submit and sell waste materials"},
                {"role": "Buyer", "description": "Purchase recyclable materials"},
                {"role": "Agent", "description": "Verify and assess material quality"},
                {"role": "Admin", "description": "Manage platform operations"}
            ],
            "fees": {
                "supplier_commission": "5%",
                "buyer_fees": "0%",
                "withdrawal_fee": "Free (bank transfer)",
                "agent_payment": "Per verification (platform paid)"
            },
            "support_hours": {
                "chatbot": "24/7",
                "live_support": "Monday-Friday, 9 AM - 6 PM",
                "email": "support@circularsync.com"
            }
        };
    }

    # Search for relevant FAQ based on query with fuzzy matching
    # + query - User query
    # + return - Relevant FAQ answer or nil
    public function searchFAQ(string query) returns string? {
        string lowerQuery = query.toLowerAscii();

        // Platform info queries (flexible matching for typos like "waht", "wht", "wt")
        if (lowerQuery.includes("what") || lowerQuery.includes("wh") || lowerQuery.includes("wt") || lowerQuery.includes("waht")) {
            if (lowerQuery.includes("circular") || lowerQuery.includes("circulr") || lowerQuery.includes("platform") || lowerQuery.includes("this")) {
                return self.faqs["what_is_circularsync"];
            }
            if (lowerQuery.includes("purpose") || lowerQuery.includes("about")) {
                return self.faqs["about_platform"];
            }
            if (lowerQuery.includes("feature") || lowerQuery.includes("can")) {
                return self.faqs["platform_features"];
            }
            if (lowerQuery.includes("waste") || lowerQuery.includes("material") || lowerQuery.includes("type")) {
                return self.faqs["waste_types"];
            }
            if (lowerQuery.includes("role")) {
                return self.faqs["user_roles"];
            }
        }

        // How queries
        if (lowerQuery.includes("how")) {
            if (lowerQuery.includes("work") || lowerQuery.includes("platform") || lowerQuery.includes("operate")) {
                return self.faqs["how_platform_works"];
            }
            if (lowerQuery.includes("register") || lowerQuery.includes("signup") || lowerQuery.includes("sign up")) {
                if (lowerQuery.includes("supplier") || lowerQuery.includes("sell")) {
                    return self.faqs["getting_started_supplier"];
                } else if (lowerQuery.includes("buyer") || lowerQuery.includes("buy")) {
                    return self.faqs["getting_started_buyer"];
                } else {
                    return self.faqs["how_to_register"];
                }
            }
            if (lowerQuery.includes("list") || lowerQuery.includes("submit") || lowerQuery.includes("upload")) {
                return self.faqs["how_to_list_materials"];
            }
            if (lowerQuery.includes("buy") || lowerQuery.includes("purchase")) {
                return self.faqs["how_to_buy"];
            }
            if (lowerQuery.includes("bid") || lowerQuery.includes("auction")) {
                return self.faqs["bidding_tips"];
            }
        }

        // Registration queries
        if (lowerQuery.includes("register") || lowerQuery.includes("signup") || lowerQuery.includes("sign up") || lowerQuery.includes("join")) {
            if (lowerQuery.includes("supplier")) {
                return self.faqs["getting_started_supplier"];
            }
            if (lowerQuery.includes("buyer")) {
                return self.faqs["getting_started_buyer"];
            }
            return self.faqs["how_to_register"];
        }

        // Waste/Material queries
        if (lowerQuery.includes("waste") || lowerQuery.includes("material")) {
            if (lowerQuery.includes("type") || lowerQuery.includes("accept") || lowerQuery.includes("kind")) {
                return self.faqs["waste_types"];
            }
            if (lowerQuery.includes("submit") || lowerQuery.includes("list") || lowerQuery.includes("upload")) {
                return self.faqs["how_to_list_materials"];
            }
        }

        // Quality assessment queries
        if (lowerQuery.includes("quality") || lowerQuery.includes("assess") || lowerQuery.includes("score")) {
            return self.faqs["quality_assessment"];
        }

        // Pricing queries
        if (lowerQuery.includes("price") || lowerQuery.includes("pricing") || lowerQuery.includes("cost") || lowerQuery.includes("fee")) {
            return self.faqs["pricing_model"];
        }

        // Payment queries
        if (lowerQuery.includes("payment") || lowerQuery.includes("pay") || lowerQuery.includes("wallet")) {
            if (lowerQuery.includes("wallet")) {
                return self.faqs["wallet_system"];
            }
            return self.faqs["payment_process"];
        }

        // Auction queries
        if (lowerQuery.includes("auction") || lowerQuery.includes("bid")) {
            if (lowerQuery.includes("how") || lowerQuery.includes("tip") || lowerQuery.includes("strategy")) {
                return self.faqs["bidding_tips"];
            }
            return self.faqs["auction_process"];
        }

        // Demand prediction queries
        if (lowerQuery.includes("demand") || lowerQuery.includes("forecast") || lowerQuery.includes("predict") || lowerQuery.includes("trend")) {
            return self.faqs["demand_prediction"];
        }

        // Scheduling/Delivery queries
        if (lowerQuery.includes("schedule") || lowerQuery.includes("pickup") || lowerQuery.includes("delivery") || lowerQuery.includes("shipping")) {
            return self.faqs["scheduling_pickup"];
        }

        // Support queries
        if (lowerQuery.includes("support") || lowerQuery.includes("help") || lowerQuery.includes("contact") || lowerQuery.includes("reach")) {
            return self.faqs["contact_info"];
        }

        // User role queries
        if (lowerQuery.includes("supplier") && !lowerQuery.includes("register")) {
            return self.faqs["supplier_info"];
        }
        if (lowerQuery.includes("buyer") && !lowerQuery.includes("register")) {
            return self.faqs["buyer_info"];
        }
        if (lowerQuery.includes("agent") && !lowerQuery.includes("register")) {
            return self.faqs["agent_info"];
        }
        if (lowerQuery.includes("role")) {
            return self.faqs["user_roles"];
        }

        // Getting started queries
        if (lowerQuery.includes("start") || lowerQuery.includes("begin") || lowerQuery.includes("first")) {
            if (lowerQuery.includes("supplier") || lowerQuery.includes("sell")) {
                return self.faqs["getting_started_supplier"];
            } else if (lowerQuery.includes("buyer") || lowerQuery.includes("buy")) {
                return self.faqs["getting_started_buyer"];
            }
        }

        // Feature queries
        if (lowerQuery.includes("feature") || lowerQuery.includes("function") || lowerQuery.includes("capability")) {
            return self.faqs["platform_features"];
        }

        // No match found
        return ();
    }

    # Get FAQ by category
    # + category - Category name
    # + return - List of FAQ answers in category
    public function getFAQsByCategory(string category) returns string[] {
        string[] results = [];
        string[]? keys = self.categories[category];
        if keys is string[] {
            foreach string key in keys {
                string? answer = self.faqs[key];
                if answer is string {
                    results.push(answer);
                }
            }
        }
        return results;
    }

    # Get all categories
    # + return - List of category names
    public function getCategories() returns string[] {
        string[] cats = [];
        foreach var key in self.categories.keys() {
            cats.push(key);
        }
        return cats;
    }

    # Get platform data
    # + dataType - Type of platform data
    # + return - Platform data as JSON
    public function getPlatformData(string dataType) returns json? {
        return self.platformData[dataType];
    }

    # Get comprehensive platform overview
    # + return - Platform overview text
    public function getPlatformOverview() returns string {
        string? faq1 = self.faqs["what_is_circularsync"];
        string? faq2 = self.faqs["how_platform_works"];
        string? faq3 = self.faqs["platform_features"];

        string overview = (faq1 ?: "") + "\n\n" +
                        (faq2 ?: "") + "\n\n" +
                        "Key Features:\n" + (faq3 ?: "");
        return overview;
    }
}
