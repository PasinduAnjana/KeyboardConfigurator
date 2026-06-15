"use client";

import {
  useState,
  useRef,
  useMemo,
  useEffect,
  useLayoutEffect,
  useCallback,
  Suspense,
  type ElementRef,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import { Model } from "@/Keyboard";
import ConfiguratorPanel, {
  type KeyColors,
  type DarkKeyMode,
  MobileWidget,
} from "@/app/ConfiguratorPanel";

const PRESS_DEPTH = 0.07;

const CODE_TO_KEY: Record<string, string> = {
  Space: "space",
  Escape: "esc",
  Backquote: "tilda",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "minus",
  Equal: "plus",
  BracketLeft: "left_bracket",
  BracketRight: "right_bracket",
  Backslash: "pipe",
  Semicolon: "semicolon",
  Quote: "apostrophe",
  Comma: "comma",
  Period: "fullstop",
  Slash: "slash",
  Backspace: "backspace",
  Delete: "del",
  Enter: "enter",
  ShiftLeft: "shift_l",
  ShiftRight: "shift_r",
  CapsLock: "caps",
  Tab: "tab",
  ControlLeft: "ctrl_l",
  AltLeft: "alt_l",
  AltRight: "alt_r",
  MetaLeft: "super",
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyQ: "q",
  KeyW: "w",
  KeyE: "e",
  KeyR: "r",
  KeyT: "t",
  KeyY: "y",
  KeyU: "u",
  KeyI: "i",
  KeyO: "o",
  KeyP: "p",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  KeyF: "f",
  KeyG: "g",
  KeyH: "h",
  KeyJ: "j",
  KeyK: "k",
  KeyL: "l",
  KeyZ: "z",
  KeyX: "x",
  KeyC: "c",
  KeyV: "v",
  KeyB: "b",
  KeyN: "n",
  KeyM: "m",
};

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

function useKeystrokeSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    fetch("/audio/single_key.wav")
      .then((res) => res.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((audioBuf) => {
        bufferRef.current = audioBuf;
      })
      .catch(() => {});
    return () => void ctx.close();
  }, []);

  const play = useCallback(() => {
    const ctx = ctxRef.current;
    const buf = bufferRef.current;
    if (!ctx || !buf) return;
    if (ctx.state === "suspended") ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.playbackRate.value = 0.85 + Math.random() * 0.3;
    source.connect(ctx.destination);
    source.start();
  }, []);

  return play;
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
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
    </>
  );
}

function Floor() {
  const { scene } = useGLTF("/models/floor.glb");
  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) child.receiveShadow = true;
    });
  }, [scene]);
  return <primitive object={scene} />;
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

