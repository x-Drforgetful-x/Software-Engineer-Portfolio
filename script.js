import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const glow = document.querySelector('.cursor-glow');
window.addEventListener('mousemove', (e) => {
  if (glow) {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .reveal-delay').forEach((el) => observer.observe(el));

document.querySelectorAll('.tilt-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

function makeScene(containerId, buildFn) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 7);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 1.25);
  const point = new THREE.PointLight(0x66a8ff, 8, 50);
  point.position.set(6, 6, 8);
  const point2 = new THREE.PointLight(0x53f3c3, 6, 50);
  point2.position.set(-5, -4, 6);
  scene.add(ambient, point, point2);

  const group = buildFn(scene);
  return { container, scene, camera, renderer, group };
}

const heroScene = makeScene('hero3d', (scene) => {
  const root = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshPhysicalMaterial({
      color: 0x66a8ff, metalness: 0.2, roughness: 0.05,
      transmission: 0.25, thickness: 1, transparent: true,
      opacity: 0.92, emissive: 0x14284f, emissiveIntensity: 1.4
    })
  );
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.8, 1)),
    new THREE.LineBasicMaterial({ color: 0x53f3c3, transparent: true, opacity: 0.9 })
  );
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.06, 24, 120),
    new THREE.MeshBasicMaterial({ color: 0xb280ff, transparent: true, opacity: 0.9 })
  );
  torus.rotation.x = Math.PI / 2.8;

  const particles = new THREE.BufferGeometry();
  const count = 220;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3 + Math.random() * 1.7;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 3.2;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(a) * r;
  }
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    particles,
    new THREE.PointsMaterial({ color: 0x8be1ff, size: 0.045, transparent: true, opacity: 0.9 })
  );
  root.add(core, wire, torus, points);
  scene.add(root);
  return { root, core, wire, torus };
});

const modelA = makeScene('modelA', (scene) => {
  const root = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x53f3c3, metalness: 0.35, roughness: 0.25, emissive: 0x103428, emissiveIntensity: 0.9 })
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.07, 20, 100),
    new THREE.MeshBasicMaterial({ color: 0x66a8ff })
  );
  ring.rotation.x = 1.1;
  root.add(mesh, ring);
  scene.add(root);
  return { root, mesh, ring };
});

const modelB = makeScene('modelB', (scene) => {
  const root = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 1.1),
      new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x66a8ff : 0xb280ff, metalness: 0.4, roughness: 0.22 })
    );
    cube.position.y = i * 0.95 - 1.9;
    cube.rotation.x = i * 0.15;
    cube.rotation.z = i * 0.08;
    root.add(cube);
  }
  scene.add(root);
  return { root };
});

const modelC = makeScene('modelC', (scene) => {
  const root = new THREE.Group();
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xb280ff, metalness: 0.2, roughness: 0.12, emissive: 0x2a1038, emissiveIntensity: 1.1 })
  );
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.05, 18, 100),
    new THREE.MeshBasicMaterial({ color: 0x53f3c3 })
  );
  ring1.rotation.x = 1.2;
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.25, 0.04, 18, 100),
    new THREE.MeshBasicMaterial({ color: 0x8be1ff })
  );
  ring2.rotation.y = 0.8;
  root.add(sphere, ring1, ring2);
  scene.add(root);
  return { root, ring1, ring2 };
});

const scenes = [heroScene, modelA, modelB, modelC].filter(Boolean);

window.addEventListener('resize', () => {
  scenes.forEach((s) => {
    const w = s.container.clientWidth;
    const h = s.container.clientHeight;
    s.camera.aspect = w / h;
    s.camera.updateProjectionMatrix();
    s.renderer.setSize(w, h);
  });
});

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  if (heroScene) {
    heroScene.group.root.rotation.y = t * 0.45;
    heroScene.group.root.rotation.x = Math.sin(t * 0.6) * 0.18;
    heroScene.group.core.rotation.x += 0.005;
    heroScene.group.core.rotation.y += 0.008;
    heroScene.group.wire.rotation.z -= 0.004;
    heroScene.group.torus.rotation.z += 0.006;
  }
  if (modelA) {
    modelA.group.root.rotation.y = t * 0.7;
    modelA.group.mesh.rotation.x = t * 0.4;
    modelA.group.ring.rotation.z = t * 0.9;
  }
  if (modelB) {
    modelB.group.root.rotation.y = t * 0.45;
    modelB.group.root.rotation.x = Math.sin(t * 0.7) * 0.2;
  }
  if (modelC) {
    modelC.group.root.rotation.y = t * 0.55;
    modelC.group.ring1.rotation.z = t * 0.8;
    modelC.group.ring2.rotation.x = t * 0.5;
  }
  scenes.forEach((s) => s.renderer.render(s.scene, s.camera));
  requestAnimationFrame(animate);
}
animate();
