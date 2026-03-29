import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Html } from '@react-three/drei';

function RealHouseModel() {
  const { scene } = useGLTF('/house.glb');
  return <primitive object={scene} scale={0.25} position={[0, -1, 0]} />;
}

// Preload the model asset
useGLTF.preload('/house.glb');

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#80C8C6] flex flex-col items-center justify-center">
      {/* 3D Canvas Background */}
      <Canvas 
        className="absolute inset-0 z-0"
        camera={{ position: [0, 5, 12], fov: 45 }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        
        <Suspense fallback={
          <Html center>
            <div className="text-white text-2xl font-black pixel-text uppercase tracking-widest bg-black px-8 py-4 border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
              Loading...
            </div>
          </Html>
        }>
          <RealHouseModel />
        </Suspense>
        
        <OrbitControls 
          autoRotate 
          autoRotateSpeed={1.0} 
          enableZoom={false} 
          enablePan={false} 
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute z-10 flex flex-col items-center pointer-events-none">
        <h1 className="text-6xl sm:text-8xl font-black text-white pixel-text uppercase tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          VILLA MESSENGER
        </h1>
        
        <button 
          onClick={() => navigate('/app')}
          className="bg-yellow-400 border-4 border-black text-black font-black text-3xl px-14 py-6 mt-12 pointer-events-auto hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all uppercase pixel-text tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          ENTER
        </button>
      </div>
    </div>
  );
}
