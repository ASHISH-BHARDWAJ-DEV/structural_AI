import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, Html } from '@react-three/drei';

function RealHouseModel() {
  const { scene } = useGLTF('/house.glb');
  return <primitive object={scene} scale={[0.2, 0.2, 0.2]} position={[0, -2, 0]} />;
}

// Optional, but highly recommended by @react-three/drei to preload models
useGLTF.preload('/house.glb');

export default function HouseScene() {
  return (
    <Canvas className="w-full h-full pointer-events-none">
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="city" />

      <Suspense fallback={
        <Html center>
          <div className="text-white text-xs font-semibold tracking-widest bg-black/50 border border-white/20 px-6 py-3 rounded-full backdrop-blur-md shadow-2xl whitespace-nowrap uppercase">
            Loading Model...
          </div>
        </Html>
      }>
        <RealHouseModel />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </Canvas>
  );
}
