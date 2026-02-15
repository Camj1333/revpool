"use client";

import { signOut } from "next-auth/react";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sticky top-0 bg-white z-20 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-900 transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-100 border-0 text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 h-10 text-sm w-64 lg:w-80 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:shadow-sm"
          />
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className="text-sm text-gray-500 hover:text-gray-900 font-medium transition"
      >
        Sign Out
      </button>
    </header>
  );
}
