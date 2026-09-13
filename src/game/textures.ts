import * as THREE from 'three';

/**
 * Creates a retro procedural texture rendered to a small canvas with NearestFilter
 * for an authentic PS1 / late 90s low-poly pixelated look.
 */
function createPixelTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    draw(ctx, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Floor texture: worn retro wooden planks or dingy tile
export function createFloorTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx, w, h) => {
    // Base wood tone
    ctx.fillStyle = '#4a3525';
    ctx.fillRect(0, 0, w, h);

    // Planks
    const plankHeight = 8;
    for (let y = 0; y < h; y += plankHeight) {
      // Dark seam
      ctx.fillStyle = '#2b1e15';
      ctx.fillRect(0, y, w, 1);

      // Plank color variation
      const shade = ((y / plankHeight) % 2 === 0) ? '#5c4330' : '#4e3928';
      ctx.fillStyle = shade;
      ctx.fillRect(0, y + 1, w, plankHeight - 1);

      // Grain noise
      for (let x = 0; x < w; x += 2) {
        if (Math.random() > 0.6) {
          ctx.fillStyle = Math.random() > 0.5 ? '#6d503a' : '#3d2a1c';
          ctx.fillRect(x, y + 1 + Math.floor(Math.random() * (plankHeight - 2)), 2, 1);
        }
      }
    }
  });
}

// Wall texture: peeling retro wallpaper / dingy apartment drywall
export function createWallTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx, w, h) => {
    ctx.fillStyle = '#6b7260'; // dingy muted greenish-tan retro wallpaper
    ctx.fillRect(0, 0, w, h);

    // Subtle stripe / grime pattern
    for (let x = 0; x < w; x += 4) {
      ctx.fillStyle = '#636958';
      ctx.fillRect(x, 0, 1, h);
    }

    // Grime speckles
    for (let i = 0; i < 40; i++) {
      const rx = Math.floor(Math.random() * w);
      const ry = Math.floor(Math.random() * h);
      ctx.fillStyle = Math.random() > 0.5 ? '#555b4b' : '#737a67';
      ctx.fillRect(rx, ry, 1, 1);
    }

    // Baseboard dark edge at bottom
    ctx.fillStyle = '#3a2e24';
    ctx.fillRect(0, h - 3, w, 3);
  });
}

// Ceiling texture: acoustic plaster tile
export function createCeilingTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 32, (ctx, w, h) => {
    ctx.fillStyle = '#555753';
    ctx.fillRect(0, 0, w, h);

    // Acoustic tile grid
    ctx.fillStyle = '#3f413d';
    ctx.fillRect(0, 0, w, 1);
    ctx.fillRect(0, 0, 1, h);

    for (let i = 0; i < 50; i++) {
      const rx = Math.floor(Math.random() * w);
      const ry = Math.floor(Math.random() * h);
      ctx.fillStyle = Math.random() > 0.5 ? '#61635e' : '#474944';
      ctx.fillRect(rx, ry, 1, 1);
    }
  });
}

// Door texture: retro wood panel door with brass knob plate
export function createDoorTexture(): THREE.CanvasTexture {
  return createPixelTexture(32, 64, (ctx, w, h) => {
    ctx.fillStyle = '#422a1d'; // dark mahogany/wood
    ctx.fillRect(0, 0, w, h);

    // Border frame
    ctx.fillStyle = '#321f15';
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // Upper panel
    ctx.fillStyle = '#523424';
    ctx.fillRect(4, 4, w - 8, 24);
    ctx.fillStyle = '#2b1b12';
    ctx.strokeRect(4, 4, w - 8, 24);

    // Lower panel
    ctx.fillStyle = '#523424';
    ctx.fillRect(4, 34, w - 8, 26);
    ctx.fillStyle = '#2b1b12';
    ctx.strokeRect(4, 34, w - 8, 26);

    // Brass lock plate & doorknob area
    ctx.fillStyle = '#c8a452';
    ctx.fillRect(w - 7, 30, 4, 8);
    ctx.fillStyle = '#8a6e30';
    ctx.fillRect(w - 6, 33, 2, 2);
  });
}

// Fabric texture for couch/bed
export function createFabricTexture(baseColor = '#3a4a58'): THREE.CanvasTexture {
  return createPixelTexture(16, 16, (ctx, w, h) => {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    // Crossweave
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(x, y, 1, 1);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });
}

// Computer screen texture: glowing retro CRT terminal desktop
export function createCrtScreenTexture(): THREE.CanvasTexture {
  return createPixelTexture(64, 48, (ctx, w, h) => {
    // Teal retro desktop background (Windows 95 style)
    ctx.fillStyle = '#008080';
    ctx.fillRect(0, 0, w, h);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < h; y += 2) {
      ctx.fillRect(0, y, w, 1);
    }

    // Fake desktop icons
    // Icon 1 (My Computer)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 4, 6, 6);
    ctx.fillStyle = '#000080';
    ctx.fillRect(5, 5, 4, 4);

    // Icon 2 (Network / Folder)
    ctx.fillStyle = '#e5c158';
    ctx.fillRect(4, 14, 6, 5);

    // Icon 3 (Terminal/Trash)
    ctx.fillStyle = '#333333';
    ctx.fillRect(4, 23, 6, 5);

    // Bottom taskbar
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, h - 6, w, 6);

    // Start button
    ctx.fillStyle = '#808080';
    ctx.fillRect(2, h - 5, 10, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, h - 4, 3, 2);

    // Clock
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(w - 12, h - 5, 10, 4);
  });
}
