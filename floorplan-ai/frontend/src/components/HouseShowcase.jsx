import React from 'react';
import HouseScene from './HouseScene';
import ShowcaseOverlay from './ShowcaseOverlay';

export default function HouseShowcase() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-900">
      <HouseScene />
      <ShowcaseOverlay />
    </div>
  );
}
