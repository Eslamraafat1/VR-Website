"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";

type Prog = MutableRefObject<{ v: number }>;

const COLS = Array.from({ length: 9 }, (_, i) => i);

function Architecture({ prog, light }: { prog: Prog; light: boolean }) {
  const mats = useRef<THREE.LineBasicMaterial[]>([]);
  const group = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const volumes = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ x: (i % 2 ? 1 : -1) * (3 + ((i * 1.3) % 4)), y: 3 + ((i * 1.9) % 5), z: -4 - i * 3.2, s: [1.2 + (i % 3) * 0.6, 0.5 + (i % 2) * 0.8, 1.2] as [number, number, number], r: i * 0.5 })),
    [],
  );
  const reg = (m: THREE.LineBasicMaterial | null) => { if (m && !mats.current.includes(m)) { m.transparent = true; mats.current.push(m); } };

  useFrame(({ camera, clock }) => {
    const p = prog.current.v;
    camera.position.set(Math.sin(clock.elapsedTime * 0.3) * 0.25, 1.7 + Math.sin(clock.elapsedTime * 0.5) * 0.05, 20 - p * 34);
    camera.lookAt(0, 2.2, camera.position.z - 12);
    const op = Math.min(1, Math.max(0, (p - 0.02) * 3));
    mats.current.forEach((m) => { m.opacity = op; });
    if (beam.current) beam.current.position.z = 18 - ((p * 2.2) % 1) * 60;
    if (lamp.current && beam.current) lamp.current.position.z = beam.current.position.z;
    group.current?.children.forEach((c, i) => { c.rotation.y += 0.002 * (i % 2 ? 1 : -1); });
  });

  return (
    <>
      <fog attach="fog" args={["#05060a", 8, 42]} />
      <ambientLight intensity={0.25} />
      <pointLight ref={lamp} color="#7be7f5" intensity={80} distance={22} position={[0, 4, 0]} />
      <pointLight color="#c8a96a" intensity={40} distance={30} position={[0, 7, -10]} />
      {COLS.flatMap((i) =>
        [-1, 1].map((side) => (
          <mesh key={`${i}${side}`} position={[side * 5.5, 5, 14 - i * 6]}>
            <boxGeometry args={[0.7, 10, 0.7]} />
            <meshStandardMaterial color="#10131a" metalness={0.9} roughness={0.25} />
            <Edges scale={1.001}><lineBasicMaterial ref={reg} color="#c8a96a" transparent opacity={0} /></Edges>
          </mesh>
        )),
      )}
      {COLS.map((i) => (
        <mesh key={`b${i}`} position={[0, 10.2, 14 - i * 6]}>
          <boxGeometry args={[12, 0.35, 0.5]} />
          <meshStandardMaterial color="#10131a" metalness={0.9} roughness={0.3} />
          <Edges><lineBasicMaterial ref={reg} color="#7be7f5" transparent opacity={0} /></Edges>
        </mesh>
      ))}
      <group ref={group}>
        {volumes.map((v, i) => (
          <mesh key={i} position={[v.x, v.y, v.z]} rotation={[0, v.r, 0]}>
            <boxGeometry args={v.s} />
            <meshStandardMaterial color="#0c0f15" metalness={1} roughness={0.15} />
            <Edges><lineBasicMaterial ref={reg} color="#f4f1ea" transparent opacity={0} /></Edges>
          </mesh>
        ))}
      </group>
      <mesh ref={beam} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 8]} />
        <meshBasicMaterial color="#7be7f5" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]}>
        <planeGeometry args={[40, 80]} />
        {light ? (
          <meshStandardMaterial color="#07090d" metalness={0.9} roughness={0.2} />
        ) : (
          <MeshReflectorMaterial blur={[300, 80]} resolution={512} mixBlur={1} mixStrength={14} roughness={0.9} depthScale={1} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#070a0f" metalness={0.6} mirror={0} />
        )}
      </mesh>
      <Particles count={light ? 120 : 300} />
    </>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3);
    const r = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }; // deterministic scatter
    for (let i = 0; i < count; i++) { a[i * 3] = (r(i * 3) - 0.5) * 16; a[i * 3 + 1] = r(i * 3 + 1) * 9; a[i * 3 + 2] = 20 - r(i * 3 + 2) * 50; }
    return a;
  }, [count]);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.01; });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial size={0.05} color="#c8a96a" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function IntroScene({ prog, light }: { prog: Prog; light: boolean }) {
  return (
    <Canvas dpr={light ? 1 : [1, 1.5]} camera={{ fov: 62, near: 0.1, far: 80, position: [0, 1.7, 20] }} gl={{ antialias: !light, powerPreference: "high-performance" }} style={{ position: "absolute", inset: 0 }}>
      <color attach="background" args={["#05060a"]} />
      <Architecture prog={prog} light={light} />
    </Canvas>
  );
}
