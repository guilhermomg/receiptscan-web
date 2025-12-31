import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About ReceiptScan.ai</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <p className="text-gray-600">
          ReceiptScan.ai is a modern web application built with the latest technologies to provide a
          seamless experience for receipt scanning and expense management.
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 mt-6">Technology Stack</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>React 19 - Modern UI library</li>
          <li>TypeScript 5 - Type-safe development</li>
          <li>Vite 7 - Fast build tool</li>
          <li>Tailwind CSS 3 - Utility-first styling</li>
          <li>React Router v6 - Client-side routing</li>
          <li>TanStack Query v5 - Server state management</li>
          <li>Zustand - Global state management</li>
          <li>Axios - HTTP client</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;
