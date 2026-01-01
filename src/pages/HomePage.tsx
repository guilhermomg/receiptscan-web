import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Modal, Spinner, useToast } from '../components/common';
import { ReceiptUpload } from '../components/receipt';
import { useAuth } from '../contexts';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  const handleButtonClick = () => {
    addToast('Welcome to ReceiptScan.ai!', 'success');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Welcome to ReceiptScan.ai
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
          AI-powered receipt scanning and expense management
        </p>
        {!user && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Receipt Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Upload Receipts
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Capture or upload your receipt images for AI-powered processing
        </p>
        <ReceiptUpload />
      </div>

      {/* Pricing CTA */}
      {!user && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 sm:p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Ready to streamline your expenses?
            </h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
              Choose a plan that fits your needs. Start with 10 free receipts per month.
            </p>
            <Link to="/pricing" className="inline-block w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                View All Plans
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
        <Button onClick={handleButtonClick} className="flex-1 sm:flex-none min-w-[120px]">
          Show Toast
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsModalOpen(true)}
          className="flex-1 sm:flex-none min-w-[120px]"
        >
          Open Modal
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none min-w-[120px]">
          Outline Button
        </Button>
        <Button variant="danger" className="flex-1 sm:flex-none min-w-[120px]">
          Danger Button
        </Button>
      </div>

      <div className="flex justify-center">
        <Spinner size="lg" />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          This is a demo modal component. You can put any content here.
        </p>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
            Confirm
          </Button>
        </div>
      </Modal>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
          Getting Started
        </h2>
        <ul className="space-y-2 text-sm sm:text-base text-gray-600">
          <li>✅ Vite + React + TypeScript configured</li>
          <li>✅ Tailwind CSS with custom theme</li>
          <li>✅ ESLint & Prettier setup</li>
          <li>✅ React Router v6 configured</li>
          <li>✅ TanStack Query for API state</li>
          <li>✅ Zustand for global state</li>
          <li>✅ Axios for API calls</li>
          <li>✅ Common UI components (Button, Modal, Spinner, Toast)</li>
          <li>✅ Receipt upload with drag-and-drop</li>
          <li>✅ Camera integration for mobile devices</li>
          <li>✅ Image compression and validation</li>
          <li>✅ Stripe payment integration</li>
          <li>✅ Subscription management</li>
          <li>✅ Progressive Web App (PWA) support</li>
          <li>✅ Mobile-responsive design</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
