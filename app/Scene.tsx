"use client";

import { useRef, useMemo, useLayoutEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Model } from "@/Keyboard";

function Lighting() {
  return (
    <>
      <color args={["#000000"]} attach="background" />
      <Environment preset="sunset" />
      <spotLight
        position={[0, 3, 0]}
        angle={0.8}
        penumbra={0.4}
        intensity={80}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

function Floor() {
  const { scene } = useGLTF("/models/floor.glb");
  return <primitive object={scene} receiveShadow />;
}

function FloorFade() {
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0.2, "rgba(255,255,255,1)");
    gradient.addColorStop(0.7, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshBasicMaterial
        map={texture}
        transparent
        premultipliedAlpha
        depthWrite={false}
        blending={THREE.MultiplyBlending}
      />
    </mesh>
  );
}

useGLTF.preload("/models/floor.glb");

function SceneContent() {
  const modelRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.name.startsWith("keys")) mat.roughness = 1;
      }
    });
  }, []);

  return (
    <>
      <Lighting />
      <group ref={modelRef}>
        <Model />
      </group>
      <Floor />
      <FloorFade />
      <OrbitControls />
    </>
  );
}

export default function Scene() {
  return (
    <div className="h-screen w-full">
      <Canvas shadows={{ type: THREE.PCFShadowMap }} camera={{ position: [2, 1.5, 2], fov: 40 }}>
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
