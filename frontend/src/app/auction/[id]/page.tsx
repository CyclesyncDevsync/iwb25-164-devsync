"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AuctionDetail from '@/components/auction/AuctionDetail';

const AuctionDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== 'string') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Auction ID</h2>
          <p className="text-gray-600">Please check the URL and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Auction Details - CycleSync</title>
        <meta name="description" content="View auction details and place bids" />
      </Head>
      
      <AuctionDetail auctionId={id} />
    </>
  );
};

export default AuctionDetailPage;
