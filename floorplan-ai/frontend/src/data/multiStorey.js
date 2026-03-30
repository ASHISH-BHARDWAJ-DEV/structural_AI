/**
 * Multi-storey engineering data — real Indian construction standards
 * Based on IS 456 (RCC), IS 800 (Steel), NBC 2016 guidelines
 */

// Floor configuration data
export const FLOOR_CONFIGS = [
  {
    floors: 1,
    label: 'G',
    description: 'Ground Floor Only',
    // Cost multiplier relative to single floor base
    // Ground floor = 100% (includes foundation + structure + roof)
    costMultiplier: 1.0,
    // Foundation cost as fraction of ground floor structure cost
    foundationFactor: 0.35,
    // Structural requirements
    concreteGrade: 'M20',
    steelGrade: 'Fe500',
    columnSize: '200×200 mm',
    slabThickness: '125 mm',
    footingType: 'Isolated Footing',
    // Per-material adjustments (multiplier on base unit cost)
    materialFactors: {
      'RCC': 1.0,
      'Steel Frame': 1.0,
      'AAC Blocks': 1.0,
      'Fly Ash Brick': 1.0,
      'Red Brick': 1.0,
      'Hollow Concrete Block': 1.0,
      'Precast Concrete Panel': 1.0,
    },
    notes: [
      'Standard M20 concrete grade',
      'Fe500 TMT steel reinforcement',
      'Isolated footing sufficient',
      '125mm slab thickness',
    ],
  },
  {
    floors: 2,
    label: 'G+1',
    description: 'Ground + 1 Upper Floor',
    // Ground floor base (1.0) + Upper floor (0.80 — no foundation re-cost)
    costMultiplier: 1.80,
    foundationFactor: 0.45,  // slightly deeper/wider footings
    concreteGrade: 'M20',
    steelGrade: 'Fe500',
    columnSize: '230×230 mm',
    slabThickness: '135 mm',
    footingType: 'Combined Footing',
    materialFactors: {
      'RCC': 1.05,
      'Steel Frame': 1.08,
      'AAC Blocks': 1.0,
      'Fly Ash Brick': 1.0,
      'Red Brick': 1.02,
      'Hollow Concrete Block': 1.0,
      'Precast Concrete Panel': 1.05,
    },
    notes: [
      'M20 concrete still adequate',
      'Column size increased to 230mm',
      'Combined footings recommended',
      '135mm slab for upper floor',
    ],
  },
  {
    floors: 3,
    label: 'G+2',
    description: 'Ground + 2 Upper Floors',
    // 1.0 + 0.80 + 0.76
    costMultiplier: 2.56,
    foundationFactor: 0.60,
    concreteGrade: 'M25',
    steelGrade: 'Fe500D',
    columnSize: '300×300 mm',
    slabThickness: '150 mm',
    footingType: 'Raft Foundation',
    materialFactors: {
      'RCC': 1.12,       // M25 grade upgrade
      'Steel Frame': 1.15,
      'AAC Blocks': 1.0, // AAC preferred for upper floors (lighter)
      'Fly Ash Brick': 1.05,
      'Red Brick': 1.10, // Not recommended for 3+ floors
      'Hollow Concrete Block': 1.05,
      'Precast Concrete Panel': 1.10,
    },
    notes: [
      'Upgrade to M25 concrete (higher compressive strength)',
      'Fe500D ductile steel for seismic resistance',
      'Raft/combined foundation required',
      'AAC blocks recommended for upper floors (load reduction)',
      '150mm slab thickness minimum',
    ],
  },
  {
    floors: 4,
    label: 'G+3',
    description: 'Ground + 3 Upper Floors',
    costMultiplier: 3.30,
    foundationFactor: 0.80,
    concreteGrade: 'M25',
    steelGrade: 'Fe550',
    columnSize: '350×350 mm',
    slabThickness: '175 mm',
    footingType: 'Raft / Pile Foundation',
    materialFactors: {
      'RCC': 1.20,
      'Steel Frame': 1.25,
      'AAC Blocks': 1.02,
      'Fly Ash Brick': 1.12,
      'Red Brick': 1.20,
      'Hollow Concrete Block': 1.08,
      'Precast Concrete Panel': 1.18,
    },
    notes: [
      'M25 concrete mandatory (IS 456)',
      'Fe550 high-strength steel required',
      'Pile foundation may be needed depending on soil',
      'Larger 350mm columns for load transfer',
      '175mm slab + shear walls recommended',
      'Structural engineer certification mandatory',
    ],
  },
  {
    floors: 5,
    label: 'G+4',
    description: 'Ground + 4 Upper Floors',
    costMultiplier: 4.00,
    foundationFactor: 1.00,
    concreteGrade: 'M30',
    steelGrade: 'Fe550',
    columnSize: '400×400 mm',
    slabThickness: '200 mm',
    footingType: 'Pile Foundation',
    materialFactors: {
      'RCC': 1.30,       // M30 grade — significant cost increase
      'Steel Frame': 1.40,
      'AAC Blocks': 1.05,
      'Fly Ash Brick': 1.20,
      'Red Brick': 1.35, // Strongly discouraged for 5 floors
      'Hollow Concrete Block': 1.12,
      'Precast Concrete Panel': 1.25,
    },
    notes: [
      'M30 concrete — high strength mandatory',
      'Fe550 high-strength steel throughout',
      'Pile foundation mandatory',
      'Shear walls compulsory (wind/seismic)',
      '400mm columns — RCC frame structure',
      '200mm slab with two-way reinforcement',
      'Structural audit + municipal approval required',
    ],
  },
]

// Get config for a given floor count (1–5)
export function getFloorConfig(floors) {
  return FLOOR_CONFIGS.find(c => c.floors === floors) || FLOOR_CONFIGS[0]
}

// Material recommendations change with floor count
export const FLOOR_MATERIAL_TIPS = {
  1: { preferred: ['AAC Blocks', 'Red Brick', 'Fly Ash Brick'], avoid: [] },
  2: { preferred: ['AAC Blocks', 'Fly Ash Brick'], avoid: [] },
  3: { preferred: ['AAC Blocks', 'RCC', 'Fly Ash Brick'], avoid: ['Red Brick'] },
  4: { preferred: ['AAC Blocks', 'RCC', 'Steel Frame'], avoid: ['Red Brick'] },
  5: { preferred: ['RCC', 'Steel Frame', 'AAC Blocks'], avoid: ['Red Brick', 'Fly Ash Brick'] },
}
