# Wallet Management Module

This module provides comprehensive wallet and transaction management services for the Cyclesync platform.

## Features

- User wallet balance management
- Recharge and withdrawal operations
- Transaction history tracking
- Role-based access control (buyers, suppliers, agents)
- Daily withdrawal limits
- Frozen balance support for auction bidding

## API Endpoints

### Core Operations
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/recharge` - Recharge wallet 
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/init` - Initialize wallet for user

## Database Schema

Uses the following tables:
- `user_wallets` - User wallet balances and limits
- `wallet_transactions` - Transaction history
- `bid_freezes` - Frozen amounts for active bids

## Usage

The wallet service automatically starts on port 8096 alongside other services.
All operations require valid authentication tokens.