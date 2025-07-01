import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, Scan, Link, Server, AlertTriangle } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface SessionData {
  hash: string;
  cart: CartItem[];
  timestamp: number;
}

interface ActiveSession {
  id: string;
  name: string;
  hash: string;
}

export default function CustomerDisplay() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [error, setError] = useState<string>('');

  const sessionHash = searchParams.get('hash');

  useEffect(() => {
    const findActiveSessions = () => {
      const sessions: ActiveSession[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pos-session-hash-')) {
          const hash = localStorage.getItem(key);
          if (hash) {
            const sessionDetails = localStorage.getItem(`pos-session-details-${hash}`);
            if (sessionDetails) {
              const details = JSON.parse(sessionDetails);
              sessions.push({ id: details.id, name: details.name, hash });
            }
          }
        }
      }
      setActiveSessions(sessions);
    };

    findActiveSessions();
    const interval = setInterval(findActiveSessions, 5000); // Refresh active sessions every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSessionData = () => {
      if (!sessionHash) {
        setSessionData(null);
        return;
      }

      try {
        const data = localStorage.getItem(`pos-session-${sessionHash}`);
        if (data) {
          const parsedData: SessionData = JSON.parse(data);
          setSessionData(parsedData);
          setLastUpdated(new Date(parsedData.timestamp).toLocaleTimeString());
          setError('');
        } else {
          setError('No active session found for this hash. Please check the hash or select an active session.');
          setSessionData(null);
        }
      } catch (e) {
        setError('Failed to parse session data. The data may be corrupted.');
        setSessionData(null);
      }
    };

    loadSessionData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `pos-session-${sessionHash}` || event.key === null) {
        loadSessionData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [sessionHash]);

  const handleSessionSelect = (hash: string) => {
    setSearchParams({ hash });
  };

  const getTotal = () => {
    if (!sessionData) return 0;
    return sessionData.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (!sessionHash) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <Server size={48} className="mx-auto text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Select a POS Session</h1>
          <p className="text-gray-600 mb-6">Choose an active session to display customer information.</p>
          {activeSessions.length > 0 ? (
            <div className="space-y-3">
              {activeSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session.hash)}
                  className="w-full text-left bg-gray-50 hover:bg-blue-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200"
                >
                  <div className="font-semibold text-blue-800">{session.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Hash: <span className="font-mono bg-gray-200 px-1 rounded">{session.hash}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 bg-gray-50 p-4 rounded-lg">
              <p>No active POS sessions detected.</p>
              <p className="text-sm mt-1">Please start a new session in the main POS window.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Session Error</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => setSearchParams({})}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select a different session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center pb-6 border-b-2 border-gray-700">
          <div className="flex items-center">
            <ShoppingCart size={40} className="text-blue-400 mr-4" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Your Order</h1>
              <p className="text-gray-400">Thank you for shopping with us!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Session Hash</p>
            <p className="font-mono text-lg bg-gray-800 px-3 py-1 rounded-md">{sessionHash}</p>
          </div>
        </header>

        <main className="mt-8">
          {sessionData && sessionData.cart.length > 0 ? (
            <div className="space-y-4">
              {sessionData.cart.map((item) => (
                <div key={item.id} className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md text-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-xl">{item.name}</p>
                    <p className="text-gray-400 text-sm">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-2xl text-blue-400">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Scan size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-2xl text-gray-500">Waiting for items...</p>
              <p className="text-gray-600">Your items will appear here once they are scanned.</p>
            </div>
          )}
        </main>

        {sessionData && sessionData.cart.length > 0 && (
          <footer className="mt-8 pt-6 border-t-2 border-gray-700">
            <div className="flex justify-between items-center">
              <p className="text-2xl font-medium text-gray-300">Total</p>
              <p className="text-5xl font-bold text-blue-400">${getTotal().toFixed(2)}</p>
            </div>
          </footer>
        )}

        <div className="text-center mt-8 text-xs text-gray-600">
          <p>Last updated: {lastUpdated}</p>
          <div className="flex items-center justify-center space-x-2 mt-1">
            <Link size={12} />
            <span>Connected to MulaPOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}