import { useState, useEffect, useRef, useCallback } from 'react'
import { useAmbientSense } from './hooks/useAmbientSense'

type Screen = 'home' | 'journey' | 'add-stops' | 'tracking'

type Leg = {
  id: string
  type: 'origin' | 'shuttle' | 'train' | 'air' | 'road' | 'destination'
  name: string
  sub: string
  time: string
  detail: string
  delayed: boolean
}

type RideMode = 'shuttle' | 'train' | 'air' | 'road'
type AddedStop = { id: string; name: string; mode: RideMode; reason: string; afterId: string }

type Point = { x: number; y: number }
type MapStop = { x: number; y: number; label: string; anchor: 'start' | 'end'; dest?: boolean }
type SegmentLabel = { x: number; y: number; text: string }

type Trip = {
  id: string
  destinationLabel: string
  eta: string
  status: string
  totalLabel: string
  whyThisRoute: string
  legs: Leg[]
  stepLabels: string[]
  narrativesFar: string[]
  narrativesNear: string[]
  arrivals: string[]
  legEndpoints: { start: Point; end: Point }[]
  mapStops: MapStop[]
  segmentLabels: SegmentLabel[]
}

// ─── Trips ──────────────────────────────────────────────────────────────────
// Boarding note: every vehicle leg below assumes NOVA identifies the
// passenger by device + biometric walk-through by default (no ticket, no
// tap) — see leg.detail copy. A non-biometric fallback (a short code shown
// at the door) is described in the team report rather than modelled here.

const TRIPS: Record<string, Trip> = {
  local: {
    id: 'local',
    destinationLabel: 'City Arts Quarter',
    eta: '9:42',
    status: 'On time',
    totalLabel: '1h 18 min · 4 transfers',
    whyThisRoute:
      'Smart road corridors on the Westside approach are clear right now — NOVA routed you via Harbor Terminal to avoid a 9-minute delay on the inner loop. Shuttle + train + air pod + smart road gets you there 22 minutes faster than the all-train option.',
    legs: [
      { id: 'start', type: 'origin', name: 'Your location', sub: 'Riverdale East', time: '8:24', detail: '', delayed: false },
      { id: 'shuttle', type: 'shuttle', name: 'Your ride arrives', sub: 'Autonomous shuttle · 4 min ride', time: '8:26', detail: 'Verified as you step in — no ticket, no tap. Just walk on.', delayed: false },
      { id: 'train', type: 'train', name: 'Central Station', sub: 'Platform 3 · Northline Express', time: '8:31', detail: "Running 6 minutes late — I've already re-timed the rest of your trip. No action needed.", delayed: true },
      { id: 'air', type: 'air', name: 'Harbor Terminal', sub: 'Air pod gate A2 · 6 min to board', time: '9:04', detail: 'Your seat is already held — boarding confirms by device automatically at the gate.', delayed: false },
      { id: 'road', type: 'road', name: 'Westside Hub', sub: 'Smart road · clear route selected', time: '9:28', detail: 'The fastest road corridor. No congestion right now.', delayed: false },
      { id: 'end', type: 'destination', name: 'City Arts Quarter', sub: 'Your destination', time: '9:42', detail: '', delayed: false },
    ],
    stepLabels: ['Shuttle', 'Train', 'Air pod', 'Smart road'],
    narrativesFar: [
      "Your shuttle is on its way.",
      "You're on the Northline Express.",
      "Heading to Harbor Terminal.",
      "The smart road is clear.",
    ],
    narrativesNear: [
      "Your shuttle is almost here.",
      "Central Station in 2 minutes. Get ready.",
      "Harbor Terminal approaching. Gather your things.",
      "Almost at City Arts Quarter.",
    ],
    arrivals: ['8:31', '9:04', '9:28', '9:42'],
    legEndpoints: [
      { start: { x: 80, y: 460 }, end: { x: 80, y: 320 } },
      { start: { x: 80, y: 320 }, end: { x: 170, y: 220 } },
      { start: { x: 170, y: 220 }, end: { x: 260, y: 130 } },
      { start: { x: 260, y: 130 }, end: { x: 260, y: 60 } },
    ],
    mapStops: [
      { x: 80, y: 460, label: 'Riverdale East', anchor: 'start' },
      { x: 80, y: 320, label: 'Central Station', anchor: 'start' },
      { x: 170, y: 220, label: 'Harbor Terminal', anchor: 'start' },
      { x: 260, y: 130, label: 'Westside Hub', anchor: 'end' },
      { x: 260, y: 60, label: 'City Arts Quarter', dest: true, anchor: 'end' },
    ],
    segmentLabels: [
      { x: 50, y: 410, text: 'shuttle' },
      { x: 88, y: 278, text: 'train' },
      { x: 195, y: 183, text: 'air pod' },
      { x: 218, y: 100, text: 'smart road' },
    ],
  },

  kandy: {
    id: 'kandy',
    destinationLabel: 'Kandy City Center',
    eta: '9:52',
    status: 'On time',
    totalLabel: '2h 42 min · 3 transfers',
    whyThisRoute:
      'The Hill Country Express handles the long climb through the highlands, so NOVA starts you on a shuttle straight to Fort Hub instead of routing you through Kadawatha road traffic. Total trip: 2h 42m — about 40 minutes faster than driving the old A1 yourself.',
    legs: [
      { id: 'start', type: 'origin', name: 'Your location', sub: 'Port City, Colombo', time: '7:10', detail: '', delayed: false },
      { id: 'shuttle', type: 'shuttle', name: 'Your ride arrives', sub: 'Autonomous shuttle · 6 min ride', time: '7:16', detail: 'Verified as you step in — first stop is Fort Hub.', delayed: false },
      { id: 'train', type: 'train', name: 'Colombo Fort Hub', sub: 'Hill Country Express · Platform 1', time: '7:24', detail: 'Your seat was reserved the moment you searched — walk through the gate, no ticket needed.', delayed: false },
      { id: 'road', type: 'road', name: 'Peradeniya Junction', sub: 'Smart road pod · final stretch to Kandy', time: '9:35', detail: 'Smart pod handles the last stretch — clear road, light rain expected near the lake.', delayed: false },
      { id: 'end', type: 'destination', name: 'Kandy City Center', sub: 'Your destination', time: '9:52', detail: '', delayed: false },
    ],
    stepLabels: ['Shuttle', 'Train', 'Smart road'],
    narrativesFar: [
      "Your shuttle is on its way.",
      "Climbing through the hill country now.",
      "The smart road into Kandy is clear.",
    ],
    narrativesNear: [
      "Your shuttle is almost here.",
      "Peradeniya in 2 minutes. Gather your things.",
      "Almost at Kandy City Center.",
    ],
    arrivals: ['7:24', '9:35', '9:52'],
    legEndpoints: [
      { start: { x: 70, y: 480 }, end: { x: 110, y: 360 } },
      { start: { x: 110, y: 360 }, end: { x: 210, y: 150 } },
      { start: { x: 210, y: 150 }, end: { x: 250, y: 60 } },
    ],
    mapStops: [
      { x: 70, y: 480, label: 'Port City', anchor: 'start' },
      { x: 110, y: 360, label: 'Colombo Fort Hub', anchor: 'start' },
      { x: 210, y: 150, label: 'Peradeniya Junction', anchor: 'end' },
      { x: 250, y: 60, label: 'Kandy City Center', dest: true, anchor: 'end' },
    ],
    segmentLabels: [
      { x: 45, y: 430, text: 'shuttle' },
      { x: 118, y: 250, text: 'train' },
      { x: 222, y: 100, text: 'smart road' },
    ],
  },
}

