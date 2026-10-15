import React, { useEffect, useRef, useState } from 'react';

interface MonochromeCosmicCanvasProps {
  parallaxX?: number; // -1 to 1
  parallaxY?: number; // -1 to 1
  className?: string;
  isLite?: boolean;
  isHyperspaceActive?: boolean;
  isMapDragging?: boolean;
  onFPSUpdate?: (fps: number) => void;
  onFPSFallback?: () => void;
}

interface Asteroid {
  x: number;
  y: number;
  z: number;
  radius: number;
  vertices: { x: number; y: number }[];
  rot: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  shade: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export function MonochromeCosmicCanvas({
  parallaxX = 0,
  parallaxY = 0,
  className = '',
  isLite = false,
  isHyperspaceActive = false,
  isMapDragging = false,
  onFPSUpdate,
  onFPSFallback,
}: MonochromeCosmicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const [hasFallbackTriggered, setHasFallbackTriggered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Cap DPR at 1.5 per specification
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
    };
    window.addEventListener('resize', handleResize);

    // Star Count: Capped at ~1200 desktop / 500 mobile per P3
    const isMobile = window.innerWidth < 768;
    const starCount = isLite || hasFallbackTriggered ? (isMobile ? 200 : 400) : (isMobile ? 500 : 1200);

    const stars = Array.from({ length: starCount }, () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const cx = width / 2;
      const cy = height / 2;
      const angle = Math.atan2(y - cy, x - cx);
      return {
        x,
        y,
        r: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        depth: Math.random() * 0.8 + 0.2,
        angle,
      };
    });

