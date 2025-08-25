"use client";

import React from 'react';
import Head from 'next/head';
import AuctionManagement from '@/components/auction/AuctionManagement';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

const ManageAuctionsPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !user.role || !['admin', 'supplier'].includes(user.role)) {
    redirect('/auction');
    return null;
  }

  return (
    <>
      <Head>
        <title>Manage Auctions - CycleSync</title>
        <meta name="description" content="Manage your auctions and track performance" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <AuctionManagement userRole={user.role as 'admin' | 'supplier'} />
      </div>
    </>
  );
};

export default ManageAuctionsPage;
