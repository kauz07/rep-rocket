import React, { useState, useRef, useEffect } from 'react';
import { generateWorkoutSuggestionStream } from '../services/geminiService';
import { WandSparklesIcon } from './icons';
import { marked } from 'marked';

interface AiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiCoachModal: React.FC<AiCoachModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const responseEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse('');
    
    try {
      const stream = await generateWorkoutSuggestionStream(prompt);
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setResponse(fullResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-secondary shadow-xl w-full max-w-2xl h-[80vh] flex flex-col p-6 rounded-lg animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <WandSparklesIcon className="text-primary"/> AI Coach
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-text text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow bg-background p-4 rounded-md overflow-y-auto mb-4 border border-border">
          {!response && !isLoading && (
             <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                <WandSparklesIcon className="w-16 h-16 text-gray-500 mb-4"/>
                <p className="text-lg">Ask me anything about your workout!</p>
                <p className="text-sm mt-2">e.g., "Suggest 3 bicep exercises" or "What's a good leg day finisher?"</p>
            </div>
          )}
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:text-text prose-headings:text-text prose-strong:text-text prose-ul:text-text prose-ol:text-text" dangerouslySetInnerHTML={{ __html: marked(response) as string }}></div>
          {isLoading && !response && <p className="text-primary animate-pulse">Thinking...</p>}
          <div ref={responseEndRef} />
        </div>
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask for workout advice..."
            className="flex-grow bg-background border border-border rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary transition"
            disabled={isLoading}
          />
          <button type="submit" className="bg-primary text-background dark:text-secondary font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition-transform transform hover:scale-105 disabled:opacity-50 disabled:scale-100" disabled={isLoading || !prompt.trim()}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCoachModal;
