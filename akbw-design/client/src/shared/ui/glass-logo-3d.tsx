'use client';

import { useEffect, useRef } from 'react';

/**
 * 3D shisha AKBW logotipi (Kenao shriftidan). Three.js faqat klientda,
 * dinamik import bilan yuklanadi; WebGL bo'lmasa hech narsa chizmaydi.
 */
export default function GlassLogo3D({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } =
        await import('three/examples/jsm/environments/RoomEnvironment.js');
      const opentype = (await import('opentype.js')).default;
      if (disposed) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // WebGL yo'q — fon gradienti qoladi
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.style.cssText =
        'width:100%;height:100%;display:block';
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

      // Studiya foni (bronza yorug'lik + vertikal chiziqlar) — shisha shuni sindiradi
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      const g = c.getContext('2d')!;
      const rg = g.createRadialGradient(512, 420, 0, 512, 420, 620);
      rg.addColorStop(0, '#c8986a');
      rg.addColorStop(0.5, '#5a3a22');
      rg.addColorStop(1, '#140e09');
      g.fillStyle = rg;
      g.fillRect(0, 0, 1024, 1024);
      g.filter = 'blur(18px)';
      (
        [
          [300, 0.25],
          [430, 0.14],
          [640, 0.2],
          [760, 0.12],
        ] as const
      ).forEach(([x, a]) => {
        g.fillStyle = `rgba(255,236,210,${a})`;
        g.fillRect(x, 60, 30, 700);
      });
      g.filter = 'none';
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const bg = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
      );
      bg.position.z = -8;
      scene.add(bg);

      const key = new THREE.DirectionalLight('#fff3e2', 3.5);
      key.position.set(4, 6, 8);
      scene.add(key);

      const glass = new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.02,
        transmission: 1,
        thickness: 1.3,
        ior: 1.55,
        dispersion: 5,
        clearcoat: 1,
        envMapIntensity: 2.6,
        attenuationColor: new THREE.Color('#f3dcb5'),
        attenuationDistance: 3,
      });

      const buf = await fetch('/fonts/Kenao.otf').then((r) => r.arrayBuffer());
      if (disposed) return;
      const font = opentype.parse(buf);
      const sp = new THREE.ShapePath();
      for (const k of font.getPath('AKBW', 0, 0, 4).commands) {
        if (k.type === 'M') sp.moveTo(k.x, -k.y);
        else if (k.type === 'L') sp.lineTo(k.x, -k.y);
        else if (k.type === 'Q') sp.quadraticCurveTo(k.x1, -k.y1, k.x, -k.y);
        else if (k.type === 'C')
          sp.bezierCurveTo(k.x1, -k.y1, k.x2, -k.y2, k.x, -k.y);
      }
      let big: import('three').Vector2[] | null = null;
      let area = 0;
      for (const s of sp.subPaths) {
        const pts = s.getPoints();
        const a = Math.abs(THREE.ShapeUtils.area(pts));
        if (a > area) {
          area = a;
          big = pts;
        }
      }
      const geo = new THREE.ExtrudeGeometry(
        sp.toShapes(big ? !THREE.ShapeUtils.isClockWise(big) : true),
        {
          depth: 0.5,
          bevelEnabled: true,
          bevelThickness: 0.08,
          bevelSize: 0.04,
          bevelSegments: 10,
          curveSegments: 32,
        },
      );
      geo.center();
      geo.computeBoundingBox();
      const W = geo.boundingBox!.max.x - geo.boundingBox!.min.x;
      const logo = new THREE.Mesh(geo, glass);
      scene.add(logo);

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const tanH = Math.tan(THREE.MathUtils.degToRad(15));
        camera.position.z = Math.max(12, W / (0.82 * 2 * tanH * camera.aspect));
        camera.updateProjectionMatrix();
        logo.position.y = 2 * tanH * camera.position.z * 0.26;
        const bh = 2 * tanH * (camera.position.z + 8);
        bg.scale.set(
          bh * Math.max(camera.aspect, 1),
          bh * Math.max(1, 1 / camera.aspect),
          1,
        );
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      const tgt = { x: 0, y: 0 };
      const cur = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        tgt.x = (e.clientX / window.innerWidth - 0.5) * 2;
        tgt.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        tgt.x = Math.max(-1, Math.min(1, e.gamma / 30));
        tgt.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('deviceorientation', onTilt);

      let visible = true;
      const io = new IntersectionObserver(
        ([e]) => (visible = e.isIntersecting),
      );
      io.observe(host);

      const clock = new THREE.Clock();
      renderer.setAnimationLoop(() => {
        if (!visible) return;
        const t = clock.getElapsedTime();
        cur.x += (tgt.x - cur.x) * 0.04;
        cur.y += (tgt.y - cur.y) * 0.04;
        logo.rotation.y = -0.2 + cur.x * 0.3 + Math.sin(t * 0.35) * 0.16;
        logo.rotation.x = 0.1 + cur.y * 0.14 + Math.sin(t * 0.5) * 0.04;
        renderer.render(scene, camera);
      });

      cleanup = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('deviceorientation', onTilt);
        geo.dispose();
        glass.dispose();
        tex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden />;
}
