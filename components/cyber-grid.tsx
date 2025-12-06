"use client";

export function CyberGrid() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Main Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" 
      />
      
      {/* Secondary Finer Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:10px_10px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" 
      />
      
      {/* Scanning Beam */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-primary/0 via-primary/5 to-primary/0 animate-scan-vertical" />
      
      {/* Perspective Grid Floor (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] opacity-30 perspective-grid" 
           style={{ 
             background: 'linear-gradient(to bottom, transparent, rgba(56, 189, 248, 0.1))',
             transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
           }} 
      />
    </div>
  );
}

