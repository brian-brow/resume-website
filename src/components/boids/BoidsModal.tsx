export default function BoidsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Boids</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          The Boids (Bird-oid objects) algorithm was developed by Craig Reynolds in 1986.
          It simulates the flocking behavior of birds or fish using
          only three rules: stay close to your neighbors (cohesion),
          avoid crowding (separation), and match velocity (alignment).
          With just these three rules a complex flocking behavior emerges.
          This uses no central coordination, just local interactions.
          Click anywhere on the canvas to send a shockwave through the flock.
        </p>

        <a href="https://vanhunteradams.com/Pico/Animal_Movement/Boids-algorithm.html"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-gray-500 hover:text-white transition-colors underline"
        >
          Learn more about the Boids algorithm
        </a>
      </div>
    </div>
  )
}
