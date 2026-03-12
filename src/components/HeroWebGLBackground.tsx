/**
 * WebGL liquid distortion / wave animation for Hero background.
 * Shiroito-style: Perlin-like noise displacement, slow "breathing" motion, lagged mouse follow.
 * Fallback: static image when WebGL unsupported. Mobile: 50% displacement strength.
 */
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const TIME_INCREMENT = 0.015;
const MOUSE_LERP = 0.06;
const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;      // 0..1
  uniform vec2 uViewSize;
  uniform float uImageAspect;
  uniform float uViewAspect;
  uniform float uStrength;
  uniform float uMouseInfluence;

  varying vec2 vUv;

  // Smooth procedural noise (low-freq, cloud-like)
  float noise(vec2 p) {
    return sin(p.x * 1.5 + uTime * 0.3) * cos(p.y * 1.2 + uTime * 0.25)
         + sin((p.x + p.y) * 1.0 + uTime * 0.2) * 0.5
         + sin(p.x * 2.3 - p.y * 1.7 + uTime * 0.15) * 0.25;
  }

  void main() {
    vec2 uv = vUv;
    vec2 nuv = uv * 2.5 + uTime * 0.02;
    float n = noise(nuv);
    float n2 = noise(nuv * 1.3 + 0.5);
    vec2 disp = vec2(n * 0.5 + 0.5, n2 * 0.5 + 0.5) - 0.5;
    disp *= uStrength;

    // Lagged mouse: distort towards cursor
    vec2 toMouse = uMouse - uv;
    disp += toMouse * uMouseInfluence;

    // Cover: scale UVs so image covers view (like background-size: cover)
    vec2 texUv = uv + disp * 0.08;
    if (uViewAspect > uImageAspect) {
      texUv.x = 0.5 + (texUv.x - 0.5) * (uImageAspect / uViewAspect);
    } else {
      texUv.y = 0.5 + (texUv.y - 0.5) * (uViewAspect / uImageAspect);
    }
    vec4 color = texture2D(uTexture, texUv);
    gl_FragColor = color;
  }
`;

export interface HeroWebGLBackgroundProps {
  imageUrl: string;
  className?: string;
  isMobile?: boolean;
  /** When true, background is position:fixed and covers the viewport (e.g. for full-page backgrounds). */
  fixed?: boolean;
}

function MobileParallaxBackground({
  imageUrl,
  className = "",
  fixed = false,
}: {
  imageUrl: string;
  className?: string;
  fixed?: boolean;
}) {
  const bgRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const el = bgRef.current;
    if (!el || !fixed) return;

    const PARALLAX_FACTOR = 0.3;
    let targetY = 0;

    const tick = () => {
      targetY = window.scrollY * PARALLAX_FACTOR;
      currentY.current += (targetY - currentY.current) * 0.12;
      el.style.transform = `translate3d(0, ${-currentY.current}px, 0)`;
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId.current);
  }, [fixed]);

  return (
    <div
      ref={bgRef}
      className={className}
      style={{
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        zIndex: 0,
        height: fixed ? "120svh" : "100%",
        overflow: "hidden",
        willChange: "transform",
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden
    />
  );
}

export default function HeroWebGLBackground({
  imageUrl,
  className = "",
  isMobile = false,
  fixed = false,
}: HeroWebGLBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglReady, setWebglReady] = useState(false);
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrent = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
    let renderer: THREE.WebGLRenderer;
    let texture: THREE.Texture;
    let rafId: number;

    try {
      const gl = container.ownerDocument.createElement("canvas").getContext("webgl2") ?? container.ownerDocument.createElement("canvas").getContext("webgl");
      if (!gl) return;
    } catch {
      return;
    }

    const width = fixed ? window.innerWidth : container.offsetWidth;
    const height = fixed ? window.innerHeight : container.offsetHeight;
    const viewAspect = width / height;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 0;

    const loader = new THREE.TextureLoader();
    texture = loader.load(
      imageUrl,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        const img = tex.image as HTMLImageElement;
        if (img && img.naturalWidth) {
          const imageAspect = img.naturalWidth / img.naturalHeight;
          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTexture: { value: texture },
              uTime: { value: 0 },
              uMouse: { value: new THREE.Vector2(0.5, 0.5) },
              uViewSize: { value: new THREE.Vector2(width, height) },
              uImageAspect: { value: imageAspect },
              uViewAspect: { value: viewAspect },
              uStrength: { value: 2.5 },
              uMouseInfluence: { value: 0.03 },
            },
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            depthWrite: false,
          });
          const geometry = new THREE.PlaneGeometry(2, 2);
          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          setWebglReady(true);
        }
      },
      undefined,
      () => setWebglReady(false)
    );

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (mesh?.material && "uniforms" in mesh.material) {
        const u = mesh.material.uniforms;
        u.uTime.value += TIME_INCREMENT;
        mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * MOUSE_LERP;
        mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * MOUSE_LERP;
        u.uMouse.value.set(mouseCurrent.current.x, mouseCurrent.current.y);
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container || !renderer || !mesh?.material) return;
      const w = fixed ? window.innerWidth : container.offsetWidth;
      const h = fixed ? window.innerHeight : container.offsetHeight;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if ("uniforms" in mesh.material) {
        mesh.material.uniforms.uViewSize.value.set(w, h);
        mesh.material.uniforms.uViewAspect.value = w / h;
      }
    };
    window.addEventListener("resize", onResize);

    const onMouseMove = (e: MouseEvent) => {
      if (fixed) {
        mouseTarget.current.x = e.clientX / window.innerWidth;
        mouseTarget.current.y = 1.0 - e.clientY / window.innerHeight;
      } else {
        const rect = container.getBoundingClientRect();
        mouseTarget.current.x = (e.clientX - rect.left) / rect.width;
        mouseTarget.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
      }
    };
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
      texture?.dispose();
      mesh?.geometry?.dispose();
      (mesh?.material as THREE.Material)?.dispose();
      renderer?.dispose();
      if (container && renderer?.domElement?.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl, isMobile, fixed]);

  if (isMobile) {
    return <MobileParallaxBackground imageUrl={imageUrl} className={className} fixed={fixed} />;
  }

  const showFallback = !webglReady;

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        style={{
          position: fixed ? "fixed" : "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
        aria-hidden
      />
      {showFallback && (
        <div
          className={className}
          style={{
            position: fixed ? "fixed" : "absolute",
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden
        />
      )}
    </>
  );
}