const RIDE_MODE_LABELS: Record<RideMode, string> = {
  shuttle: 'Shuttle',
  train: 'Train',
  air: 'Air pod',
  road: 'Smart road',
}

function suggestTransport(stopName: string): { mode: RideMode; reason: string } {
  const name = stopName.trim().toLowerCase()
  if (name.includes('station') || name.includes('fort') || name.includes('rail')) {
    return { mode: 'train', reason: 'A train is the quickest fit for a station or rail connection.' }
  }
  if (name.includes('airport') || name.includes('terminal') || name.includes('gate')) {
    return { mode: 'air', reason: 'An air pod keeps terminal journeys fast and avoids surface traffic.' }
  }
  if (name.includes('highway') || name.includes('road') || name.includes('hub')) {
    return { mode: 'road', reason: 'Smart road can take you directly there with live traffic routing.' }
  }
  return { mode: 'shuttle', reason: 'A shuttle is the most flexible option for a local stop.' }
}

function withAddedStops(trip: Trip, addedStops: AddedStop[]): Trip {
  if (!addedStops.length) return trip

  const finalArrival = trip.arrivals[trip.arrivals.length - 1]
  const addedByAfter = new Map<string, AddedStop[]>()
  for (const stop of addedStops) {
    const stopsAtPosition = addedByAfter.get(stop.afterId) ?? []
    stopsAtPosition.push(stop)
    addedByAfter.set(stop.afterId, stopsAtPosition)
  }

  const legs: Leg[] = []
  const mapStops: MapStop[] = []
  const customStopIds = new Set(addedStops.map((stop) => `added-${stop.id}`))

  trip.legs.slice(0, -1).forEach((leg, index) => {
    legs.push(leg)
    mapStops.push(trip.mapStops[index])
    const stopsAtPosition = addedByAfter.get(leg.id) ?? []
    const start = trip.mapStops[index]
    const end = trip.mapStops[index + 1]
    stopsAtPosition.forEach((stop, stopIndex) => {
      const progress = (stopIndex + 1) / (stopsAtPosition.length + 1)
      legs.push({
        id: `added-${stop.id}`,
        type: stop.mode,
        name: stop.name,
        sub: `${RIDE_MODE_LABELS[stop.mode]} · added stop`,
        time: finalArrival,
        detail: stop.reason,
        delayed: false,
      })
      mapStops.push({
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
        label: stop.name,
        anchor: 'end',
      })
    })
  })
  legs.push(trip.legs[trip.legs.length - 1])
  mapStops.push(trip.mapStops[trip.mapStops.length - 1])

  const stepLabels: string[] = []
  const narrativesFar: string[] = []
  const narrativesNear: string[] = []
  const arrivals: string[] = []
  legs.slice(1, -1).forEach((leg) => {
    if (customStopIds.has(leg.id)) {
      const stop = addedStops.find((candidate) => `added-${candidate.id}` === leg.id)
      stepLabels.push(RIDE_MODE_LABELS[leg.type as RideMode])
      narrativesFar.push(`Routing you to ${leg.name}.`)
      narrativesNear.push(`${leg.name} is coming up. Get ready.`)
      arrivals.push(finalArrival)
      if (stop) return
    }
    const baseIndex = trip.legs.findIndex((baseLeg) => baseLeg.id === leg.id) - 1
    stepLabels.push(trip.stepLabels[baseIndex])
    narrativesFar.push(trip.narrativesFar[baseIndex])
    narrativesNear.push(trip.narrativesNear[baseIndex])
    arrivals.push(trip.arrivals[baseIndex])
  })

  return {
    ...trip,
    legs,
    stepLabels,
    narrativesFar,
    narrativesNear,
    arrivals,
    legEndpoints: mapStops.slice(0, -1).map((start, index) => ({ start: { x: start.x, y: start.y }, end: { x: mapStops[index + 1].x, y: mapStops[index + 1].y } })),
    mapStops,
    segmentLabels: legs.slice(1, -1).map((leg, index) => ({
      x: (mapStops[index].x + mapStops[index + 1].x) / 2,
      y: (mapStops[index].y + mapStops[index + 1].y) / 2,
      text: RIDE_MODE_LABELS[leg.type as RideMode].toLowerCase(),
    })),
    whyThisRoute: `${trip.whyThisRoute} Added stops: ${addedStops.map((stop) => `${stop.name} via ${RIDE_MODE_LABELS[stop.mode]}`).join(', ')}.`,
  }
}

