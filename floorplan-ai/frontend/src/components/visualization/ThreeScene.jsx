import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid, Environment, Text } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

// Color mapping for element types
const colorMap = {
  door: '#22c55e',
  window: '#3b82f6',
  wall: '#ef4444',
  column: '#f59e0b',
  room: '#8b5cf6',
  stairs: '#ec4899',
}

// Enhanced materials and element rendering
function FloorPlanElement({ element, scale, wallHeight, showLabels }) {
  const { type, bounds } = element
  
  // Calculate position and size
  const width = (bounds.x2 - bounds.x1) * scale
  const depth = (bounds.y2 - bounds.y1) * scale
  const centerX = bounds.center_x * scale
  const centerZ = bounds.center_y * scale
  
  const elemType = type.toLowerCase()
  
  // Filter out non-solid elements (like dimensions, rooms, text)
  const allowedSolidTypes = ['wall', 'window', 'door', 'column']
  if (!allowedSolidTypes.includes(elemType)) {
    return null
  }
  
  // Custom heights
  let height = wallHeight
  let yPos = height / 2

  if (elemType === 'column') {
    height = wallHeight * 1.05
    yPos = height / 2
  }

  // Material setup based on type
  const renderMaterial = () => {
    switch(elemType) {
      case 'window':
        return (
          <meshPhysicalMaterial 
            color="#e0f2fe" 
            transmission={0.9} 
            opacity={1} 
            roughness={0.1}
            ior={1.5}
            thickness={0.5}
            metalness={0.1}
          />
        )
      case 'door':
        return (
          <meshStandardMaterial 
            color="#8b5a2b" 
            roughness={0.8}
            metalness={0.1}
          />
        )
      case 'wall':
        return (
          <meshStandardMaterial 
            color="#f8fafc" 
            roughness={0.9}
            metalness={0.0}
          />
        )
      case 'column':
        return (
          <meshStandardMaterial 
            color="#94a3b8" 
            roughness={0.7}
            metalness={0.2}
          />
        )
      default:
        return (
          <meshStandardMaterial 
            color="#cbd5e1" 
            roughness={0.5}
            metalness={0.5}
          />
        )
    }
  }

  const renderWallMaterial = () => (
    <meshStandardMaterial 
      color="#f8fafc" 
      roughness={0.9}
      metalness={0.0}
    />
  )

  const labelNode = showLabels && (
    <Text
      position={[0, wallHeight + 0.5, 0]}
      fontSize={0.4}
      color="white"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.02}
      outlineColor="#000000"
    >
      {type}
    </Text>
  )

  if (elemType === 'window') {
    const sillHeight = wallHeight * 0.3
    const winHeight = wallHeight * 0.4
    const headerHeight = wallHeight - (sillHeight + winHeight)
    
    return (
      <group position={[centerX, 0, centerZ]}>
        {/* Sill */}
        <mesh position={[0, sillHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, sillHeight, depth]} />
          {renderWallMaterial()}
        </mesh>
        <mesh position={[0, sillHeight / 2, 0]}>
          <boxGeometry args={[width + 0.01, sillHeight + 0.01, depth + 0.01]} />
          <meshBasicMaterial color="#475569" wireframe transparent opacity={0.1} />
        </mesh>

        {/* Window itself */}
        <mesh position={[0, sillHeight + winHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, winHeight, depth]} />
          {renderMaterial()}
        </mesh>
        <mesh position={[0, sillHeight + winHeight / 2, 0]}>
          <boxGeometry args={[width + 0.01, winHeight + 0.01, depth + 0.01]} />
          <meshBasicMaterial color="#bae6fd" wireframe transparent opacity={0.1} />
        </mesh>

        {/* Header */}
        <mesh position={[0, sillHeight + winHeight + headerHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, headerHeight, depth]} />
          {renderWallMaterial()}
        </mesh>
        <mesh position={[0, sillHeight + winHeight + headerHeight / 2, 0]}>
          <boxGeometry args={[width + 0.01, headerHeight + 0.01, depth + 0.01]} />
          <meshBasicMaterial color="#475569" wireframe transparent opacity={0.1} />
        </mesh>
        
        {labelNode}
      </group>
    )
  }

  if (elemType === 'door') {
    const dHeight = wallHeight * 0.75
    const headerHeight = wallHeight - dHeight
    
    return (
      <group position={[centerX, 0, centerZ]}>
        {/* Door */}
        <mesh position={[0, dHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, dHeight, depth]} />
          {renderMaterial()}
        </mesh>
        <mesh position={[0, dHeight / 2, 0]}>
          <boxGeometry args={[width + 0.01, dHeight + 0.01, depth + 0.01]} />
          <meshBasicMaterial color="#475569" wireframe transparent opacity={0.1} />
        </mesh>

        {/* Header over door */}
        <mesh position={[0, dHeight + headerHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, headerHeight, depth]} />
          {renderWallMaterial()}
        </mesh>
        <mesh position={[0, dHeight + headerHeight / 2, 0]}>
          <boxGeometry args={[width + 0.01, headerHeight + 0.01, depth + 0.01]} />
          <meshBasicMaterial color="#475569" wireframe transparent opacity={0.1} />
        </mesh>
        
        {labelNode}
      </group>
    )
  }

  // Default block rendering (Wall, Column, etc.)
  return (
    <group position={[centerX, yPos, centerZ]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        {renderMaterial()}
      </mesh>
      
      {/* Subtle edge lines for better definition */}
      <mesh>
        <boxGeometry args={[width + 0.01, height + 0.01, depth + 0.01]} />
        <meshBasicMaterial 
          color="#475569" 
          wireframe 
          transparent
          opacity={0.1}
        />
      </mesh>
      
      {labelNode}
    </group>
  )
}

