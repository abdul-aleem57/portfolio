/**
 * Abdul Aleem — 3D Astra Constellation & Particle Cloud Engine
 * Inspired by OpenAI GPT Astra interactive visual experience
 */

(function () {
  const canvas = document.getElementById('astra-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, centerX, centerY;
  let dpr = window.devicePixelRatio || 1;

  // Particle Settings
  const PARTICLE_COUNT = 1800;
  const SPHERE_RADIUS = 340;
  const FOV = 450;

  // 3D Particles Array
  const particles = [];

  // Color Palettes (White starlight, warm gold, icy cyan, faint violet)
  const colors = [
    { r: 255, g: 255, b: 255, weight: 0.65 }, // Pure starlight white
    { r: 255, g: 195, b: 110, weight: 0.15 }, // Warm celestial gold
    { r: 100, g: 215, b: 255, weight: 0.12 }, // Icy cyan
    { r: 180, g: 160, b: 255, weight: 0.08 }  // Faint violet
  ];

  function getRandomColor() {
    const rand = Math.random();
    let accumulated = 0;
    for (const c of colors) {
      accumulated += c.weight;
      if (rand <= accumulated) return c;
    }
    return colors[0];
  }

  // Particle Class
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      // Gaussian distribution for natural organic core cluster
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Distance from center: higher density in core
      const r = Math.pow(Math.random(), 0.8) * SPHERE_RADIUS;

      this.x = r * Math.sin(phi) * Math.cos(theta);
      this.y = r * Math.sin(phi) * Math.sin(theta) * 0.85; // Slight oblate spheroid
      this.z = r * Math.cos(phi);

      // Base radius & brightness
      this.baseRadius = Math.random() * 1.6 + 0.4;
      this.color = getRandomColor();
      this.alphaBase = Math.random() * 0.7 + 0.3;

      // Subtle twinkling oscillation
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.03 + 0.01;

      // Orbit velocity (gentle internal swirl)
      this.orbitalSpeed = (Math.random() * 0.001 + 0.0005) * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
      this.twinklePhase += this.twinkleSpeed;

      // Slow orbital swirl around Y axis
      const cosO = Math.cos(this.orbitalSpeed);
      const sinO = Math.sin(this.orbitalSpeed);
      const nx = this.x * cosO - this.z * sinO;
      const nz = this.x * sinO + this.z * cosO;
      this.x = nx;
      this.z = nz;
    }
  }

  // Initialize Particles
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Rotation & Interactive Controls
  let rotX = 0;
  let rotY = 0;
  let targetRotX = 0;
  let targetRotY = 0;

  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseVelocityX = 0;
  let mouseVelocityY = 0;

  // Window Resize
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    centerX = width / 2;
    centerY = height / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse / Touch Event Handlers
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) {
      // Subtle smooth parallax tilt based on cursor position
      const normX = (e.clientX - centerX) / centerX;
      const normY = (e.clientY - centerY) / centerY;
      targetRotY = normX * 0.6;
      targetRotX = -normY * 0.4;
    } else {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      mouseVelocityX = deltaX * 0.005;
      mouseVelocityY = deltaY * 0.005;
      rotY += mouseVelocityX;
      rotX += mouseVelocityY;
      targetRotY = rotY;
      targetRotX = rotX;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
  });

  window.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Support for Mobile
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const normX = (touch.clientX - centerX) / centerX;
      const normY = (touch.clientY - centerY) / centerY;
      targetRotY = normX * 0.8;
      targetRotX = -normY * 0.5;
    }
  }, { passive: true });

  // Main Render Loop
  let time = 0;

  function render() {
    time += 0.002;

    // Smooth inertia / damping towards target rotation
    rotX += (targetRotX - rotX) * 0.05;
    rotY += (targetRotY - rotY) * 0.05;

    // Automatic slow cinematic celestial spin
    const currentRotY = rotY + time * 0.5;
    const currentRotX = rotX + Math.sin(time * 0.7) * 0.08;

    const cosY = Math.cos(currentRotY);
    const sinY = Math.sin(currentRotY);
    const cosX = Math.cos(currentRotX);
    const sinX = Math.sin(currentRotX);

    // Clear canvas with subtle radial depth gradient
    ctx.clearRect(0, 0, width, height);

    // Deep cosmic background glow in center
    const bgGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, SPHERE_RADIUS * 1.6);
    bgGlow.addColorStop(0, 'rgba(12, 19, 36, 0.45)');
    bgGlow.addColorStop(0.5, 'rgba(4, 8, 16, 0.25)');
    bgGlow.addColorStop(1, 'rgba(3, 5, 9, 0)');
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);

    // Sort particles by Z depth for realistic occlusion
    const projected = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();

      // 3D Rotation along Y then X
      // Y-axis rotation
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.z * cosY + p.x * sinY;

      // X-axis rotation
      const y1 = p.y * cosX - z1 * sinX;
      const z2 = z1 * cosX + p.y * sinX;

      // Perspective projection
      const depth = FOV + z2;
      if (depth > 20) {
        const scale = FOV / depth;
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y1 * scale;

        // Twinkle factor
        const twinkle = (Math.sin(p.twinklePhase) + 1) * 0.5 * 0.4 + 0.6;
        const alpha = Math.min(Math.max((p.alphaBase * scale * 0.9) * twinkle, 0.05), 1);
        const radius = Math.max(p.baseRadius * scale, 0.4);

        projected.push({
          x: screenX,
          y: screenY,
          z: z2,
          radius: radius,
          color: p.color,
          alpha: alpha
        });
      }
    }

    // Sort back-to-front
    projected.sort((a, b) => a.z - b.z);

    // Render projected particles
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const { r, g, b } = p.color;

      // Soft glow for larger / closer stars
      if (p.radius > 1.2 && p.alpha > 0.4) {
        ctx.beginPath();
        const glowRadius = p.radius * 3.5;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.7})`);
        grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.25})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Star core
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
