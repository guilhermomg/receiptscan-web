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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ReceiptScan.ai</h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered receipt scanning and expense management
        </p>
        {!user && (
          <div className="flex justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Receipt Upload Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upload Receipts</h2>
        <p className="text-gray-600 mb-6">
          Capture or upload your receipt images for AI-powered processing
        </p>
        <ReceiptUpload />
      </div>

      {/* Pricing CTA */}
      {!user && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to streamline your expenses?</h2>
            <p className="text-lg mb-6 opacity-90">
              Choose a plan that fits your needs. Start with 10 free receipts per month.
            </p>
            <Link to="/pricing">
              <Button variant="secondary" size="lg">
                View All Plans
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={handleButtonClick}>Show Toast</Button>
        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
          Open Modal
        </Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="danger">Danger Button</Button>
      </div>

      <div className="flex justify-center">
        <Spinner size="lg" />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
        <p className="text-gray-600 mb-4">
          This is a demo modal component. You can put any content here.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
        </div>
      </Modal>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <ul className="space-y-2 text-gray-600">
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
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
