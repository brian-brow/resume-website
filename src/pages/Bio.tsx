import { useNavigate } from 'react-router-dom'
// import { useBoids } from '@/components/boids/context/BoidsContext'

export default function Bio() {
  // const { shockwaveRef } = useBoids()
  const navigate = useNavigate()

  // const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  //   shockwaveRef.current?.(e.clientX - rect.left, e.clientY - rect.top)
  // }

  return (
    <div className="relative min-h-screen text-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 relative">
        <button
          className="fixed top-[164px] text-gray-500 hover:text-white transition-colors text-sm"
          style={{ left: 'calc(50% - 768px/2 - 48px)' }}
          onClick={(e) => { e.stopPropagation(); navigate('/') }}
        >
          ← Back
        </button>
        <div className="max-w-2xl mx-auto pt-8" onClick={e => e.stopPropagation()}>

          {/* Work History */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Work History</h2>
            <div className="flex flex-col gap-8">
              <div className="border-gray-600 pl-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 pointer-events-auto">
                <div className="border-l border-gray-700 pl-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">IT Intern</h3>
                      <p className="text-gray-400">Loxahatchee River District</p>
                    </div>
                    <span className="text-gray-500 text-sm whitespace-nowrap ml-4">May 2025 – Present</span>
                  </div>
                  <ul className="mt-3 text-gray-400 text-sm space-y-2">
                    <li>Designed and consumed RESTful APIs to automate ingestion and storage of call and training data.</li>
                    <li>Built automated extraction pipelines for water-distribution data, reducing manual collection time by several hours per week.</li>
                    <li>Developed a database-driven tool to auto-generate late-notice letters for customers.</li>
                    <li>Created a Linux-based monitoring utility leveraging Kismet to monitor district pump stations.</li>
                    <li>Assisted in implementing AI-based image recognition for pressure gauge readings.</li>
                  </ul>
                </div>
              </div>

              <div className="border-gray-600 pl-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 pointer-events-auto">
                <div className="border-l border-gray-700 pl-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">Digital Engineering Intern</h3>
                      <p className="text-gray-400">Kratos Defense & Solutions</p>
                    </div>
                    <span className="text-gray-500 text-sm whitespace-nowrap ml-4">May 2023 – Aug 2023</span>
                  </div>
                  <ul className="mt-3 text-gray-400 text-sm space-y-2">
                    <li>Designed functional models in Cameo Systems Modeler to calculate optimal inputs for a turbojet.</li>
                    <li>Wrote Visual Basic scripts in Excel to calculate expected thrust and cost of a hypothetical engine.</li>
                    <li>Collaborated with engineering teams to implement performance calculations for a C++ steady-state engine model.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            <div className="flex flex-col gap-6">

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">Archive Vision</h3>
                  <span className="text-gray-500 text-sm">Senior Capstone</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  A mobile application for digitizing and querying archival documents. Built OCR/HTR pipelines using HuggingFace models to extract text from scanned documents, organized into searchable collections backed by ChromaDB vector embeddings. Developed a RAG-based chatbot powered by OpenAI/Gemini with contextual knowledge of user collections. Backend built with FastAPI, async job processing via Celery and Redis, and MariaDB for relational data. Deployed via Docker Compose.
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['Python', 'FastAPI', 'ChromaDB', 'HuggingFace', 'Celery', 'Redis', 'MariaDB', 'React Native'].map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">Boid Flocking Simulation</h3>
                  <a href="https://boid-simulation.web.app/" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm hover:text-white transition-colors">Live ↗</a>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Real-time Boids flocking simulation with configurable rule weights. Node.js/Express backend with a React and p5.js frontend.
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['Node.js', 'Express', 'React', 'p5.js'].map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-lg">Craven</h3>
                <p className="text-gray-400 text-sm mt-2">
                  Web application enabling users to browse and match with recipes based on preferences, featuring a suggestion algorithm. RESTful backend with Node.js and Express, MongoDB for user preferences and saved recipes, and a React.js frontend.
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['Node.js', 'Express', 'MongoDB', 'React'].map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-lg">3D Graphics Engine</h3>
                <p className="text-gray-400 text-sm mt-2">
                  Designed a 3D graphics engine in OpenGL and SDL with a traversable environment.
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['C++', 'OpenGL', 'SDL'].map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Education */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Education</h2>
            <div className="border-gray-600 pl-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 pointer-events-auto">
              <div className="border-l border-gray-700 pl-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">University of Florida</h3>
                    <p className="text-gray-400">B.S. in Computer Science</p>
                    <p className="text-gray-500 text-sm mt-1">GPA: 3.66 / 4.0</p>
                  </div>
                  <span className="text-gray-500 text-sm whitespace-nowrap ml-4">Jun 2022 – May 2026</span>
                </div>
                <div className="mt-3">
                  <p className="text-gray-500 text-sm">Relevant Coursework</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {[
                      'Data Structures & Algorithms',
                      'Operating Systems',
                      'Algorithm Abstraction & Design',
                      'Computer Organization',
                      'Machine Learning Engineering',
                      'Natural Language Processing',
                    ].map(c => (
                      <span key={c} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
