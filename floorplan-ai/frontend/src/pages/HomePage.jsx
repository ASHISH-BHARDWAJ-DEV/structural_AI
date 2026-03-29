import { motion } from 'framer-motion'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import PipelineStages from '../components/pipeline/PipelineStages'

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16"
    >
      <HeroSection />
      <FeaturesSection />
      <PipelineStages />
    </motion.div>
  )
}
