'use client';

import { useEffect, useRef, useState } from 'react';

export function SacredGeometryBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0.12);

  // Evolving opacity effect
  useEffect(() => {
    let increasing = true;
    const interval = setInterval(() => {
      setOpacity((prev) => {
        if (increasing) {
          if (prev >= 0.18) {
            increasing = false;
            return prev - 0.002;
          }
          return prev + 0.002;
        } else {
          if (prev <= 0.08) {
            increasing = true;
            return prev + 0.002;
          }
          return prev - 0.002;
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      const flowerOfLife = containerRef.current.querySelector('.flower-of-life') as HTMLElement;
      const metatronCube = containerRef.current.querySelector('.metatron-cube') as HTMLElement;
      const sriYantra = containerRef.current.querySelector('.sri-yantra') as HTMLElement;

      if (flowerOfLife) {
        flowerOfLife.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
      if (metatronCube) {
        metatronCube.style.transform = `translate(${-x * 15}px, ${-y * 15}px)`;
      }
      if (sriYantra) {
        sriYantra.style.transform = `translate(${x * 10}px, ${-y * 10}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity }}
    >
      {/* Flower of Life - Top Left */}
      <svg
        className="flower-of-life absolute top-[5%] left-[10%] transition-transform duration-100"
        width="400"
        height="400"
        viewBox="0 0 400 400"
        style={{
          animation: 'drift-gentle 60s ease-in-out infinite, pulse-subtle 15s ease-in-out infinite',
        }}
      >
        <g fill="none" stroke="hsl(var(--geometry-alt))" strokeWidth="1">
          <circle cx="200" cy="200" r="60" />
          <circle cx="200" cy="140" r="60" />
          <circle cx="148" cy="170" r="60" />
          <circle cx="148" cy="230" r="60" />
          <circle cx="200" cy="260" r="60" />
          <circle cx="252" cy="230" r="60" />
          <circle cx="252" cy="170" r="60" />
        </g>
      </svg>

      {/* Metatron's Cube - Bottom Right */}
      <svg
        className="metatron-cube absolute bottom-[10%] right-[5%] transition-transform duration-100"
        width="350"
        height="350"
        viewBox="0 0 350 350"
        style={{
          animation: 'drift-gentle-reverse 70s ease-in-out infinite, pulse-subtle 18s ease-in-out infinite 2s',
        }}
      >
        <g fill="none" stroke="hsl(var(--geometry))" strokeWidth="0.8">
          <circle cx="175" cy="175" r="15" />
          <circle cx="175" cy="75" r="15" />
          <circle cx="175" cy="275" r="15" />
          <circle cx="75" cy="175" r="15" />
          <circle cx="275" cy="175" r="15" />
          <circle cx="115" cy="115" r="15" />
          <circle cx="235" cy="115" r="15" />
          <circle cx="115" cy="235" r="15" />
          <circle cx="235" cy="235" r="15" />
          <line x1="175" y1="75" x2="175" y2="275" />
          <line x1="75" y1="175" x2="275" y2="175" />
          <line x1="115" y1="115" x2="235" y2="235" />
          <line x1="235" y1="115" x2="115" y2="235" />
          <line x1="175" y1="175" x2="175" y2="75" />
          <line x1="175" y1="175" x2="235" y2="115" />
          <line x1="175" y1="175" x2="275" y2="175" />
          <line x1="175" y1="175" x2="235" y2="235" />
          <line x1="175" y1="175" x2="175" y2="275" />
          <line x1="175" y1="175" x2="115" y2="235" />
          <line x1="175" y1="175" x2="75" y2="175" />
          <line x1="175" y1="175" x2="115" y2="115" />
        </g>
      </svg>

      {/* Seed of Life - Center */}
      <svg
        className="seed-of-life absolute top-1/2 left-1/2"
        width="500"
        height="500"
        viewBox="0 0 500 500"
        style={{
          transform: 'translate(-50%, -50%)',
          animation: 'rotate-ethereal 180s linear infinite, breathe-subtle 25s ease-in-out infinite',
        }}
      >
        <g fill="none" stroke="hsl(var(--geometry))" strokeWidth="1.5">
          <circle cx="250" cy="250" r="70" />
          <circle cx="250" cy="180" r="70" />
          <circle cx="189.4" cy="215" r="70" />
          <circle cx="189.4" cy="285" r="70" />
          <circle cx="250" cy="320" r="70" />
          <circle cx="310.6" cy="285" r="70" />
          <circle cx="310.6" cy="215" r="70" />
        </g>
      </svg>

      {/* Sri Yantra - Top Right */}
      <svg
        className="sri-yantra absolute top-[15%] right-[15%] transition-transform duration-100"
        width="280"
        height="280"
        viewBox="0 0 280 280"
        style={{
          animation: 'drift-gentle 80s ease-in-out infinite reverse, pulse-subtle 20s ease-in-out infinite 4s',
        }}
      >
        <g fill="none" stroke="hsl(var(--geometry))" strokeWidth="0.8">
          <circle cx="140" cy="140" r="130" />
          <circle cx="140" cy="140" r="110" />
          <circle cx="140" cy="140" r="90" />
          <circle cx="140" cy="140" r="70" />
          <circle cx="140" cy="140" r="50" />
          <circle cx="140" cy="140" r="30" />
          <polygon points="140,20 240,220 40,220" />
          <polygon points="140,260 40,60 240,60" />
        </g>
      </svg>

      {/* Vesica Piscis - Bottom Left */}
      <svg
        className="vesica-piscis absolute bottom-[20%] left-[15%]"
        width="260"
        height="260"
        viewBox="0 0 260 260"
        style={{
          animation: 'drift-gentle-reverse 65s ease-in-out infinite, pulse-subtle 16s ease-in-out infinite 3s',
        }}
      >
        <g fill="none" stroke="hsl(var(--geometry))" strokeWidth="1">
          <circle cx="110" cy="130" r="70" />
          <circle cx="150" cy="130" r="70" />
          <ellipse cx="130" cy="130" rx="22" ry="60" />
        </g>
      </svg>
    </div>
  );
}

