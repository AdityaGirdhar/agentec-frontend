"use client";

import Sidebar from "../navbar";
import Cards from "@/app/explore/cards";

export default function MarketplacePage() {
  return (
    <div className="bg-black text-white">
      <Sidebar />
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="font-black text-2xl mb-4">Marketplace</h1>
        <h4>Popular Agents</h4>
        <Cards/>
      </div>
      
    </div>
  );
}