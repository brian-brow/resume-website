// import { useBoids } from '@/components/boids/context/BoidsContext'

export default function SandSim() {


  return (
    <div className="border border-gray-700 rounded-xl w-full aspect-square grid grid-cols-8 grid-rows-8">
      {Array.from({ length: 64 }).map((_, i) => (
        <div key={i} className="border border-gray-800/40" />
      ))}
    </div>
  )
}