function Floor({ width, depth }) {
  return (
    <group position={[width / 2, -0.01, depth / 2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width * 1.2, depth * 1.2]} />
        <meshStandardMaterial 
          color="#e2e8f0"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Base Foundation (Slightly larger and darker) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[width * 1.3, depth * 1.3]} />
        <meshStandardMaterial 
          color="#334155"
          roughness={0.9}
        />
      </mesh>
    </group>
  )
}

export default function ThreeScene({ detectionData, wallHeight = 3, showLabels = true }) {
  // Scale factor to convert pixels to meters (roughly)
  const scale = useMemo(() => {
    const maxDim = Math.max(
        detectionData.image_dimensions?.width || 1000,
        detectionData.image_dimensions?.height || 1000
    )
    return 20 / maxDim // Normalize to ~20 meters max size
  }, [detectionData])
  
  const floorWidth = (detectionData.image_dimensions?.width || 1000) * scale
  const floorDepth = (detectionData.image_dimensions?.height || 1000) * scale
  
  return (
    <div className="w-full h-full bg-black relative">
      {/* HUD - Voxel Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white border-2 border-black text-black px-4 py-1 uppercase text-sm font-black pixel-text shadow-[2px_2px_0_0_#000]">
          3D_RENDERER_v1.0
        </div>
        <div className="bg-yellow-400 border-2 border-black text-black px-4 py-1 uppercase text-xs font-black pixel-text shadow-[2px_2px_0_0_#000]">
          FPS: 60
        </div>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[floorWidth * 1.2, wallHeight * 4, floorDepth * 1.5]} fov={50} />
        
        {/* Realistic Lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[floorWidth, 20, floorDepth]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-floorWidth}
          shadow-camera-right={floorWidth}
          shadow-camera-top={floorDepth}
          shadow-camera-bottom={-floorDepth}
          shadow-camera-near={0.1}
          shadow-camera-far={100}
        />
        <pointLight position={[floorWidth/2, 5, floorDepth/2]} intensity={0.8} color="#fef08a" distance={30} />
        
        {/* Environment map for realistic window reflections */}
        <Environment preset="city" />
        
        {/* Architectural Grid mapping over floor */}
        <Grid 
          args={[Math.max(floorWidth, floorDepth) * 1.5, Math.max(floorWidth, floorDepth) * 1.5]} 
          cellSize={1} // 1 meter grid
          cellThickness={0.5}
          cellColor="#94a3b8"
          sectionSize={5} // 5 meter blocks
          sectionThickness={1}
          sectionColor="#64748b"
          fadeDistance={Math.max(floorWidth, floorDepth) * 1.5}
          fadeStrength={1}
          position={[floorWidth / 2, 0.01, floorDepth / 2]}
        />
        
        <Floor width={floorWidth} depth={floorDepth} />
        
        {/* Render architectural elements */}
        {detectionData.elements?.map((element, index) => (
          <FloorPlanElement
            key={index}
            element={element}
            scale={scale}
            wallHeight={wallHeight}
            showLabels={showLabels}
          />
        ))}
        
        {/* Soft immersive OrbitControls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2 - 0.05} // Keep camera above ground
          target={[floorWidth / 2, 0, floorDepth / 2]}
        />
        
      </Canvas>
    </div>
  )
}