    // Asteroids (5 mobile / 12 desktop)
    const asteroidCount = isLite || hasFallbackTriggered ? 3 : (isMobile ? 5 : 12);
    const asteroids: Asteroid[] = Array.from({ length: asteroidCount }, () => {
      const radius = (Math.random() * 14 + 8) * dpr;
      const numPoints = Math.floor(Math.random() * 4) + 6;
      const vertices: { x: number; y: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const dist = radius * (0.7 + Math.random() * 0.5);
        vertices.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
      }
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.4,
        radius,
        vertices,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        shade: Math.random() > 0.5 ? '#22262e' : '#14161a',
      };
    });

    const shootingStars: ShootingStar[] = [];
    let lastShootingStarTime = 0;

    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 1.2 - width * 0.1,
        y: Math.random() * height * 0.4,
        length: (Math.random() * 80 + 50) * dpr,
        speed: (Math.random() * 14 + 12) * dpr,
        angle: (Math.PI / 4) * (0.8 + Math.random() * 0.4),
        opacity: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * 25 + 20),
      });
    };

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    let time = 0;
    let hyperspaceStretch = 1;

    // 2-Second Rolling FPS Monitor
    let frameCount = 0;
    let lastFPSCheckTime = performance.now();
    let lowFPSDuration = 0;

    const render = (now: number) => {
      // 1. Paused when tab is hidden or during active map drags
      if (document.visibilityState === 'hidden' || isMapDragging) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // 2. FPS Calculation Loop
      frameCount++;
      const elapsedSinceFPSCheck = now - lastFPSCheckTime;
      if (elapsedSinceFPSCheck >= 1000) {
        const currentFPS = Math.round((frameCount * 1000) / elapsedSinceFPSCheck);
        onFPSUpdate?.(currentFPS);
        frameCount = 0;
        lastFPSCheckTime = now;

        // Auto-fallback check: FPS < 40 for 2 seconds
        if (currentFPS < 40) {
          lowFPSDuration += elapsedSinceFPSCheck;
          if (lowFPSDuration >= 2000 && !hasFallbackTriggered) {
            setHasFallbackTriggered(true);
            onFPSFallback?.();
          }
        } else {
          lowFPSDuration = 0;
        }
      }

      time += 0.016;

      // Hyperspace stretch transition progression
      const targetStretch = isHyperspaceActive ? 32 : 1;
      hyperspaceStretch += (targetStretch - hyperspaceStretch) * 0.18;

      // Smooth parallax lerp
      targetParallaxX = parallaxX * 35 * dpr;
      targetParallaxY = parallaxY * 25 * dpr;
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.06;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.06;

      // Deep Black Void Canvas Clear
      ctx.fillStyle = '#010204';
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 1: Starfield with Hyperspace Elongation (T3 Shader) ---
      const centerX = width / 2;
      const centerY = height / 2;

      stars.forEach((star) => {
        const px = (star.x + currentParallaxX * star.depth * 0.3 + width) % width;
        const py = (star.y + currentParallaxY * star.depth * 0.3 + height) % height;
        const currentAlpha =
          star.alpha * (0.6 + 0.4 * Math.sin(time * 3 * star.twinkleSpeed * 60 + star.twinklePhase));

        if (hyperspaceStretch > 2) {
          // T3: Elongate along radial motion axis
          const dx = px - centerX;
          const dy = py - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const dirX = dx / dist;
          const dirY = dy / dist;
          const streakLen = Math.min(180, (dist / 8) * (hyperspaceStretch / 6));

          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, currentAlpha * 1.5).toFixed(2)})`;
          ctx.lineWidth = star.r * dpr;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + dirX * streakLen, py + dirY * streakLen);
          ctx.stroke();
        } else {
          // Nominal star point
          ctx.fillStyle = `rgba(240, 244, 250, ${currentAlpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(px, py, star.r * star.depth * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- LAYER 2: Sun (Monochrome Radiant Core) ---
      const sunX = width * 0.82 + currentParallaxX * 0.2;
      const sunY = height * 0.22 + currentParallaxY * 0.2;
      const sunRadius = 42 * dpr;

      const coronaGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.8, sunX, sunY, sunRadius * 3.8);
      coronaGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      coronaGrad.addColorStop(0.35, 'rgba(210, 220, 235, 0.12)');
      coronaGrad.addColorStop(0.8, 'rgba(100, 110, 125, 0.03)');
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 3.8, 0, Math.PI * 2);
      ctx.fill();

      const sunCoreGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
      sunCoreGrad.addColorStop(0, '#ffffff');
      sunCoreGrad.addColorStop(0.75, '#e2e8f0');
      sunCoreGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = sunCoreGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal solar diffraction spike
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(sunX - sunRadius * 3.2, sunY);
      ctx.lineTo(sunX + sunRadius * 3.2, sunY);
      ctx.stroke();

      // --- LAYER 3: Moon (High-Contrast Monochrome Satellite with Craters) ---
      const moonX = width * 0.16 + currentParallaxX * 0.4;
      const moonY = height * 0.32 + currentParallaxY * 0.4;
      const moonRadius = 32 * dpr;

      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.7, moonX, moonY, moonRadius * 2.2);
      moonGlow.addColorStop(0, 'rgba(225, 235, 245, 0.2)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.clip();

      const moonGrad = ctx.createLinearGradient(moonX - moonRadius, moonY - moonRadius, moonX + moonRadius, moonY + moonRadius);
      moonGrad.addColorStop(0, '#f1f5f9');
      moonGrad.addColorStop(0.6, '#94a3b8');
      moonGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(moonX - moonRadius, moonY - moonRadius, moonRadius * 2, moonRadius * 2);

      const craters = [
        { cx: -8 * dpr, cy: -6 * dpr, r: 6 * dpr },
        { cx: 7 * dpr, cy: -9 * dpr, r: 4 * dpr },
        { cx: -4 * dpr, cy: 11 * dpr, r: 5 * dpr },
        { cx: 9 * dpr, cy: 8 * dpr, r: 7 * dpr },
        { cx: -13 * dpr, cy: 5 * dpr, r: 3.5 * dpr },
      ];
      craters.forEach((c) => {
        ctx.fillStyle = 'rgba(15, 20, 28, 0.45)';
        ctx.beginPath();
        ctx.arc(moonX + c.cx, moonY + c.cy, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.8 * dpr;
        ctx.beginPath();
        ctx.arc(moonX + c.cx + 0.8, moonY + c.cy + 0.8, c.r, 0, Math.PI);
        ctx.stroke();
      });

      // Lunar shadow
      ctx.fillStyle = 'rgba(5, 7, 12, 0.65)';
      ctx.beginPath();
      ctx.arc(moonX + moonRadius * 0.45, moonY, moonRadius * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- LAYER 4: Ringed Planet in Far Orbit ---
      const planetX = width * 0.72 + currentParallaxX * 0.3;
      const planetY = height * 0.74 + currentParallaxY * 0.3;
      const planetRadius = 24 * dpr;

      const planetGrad = ctx.createLinearGradient(planetX - planetRadius, planetY, planetX + planetRadius, planetY);
      planetGrad.addColorStop(0, '#cbd5e1');
      planetGrad.addColorStop(0.5, '#64748b');
      planetGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(planetX, planetY);
      ctx.rotate(-0.4);
      ctx.scale(1, 0.28);
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.4)';
      ctx.lineWidth = 4 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, planetRadius * 2.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, planetRadius * 2.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // --- LAYER 5: Floating Asteroid Stones ---
      asteroids.forEach((ast) => {
        ast.x += ast.vx;
        ast.y += ast.vy;
        ast.rot += ast.rotSpeed;

        if (ast.x < -50) ast.x = width + 50;
        if (ast.x > width + 50) ast.x = -50;
        if (ast.y < -50) ast.y = height + 50;
        if (ast.y > height + 50) ast.y = -50;

        const posX = ast.x + currentParallaxX * ast.z * 0.7;
        const posY = ast.y + currentParallaxY * ast.z * 0.7;

        ctx.save();
        ctx.translate(posX, posY);
        ctx.rotate(ast.rot);
        ctx.scale(ast.z, ast.z);

        ctx.beginPath();
        ast.vertices.forEach((v, idx) => {
          if (idx === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();

        const rockGrad = ctx.createLinearGradient(-ast.radius, -ast.radius, ast.radius, ast.radius);
        rockGrad.addColorStop(0, '#94a3b8');
        rockGrad.addColorStop(0.3, ast.shade);
        rockGrad.addColorStop(1, '#0b0d12');
        ctx.fillStyle = rockGrad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 0.9 * dpr;
        ctx.stroke();

        ctx.restore();
      });

      // --- LAYER 6: Shooting Stars ---
      if (Math.random() < 0.018 && time - lastShootingStarTime > 1.6) {
        spawnShootingStar();
        lastShootingStarTime = time;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.life++;
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        const fade = 1 - star.life / star.maxLife;
        if (fade <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const meteorGrad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        meteorGrad.addColorStop(0, `rgba(255, 255, 255, ${fade.toFixed(2)})`);
        meteorGrad.addColorStop(0.4, `rgba(200, 215, 235, ${(fade * 0.7).toFixed(2)})`);
        meteorGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 1.8 * dpr;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${fade.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1.8 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [parallaxX, parallaxY, isLite, isHyperspaceActive, isMapDragging, hasFallbackTriggered]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ willChange: 'transform' }}
    />
  );
}
