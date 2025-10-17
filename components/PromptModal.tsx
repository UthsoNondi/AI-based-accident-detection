import React, { useState, useCallback, Fragment } from 'react';
import { ClipboardIcon, CheckIcon, XMarkIcon } from './Icons';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptText: string;
}

const FormattedLine: React.FC<{ line: string; className?: string }> = ({ line, className }) => {
  const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean);
  return (
    <p className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index} className="bg-gray-900 text-yellow-300 px-1.5 py-1 rounded-md font-mono text-sm mx-0.5">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
};

const PromptContent: React.FC<{ promptText: string }> = ({ promptText }) => {
    const blocks = promptText.split(/(\r\n|\n){2,}/);
    return (
      <>
        {blocks.map((block, blockIndex) => {
            const trimmedBlock = block.trim();
            if (!trimmedBlock) return null;

            if (trimmedBlock.startsWith('```') && trimmedBlock.endsWith('```')) {
                const code = trimmedBlock.slice(3, -3).trim();
                return (
                <pre key={blockIndex} className="bg-black/50 p-4 rounded-lg my-4 overflow-x-auto">
                    <code className="font-mono text-sm text-gray-300">{code}</code>
                </pre>
                );
            }

            const lines = trimmedBlock.split(/\r\n|\n/);
            const isList = lines.every(line => /^\s*(\*|\d+\.)\s/.test(line));

            if (isList) {
                return (
                <ul key={blockIndex} className="space-y-2 my-4 pl-5">
                    {lines.map((line, lineIndex) => {
                    const cleanedLine = line.replace(/^\s*(\*|\d+\.)\s/, '');
                    return (
                        <li key={lineIndex} className="list-item list-disc">
                        <FormattedLine line={cleanedLine} className="inline"/>
                        </li>
                    )
                    })}
                </ul>
                );
            }

            return (
                <div key={blockIndex} className="my-4 space-y-2">
                {lines.map((line, lineIndex) => {
                    if (line.startsWith('### ')) {
                    return (
                        <h3 key={lineIndex} className="text-2xl font-bold text-cyan-400 pt-4 pb-1 border-b border-gray-700">
                        <FormattedLine line={line.substring(4)} />
                        </h3>
                    );
                    }
                    if (line.startsWith('#### ')) {
                        return (
                        <h4 key={lineIndex} className="text-xl font-semibold text-teal-300 mt-3 mb-1">
                            <FormattedLine line={line.substring(5)} />
                        </h4>
                        );
                    }
                    if (line.startsWith('---')) {
                    return <hr key={lineIndex} className="border-gray-700 my-6" />;
                    }
                    if (line.trim().startsWith('*(copy-paste everything below)*')) {
                    return <p key={lineIndex} className="text-center text-gray-400 italic my-4">{line.replace(/\*/g, '')}</p>
                    }
                    return <FormattedLine key={lineIndex} line={line} className="text-gray-300 leading-relaxed" />;
                })}
                </div>
            );
        })}
      </>
    );
};


const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = useCallback(() => {
    if (isCopied) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    });
  }, [textToCopy, isCopied]);

  return (
    <button
      onClick={handleCopy}
      title="Copy Prompt to Clipboard"
      className={`flex items-center justify-center gap-3 px-5 py-3 rounded-full font-semibold text-white transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 shadow-lg ${isCopied ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500'}`}
    >
      {isCopied ? <CheckIcon className="w-6 h-6" /> : <ClipboardIcon className="w-6 h-6" />}
      <span>{isCopied ? 'Copied!' : 'Copy Prompt'}</span>
    </button>
  );
};


export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, promptText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gray-800/80 border border-gray-700 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            Original Project Prompt
          </h2>
          <div className="flex items-center gap-4">
              <CopyButton textToCopy={promptText} />
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                <XMarkIcon className="w-6 h-6" />
              </button>
          </div>
        </header>
        <div className="overflow-y-auto p-6">
          <PromptContent promptText={promptText} />
        </div>
      </div>
    </div>
  );
};