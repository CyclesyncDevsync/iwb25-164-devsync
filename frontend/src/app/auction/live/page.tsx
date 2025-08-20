"use client";

import React from 'react';
import Head from 'next/head';
import LiveAuctionDashboard from '@/components/auction/LiveAuctionDashboard';

const LiveDashboardPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Live Auction Dashboard - CycleSync</title>
        <meta name="description" content="Real-time auction monitoring and activity dashboard" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <LiveAuctionDashboard />
        </div>
      </div>
    </>
  );
};

export default LiveDashboardPage;
