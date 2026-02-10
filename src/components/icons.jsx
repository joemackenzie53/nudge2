import React from 'react'

export function Icon({ name, size=18 }){
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', xmlns:'http://www.w3.org/2000/svg' }
  switch(name){
    case 'today':
      return (
        <svg {...common}>
          <path d="M7 3v2M17 3v2M4 7h16M6 11h4m-4 4h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )

    case 'inbox':
      return (
        <svg {...common}>
          <path d="M4 4h16v12H4z" stroke="currentColor" strokeWidth="2"/>
          <path d="M4 13h5l2 3h2l2-3h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
      )

    case 'items':
      return (
        <svg {...common}>
          <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )

    case 'meetings':
      return (
        <svg {...common}>
          <path d="M7 8h10M7 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M5 4h14a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )

    // NEW: recurring / repeat
    case 'repeat':
      return (
        <svg {...common}>
          <path
            d="M7 7h10a3 3 0 0 1 3 3v1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 8l-2 2-2-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 17H7a3 3 0 0 1-3-3v-1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 16l2-2 2 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )

    case 'logout':
      return (
        <svg {...common}>
          <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2"/>
          <path d="M3 12h9m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
  }
}
