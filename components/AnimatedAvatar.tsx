import React from 'react';

export const AnimatedAvatar: React.FC = () => {
    return (
        <div className="w-full h-full bg-blue-100 flex items-center justify-center overflow-hidden relative">
            <svg viewBox="0 0 100 100" className="w-full h-full transform scale-90">
                {/* Hair/Head Base */}
                <circle cx="50" cy="50" r="45" fill="#fdd8b5" />
                <path d="M5,50 Q20,5 50,5 T95,50" fill="#333" stroke="#333" strokeWidth="2" />

                {/* Eyes */}
                <g className="animate-blink">
                    <circle cx="35" cy="45" r="5" fill="#333" />
                    <circle cx="65" cy="45" r="5" fill="#333" />
                </g>

                {/* Mouth (Smile) */}
                <path d="M35,65 Q50,75 65,65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" className="animate-smile" />

                {/* Blush */}
                <circle cx="25" cy="55" r="4" fill="#ffb7b2" opacity="0.6" />
                <circle cx="75" cy="55" r="4" fill="#ffb7b2" opacity="0.6" />

                {/* Simple Shirt */}
                <path d="M15,90 Q50,110 85,90 V100 H15 Z" fill="#3b82f6" />
            </svg>

            {/* CSS Animations */}
            <style>{`
                @keyframes blink {
                    0%, 90%, 100% { transform: scaleY(1); }
                    95% { transform: scaleY(0.1); }
                }
                .animate-blink {
                    transform-origin: center;
                    animation: blink 4s infinite;
                }
                @keyframes smile {
                    0%, 100% { d: path("M35,65 Q50,75 65,65"); }
                    50% { d: path("M35,65 Q50,80 65,65"); }
                }
                 .animate-smile {
                    animation: smile 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