function SceneContent({
  lightBg,
  lightLabel,
  darkBg,
  darkLabel,
  base,
  darkKeysEnabled,
  customDarkKeys,
  onInitDarkKeys,
  onToggleKey,
  darkKeyMode,
  captureRef,
  onReady,
}: KeyColors & {
  darkKeysEnabled: boolean;
  customDarkKeys: string[] | null;
  onInitDarkKeys: (defaults: string[]) => void;
  onToggleKey: (keyName: string) => void;
  darkKeyMode: DarkKeyMode;
  captureRef: React.MutableRefObject<(() => void) | null>;
  onReady?: () => void;
}) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  const modelRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const originalY = useRef<Map<string, number>>(new Map());
  const targetY = useRef<Map<string, number>>(new Map());
  const playKeystroke = useKeystrokeSound();
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    captureRef.current = () => {
      gl.render(scene, camera);
      const link = document.createElement("a");
      link.download = "keyboard-config.png";
      link.href = gl.domElement.toDataURL("image/png");
      link.click();
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, scene, camera, captureRef]);

  const { nodes, materials } = useGLTF("/models/keyboard.glb");
  const originallyDarkRef = useRef<Set<string>>(new Set());

  const geoToName = useMemo(() => {
    const map = new Map<string, string>();
    for (const [name, node] of Object.entries(nodes)) {
      if (node instanceof THREE.Mesh) {
        map.set(node.geometry.uuid, name);
      }
    }
    return map;
  }, [nodes]);

  const keysRoughness = useTexture("/textures/keyboard/keys_roughness.jpg");
  const baseRoughness = useTexture("/textures/keyboard/base_roughness.webp");
  const keysAOMap = useTexture("/textures/keyboard/ao.webp");
  const keysAOMapUnflipped = useMemo(() => {
    const t = keysAOMap.clone();
    t.flipY = false;
    t.channel = 1;
    t.needsUpdate = true;
    return t;
  }, [keysAOMap]);

  useEffect(() => () => keysAOMapUnflipped.dispose(), [keysAOMapUnflipped]);
  const keysMask = useTexture("/textures/keyboard/keys.webp");
  const lightLabelMap = useMemo(
    () => createLabelMap(keysMask, lightBg, lightLabel),
    [keysMask, lightBg, lightLabel],
  );
  const darkLabelMap = useMemo(
    () => createLabelMap(keysMask, darkBg, darkLabel),
    [keysMask, darkBg, darkLabel],
  );

  useLayoutEffect(() => {
    if (!modelRef.current) return;
    originalY.current.clear();
    targetY.current.clear();
    modelRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = geoToName.get(child.geometry.uuid);
      if (name && name !== "Base" && name !== "base_back" && name !== "typeC") {
        originalY.current.set(name, child.position.y);
        targetY.current.set(name, child.position.y);
      }
    });
  }, [geoToName]);

  useLayoutEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        const mat = child.material;
        if (!(mat instanceof THREE.MeshStandardMaterial)) return;
        if (mat.name === "keys_light") {
          mat.map = lightLabelMap;
          mat.color.set(0xffffff);
          mat.aoMap = keysAOMapUnflipped;
          mat.aoMapIntensity = 1;
          mat.roughnessMap = keysRoughness;
          mat.bumpMap = keysRoughness;
          mat.bumpScale = 1;
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
          if (base) mat.color.set(base);
          mat.aoMap = keysAOMapUnflipped;
          mat.aoMapIntensity = 1;
          mat.roughnessMap = baseRoughness;
          mat.bumpMap = baseRoughness;
          mat.bumpScale = 0.3;
          mat.roughness = 1;
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
    lightBg,
    lightLabel,
    darkBg,
    darkLabel,
    base,
  ]);

  // Record original dark key assignment from the model
  useLayoutEffect(() => {
    if (!modelRef.current || !geoToName.size) return;
    const origDark = new Set<string>();
    modelRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = geoToName.get(child.geometry.uuid);
      if (!name || name === "Base" || name === "base_back" || name === "typeC") return;
      const mat = child.material;
      if (mat instanceof THREE.MeshStandardMaterial && mat.name === "keys_dark") {
        origDark.add(name);
      }
    });
    originallyDarkRef.current = origDark;
    if (customDarkKeys === null) {
      onInitDarkKeys(Array.from(origDark));
    }
  }, [geoToName, onInitDarkKeys, customDarkKeys]);

  // Apply dark key material assignments based on user configuration
  useLayoutEffect(() => {
    if (!modelRef.current || !geoToName.size) return;
    const lightMat = materials.keys_light as THREE.MeshStandardMaterial;
    const darkMat = materials.keys_dark as THREE.MeshStandardMaterial;

    modelRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = geoToName.get(child.geometry.uuid);
      if (!name || name === "Base" || name === "base_back" || name === "typeC") return;

      let isDark: boolean;
      if (!darkKeysEnabled) {
        isDark = false;
      } else if (customDarkKeys !== null) {
        isDark = customDarkKeys.includes(name);
      } else {
        isDark = originallyDarkRef.current.has(name);
      }
      child.material = isDark ? darkMat : lightMat;
    });
  }, [geoToName, materials, darkKeysEnabled, customDarkKeys]);

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const handler = () => {
      if (ctrl.target.y < 0) ctrl.target.y = 0;
    };
    ctrl.addEventListener("change", handler);
    return () => ctrl.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyName = CODE_TO_KEY[e.code];
      if (keyName && originalY.current.has(keyName)) {
        e.preventDefault();
        targetY.current.set(
          keyName,
          originalY.current.get(keyName)! - PRESS_DEPTH,
        );
        playKeystroke();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const keyName = CODE_TO_KEY[e.code];
      if (keyName && originalY.current.has(keyName)) {
        targetY.current.set(keyName, originalY.current.get(keyName)!);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playKeystroke]);

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!(e.object instanceof THREE.Mesh)) return;
      const name = geoToName.get(e.object.geometry.uuid);
      if (!name) return;

      if (darkKeyMode !== "idle") {
        const isCurrentlyDark =
          customDarkKeys?.includes(name) ?? originallyDarkRef.current.has(name);
        if (
          (darkKeyMode === "add" && !isCurrentlyDark) ||
          (darkKeyMode === "remove" && isCurrentlyDark)
        ) {
          onToggleKey(name);
        }
        return;
      }

      const origY = originalY.current.get(name);
      if (origY === undefined) return;
      targetY.current.set(name, origY - PRESS_DEPTH);
      playKeystroke();
    },
    [geoToName, playKeystroke, darkKeyMode, customDarkKeys, onToggleKey],
  );

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!(e.object instanceof THREE.Mesh)) return;
      const name = geoToName.get(e.object.geometry.uuid);
      if (!name) return;
      const origY = originalY.current.get(name);
      if (origY === undefined) return;
      targetY.current.set(name, origY);
    },
    [geoToName],
  );

  useFrame(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const name = geoToName.get(child.geometry.uuid);
      if (!name) return;
      const target = targetY.current.get(name);
      if (target === undefined) return;
      child.position.y += (target - child.position.y) * 0.2;
    });
  });

  return (
    <>
      <Lighting />
      <group
        ref={modelRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
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
  const [colors, setColors] = useState<KeyColors>({
    lightBg: "#E7A779",
    lightLabel: "#663919",
    darkBg: "#663919",
    darkLabel: "#E7A779",
  });
  const [ready, setReady] = useState(false);
  const [darkKeysEnabled, setDarkKeysEnabled] = useState(true);
  const [customDarkKeys, setCustomDarkKeys] = useState<string[] | null>(null);
  const [darkKeyMode, setDarkKeyMode] = useState<DarkKeyMode>("idle");

  const handleInitDarkKeys = useCallback((defaults: string[]) => {
    setCustomDarkKeys((prev) => prev ?? defaults);
  }, []);

  const handleToggleKey = useCallback((keyName: string) => {
    setCustomDarkKeys((prev) => {
      if (!prev) return [keyName];
      return prev.includes(keyName)
        ? prev.filter((k) => k !== keyName)
        : [...prev, keyName];
    });
  }, []);

  const captureRef = useRef<(() => void) | null>(null);

  const handleDownload = useCallback(() => {
    captureRef.current?.();
  }, []);

  return (
    <div
      className={`h-screen w-full relative bg-zinc-950 overflow-hidden ${
        darkKeyMode !== "idle" ? "cursor-crosshair" : ""
      }`}
    >
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/keyboard_loading.svg"
            alt="Loading"
            className="size-16 opacity-60"
          />
        </div>
      )}
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.5]}
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [2, 1.5, 2], fov: 40 }}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Suspense fallback={null}>
            <SceneContent
              {...colors}
              darkKeysEnabled={darkKeysEnabled}
              customDarkKeys={customDarkKeys}
              onInitDarkKeys={handleInitDarkKeys}
              onToggleKey={handleToggleKey}
              darkKeyMode={darkKeyMode}
              captureRef={captureRef}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute top-0 left-0 right-0 h-14 z-10 flex items-center px-5 backdrop-blur-2xl bg-zinc-950/40">
        <span className="text-base font-semibold text-zinc-200">
          ⌨ Keyboard Configurator
        </span>
      </div>

      <div className="absolute top-14 right-0 bottom-0 w-72 z-10 p-6 backdrop-blur-2xl bg-zinc-950/40 hidden lg:block pointer-events-none">
        <div className="pointer-events-auto">
          <ConfiguratorPanel
            colors={colors}
            onChange={setColors}
            darkKeysEnabled={darkKeysEnabled}
            onDarkKeysEnabledChange={setDarkKeysEnabled}
            darkKeyMode={darkKeyMode}
            onDarkKeyModeChange={setDarkKeyMode}
            onDownload={handleDownload}
          />
        </div>
      </div>

      <MobileWidget
        colors={colors}
        onChange={setColors}
        darkKeysEnabled={darkKeysEnabled}
        onDarkKeysEnabledChange={setDarkKeysEnabled}
        darkKeyMode={darkKeyMode}
        onDarkKeyModeChange={setDarkKeyMode}
        onDownload={handleDownload}
      />

      <div className="absolute top-16 lg:bottom-6 lg:top-auto left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
        <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5 text-white shrink-0">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM7 5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm1 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Z" />
        </svg>
        <span className="text-xs text-white transition-opacity duration-300">
          {darkKeyMode === "add"
            ? "Click a key to mark it as dark"
            : darkKeyMode === "remove"
              ? "Click a dark key to remove it"
              : "Press keys on your keyboard to see them type"}
        </span>
      </div>
    </div>
  );
}
