
import React, { useState, useCallback } from 'react';
import { Truck, GroundingChunk } from '../types';
import { getSimpleTruckInsights, queryGeminiWithGrounding } from '../services/geminiService';
import { SparklesIcon, XMarkIcon, PaperPlaneIcon } from './icons';

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  trucks: Truck[];
}

const GeminiModal: React.FC<GeminiModalProps> = ({ isOpen, onClose, trucks }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setInsight(null);
    setSources([]);
    try {
      const result = await getSimpleTruckInsights(trucks);
      setInsight(result);
    } catch (e: any) {
      setError(e.message || "Failed to fetch insights.");
    } finally {
      setIsLoading(false);
    }
  }, [trucks]);
  
  const handleQuerySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setInsight(null);
    setSources([]);
    try {
      const result = await queryGeminiWithGrounding(userQuery);
      setInsight(result.text);
      setSources(result.sources);
    } catch (e: any)      
     {
      setError(e.message || "Failed to query Gemini.");
    } finally {
      setIsLoading(false);
    }
  }, [userQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 space-y-4 rounded-lg shadow-xl bg-neutral-800 text-gray-100 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-700">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-purple-400">
            <SparklesIcon /> Gemini AI Assistant
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-neutral-700 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {!insight && !isLoading && (
            <div className="text-center text-gray-300">
              <p className="mb-4">Ask about Kaohsiung garbage collection, current truck status, or get general tips!</p>
              <button
                onClick={fetchInsights}
                disabled={isLoading}
                className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-neutral-600 flex items-center justify-center mx-auto"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <>Get Quick Insights <SparklesIcon className="ml-2"/></>
                )}
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-purple-400 rounded-full border-t-transparent animate-spin"></div>
              <p className="mt-2 text-gray-300">Gemini is thinking...</p>
            </div>
          )}
          {error && <p className="text-red-400">Error: {error}</p>}
          {insight && (
            <div className="p-3 my-2 space-y-2 prose-sm prose-invert rounded-md bg-neutral-700/50 max-w-none">
                <p className="whitespace-pre-wrap">{insight}</p>
                {sources && sources.length > 0 && (
                    <div className="pt-2 mt-3 border-t border-neutral-600">
                        <h4 className="text-xs font-semibold text-gray-400">Sources:</h4>
                        <ul className="pl-4 text-xs list-disc list-inside">
                            {sources.map((source, index) => source.web && (
                                <li key={index} className="mt-1">
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          )}
        </div>
        
        <form onSubmit={handleQuerySubmit} className="flex gap-2 pt-3 border-t border-neutral-700">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask Gemini something..."
            className="flex-grow p-2 text-white rounded-md bg-neutral-700 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userQuery.trim()}
            className="px-4 py-2 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-neutral-600 disabled:cursor-not-allowed"
          >
            <PaperPlaneIcon />
          </button>
        </form>

      </div>
    </div>
  );
};

export default GeminiModal;
    