function resolveTripId(query: string): string {
  const q = query.trim().toLowerCase()
  if (q.includes('kandy') || q.includes('port city')) return 'kandy'
  return 'local'
}

const LEG_DURATION = 20 // seconds per leg in the simulation

function ModeGlyph({ type }: { type: string }) {
  const common = { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'shuttle':
      return (
        <svg {...common}><rect x="2.5" y="5.5" width="11" height="6" rx="3" /><circle cx="5.5" cy="13" r="0.9" fill="currentColor" stroke="none" /><circle cx="10.5" cy="13" r="0.9" fill="currentColor" stroke="none" /></svg>
      )
    case 'train':
      return (
        <svg {...common}><path d="M3 4h10M3 8h10" /><path d="M5 12l-1.5 2M11 12l1.5 2" /></svg>
      )
    case 'air':
      return (
        <svg {...common}><path d="M2 9l12-5.5-3.2 5.5 3.2 5.5L2 9z" /></svg>
      )
    case 'road':
      return (
        <svg {...common}><path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" /><circle cx="8" cy="8" r="2.2" /></svg>
      )
    default:
      return null
  }
}

const modeColor: Record<string, string> = {
  origin: '#1E4D8C', destination: '#3F6B4F',
  shuttle: '#1E4D8C', train: '#1E4D8C', air: '#1E4D8C', road: '#1E4D8C',
}

// ─── Home ───────────────────────────────────────────────────────────────────

