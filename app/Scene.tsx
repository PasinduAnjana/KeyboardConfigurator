"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Model } from "@/Keyboard";

function Lighting() {
  return (
    <>
      <color args={["#0f0f1a"]} attach="background" />
      <ambientLight intensity={0.08} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-3, 2, -1]}
        intensity={0.25}
        color="#8ba8ff"
      />
      <directionalLight
        position={[-1, 3, 5]}
        intensity={0.15}
        color="#ffd5a0"
      />
      <Environment preset="studio" />
    </>
  );
}

function Stage({ y }: { y: number }) {
  return (
    <mesh position={[0, y, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[1.5, 1.5, 0.3, 64]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
    </mesh>
  );
}

function SceneContent() {
  const modelRef = useRef<THREE.Group>(null);
  const [bottomY, setBottomY] = useState(-0.24);

  useEffect(() => {
    if (!modelRef.current) return;
    const box = new THREE.Box3().setFromObject(modelRef.current);
    setBottomY(box.min.y);
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.name.startsWith("keys")) mat.roughness = 1;
      }
    });
  }, []);

  const stageY = useMemo(() => bottomY - 0.15, [bottomY]);

  return (
    <>
      <Lighting />
      <group ref={modelRef}>
        <Model />
      </group>
      <Stage y={stageY} />
      <OrbitControls />
    </>
  );
}

export default function Scene() {
  return (
    <div className="h-screen w-full">
      <Canvas shadows camera={{ position: [2, 1.5, 2], fov: 40 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
}
