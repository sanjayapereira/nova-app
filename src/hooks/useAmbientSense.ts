import { useRef, useCallback } from 'react'

function vibrate(pattern: number[]): boolean {
  try {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && navigator.vibrate(pattern)
  } catch {
    return false
  }
}

function speak(text: string, onEnd?: () => void) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.()
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onend = () => onEnd?.()
    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech is optional and may be blocked by the browser.
    onEnd?.()
  }
}

export function useAmbientSense() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const primeHaptics = useCallback(() => vibrate([700]), [])

  const announceGreeting = useCallback((name: string, greeting: string) => {
    speak(`${greeting}, ${name}. Where are you headed?`)
  }, [])

  const announceJourneyStart = useCallback((instruction: string) => {
    speak(`Your journey is starting. ${instruction}`)
  }, [])

  const announceInstruction = useCallback((instruction: string, onEnd?: () => void) => {
    speak(instruction, onEnd)
  }, [])

  const announceLegArrival = useCallback((destination: string, nextAction: string) => {
    speak(`${destination} has arrived. ${nextAction}`)
  }, [])

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    return audioCtxRef.current
  }, [])

  const playTone = useCallback(
    (freq: number, gain: number, duration: number, delay = 0) => {
      try {
        const ctx = getCtx()
        const now = ctx.currentTime + delay
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1200, now)

        g.gain.setValueAtTime(0, now)
        g.gain.linearRampToValueAtTime(gain, now + 0.05)
        g.gain.exponentialRampToValueAtTime(0.001, now + duration)

        osc.connect(filter)
        filter.connect(g)
        g.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + duration + 0.02)
      } catch {
        // AudioContext not available
      }
    },
    [getCtx],
  )

  // Soft two-pulse when approaching a stop
  const triggerApproaching = useCallback(() => {
    playTone(280, 0.06, 0.3, 0)
    playTone(320, 0.06, 0.3, 0.35)
    vibrate([25, 80, 25])
  }, [playTone])

  // Reached the end of a leg — fires for every vehicle mode (shuttle,
  // train, air pod, smart road), confirming arrival before the next thing
  // happens (boarding the next vehicle, or the final destination cue).
  const triggerLegArrival = useCallback(() => {
    playTone(392, 0.08, 0.3, 0)
    vibrate([50, 40, 50])
  }, [playTone])

  // Boarding a new vehicle
  const triggerBoard = useCallback(() => {
    playTone(330, 0.09, 0.4, 0)
    playTone(440, 0.09, 0.4, 0.2)
    vibrate([40, 60, 80])
  }, [playTone])

  // Transfer between modes
  const triggerTransfer = useCallback(() => {
    playTone(300, 0.07, 0.35, 0)
    playTone(380, 0.07, 0.35, 0.18)
    vibrate([30, 40, 30, 40, 30])
  }, [playTone])

  // Final destination arrived — three ascending notes
  const triggerDestination = useCallback(() => {
    playTone(440, 0.13, 0.5, 0)
    playTone(550, 0.13, 0.5, 0.2)
    playTone(660, 0.15, 0.7, 0.4)
    vibrate([80, 60, 120, 60, 200])
  }, [playTone])

  return { primeHaptics, announceGreeting, announceJourneyStart, announceInstruction, announceLegArrival, triggerApproaching, triggerBoard, triggerTransfer, triggerLegArrival, triggerDestination }
}
