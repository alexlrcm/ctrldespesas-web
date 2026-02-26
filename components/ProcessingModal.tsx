'use client'

import { useEffect, useState } from 'react'

interface ProcessingModalProps {
  isOpen: boolean
  currentStep: string
  progress: number // 0 a 100
}

export function ProcessingModal({ isOpen, currentStep, progress }: ProcessingModalProps) {
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    if (progress >= 100) {
      // Mostrar check verde após um pequeno delay
      setTimeout(() => setShowCheck(true), 300)
    } else {
      setShowCheck(false)
    }
  }, [progress])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Animação de Engrenagens e Circuito */}
          <div className="relative w-80 h-40 mb-6 flex items-center justify-center">
            {/* Engrenagem Esquerda (Rotação) */}
            <div className="absolute left-0">
              <svg
                className={`w-20 h-20 ${showCheck ? '' : 'animate-spin'}`}
                style={{ animationDuration: '2s' }}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Engrenagem com 8 dentes */}
                <path
                  d="M50 5 L55 20 L70 20 L60 30 L65 45 L50 40 L35 45 L40 30 L30 20 L45 20 Z"
                  fill={showCheck ? '#10b981' : '#3b82f6'}
                  stroke={showCheck ? '#10b981' : '#3b82f6'}
                  strokeWidth="2"
                />
                <circle cx="50" cy="50" r="18" fill="white" stroke={showCheck ? '#10b981' : '#3b82f6'} strokeWidth="2" />
                <circle cx="50" cy="50" r="10" fill={showCheck ? '#10b981' : '#3b82f6'} />
              </svg>
            </div>

            {/* Circuito Animado (Linha com pontos se movendo) */}
            <div className="absolute left-20 right-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
              {/* Pontos animados se movendo */}
              {!showCheck && progress > 0 && (
                <>
                  <div
                    className="absolute -top-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg"
                    style={{
                      left: `calc(${progress}% - 8px)`,
                      transition: 'left 0.3s ease',
                    }}
                  />
                  <div
                    className="absolute -top-1 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"
                    style={{
                      left: `calc(${Math.max(0, progress - 10)}% - 8px)`,
                      transition: 'left 0.3s ease',
                      animationDelay: '0.2s',
                    }}
                  />
                </>
              )}
            </div>

            {/* Engrenagem Direita (Check quando completo) */}
            <div className="absolute right-0">
              {showCheck ? (
                <div className="relative">
                  <svg
                    className="w-20 h-20 text-green-500 animate-bounce"
                    style={{ animationDuration: '0.5s' }}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="50" cy="50" r="40" fill="#10b981" />
                    <path
                      d="M30 50 L45 65 L70 35"
                      stroke="white"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                <svg
                  className="w-20 h-20 animate-spin text-blue-500"
                  style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Engrenagem com 8 dentes */}
                  <path
                    d="M50 5 L55 20 L70 20 L60 30 L65 45 L50 40 L35 45 L40 30 L30 20 L45 20 Z"
                    fill="#3b82f6"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                  <circle cx="50" cy="50" r="18" fill="white" stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="50" cy="50" r="10" fill="#3b82f6" />
                </svg>
              )}
            </div>
          </div>

          {/* Texto do Status */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showCheck ? 'Processamento Concluído!' : 'Processando...'}
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">{currentStep}</p>

          {/* Barra de Progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{progress}%</p>
        </div>
      </div>
    </div>
  )
}