function HomeScreen({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceNote, setVoiceNote] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Clean up if the screen unmounts mid-listen
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        /* no-op */
      }
    }
  }, [])

  const toggleVoice = useCallback(() => {
    // Tapping the mic again while it's listening means "stop" — this is the
    // fix: previously every tap started a brand-new recognizer, so the
    // button could never turn itself off.
    if (listening) {
      try {
        recognitionRef.current?.stop()
      } catch {
        /* no-op */
      }
      return
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setVoiceNote("Voice search isn't supported in this browser — try typing instead.")
      return
    }

    setVoiceNote(null)
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    recognitionRef.current = rec

    rec.onstart = () => setListening(true)
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript
      if (transcript) setQuery(transcript)
    }
    rec.onerror = (e: any) => {
      setListening(false)
      recognitionRef.current = null
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        setVoiceNote('Microphone access is blocked — allow it in your browser settings to use voice search.')
      } else if (e?.error === 'no-speech') {
        setVoiceNote("Didn't catch that — try again, or type your destination.")
      } else {
        setVoiceNote('Voice search had a problem — try typing instead.')
      }
    }
    rec.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    try {
      rec.start()
    } catch {
      setListening(false)
      recognitionRef.current = null
      setVoiceNote('Voice search had a problem — try typing instead.')
    }
  }, [listening])

  return (
    <div className="flex flex-col min-h-screen px-6 pt-14 pb-10">
      {/* Greeting */}
      <div className="mb-10 mt-8 animate-slide-up">
        <p className="text-[15px] text-[#1C1F26]/50 mb-1">{greeting}, Alex.</p>
        <h1 className="text-[36px] leading-[1.1] font-800 text-[#1C1F26] tracking-tight">
          Where are<br />you headed?
        </h1>
      </div>

      {/* Recent */}
      <div className="mb-8 animate-slide-up-delay-1">
        <p className="text-[12px] text-[#1C1F26]/60 uppercase tracking-widest mb-3 font-600">Recent</p>
        {['City Arts Quarter', 'Kandy'].map((place) => (
          <button
            key={place}
            onClick={() => setQuery(place)}
            className="w-full flex items-center gap-3 py-4 border-b border-[#D8D8D3] text-left group"
          >
            <span className="text-[#D8D8D3] text-lg">○</span>
            <span className="text-[16px] text-[#1C1F26]/70 group-hover:text-[#1C1F26] transition-colors">{place}</span>
          </button>
        ))}
      </div>

      {/* Search row */}
      <div className="animate-slide-up-delay-2">
        <div
          className={`flex items-center gap-3 border-b-2 transition-colors pb-3 mb-2 ${
            focused ? 'border-[#1E4D8C]' : 'border-[#D8D8D3]'
          }`}
        >
          <span className="text-[#1E4D8C] text-xl">→</span>
          <input
            type="text"
            placeholder="Enter destination"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 text-[18px] text-[#1C1F26] placeholder:text-[#1C1F26]/55 bg-transparent outline-none font-500"
          />
          {/* Voice button — tap to start, tap again to stop */}
          <button
            onClick={toggleVoice}
            aria-label={listening ? 'Stop listening' : 'Speak your destination'}
            aria-pressed={listening}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              listening
                ? 'bg-[#1E4D8C] text-white animate-pulse-med'
                : 'bg-[#EDEDEA] text-[#1C1F26]/50 hover:bg-[#D8D8D3]'
            }`}
          >
            {listening ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="12" height="12" rx="2.5" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
                <rect x="5" y="0" width="6" height="12" rx="3" fill="currentColor" />
                <path d="M2 9a6 6 0 0 0 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <line x1="8" y1="15" x2="8" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="5" y1="19" x2="11" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        <div className="min-h-[20px] mb-4" aria-live="polite">
          {voiceNote && <p className="text-[12.5px] text-[#C7791C]">{voiceNote}</p>}
          {listening && !voiceNote && <p className="text-[12.5px] text-[#1E4D8C]">Listening — say your destination…</p>}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => onSearch(query)}
            className="bg-[#1E4D8C] text-white text-[17px] font-700 px-10 py-4 rounded-full min-h-[56px] hover:bg-[#163a6e] active:scale-[0.98] transition-all"
          >
            Get me there
          </button>
        </div>
      </div>

      {/* Usual trip card */}
      <div className="mt-auto pt-10 animate-slide-up-delay-3">
        <div className="bg-[#EDEDEA] rounded-2xl p-5">
          <p className="text-[13px] text-[#1C1F26]/50 mb-1">Your usual Monday trip</p>
          <p className="text-[16px] font-600 text-[#1C1F26] mb-0.5">City Arts Quarter</p>
          <p className="text-[13px] text-[#3F6B4F] font-500">On time · departs in 18 min</p>
        </div>
      </div>
    </div>
  )
}

// ─── Add stops ──────────────────────────────────────────────────────────────

function AddStopsScreen({ trip, stops, onAdd, onRemove, onBack }: { trip: Trip; stops: AddedStop[]; onAdd: (stop: AddedStop) => void; onRemove: (id: string) => void; onBack: () => void }) {
  const [draft, setDraft] = useState('')
  const [selectedMode, setSelectedMode] = useState<RideMode | null>(null)
  const insertionOptions = trip.legs.slice(0, -1)
  const [selectedAfterId, setSelectedAfterId] = useState(insertionOptions[insertionOptions.length - 1]?.id ?? 'start')
  const [isThinking, setIsThinking] = useState(false)
  const [recommendationReady, setRecommendationReady] = useState(false)
  const suggestion = suggestTransport(draft)
  const chosenMode = selectedMode ?? suggestion.mode

  useEffect(() => {
    if (!draft.trim()) {
      setIsThinking(false)
      setRecommendationReady(false)
      return
    }
    setIsThinking(true)
    setRecommendationReady(false)
    const timer = setTimeout(() => {
      setIsThinking(false)
      setRecommendationReady(true)
    }, 1200)
    return () => clearTimeout(timer)
  }, [draft])

  const addStop = () => {
    const name = draft.trim()
    if (!name || !recommendationReady) return
    onAdd({ id: `${Date.now()}-${name}`, name, mode: chosenMode, afterId: selectedAfterId, reason: selectedMode ? `You chose ${RIDE_MODE_LABELS[chosenMode]} for this stop.` : suggestion.reason })
    setDraft('')
    setSelectedMode(null)
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 pb-10">
      <button onClick={onBack} className="text-[#1E4D8C] text-[15px] font-600 mb-8 flex items-center gap-1 -ml-0.5">← Journey</button>
      <p className="text-[13px] text-[#1C1F26]/50 mb-1">Make the route yours</p>
      <h1 className="text-[32px] leading-tight font-800 text-[#1C1F26] mb-2">Add a stop</h1>
      <p className="text-[14px] text-[#1C1F26]/60 leading-relaxed mb-8">NOVA will add your stops to every route and suggest the best way to reach each one.</p>

      <div className="border-b-2 border-[#1E4D8C] pb-3 mb-5">
        <input
          value={draft}
          onChange={(event) => { setDraft(event.target.value); setSelectedMode(null) }}
          onKeyDown={(event) => { if (event.key === 'Enter') addStop() }}
          placeholder="Where would you like to stop?"
          className="w-full text-[17px] text-[#1C1F26] placeholder:text-[#1C1F26]/45 bg-transparent outline-none"
          autoFocus
        />
      </div>

      {draft.trim() && isThinking && (
        <div className="bg-[#EDEDEA] rounded-2xl p-5 mb-6 flex items-center gap-3 animate-slide-up" aria-live="polite">
          <span className="thinking-pulse" aria-hidden="true"><span /><span /><span /></span>
          <div>
            <p className="text-[15px] font-700 text-[#1C1F26]">Finding the best connection</p>
            <p className="text-[13px] text-[#1C1F26]/55">Checking time, distance, and live route conditions</p>
          </div>
        </div>
      )}

      {draft.trim() && recommendationReady && (
        <div className="bg-[#EDEDEA] rounded-2xl p-4 mb-6 animate-slide-up">
          <p className="text-[11px] uppercase tracking-widest font-700 text-[#1C1F26]/45 mb-2">NOVA suggests</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#1E4D8C] text-white flex items-center justify-center"><ModeGlyph type={chosenMode} /></div>
            <div>
              <p className="text-[16px] font-700 text-[#1C1F26]">{RIDE_MODE_LABELS[chosenMode]}</p>
              <p className="text-[13px] text-[#1C1F26]/60">{selectedMode ? 'Your preferred option' : suggestion.reason}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {(Object.keys(RIDE_MODE_LABELS) as RideMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-2 rounded-full text-[12px] font-700 border transition-colors ${chosenMode === mode ? 'bg-[#1E4D8C] border-[#1E4D8C] text-white' : 'border-[#D8D8D3] text-[#1C1F26]/60'}`}
              >
                {RIDE_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
          <label className="block mt-4">
            <span className="text-[11px] uppercase tracking-widest font-700 text-[#1C1F26]/45">Add this stop after</span>
            <select
              value={selectedAfterId}
              onChange={(event) => setSelectedAfterId(event.target.value)}
              className="w-full mt-2 bg-white border border-[#D8D8D3] rounded-xl px-3 py-3 text-[14px] text-[#1C1F26] outline-none"
            >
              {insertionOptions.map((leg) => <option key={leg.id} value={leg.id}>{leg.name}</option>)}
            </select>
          </label>
          <button onClick={addStop} className="w-full mt-4 bg-[#1E4D8C] text-white text-[15px] font-700 py-3 rounded-full">Add this stop</button>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] text-[#1C1F26]/60 uppercase tracking-widest font-600">Your added stops</p>
          <p className="text-[12px] text-[#1C1F26]/45">{stops.length} saved · all routes</p>
        </div>
        {stops.length === 0 ? (
          <p className="text-[14px] text-[#1C1F26]/45 border-b border-[#D8D8D3] pb-4">No extra stops yet.</p>
        ) : stops.map((stop) => (
          <div key={stop.id} className="flex items-center gap-3 py-3 border-b border-[#D8D8D3]">
            <div className="w-8 h-8 rounded-full bg-[#1E4D8C] text-white flex items-center justify-center flex-shrink-0"><ModeGlyph type={stop.mode} /></div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-700 text-[#1C1F26] truncate">{stop.name}</p>
              <p className="text-[12px] text-[#1C1F26]/55">{RIDE_MODE_LABELS[stop.mode]} · after {insertionOptions.find((leg) => leg.id === stop.afterId)?.name ?? 'your current route'}</p>
            </div>
            <button onClick={() => onRemove(stop.id)} aria-label={`Remove ${stop.name}`} className="text-[#B94A48] text-[13px] font-700">Remove</button>
          </div>
        ))}
      </div>

      <button onClick={onBack} className="mt-auto w-full bg-[#1E4D8C] text-white text-[17px] font-700 py-4 rounded-full min-h-[56px]">Done</button>
    </div>
  )
}

