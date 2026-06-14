"use client";

import {
  useRef,
  useMemo,
  useEffect,
  useLayoutEffect,
  Suspense,
  type ElementRef,
} from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Model } from "@/Keyboard";

function createLabelMap(
  mask: THREE.Texture,
  bgColor: string,
  labelColor: string,
): THREE.CanvasTexture {
  const img = mask.image as HTMLImageElement;
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const bg = new THREE.Color(bgColor);
  const label = new THREE.Color(labelColor);

  for (let i = 0; i < data.length; i += 4) {
    const t = data[i] / 255;
    data[i] = Math.round((bg.r * (1 - t) + label.r * t) * 255);
    data[i + 1] = Math.round((bg.g * (1 - t) + label.g * t) * 255);
    data[i + 2] = Math.round((bg.b * (1 - t) + label.b * t) * 255);
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

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
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0.2, "rgba(255,255,255,1)");
    gradient.addColorStop(0.7, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const keysRoughness = useTexture("/textures/keyboard/keys_roughness.jpg");
  const baseRoughness = useTexture("/textures/keyboard/base_roughness.jpg");
  const keysAOMap = useTexture("/textures/keyboard/ao.webp");
  const keysAOMapUnflipped = useMemo(() => {
    const t = keysAOMap.clone();
    t.flipY = false;
    t.channel = 1;
    t.needsUpdate = true;
    return t;
  }, [keysAOMap]);
  const keysMask = useTexture("/textures/keyboard/keys.webp");
  const lightLabelMap = useMemo(
    () => createLabelMap(keysMask, "#E7A779", "#663919"),
    [keysMask],
  );
  const darkLabelMap = useMemo(
    () => createLabelMap(keysMask, "#663919", "#E7A779"),
    [keysMask],
  );

  useLayoutEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.name === "keys_light") {
          mat.map = lightLabelMap;
          mat.color.set(0xffffff);
          mat.aoMap = keysAOMapUnflipped;
          mat.aoMapIntensity = 1;
          mat.roughnessMap = keysRoughness;
          mat.bumpMap = keysRoughness;
          mat.bumpScale = 2;
          mat.roughness = 1;
          mat.needsUpdate = true;
        } else if (mat.name === "keys_dark") {
          mat.map = darkLabelMap;
          mat.color.set(0xffffff);
          mat.aoMap = keysAOMapUnflipped;
          mat.aoMapIntensity = 1;
          mat.roughnessMap = keysRoughness;
          mat.bumpMap = keysRoughness;
          mat.bumpScale = 2;
          mat.roughness = 1;
          mat.needsUpdate = true;
        } else if (mat.name === "base") {
          mat.aoMap = keysAOMapUnflipped;
          mat.aoMapIntensity = 1;
          mat.roughnessMap = baseRoughness;
          mat.bumpMap = baseRoughness;
          mat.bumpScale = 1;
          mat.roughness = 1.8;
          mat.needsUpdate = true;
        }
      }
    });
  }, [
    keysRoughness,
    baseRoughness,
    lightLabelMap,
    darkLabelMap,
    keysAOMapUnflipped,
  ]);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const handler = () => {
      if (ctrl.target.y < 0) ctrl.target.y = 0;
    };
    ctrl.addEventListener("change", handler);
    return () => ctrl.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <Lighting />
      <group ref={modelRef}>
        <Model />
      </group>
      <Floor />
      <FloorFade />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </>
  );
}

export default function Scene() {
  return (
    <div className="h-screen w-full">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [2, 1.5, 2], fov: 40 }}
      >
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshBasicMaterial wireframe color="gray" />
            </mesh>
          }
        >
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
