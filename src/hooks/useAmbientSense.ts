import { useRef, useCallback } from 'react'

let speechSequence = 0
let speechQueue: { text: string; onEnd?: () => void }[] = []
let speechBusy = false
let speechMuted = false

function dispatchSpeechState(active: boolean) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nova:speech-state', { detail: { active } }))
}

function preferredVoice(): SpeechSynthesisVoice | undefined {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return undefined
  const voices = window.speechSynthesis.getVoices()
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
  const mobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent)
  const preferredNames = mobile
    ? ['samantha', 'karen', 'susan', 'zira', 'jenny', 'google us english']
    : ['david', 'mark', 'daniel', 'guy', 'alex', 'google uk english male']
  return preferredNames.reduce<SpeechSynthesisVoice | undefined>((match, name) => match ?? englishVoices.find((voice) => voice.name.toLowerCase().includes(name)), undefined)
    ?? englishVoices[0]
    ?? voices[0]
}

function flushSpeechQueue() {
  if (speechMuted || speechBusy || speechQueue.length === 0) {
    if (!speechBusy && speechQueue.length === 0) dispatchSpeechState(false)
    return
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    const job = speechQueue.shift()
    job?.onEnd?.()
    flushSpeechQueue()
    return
  }

  const job = speechQueue.shift()!
  speechBusy = true
  const speechId = ++speechSequence
  dispatchSpeechState(true)
  window.dispatchEvent(new CustomEvent('nova:speech-start', { detail: { speechId } }))
  const utterance = new SpeechSynthesisUtterance(job.text)
  utterance.rate = 0.92
  utterance.pitch = 1
  utterance.voice = preferredVoice() ?? null
  let finished = false
  let fallbackTimer: number | undefined
  const finish = () => {
    if (finished) return
    finished = true
    if (fallbackTimer) window.clearTimeout(fallbackTimer)
    speechBusy = false
    window.dispatchEvent(new CustomEvent('nova:speech-end', { detail: { speechId } }))
    job.onEnd?.()
    window.setTimeout(() => {
      flushSpeechQueue()
      if (!speechBusy && speechQueue.length === 0) dispatchSpeechState(false)
    }, 0)
  }
  utterance.onend = finish
  utterance.onerror = finish
  window.speechSynthesis.speak(utterance)
  // Some Android voices do not reliably emit onend. Keep UI and phase state
  // from getting stuck if that happens.
  fallbackTimer = window.setTimeout(finish, Math.max(4000, job.text.length * 125))
}

function vibrate(pattern: number[]): boolean {
  try {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && navigator.vibrate(pattern)
  } catch {
    return false
  }
}

function speak(text: string, onEnd?: () => void) {
  if (speechMuted) {
    onEnd?.()
    return
  }
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.()
      return
    }
    speechQueue.push({ text, onEnd })
    flushSpeechQueue()
  } catch {
    onEnd?.()
  }
}

export function useAmbientSense() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  const primeHaptics = useCallback(() => vibrate([700]), [])

  const setSpeechMuted = useCallback((muted: boolean) => {
    speechMuted = muted
    if (muted) {
      speechQueue = []
      speechBusy = false
      window.speechSynthesis?.cancel()
      dispatchSpeechState(false)
    }
  }, [])

  const announceGreeting = useCallback((name: string, greeting: string) => {
    speak(`${greeting}, ${name}. Where are you headed?`)
  }, [])

  const announceJourneyStart = useCallback((instruction: string, onEnd?: () => void) => {
    speak(`Your journey is starting. ${instruction}`, onEnd)
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

  return { primeHaptics, setSpeechMuted, announceGreeting, announceJourneyStart, announceInstruction, announceLegArrival, triggerApproaching, triggerBoard, triggerTransfer, triggerLegArrival, triggerDestination }
}
