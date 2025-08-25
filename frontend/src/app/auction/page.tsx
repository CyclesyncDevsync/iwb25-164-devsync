"use client";

import React from 'react';
import Head from 'next/head';
import AuctionList from '@/components/auction/AuctionList';
import BidModal from '@/components/auction/BidModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setShowBidModal } from '@/store/slices/auctionSlice';

const AuctionListPage: React.FC = () => {
  const dispatch = useDispatch();
  const { showBidModal } = useSelector((state: RootState) => state.auctions);

  return (
    <>
      <Head>
        <title>Auctions - CycleSync</title>
        <meta name="description" content="Browse and bid on material auctions" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AuctionList />
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={showBidModal}
        onClose={() => dispatch(setShowBidModal(false))}
      />
    </>
  );
};

export default AuctionListPage;
