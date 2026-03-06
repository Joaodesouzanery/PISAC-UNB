"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { BIMModel, BIMComponent } from "@/data/map-data";
import {
  Box,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface BIMViewerProps {
  model: BIMModel;
  onClose: () => void;
}

const conditionColors: Record<string, number> = {
  good: 0x22c55e,
  fair: 0xf59e0b,
  poor: 0xf97316,
  critical: 0xef4444,
};

export default function BIMViewer({ model, onClose }: BIMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number>(0);
  const [selectedComponent, setSelectedComponent] = useState<BIMComponent | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0d14);
    scene.fog = new THREE.Fog(0x0c0d14, 20, 50);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xf97316, 0.3, 20);
    pointLight.position.set(-3, 5, -3);
    scene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x26273a, 0x1e1f2e);
    scene.add(gridHelper);

    // Build 3D model from components
    const meshMap = new Map<string, THREE.Mesh>();
    const group = new THREE.Group();

    model.components.forEach((component, index) => {
      let geometry: THREE.BufferGeometry;
      const yPos = index * 0.1;

      switch (component.type) {
        case "column":
          geometry = new THREE.CylinderGeometry(0.2, 0.25, 3, 8);
          break;
        case "beam":
          geometry = new THREE.BoxGeometry(4, 0.3, 0.3);
          break;
        case "slab":
          geometry = new THREE.BoxGeometry(5, 0.15, 3);
          break;
        case "foundation":
          geometry = new THREE.BoxGeometry(1.5, 0.5, 1.5);
          break;
        case "wall":
          geometry = new THREE.BoxGeometry(6, 2, 0.5);
          break;
        case "spillway":
          geometry = new THREE.BoxGeometry(2, 1, 3);
          break;
        case "gallery":
          geometry = new THREE.CylinderGeometry(0.4, 0.4, 5, 8);
          break;
        case "railing":
          geometry = new THREE.BoxGeometry(5, 0.8, 0.05);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      const color = conditionColors[component.condition] || 0x94a3b8;
      const material = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        specular: 0x111111,
        shininess: 30,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Position based on type
      switch (component.type) {
        case "column": {
          const angle = (index * Math.PI * 2) / Math.max(model.components.filter((c) => c.type === "column").length, 1);
          const radius = 1.5;
          mesh.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius);
          break;
        }
        case "beam":
          mesh.position.set(0, 3, 0);
          break;
        case "slab":
          mesh.position.set(0, 3.2, 0);
          break;
        case "foundation":
          mesh.position.set(0, -0.25, 0);
          break;
        case "wall":
          mesh.position.set(0, 1, 0);
          break;
        case "spillway":
          mesh.position.set(2, 0.5, 0);
          break;
        case "gallery":
          mesh.position.set(0, 0, 0);
          mesh.rotation.z = Math.PI / 2;
          break;
        case "railing":
          mesh.position.set(0, 3.6, 1.5);
          break;
        default:
          mesh.position.set(index * 1.5 - 2, 0.5, 0);
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { componentId: component.id };
      meshMap.set(component.id, mesh);
      group.add(mesh);
    });

    scene.add(group);
    meshMapRef.current = meshMap;

    // Raycaster for click interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children, true);

      if (intersects.length > 0) {
        const componentId = intersects[0].object.userData.componentId;
        const comp = model.components.find((c) => c.id === componentId);
        if (comp) {
          setSelectedComponent(comp);
          // Highlight
          meshMap.forEach((m) => {
            (m.material as THREE.MeshPhongMaterial).opacity = 0.3;
          });
          const selectedMesh = meshMap.get(componentId);
          if (selectedMesh) {
            (selectedMesh.material as THREE.MeshPhongMaterial).opacity = 1;
            (selectedMesh.material as THREE.MeshPhongMaterial).emissive = new THREE.Color(0xf97316);
            (selectedMesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.3;
          }
        }
      } else {
        setSelectedComponent(null);
        meshMap.forEach((m) => {
          (m.material as THREE.MeshPhongMaterial).opacity = 0.85;
          (m.material as THREE.MeshPhongMaterial).emissive = new THREE.Color(0x000000);
        });
      }
    };

    container.addEventListener("click", onClick);

    // Animation loop
    let angle = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isRotating) {
        angle += 0.003;
        camera.position.x = Math.cos(angle) * 10;
        camera.position.z = Math.sin(angle) * 10;
        camera.lookAt(0, 1, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("click", onClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [model, isRotating]);

  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    cam.position.multiplyScalar(factor);
    cam.lookAt(0, 1, 0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Box className="h-5 w-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {model.name}
            </h3>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {model.format} • v{model.version} • {model.fileSize}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="p-1.5 rounded-lg"
            style={{
              backgroundColor: isRotating ? "var(--accent-muted)" : "var(--bg-elevated)",
              color: isRotating ? "var(--accent)" : "var(--text-muted)",
            }}
            title={isRotating ? "Parar rotação" : "Rotacionar"}
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(0.85)} className="p-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <ZoomIn className="h-4 w-4" />
          </button>
          <button onClick={() => handleZoom(1.15)} className="p-1.5 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <ZoomOut className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg ml-2" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 3D Viewport */}
        <div ref={containerRef} className="flex-1" />

        {/* Component List */}
        <div
          className="w-64 overflow-y-auto scrollbar-thin p-3 flex-shrink-0"
          style={{
            backgroundColor: "var(--bg-card)",
            borderLeft: "1px solid var(--border-primary)",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Componentes ({model.components.length})
          </p>
          <div className="space-y-1.5">
            {model.components.map((comp) => (
              <button
                key={comp.id}
                onClick={() => {
                  setSelectedComponent(comp);
                  meshMapRef.current.forEach((m) => {
                    (m.material as THREE.MeshPhongMaterial).opacity = 0.3;
                    (m.material as THREE.MeshPhongMaterial).emissive = new THREE.Color(0x000000);
                  });
                  const mesh = meshMapRef.current.get(comp.id);
                  if (mesh) {
                    (mesh.material as THREE.MeshPhongMaterial).opacity = 1;
                    (mesh.material as THREE.MeshPhongMaterial).emissive = new THREE.Color(0xf97316);
                    (mesh.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.3;
                  }
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: selectedComponent?.id === comp.id ? "var(--accent-muted)" : "var(--bg-elevated)",
                  border: `1px solid ${selectedComponent?.id === comp.id ? "rgba(249,115,22,0.3)" : "var(--border-subtle)"}`,
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `#${conditionColors[comp.condition]?.toString(16) || "94a3b8"}` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {comp.name}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {comp.type} • {comp.material}
                  </p>
                </div>
                <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
              </button>
            ))}
          </div>

          {/* Selected Component Detail */}
          {selectedComponent && (
            <div
              className="mt-4 p-3 rounded-lg"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {selectedComponent.condition === "good" ? (
                  <CheckCircle className="h-4 w-4 text-success-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning-500" />
                )}
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                  {selectedComponent.name}
                </span>
              </div>
              <div className="space-y-1 text-[11px]">
                <p style={{ color: "var(--text-secondary)" }}>
                  Material: <span style={{ color: "var(--text-primary)" }}>{selectedComponent.material}</span>
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  Ano: <span style={{ color: "var(--text-primary)" }}>{selectedComponent.yearBuilt}</span>
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  Condição: <span style={{
                    color: selectedComponent.condition === "good" ? "#22c55e" :
                           selectedComponent.condition === "fair" ? "#f59e0b" :
                           selectedComponent.condition === "poor" ? "#f97316" : "#ef4444",
                  }}>{selectedComponent.condition.toUpperCase()}</span>
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  Inspeção: <span style={{ color: "var(--text-primary)" }}>{selectedComponent.lastInspection}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