// ─── Journey ────────────────────────────────────────────────────────────────

function JourneyScreen({ trip, onNext, onAddStops, onBack }: { trip: Trip; onNext: () => void; onAddStops: () => void; onBack: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-6 pt-12 pb-6">
        <button onClick={onBack} className="text-[#1E4D8C] text-[15px] font-600 mb-6 flex items-center gap-1 -ml-0.5">
          ← Back
        </button>
        <p className="text-[13px] text-[#1C1F26]/50 mb-1">I'll get you there by</p>
        <div className="flex items-baseline gap-3">
          <span className="text-[52px] font-800 text-[#1C1F26] tabular leading-none">{trip.eta}</span>
          <div>
            <p className="text-[15px] font-500 text-[#3F6B4F]">{trip.status}</p>
            <p className="text-[13px] text-[#1C1F26]/62">{trip.totalLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="relative">
          <div
            className="absolute left-[19px] top-3 w-[2px] bg-[#D8D8D3] animate-draw-line"
            style={{ height: 'calc(100% - 24px)' }}
          />
          <div className="flow-line" style={{ top: 12, bottom: 12 }} aria-hidden="true" />
          {trip.legs.map((leg, i) => {
            const isLast = i === trip.legs.length - 1
            const isExpanded = expanded === leg.id
            return (
              <div
                key={leg.id}
                className="relative flex gap-5 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
              >
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-700 z-10 relative mt-1"
                    style={{ backgroundColor: leg.delayed ? '#C7791C' : (modeColor[leg.type] || '#1E4D8C'), border: '3px solid #F7F7F5' }}
                  >
                    {leg.type === 'destination' ? <span className="text-xs">✓</span>
                      : leg.type === 'origin' ? <span className="w-2 h-2 rounded-full bg-white" />
                      : <ModeGlyph type={leg.type} />}
                  </div>
                  {!isLast && leg.type !== 'origin' && (
                    <div className="flex items-center justify-center flex-1 pt-1 pb-1">
                      <span className={`w-2.5 h-2.5 rounded-full animate-pulse-slow ${leg.delayed ? 'bg-[#C7791C]' : 'bg-[#1E4D8C]'}`} />
                    </div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-[17px] font-700 text-[#1C1F26] leading-tight">{leg.name}</p>
                      <p className="text-[13px] text-[#1C1F26]/60 mt-0.5">{leg.sub}</p>
                    </div>
                    <span className="text-[17px] tabular font-600 text-[#1C1F26]/70 flex-shrink-0 pt-0.5">{leg.time}</span>
                  </div>
                  {leg.delayed ? (
                    <div className="mt-2 bg-[#FBF0DF] rounded-xl px-3 py-2.5">
                      <p className="text-[13.5px] text-[#1C1F26] leading-snug">{leg.detail}</p>
                    </div>
                  ) : leg.detail ? (
                    <>
                      <button onClick={() => setExpanded(isExpanded ? null : leg.id)} className="mt-2 text-[13px] text-[#1E4D8C] font-500">
                        {isExpanded ? 'Less ↑' : 'Details ↓'}
                      </button>
                      {isExpanded && (
                        <p className="mt-2 text-[14px] text-[#1C1F26]/60 leading-relaxed animate-slide-up">{leg.detail}</p>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-2 border border-[#D8D8D3] rounded-2xl overflow-hidden">
          <button onClick={() => setWhyOpen(!whyOpen)} className="w-full flex items-center justify-between px-5 py-4 text-left">
            <span className="text-[15px] font-600 text-[#1C1F26]">Why this route?</span>
            <span className="text-[#1C1F26]/62">{whyOpen ? '↑' : '↓'}</span>
          </button>
          {whyOpen && (
            <div className="px-5 pb-5 animate-slide-up">
              <p className="text-[14px] text-[#1C1F26]/60 leading-relaxed">{trip.whyThisRoute}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={onNext}
            className="bg-[#1E4D8C] text-white text-[17px] font-700 px-10 py-4 rounded-full min-h-[56px] hover:bg-[#163a6e] active:scale-[0.98] transition-all"
          >
            Start journey
          </button>
        </div>
        <div className="flex justify-center mt-3">
          <button onClick={onAddStops} className="text-[#1E4D8C] text-[15px] font-700 px-6 py-3">+ Add stops</button>
        </div>
      </div>
    </div>
  )
}

// ─── Tracking ───────────────────────────────────────────────────────────────

function TrackingScreen({ trip, onBack, onCancel }: { trip: Trip; onBack: () => void; onCancel: () => void }) {
  const [mapView, setMapView] = useState(false)
  const [step, setStep] = useState(0)
  const [legProgress, setLegProgress] = useState(0) // 0→1 within each leg
  const [arrived, setArrived] = useState(false)
  const approachFiredRef = useRef(false)
  const legArrivalFiredRef = useRef(false)

  const { triggerApproaching, triggerBoard, triggerLegArrival, triggerDestination } = useAmbientSense()

  // Auto-simulate leg progress — counts from 0→1 over LEG_DURATION seconds
  useEffect(() => {
    if (arrived) return
    const tick = 100 // ms
    const increment = tick / (LEG_DURATION * 1000)

    const t = setInterval(() => {
      setLegProgress((p) => {
        const next = p + increment
        if (next >= 1) {
          clearInterval(t)
          return 1
        }
        return next
      })
    }, tick)

    return () => clearInterval(t)
  }, [step, arrived])

  // Fire events based on progress within a leg
  useEffect(() => {
    if (arrived) return

    // Approaching threshold — fire once per leg
    if (legProgress >= 0.75 && !approachFiredRef.current) {
      approachFiredRef.current = true
      triggerApproaching()
    }

    // Fire once at the arrival edge. The ref also prevents duplicate cues
    // during React Strict Mode or while the transition timer is pending.
    if (legProgress >= 1) {
      if (legArrivalFiredRef.current) return
      legArrivalFiredRef.current = true
      triggerLegArrival()

      const next = step + 1
      const transitionTimer = setTimeout(() => {
        if (next >= trip.stepLabels.length) {
          setTimeout(() => {
            setArrived(true)
            triggerDestination()
          }, 350)
        } else {
          approachFiredRef.current = false
          legArrivalFiredRef.current = false
          setStep(next)
          setLegProgress(0)
          triggerBoard()
        }
      }, 500)

      return () => clearTimeout(transitionTimer)
    }
  }, [legProgress, step, arrived, trip.stepLabels.length, triggerApproaching, triggerBoard, triggerLegArrival, triggerDestination])

  // Derived values — dot size is fixed, only pulse speed changes with proximity:
  // far away it breathes slowly, close by it quickens, like a locating pulse.
  const isApproaching = legProgress >= 0.75
  const dotPx = 14
  const rippleDur = (3.4 - legProgress * 2.4).toFixed(2) // 3.4s far → 1.0s near
  const rippleCount = 2
  const narrative = isApproaching ? trip.narrativesNear[step] : trip.narrativesFar[step]
  const proximityLabel = legProgress < 0.35 ? 'Far away' : legProgress < 0.6 ? 'En route' : legProgress < 0.75 ? 'Getting close' : 'Almost there'

  // Map dot interpolated along the actual route segment
  const ep = trip.legEndpoints[Math.min(step, trip.legEndpoints.length - 1)]
  const dotX = ep.start.x + (ep.end.x - ep.start.x) * legProgress
  const dotY = ep.start.y + (ep.end.y - ep.start.y) * legProgress

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-12 pb-5">
        <button onClick={onBack} className="text-[#1E4D8C] text-[15px] font-600 mb-6 flex items-center gap-1 -ml-0.5">
          ← Journey
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-[#1C1F26]/50 mb-0.5">Arriving at</p>
            <p className="text-[20px] font-700 text-[#1C1F26]">{trip.destinationLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[38px] font-800 text-[#1C1F26] tabular leading-none">{trip.eta}</p>
            <p className="text-[13px] text-[#3F6B4F] font-500">{trip.status}</p>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="px-6 mb-5">
        <div className="flex gap-1 bg-[#EDEDEA] rounded-full p-1 w-fit">
          {['Journey', 'Map'].map((label) => (
            <button
              key={label}
              onClick={() => setMapView(label === 'Map')}
              className={`px-5 py-2 rounded-full text-[14px] font-600 transition-all ${
                mapView === (label === 'Map') ? 'bg-white text-[#1C1F26] shadow-sm' : 'text-[#1C1F26]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!mapView ? (
        <div className="flex-1 overflow-y-auto px-6 pb-10">
          {arrived && (
            /* Arrival card */
            <div className="bg-[#3F6B4F] rounded-3xl p-6 mb-6 text-white animate-slide-up">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">✓</div>
                <div>
                  <p className="text-[18px] font-700">You've arrived.</p>
                  <p className="text-[13px] text-white/70">{trip.destinationLabel} · {trip.eta}</p>
                </div>
              </div>
              <p className="text-[14px] text-white/80 leading-snug">Right on time. Enjoy your visit.</p>
            </div>
          )}

          {/* One unified timeline — the currently active leg carries its own
              live status inline, so nothing is ever shown twice. */}
          {!arrived && (
            <div className="relative">
              <div className="absolute left-[19px] top-3 w-[2px] bg-[#D8D8D3]" style={{ height: 'calc(100% - 24px)' }} />
              <div className="flow-line" style={{ top: 12, bottom: 12 }} aria-hidden="true" />
              {trip.legs.slice(step + 1).map((leg, i) => {
                const isCurrent = i === 0
                const remaining = trip.legs.slice(step + 1)
                return (
                  <div key={leg.id} className="relative flex gap-5">
                    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-700 z-10 relative mt-1 ${isCurrent ? 'glow-blue' : ''}`}
                        style={{
                          backgroundColor: isCurrent ? modeColor[leg.type] : '#D8D8D3',
                          border: '3px solid #F7F7F5',
                          color: isCurrent ? 'white' : '#1C1F26',
                        }}
                      >
                        {isCurrent && <div className="scan-ring" aria-hidden="true" />}
                        {leg.type === 'destination' ? <span className="text-xs">✓</span> : <ModeGlyph type={leg.type} />}
                      </div>
                      {i < remaining.length - 1 && (
                        <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: isCurrent ? '#1E4D8C' : '#D8D8D3' }} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-[16px] font-700 leading-tight ${isCurrent ? 'text-[#1C1F26]' : 'text-[#1C1F26]/62'}`}>{leg.name}</p>
                          <p className="text-[12px] text-[#1C1F26]/62 mt-0.5">{leg.sub}</p>
                        </div>
                        <span className={`text-[16px] tabular font-600 flex-shrink-0 pt-0.5 ${isCurrent ? 'text-[#1C1F26]/70' : 'text-[#1C1F26]/55'}`}>
                          {leg.time}
                        </span>
                      </div>

                      {isCurrent && (
                        <div className="mt-3 bg-[#1E4D8C] rounded-2xl px-4 py-3.5 text-white relative overflow-hidden sheen">
                          <div className="flex items-center gap-3 mb-2">
                            {/* Compact pulsing dot — breathes slowly far away, quickens close by */}
                            <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: dotPx + 20, height: dotPx + 20 }}>
                              {Array.from({ length: rippleCount }).map((_, r) => (
                                <span
                                  key={r}
                                  className="absolute rounded-full bg-white/25"
                                  style={{
                                    width: dotPx + 10,
                                    height: dotPx + 10,
                                    animation: `ripple ${rippleDur}s ease-out ${(r * parseFloat(rippleDur)) / rippleCount}s infinite`,
                                  }}
                                />
                              ))}
                              <span
                                className="rounded-full bg-white relative z-10"
                                style={{
                                  width: dotPx,
                                  height: dotPx,
                                  animation: `pulse-slow ${rippleDur}s ease-in-out infinite`,
                                  boxShadow: '0 0 12px 3px rgba(255,255,255,0.55)',
                                }}
                              />
                            </div>
                            <span className="text-[10.5px] font-700 text-white/55 tracking-widest uppercase" style={{ letterSpacing: '0.14em' }}>
                              {proximityLabel}
                            </span>
                          </div>
                          <p className="text-[14px] font-500 text-white/95 leading-snug">{narrative}</p>
                          <div className="h-0.5 bg-white/20 rounded-full overflow-hidden mt-3">
                            <div
                              className="h-full bg-white/60 rounded-full transition-all duration-200"
                              style={{ width: `${legProgress * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Map view — dot moves along route with legProgress */
        <div className="flex-1 mx-6 mb-8 rounded-3xl overflow-hidden relative bg-[#EDEDEA]">
          <svg viewBox="0 0 340 520" className="w-full h-full" style={{ minHeight: 380 }}>
            <rect width="340" height="520" fill="#EDEDEA" />
            {/* Background road grid */}
            <line x1="0" y1="260" x2="340" y2="260" stroke="#D8D8D3" strokeWidth="5" />
            <line x1="170" y1="0" x2="170" y2="520" stroke="#D8D8D3" strokeWidth="5" />
            <line x1="80" y1="0" x2="260" y2="520" stroke="#D8D8D3" strokeWidth="3" opacity="0.4" />

            {/* Completed segment (darker) */}
            {step > 0 && (
              <polyline
                points={trip.legEndpoints.slice(0, step).map((e) => `${e.start.x},${e.start.y}`).join(' ') + ` ${ep.start.x},${ep.start.y}`}
                fill="none"
                stroke="#1E4D8C"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.4"
              />
            )}

            {/* Full route */}
            <polyline
              points={trip.mapStops.map((s) => `${s.x},${s.y}`).join(' ')}
              fill="none"
              stroke="#1E4D8C"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
            />

            {/* Active segment progress */}
            <line
              x1={ep.start.x} y1={ep.start.y}
              x2={dotX} y2={dotY}
              stroke="#1E4D8C"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* User dot — moves continuously */}
            <circle cx={dotX} cy={dotY} r="7" fill="#1E4D8C" />
            <circle cx={dotX} cy={dotY} r="7" fill="#1E4D8C" opacity="0.25">
              <animate
                attributeName="r"
                values="7;18;7"
                dur={isApproaching ? '0.9s' : '2.2s'}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0;0.3"
                dur={isApproaching ? '0.9s' : '2.2s'}
                repeatCount="indefinite"
              />
            </circle>
            <text x={dotX + 10} y={dotY + 4} fontSize="11" fill="#1E4D8C" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700">You</text>

            {/* Stops */}
            {trip.mapStops.map(({ x, y, label, dest, anchor }) => (
              <g key={label}>
                <circle cx={x} cy={y} r={dest ? 7 : 5} fill={dest ? '#3F6B4F' : '#F7F7F5'} stroke={dest ? '#3F6B4F' : '#1E4D8C'} strokeWidth="2" />
                <text
                  x={anchor === 'end' ? x - 11 : x + 11}
                  y={y + 4}
                  textAnchor={anchor}
                  fontSize="11"
                  fill="#1C1F26"
                  opacity={dest ? 0.9 : 0.65}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight={dest ? '700' : '600'}
                >
                  {label}
                </text>
              </g>
            ))}

            {/* Mode labels along segments */}
            {trip.segmentLabels.map((l) => (
              <text key={l.text + l.x} x={l.x} y={l.y} fontSize="10" fill="#1E4D8C" opacity="0.5" fontFamily="Plus Jakarta Sans, sans-serif">
                {l.text}
              </text>
            ))}
          </svg>

          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl px-4 py-3">
            <p className="text-[13px] font-600 text-[#1C1F26]">{trip.stepLabels[step]} · {proximityLabel.toLowerCase()}</p>
            <p className="text-[12px] text-[#1C1F26]/50">Next stop · {trip.arrivals[step]}</p>
          </div>
        </div>
      )}

      <div className="px-6 pb-8">
        <button
          onClick={onCancel}
          className="w-full min-h-[50px] rounded-full border border-[#B94A48]/40 text-[#B94A48] text-[15px] font-600 hover:bg-[#B94A48]/8 active:scale-[0.98] transition-all"
        >
          Cancel journey
        </button>
      </div>
    </div>
  )
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [tripId, setTripId] = useState<string>('local')
  const [addedStops, setAddedStops] = useState<AddedStop[]>([])
  const trip = withAddedStops(TRIPS[tripId], addedStops)

  return (
    <div
      className="max-w-[430px] mx-auto bg-[#F7F7F5] min-h-screen relative overflow-x-hidden"
      style={{ boxShadow: '0 0 0 1px #D8D8D3' }}
    >
      <div className="ambient-field" aria-hidden="true">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="text-[11px] font-800 text-[#1C1F26]/25 tracking-[0.2em]">NOVA</span>
      </div>

      <div className="relative z-[1]">
        {screen === 'home' && (
          <HomeScreen
            onSearch={(query) => {
              setTripId(resolveTripId(query))
              setScreen('journey')
            }}
          />
        )}
        {screen === 'journey' && (
          <JourneyScreen trip={trip} onNext={() => setScreen('tracking')} onAddStops={() => setScreen('add-stops')} onBack={() => setScreen('home')} />
        )}
        {screen === 'add-stops' && (
          <AddStopsScreen
            trip={TRIPS[tripId]}
            stops={addedStops}
            onAdd={(stop) => setAddedStops((current) => [...current, stop])}
            onRemove={(id) => setAddedStops((current) => current.filter((stop) => stop.id !== id))}
            onBack={() => setScreen('journey')}
          />
        )}
        {screen === 'tracking' && (
          <TrackingScreen trip={trip} onBack={() => setScreen('journey')} onCancel={() => setScreen('home')} />
        )}
      </div>
    </div>
  )
}
