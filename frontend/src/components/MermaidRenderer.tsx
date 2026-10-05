import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid configurations
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  themeVariables: {
    primaryColor: '#6366f1', // Indigo 500
    primaryTextColor: '#1e293b', // Slate 800
    primaryBorderColor: '#e2e8f0', // Slate 200
    lineColor: '#64748b', // Slate 500
    secondaryColor: '#f8fafc', // Slate 50
    tertiaryColor: '#f1f5f9', // Slate 100
  }
});

const DEFAULT_ZOOM = 100; // Mặc định hiển thị 100%
const MIN_ZOOM = 20;      // Zoom tối thiểu
const MAX_ZOOM = 300;     // Zoom tối đa
const ZOOM_STEP = 10;     // Mỗi bước tăng/giảm 10%

interface MermaidRendererProps {
  chart: string;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);

  useEffect(() => {
    let isMounted = true;
    // Generate a unique ID for each mermaid diagram
    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

    const renderChart = async () => {
      try {
        setError(null);
        if (isMounted) {
          // Render mermaid chart asynchronously
          const { svg } = await mermaid.render(uniqueId, chart);
          if (isMounted) {
            setSvgContent(svg);
          }
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        if (isMounted) {
          setError(err.message || 'Lỗi cú pháp sơ đồ Mermaid.');

          // Cleanup any potentially bad elements inserted by Mermaid library in DOM
          const badElement = document.getElementById(uniqueId);
          if (badElement) {
            badElement.remove();
          }
          const bindElement = document.getElementById(`d${uniqueId}`);
          if (bindElement) {
            bindElement.remove();
          }
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50/80 border border-red-200 rounded-2xl text-red-700 shadow-sm">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          Lỗi vẽ sơ đồ Mermaid:
        </div>
        <p className="text-xs font-mono mb-3 bg-white/70 p-2.5 rounded-xl border border-red-100 overflow-x-auto whitespace-pre-wrap">
          {error}
        </p>
        <div className="text-xs text-slate-500 font-semibold mb-1">Mã nguồn sơ đồ:</div>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed shadow-inner">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center my-6 p-5 bg-slate-50/50 rounded-3xl border border-slate-100/80 shadow-sm w-full">
      {/* Zoom Control Panel */}
      <div className="flex items-center gap-2 mb-4 bg-white px-3 py-1.5 rounded-full border border-slate-200/60 shadow-sm self-end text-xs shrink-0 select-none">
        <button
          onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 font-bold text-slate-500 transition-colors"
          title="Thu nhỏ"
        >
          -
        </button>
        <span className="font-mono font-bold text-slate-500 min-w-[40px] text-center">{zoom}%</span>
        <button
          onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 font-bold text-slate-500 transition-colors"
          title="Phóng to"
        >
          +
        </button>
        <button
          onClick={() => setZoom(DEFAULT_ZOOM)}
          className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-400 font-semibold transition-colors"
          title="Mặc định"
        >
          Reset
        </button>
      </div>

      <style>{`
        .mermaid-svg-container svg {
          height: auto !important;
          display: block;
          margin: 0 auto;
          width: var(--mermaid-zoom, ${DEFAULT_ZOOM}%) !important;
          max-width: var(--mermaid-zoom, ${DEFAULT_ZOOM}%) !important;
          transition: width 0.15s ease, max-width 0.15s ease;
        }
      `}</style>

      <div className="w-full overflow-x-auto custom-scrollbar flex justify-center py-4 bg-white rounded-2xl border border-slate-100 shadow-inner">
        <div
          ref={containerRef}
          className="mermaid-svg-container w-full"
          style={{ '--mermaid-zoom': `${zoom}%` } as React.CSSProperties}
          dangerouslySetInnerHTML={{
            __html: svgContent || '<div class="text-slate-400 text-xs animate-pulse py-4 font-medium">Đang vẽ sơ đồ...</div>'
          }}
        />
      </div>
    </div>
  );
}
