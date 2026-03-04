"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Center, useGLTF, ContactShadows } from "@react-three/drei";

function Model({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    return (
        <Center>
            <primitive object={scene} />
        </Center>
    );
}

function LoadingFallback() {
    return (
        <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#6d28d9" wireframe />
        </mesh>
    );
}

interface ModelViewerProps {
    modelUrl: string;
}

export default function ModelViewer({ modelUrl }: ModelViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-linear-to-b from-neutral-900 to-neutral-950 border border-white/10">
            <Canvas
                ref={canvasRef}
                camera={{ position: [0, 1.5, 3], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
                <directionalLight position={[-3, 3, -3]} intensity={0.3} />

                <Suspense fallback={<LoadingFallback />}>
                    <Model url={modelUrl} />
                    <Environment preset="city" />
                    <ContactShadows
                        position={[0, -0.5, 0]}
                        opacity={0.4}
                        scale={5}
                        blur={2}
                        far={4}
                    />
                </Suspense>

                {/* Controls */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={true}
                    autoRotateSpeed={1.5}
                    minDistance={1}
                    maxDistance={10}
                />

                {/* Grid */}
                <gridHelper args={[6, 20, "#1e1b4b", "#1e1b4b"]} position={[0, -0.5, 0]} />
            </Canvas>
        </div>
    );
}
