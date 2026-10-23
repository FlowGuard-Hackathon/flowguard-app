"use client";

import { useEffect, useRef, type RefObject } from "react";
import styles from "./login.module.css";

type Node = { x: number; y: number; vx: number; vy: number; size: number; flashUntil: number };
type Edge = { a: number; b: number; dist: number };
type FlowLine = {
  startX: number;
  startY: number;
  angle: number;
  length: number;
  wavelength: number;
  amplitude: number;
  speed: number;
  phase: number;
  phase2: number;
  width: number;
  lightSpeed: number;
  lightOffset: number;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;
  maxLife: number;
  trail: { x: number; y: number }[];
};
type Pulse = { a: number; b: number; progress: number; speed: number };
type Wave = { x: number; y: number; start: number; duration: number; maxRadius: number };
type SafeRect = { x0: number; y0: number; x1: number; y1: number };

const FALLBACK_SAFE = { x0: 0.3, y0: 0.14, x1: 0.7, y1: 0.86 };

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function configFor(innerWidth: number) {
  if (innerWidth < 761) return { nodeCount: 20, particleCount: 18, lineCount: 6 };
  if (innerWidth < 1100) return { nodeCount: 32, particleCount: 26, lineCount: 9 };
  return { nodeCount: 50, particleCount: 34, lineCount: 12 };
}

