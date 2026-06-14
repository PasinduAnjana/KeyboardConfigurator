"use client";

import { useRef, useLayoutEffect, Suspense } from "react";
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
