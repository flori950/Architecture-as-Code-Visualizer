import React from 'react';
import { Play, FileText } from 'lucide-react';
import type { ExampleButtonsProps } from '../types';
import { examples } from '../data/examples';

const ExampleButtons: React.FC<ExampleButtonsProps> = ({
  onExampleSelected,
  examples: customExamples,
}) => {
  const examplesData = customExamples || examples;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Example Configurations
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {examplesData.map(example => (
          <button
            key={example.name}
            onClick={() => onExampleSelected(example)}
            className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{example.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-100">
                    {example.name}
                  </h4>
                  <Play className="h-3 w-3 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {example.description}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <FileText className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-mono">
                    {example.format}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>
          Click any example to load it into the editor and generate a diagram.
        </p>
      </div>
    </div>
  );
};

export default ExampleButtons;
