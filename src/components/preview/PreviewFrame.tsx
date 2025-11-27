'use client';

import { useState } from 'react';
import { Loader } from 'lucide-react';

interface PreviewFrameProps {
  project: any;
  hasAIPremium: boolean;
}

export function PreviewFrame({ project, hasAIPremium }: PreviewFrameProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementRequest, setRefinementRequest] = useState('');
  const [components, setComponents] = useState(project.generated_components || {});
  const [error, setError] = useState<string | null>(null);
  const theme = project.theme_settings || {};

  async function handleRefineComponent() {
    if (!refinementRequest.trim()) {
      setError('Please describe how you want to refine this component');
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/refine-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: project.email,
          projectId: project.id,
          componentName: selectedComponent,
          userRequest: refinementRequest
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update component in local state
        setComponents({
          ...components,
          [selectedComponent!]: data.refinedComponent
        });
        setRefinementRequest('');
        setError(null);
      } else {
        setError(data.error || 'Failed to refine component');
      }
    } catch (err) {
      setError('Failed to refine component. Please try again.');
      console.error(err);
    } finally {
      setIsRefining(false);
    }
  }

  return (
    <div className="bg-card dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-border dark:border-slate-700">
      {/* Preview Header */}
      <div className="bg-slate-800 dark:bg-slate-950 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm ml-3 text-slate-300 dark:text-slate-400">
            {project.business_name || 'Your Website'} Preview
          </span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          {hasAIPremium ? 'Click sections to customize' : 'Read-only preview'}
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative">
        {/* Device Frame */}
        <div className="bg-card dark:bg-slate-900">
          {/* Render each component */}
          {Object.entries(components).map(([name, component]: [string, any]) => (
            <div
              key={name}
              className={`relative border-b border-border dark:border-slate-700 transition-all ${
                hasAIPremium ? 'cursor-pointer hover:bg-muted dark:hover:bg-slate-800' : ''
              } ${selectedComponent === name ? 'ring-2 ring-primary dark:ring-blue-500' : ''}`}
              onClick={() => hasAIPremium && setSelectedComponent(name)}
            >
              {/* Component Preview */}
              <div
                className="p-6"
                dangerouslySetInnerHTML={{
                  __html: component.code || renderComponentPlaceholder(name, component)
                }}
              />

              {/* Hover overlay for premium users */}
              {hasAIPremium && (
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                  <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full shadow-lg">
                    Customize {name}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Watermark for free preview */}
        {!hasAIPremium && (
          <div className="absolute top-4 right-4 bg-accent/10 dark:bg-accent/20 border-2 border-accent px-3 py-2 rounded-lg shadow-lg">
            <p className="text-xs font-semibold text-accent-foreground dark:text-accent">
              Free Preview
            </p>
          </div>
        )}
      </div>

      {/* Component Info Panel (if selected) */}
      {selectedComponent && hasAIPremium && (
        <div className="border-t-2 border-primary dark:border-blue-500 bg-primary/5 dark:bg-primary/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground dark:text-slate-100">
              Customizing: {selectedComponent}
            </h3>
            <button
              onClick={() => {
                setSelectedComponent(null);
                setRefinementRequest('');
                setError(null);
              }}
              className="text-primary dark:text-blue-400 hover:text-primary/80 dark:hover:text-blue-300 text-sm"
            >
              Close
            </button>
          </div>
          <p className="text-sm text-primary dark:text-blue-400 mb-3">
            Describe how you'd like to change this section
          </p>

          {error && (
            <div className="mb-3 p-2 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Make it more professional, change colors, add testimonials..."
              value={refinementRequest}
              onChange={(e) => setRefinementRequest(e.target.value)}
              disabled={isRefining}
              className="flex-1 px-3 py-2 border border-border dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
            />
            <button
              onClick={handleRefineComponent}
              disabled={isRefining || !refinementRequest.trim()}
              className="px-4 py-2 bg-primary dark:bg-primary text-primary-foreground dark:text-white rounded-lg hover:bg-primary-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRefining ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Refining...
                </>
              ) : (
                'Refine'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Render a placeholder when component code isn't HTML
 */
function renderComponentPlaceholder(name: string, component: any): string {
  const props = component.props || {};

  return `
    <div class="min-h-[200px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">${name.toUpperCase()}</h2>
      <p class="text-gray-600">${props.heading || props.title || 'Component preview'}</p>
      <p class="text-sm text-gray-500 mt-2">${props.description || ''}</p>
    </div>
  `;
}
