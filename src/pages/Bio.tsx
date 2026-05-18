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

              {/* Archive Vision - Featured */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 relative overflow-hidden">
                {/* Subtle accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">Archive Vision</h3>
                    <span className="text-xs border border-gray-600 text-gray-400 px-2 py-0.5 rounded-full">
                      Senior Capstone
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  A mobile application for digitizing and querying archival documents using OCR/HTR pipelines,
                  vector search via ChromaDB, and a RAG-based chatbot backed by OpenAI/Gemini. Built on FastAPI
                  with async job processing via Celery and Redis, deployed via Docker Compose.
                </p>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Currently in talks with the University of Florida to continue development and adopt the
                  platform across university departments.
                </p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {['Python', 'FastAPI', 'ChromaDB', 'HuggingFace', 'Celery', 'Redis', 'MariaDB', 'React Native'].map(t => (
                    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                  ))}
                </div>
              </div>

              {/* Secondary projects - side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-2">Craven</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Recipe-matching web app with a preference-based suggestion algorithm. RESTful backend
                    with Node.js/Express, MongoDB, and a React frontend.
                  </p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {['Node.js', 'Express', 'MongoDB', 'React'].map(t => (
                      <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">3D Graphics Engine</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Custom 3D graphics engine built in C++ with OpenGL and SDL, featuring a
                      fully traversable environment.
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {['C++', 'OpenGL', 'SDL'].map(t => (
                      <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">{t}</span>
                    ))}
                  </div>
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