export default function IntelligentBackground({ avoidRef }: { avoidRef?: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const context = canvasEl?.getContext("2d", { alpha: true });
    if (!canvasEl || !context) return;
    const canvas = canvasEl;
    const ctx = context;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let frame = 0;
    let startTime = performance.now();
    let lastFrameTime = startTime;
    let stopped = false;

    let safeRect: SafeRect = { x0: 0, y0: 0, x1: 0, y1: 0 };
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let flowLines: FlowLine[] = [];
    let particles: Particle[] = [];
    let pulses: Pulse[] = [];
    let waves: Wave[] = [];
    let nextPulseAt = 0;
    let nextWaveAt = 0;

    let perfSum = 0;
    let perfCount = 0;
    let lastPerfCheck = startTime;

    function computeSafeRect(): SafeRect {
      const target = avoidRef?.current;
      if (target) {
        const canvasRect = canvas.getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const padding = 48;
        return {
          x0: rect.left - canvasRect.left - padding,
          y0: rect.top - canvasRect.top - padding,
          x1: rect.right - canvasRect.left + padding,
          y1: rect.bottom - canvasRect.top + padding,
        };
      }
      return {
        x0: width * FALLBACK_SAFE.x0,
        y0: height * FALLBACK_SAFE.y0,
        x1: width * FALLBACK_SAFE.x1,
        y1: height * FALLBACK_SAFE.y1,
      };
    }

    function isInSafeZone(x: number, y: number) {
      return x > safeRect.x0 && x < safeRect.x1 && y > safeRect.y0 && y < safeRect.y1;
    }

    function randomOutsideSafe(random: () => number) {
      let x = random() * width;
      const y = random() * height;
      if (isInSafeZone(x, y)) {
        const toLeft = random() < 0.5;
        x = toLeft ? random() * Math.max(safeRect.x0, 0) : safeRect.x1 + random() * Math.max(width - safeRect.x1, 0);
      }
      return { x, y };
    }

    function buildScene() {
      const random = seededRandom(Math.round(width * 7 + height * 13) || 9137);
      const config = configFor(window.innerWidth);

      nodes = [];
      for (let i = 0; i < config.nodeCount; i += 1) {
        const { x, y } = randomOutsideSafe(random);
        const angle = random() * Math.PI * 2;
        const speed = 5 + random() * 9;
        nodes.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: 1.4 + random() * 1.6, flashUntil: 0 });
      }

      flowLines = [];
      for (let i = 0; i < config.lineCount; i += 1) {
        const diagonal = i % 3 !== 0;
        const angle = diagonal ? (0.12 + random() * 0.28) * (random() < 0.5 ? 1 : -1) : 0;
        flowLines.push({
          startX: diagonal ? -width * 0.25 : -width * 0.1,
          startY: height * (0.08 + random() * 0.84),
          angle,
          length: width * 1.6,
          wavelength: 140 + random() * 160,
          amplitude: 22 + random() * 36,
          speed: 0.18 + random() * 0.22,
          phase: random() * Math.PI * 2,
          phase2: random() * Math.PI * 2,
          width: 1.1 + random() * 0.9,
          lightSpeed: 0.05 + random() * 0.06,
          lightOffset: random(),
        });
      }

      particles = [];
      for (let i = 0; i < config.particleCount; i += 1) {
        const x = random() * width;
        const y = random() * height;
        const angle = random() * Math.PI * 2;
        const speed = 10 + random() * 18;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.6 + random() * 1.8,
          age: random() * 6,
          maxLife: 7 + random() * 8,
          trail: [],
        });
      }

      pulses = [];
      waves = [];
      edges = [];
      nextPulseAt = 0;
      nextWaveAt = 0;
      perfSum = 0;
      perfCount = 0;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      safeRect = computeSafeRect();
      buildScene();
    }

    function updateEdges() {
      const threshold = Math.min(width, height) * 0.3;
      const connected = new Set<string>();
      edges = [];
      nodes.forEach((node, index) => {
        const nearest = nodes
          .map((candidate, candidateIndex) => ({ candidateIndex, distance: Math.hypot(candidate.x - node.x, candidate.y - node.y) }))
          .filter(({ candidateIndex }) => candidateIndex !== index)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);
        nearest.forEach(({ candidateIndex, distance }) => {
          if (distance > threshold) return;
          const a = Math.min(index, candidateIndex);
          const b = Math.max(index, candidateIndex);
          const key = `${a}:${b}`;
          if (connected.has(key)) return;
          connected.add(key);
          edges.push({ a, b, dist: distance });
        });
      });
    }

    function pointOnFlowLine(line: FlowLine, t: number, time: number) {
      const travel = t * line.length;
      const baseX = line.startX + Math.cos(line.angle) * travel;
      const baseY = line.startY + Math.sin(line.angle) * travel;
      const waveT = travel / line.wavelength + time * line.speed + line.phase;
      const offset = Math.sin(waveT) * line.amplitude + Math.sin(waveT * 0.47 + line.phase2) * line.amplitude * 0.35;
      const perp = line.angle + Math.PI / 2;
      return { x: baseX + Math.cos(perp) * offset, y: baseY + Math.sin(perp) * offset };
    }

    function drawFlowLines(time: number) {
      flowLines.forEach((line) => {
        const segments = 48;
        let start: { x: number; y: number } | null = null;
        ctx.beginPath();
        for (let s = 0; s <= segments; s += 1) {
          const point = pointOnFlowLine(line, s / segments, time);
          if (s === 0) {
            ctx.moveTo(point.x, point.y);
            start = point;
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        const end = pointOnFlowLine(line, 1, time);
        if (start) {
          const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
          gradient.addColorStop(0, "rgba(28,58,110,0.04)");
          gradient.addColorStop(0.5, "rgba(47,111,237,0.32)");
          gradient.addColorStop(1, "rgba(56,189,248,0.08)");
          ctx.strokeStyle = gradient;
        }
        ctx.lineWidth = line.width;
        ctx.stroke();

        const t = (line.lightOffset + time * line.lightSpeed) % 1;
        const lightPoint = pointOnFlowLine(line, t, time);
        const glow = ctx.createRadialGradient(lightPoint.x, lightPoint.y, 0, lightPoint.x, lightPoint.y, 10);
        glow.addColorStop(0, "rgba(140,210,255,0.9)");
        glow.addColorStop(1, "rgba(56,189,248,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lightPoint.x, lightPoint.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "rgba(220,240,255,0.95)";
        ctx.arc(lightPoint.x, lightPoint.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function updateNodes(dt: number) {
      const margin = 20;
      const maxSpeed = 34;
      nodes.forEach((node) => {
        node.x += node.vx * dt;
        node.y += node.vy * dt;

        if (node.x < -margin || node.x > width + margin) node.vx *= -1;
        if (node.y < -margin || node.y > height + margin) node.vy *= -1;
        node.x = Math.min(Math.max(node.x, -margin), width + margin);
        node.y = Math.min(Math.max(node.y, -margin), height + margin);

        if (isInSafeZone(node.x, node.y)) {
          const cx = (safeRect.x0 + safeRect.x1) / 2;
          const cy = (safeRect.y0 + safeRect.y1) / 2;
          const dx = node.x - cx;
          const dy = node.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          node.vx += (dx / dist) * 16 * dt;
          node.vy += (dy / dist) * 16 * dt;
        }

        const speed = Math.hypot(node.vx, node.vy);
        if (speed > maxSpeed) {
          node.vx = (node.vx / speed) * maxSpeed;
          node.vy = (node.vy / speed) * maxSpeed;
        }
      });
    }

    function updatePulses(dt: number, now: number) {
      pulses = pulses.filter((pulse) => {
        pulse.progress += pulse.speed * dt;
        if (pulse.progress >= 1) {
          const node = nodes[pulse.b];
          if (node) node.flashUntil = now + 260;
          return false;
        }
        return true;
      });

      if (now >= nextPulseAt && edges.length > 0 && pulses.length < 16) {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        if (!edge) return;
        const reversed = Math.random() < 0.5;
        pulses.push({ a: reversed ? edge.b : edge.a, b: reversed ? edge.a : edge.b, progress: 0, speed: 0.5 + Math.random() * 0.5 });
        nextPulseAt = now + 120 + Math.random() * 220;
      }
    }

    function drawNetwork(now: number) {
      updateEdges();
      const threshold = Math.min(width, height) * 0.3;

      edges.forEach(({ a, b, dist }) => {
        const first = nodes[a];
        const second = nodes[b];
        if (!first || !second) return;
        const flashBoost = Math.max(
          first.flashUntil > now ? (first.flashUntil - now) / 260 : 0,
          second.flashUntil > now ? (second.flashUntil - now) / 260 : 0
        );
        const base = 0.09 + (1 - dist / threshold) * 0.1;
        const opacity = Math.min(0.55, base + flashBoost * 0.4);
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.strokeStyle = `rgba(47,111,237,${opacity})`;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      });

      pulses.forEach((pulse) => {
        const first = nodes[pulse.a];
        const second = nodes[pulse.b];
        if (!first || !second) return;
        const x = first.x + (second.x - first.x) * pulse.progress;
        const y = first.y + (second.y - first.y) * pulse.progress;
        ctx.beginPath();
        ctx.arc(x, y, 2.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56,189,248,0.75)";
        ctx.shadowColor = "rgba(47,111,237,0.7)";
        ctx.shadowBlur = 9;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      nodes.forEach((node) => {
        const flashing = node.flashUntil > now;
        const flashT = flashing ? (node.flashUntil - now) / 260 : 0;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + flashT * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56,189,248,${0.22 + flashT * 0.55})`;
        ctx.fill();
      });
    }

    function updateParticles(dt: number) {
      particles.forEach((particle) => {
        particle.age += dt;
        if (particle.age > particle.maxLife) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 10 + Math.random() * 18;
          particle.x = Math.random() * width;
          particle.y = Math.random() * height;
          particle.vx = Math.cos(angle) * speed;
          particle.vy = Math.sin(angle) * speed;
          particle.age = 0;
          particle.maxLife = 7 + Math.random() * 8;
          particle.trail = [];
          return;
        }

        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        if (particle.x < -10 || particle.x > width + 10) particle.vx *= -1;
        if (particle.y < -10 || particle.y > height + 10) particle.vy *= -1;

        const speed = Math.hypot(particle.vx, particle.vy);
        if (speed > 42) {
          particle.vx = (particle.vx / speed) * 42;
          particle.vy = (particle.vy / speed) * 42;
        }

        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 7) particle.trail.shift();
      });
    }

    function drawParticles() {
      particles.forEach((particle) => {
        const fadeIn = Math.min(1, particle.age / 0.6);
        const fadeOut = Math.min(1, (particle.maxLife - particle.age) / 0.6);
        const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
        if (alpha <= 0.01) return;

        for (let i = 1; i < particle.trail.length; i += 1) {
          const previous = particle.trail[i - 1];
          const current = particle.trail[i];
          if (!previous || !current) continue;
          const t = i / particle.trail.length;
          ctx.beginPath();
          ctx.moveTo(previous.x, previous.y);
          ctx.lineTo(current.x, current.y);
          ctx.strokeStyle = `rgba(56,189,248,${0.22 * t * alpha})`;
          ctx.lineWidth = particle.size * 0.6;
          ctx.stroke();
        }

        const halo = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 5);
        halo.addColorStop(0, `rgba(80,180,255,${0.35 * alpha})`);
        halo.addColorStop(1, "rgba(80,180,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(226,243,255,${0.9 * alpha})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function updateWaves(now: number) {
      waves = waves.filter((wave) => now - wave.start < wave.duration);
      if (now >= nextWaveAt && waves.length < 7 && nodes.length > 0) {
        const node = nodes[Math.floor(Math.random() * nodes.length)];
        if (!node) return;
        waves.push({
          x: node.x,
          y: node.y,
          start: now,
          duration: 2000 + Math.random() * 1000,
          maxRadius: Math.min(width, height) * (0.12 + Math.random() * 0.08),
        });
        nextWaveAt = now + 450 + Math.random() * 650;
      }
    }

    function drawWaves(now: number) {
      waves.forEach((wave) => {
        const t = Math.min(1, Math.max(0, (now - wave.start) / wave.duration));
        const eased = 1 - Math.pow(1 - t, 2);
        const radius = Math.max(0, wave.maxRadius * eased);
        const opacity = (1 - t) * 0.35;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56,189,248,${opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
    }

    function drawSweep(time: number) {
      const period = 9.2;
      const duration = 2.6;
      const cycleTime = time % period;
      if (cycleTime > duration) return;
      const progress = cycleTime / duration;
      const angle = 0.52;
      const diag = Math.hypot(width, height);
      const travel = diag * 1.3;
      const dist = -travel / 2 + progress * travel;
      const bandLength = diag * 1.6;
      const bandWidth = diag * 0.12;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(angle);
      ctx.translate(dist, 0);

      const gradient = ctx.createLinearGradient(-bandWidth, 0, bandWidth, 0);
      gradient.addColorStop(0, "rgba(56,189,248,0)");
      gradient.addColorStop(0.5, "rgba(150,210,255,0.22)");
      gradient.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(-bandWidth, -bandLength / 2, bandWidth * 2, bandLength);
      ctx.restore();
    }

    function checkPerformance(now: number, dt: number) {
      perfSum += dt;
      perfCount += 1;
      if (now - lastPerfCheck < 2000) return;
      const avgDt = perfSum / Math.max(1, perfCount);
      if (avgDt > 1 / 42 && nodes.length > 8) {
        nodes = nodes.slice(0, Math.max(8, Math.floor(nodes.length * 0.75)));
      }
      perfSum = 0;
      perfCount = 0;
      lastPerfCheck = now;
    }

    function draw(now: number) {
      if (stopped) return;
      const time = reducedMotion.matches ? 0 : (now - startTime) / 1000;
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      ctx.clearRect(0, 0, width, height);

      const glowX = width * (0.48 + Math.sin(time / 19) * 0.055);
      const glowY = height * (0.46 + Math.cos(time / 23) * 0.045);
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.72);
      glow.addColorStop(0, "rgba(11,61,145,0.14)");
      glow.addColorStop(1, "rgba(7,19,38,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      drawFlowLines(time);

      if (!reducedMotion.matches) {
        updateNodes(dt);
        updatePulses(dt, now);
        updateParticles(dt);
        updateWaves(now);
        checkPerformance(now, dt);
      }

      drawWaves(now);
      drawNetwork(now);
      drawParticles();
      drawSweep(time);

      if (!reducedMotion.matches && !document.hidden) frame = window.requestAnimationFrame(draw);
    }

    function stop() {
      stopped = true;
      window.cancelAnimationFrame(frame);
    }

    function start() {
      if (!stopped) return;
      stopped = false;
      startTime = performance.now();
      lastFrameTime = startTime;
      draw(startTime);
    }

    function handleVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function handleMotionPreference() {
      window.cancelAnimationFrame(frame);
      startTime = performance.now();
      lastFrameTime = startTime;
      draw(startTime);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    draw(startTime);
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotionPreference);
    };
  }, [avoidRef]);

  return <canvas ref={canvasRef} className={styles.networkCanvas} aria-hidden="true" />;
}
