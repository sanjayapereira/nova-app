import { useRef, useCallback } from 'react'

function vibrate(pattern: number[]): boolean {
  try {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && navigator.vibrate(pattern)
  } catch {
    return false
  }
}

export function useAmbientSense() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const primeHaptics = useCallback(() => vibrate([10]), [])

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

  return { primeHaptics, triggerApproaching, triggerBoard, triggerTransfer, triggerLegArrival, triggerDestination }
}
