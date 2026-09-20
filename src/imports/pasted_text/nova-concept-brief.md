**CRE8X 3.0 — THE ORACLE CHALLENGE**

**NOVA**

*One system. Every way to feel it.*

Concept brief for the team — Transportation 2100

# **The Real Problem We're Actually Solving**

By 2100, transportation
is realistically headed toward full automation and a single AI-coordinated
network across bus, train, air, and smart roads — this is already the direction
Mobility-as-a-Service is moving in today, just matured. Two other shifts happen
at the same time: lifespans extend, so a much larger share of the population is
elderly; and the system increasingly plans the journey for you, so the human's
role shifts from figuring out logistics to trusting and understanding what's
happening.

That combination
creates one clear, recurring failure pattern:

*As transportation becomes fully automated, most
apps will default to designing for the confident, sighted, tech-fluent user —
because that's the easy path. The people left behind won't be a small edge
case; they'll be a huge and growing share of the population (elderly, disabled,
anxious, distracted, non-native-language speakers) using a system that was
never built with them in the room.*

That's the problem NOVA
exists to solve — not "make transit look futuristic," but make one
automated system that genuinely works for everyone at once, without a
specialised mode for anyone.

# **The Core Idea**

NOVA merges three
concepts we explored, not as competing styles but as three layers of the same
experience — each one answering the same problem through a different sense:

—  Radical simplicity: one
clear path forward at a time, plain language, no mode-picking, always a
"just get me there" fallback. This is the skeleton — the actual
information architecture.

—  The system communicates
like it knows you and your patterns, in warm, plain, first-person language
instead of robotic readouts. This is how the skeleton speaks to you.

—  Underneath the clear
visuals and warm language, a gentle ambient rhythm (pulsing, sound, haptic)
runs constantly, so time and status can be felt, not just read. This is the
nervous system underneath the skin.

*NOVA is built on the idea that trust in an
automated system comes from being able to understand it through more than one
sense — see it clearly, hear it speak plainly, and feel its rhythm — so no
single ability or comfort level becomes a barrier to moving through the city
confidently.*

Design rule to keep us
honest: every screen leads with one primary channel at a time — never all three
at once. Visual clarity is always the baseline; warmth and rhythm are quiet
additions underneath it, not competing layers. This restraint is itself part of
the pitch.

# **How NOVA Maps to the Judging Rubric**

|     |
| --- |

**Criterion**

|     |
| --- |

**Points**

|     |
| --- |

How NOVA earns
&#x20; it

|     |
| --- |

**Usability**

|     |
| --- |

20

|     |
| --- |

ONE's single
&#x20; clear path forward — search → route → track, with no mode-picking and a
&#x20; one-tap fallback for anyone overwhelmed by choice.

|     |
| --- |

**Aesthetics**

|     |
| --- |

20

|     |
| --- |

One cohesive,
&#x20; deliberate personality (calm / warm / rhythmic) instead of generic
&#x20; neon-futurism — a distinctive point of view, not decoration.

|     |
| --- |

**Innovation**

|     |
| --- |

15

|     |
| --- |

ambient,
&#x20; multisensory layer (pulse, sound, haptic feedback tied to real arrival time)
&#x20; — a genuinely novel feature 

|     |
| --- |

**Accessibility**

|     |
| --- |

15

|     |
| --- |

All three
&#x20; layers together: visual clarity + plain warm language+ a non-visual sensory
&#x20; channel mean a person can rely on any single channel alone and still complete
&#x20; the journey.

|     |
| --- |

**Functionality**

|     |
| --- |

15

|     |
| --- |

One complete,
&#x20; working flow across all three mandatory screens — search, route detail, and
&#x20; live tracking — behaving like a real product.

|     |
| --- |

**Mobile
&#x20; Responsiveness**

|     |
| --- |

15

|     |
| --- |

Generous
&#x20; touch targets, single-column single-path layouts by design — built
&#x20; mobile-first, not adapted afterward.

# **Design System**

## **Colour — "Calm Transit" palette**

One accent colour, one
meaning each. Nothing decorative — every colour choice carries information.

|     |
| --- |

**Swatch**

|     |
| --- |

**Name**

|     |
| --- |

**Hex**

|     |
| --- |

**Role**

|     |
| --- |

|     |
| --- |

**Paper**

|     |
| --- |

\#F7F7F5

|     |
| --- |

Base
&#x20; background — soft neutral, not stark white

|     |
| --- |

|     |
| --- |

**Ink**

|     |
| --- |

\#1C1F26

|     |
| --- |

Primary text
&#x20; — warm near-black

|     |
| --- |

|     |
| --- |

**Transit
&#x20; Blue**

|     |
| --- |

\#1E4D8C

|     |
| --- |

Primary
&#x20; accent — active states, primary actions, "you are here"

|     |
| --- |

|     |
| --- |

**Signal
&#x20; Amber**

|     |
| --- |

\#C7791C

|     |
| --- |

Reserved only
&#x20; for live alerts/delays — never decorative

|     |
| --- |

|     |
| --- |

**Line Grey**

|     |
| --- |

\#D8D8D3

|     |
| --- |

Dividers and
&#x20; inactive states

|     |
| --- |

|     |
| --- |

**Moss**

|     |
| --- |

\#3F6B4F

|     |
| --- |

Confirmation
&#x20; states — on time, arrived

## **Typography**

—  **Single family —**  one humanist sans-serif family for both
headline and body text, differentiated only by size and weight — fewer
competing styles means faster, calmer scanning for everyone.

—  **Headlines —**  set unusually large and generous, evoking
wayfinding signage rather than app UI.

—  **Numerals —**  tabular figures, sized slightly larger than
surrounding text — times and platform numbers get quiet visual priority without
shouting in colour or bold.

—  **Avoided —**  no ALL-CAPS labels, no letter-spaced eyebrows,
no monospace data tags — these read as generic template chrome, not intentional
design.

## **Layout — "Single Path" principle**

The layout should
always show one primary path forward, never a grid of competing choices. No
card grids anywhere — content is sequential, not browsable.

—  **Left-aligned text —**  not centred — matches natural reading patterns
and is easier to scan quickly for low-vision and elderly users. Centring is
reserved only for the single primary button.

—  **The line is the
interface —**  a literal connecting line
runs through the Journey Details and Live Tracking screens, like a line on a
transit map — it encodes real sequence and progress rather than decorating the
page.

—  **Generous touch targets
—**  minimum 56px touch targets and generous
spacing throughout, treated as the aesthetic itself (calm = uncrowded), not
just a compliance checkbox.

## **The Pulse Layer**

A small ambient signal
— a dot that gently pulses slower when a ride is far away and faster as it
approaches, paired with an optional soft sound and haptic pattern. It runs
underneath the visual layout, not instead of it: exact numbers are always
available on a single tap. This is what lets someone glance at their phone in a
pocket, or rely on it without looking at all, and still know where things
stand.

# **The Three Mandatory Screens**

|     |
| --- |

**Screen**

|     |
| --- |

**Skeleton**

|     |
| --- |

**Voice** 

|     |
| --- |

**Pulse**

|     |
| --- |

**1. Home**

|     |
| --- |

One input, no mode picking,
&#x20; always-visible "Just get me there"

|     |
| --- |

Personalised, plain greeting
&#x20; referencing real habits

|     |
| --- |

Quiet ambient signal shows the
&#x20; city is flowing normally before any search

|     |
| --- |

**2. Journey / Route Details**

|     |
| --- |

One vertical connected line,
&#x20; plain language, no jargon

|     |
| --- |

Narrated first person —
&#x20; "I'll get you there by 9:42"

|     |
| --- |

Each step pulses at a pace
&#x20; reflecting real time pressure; exact numbers on tap

|     |
| --- |

**3. Live Map / Tracking**

|     |
| --- |

Simplified narrative tracker
&#x20; by default; full map one tap away

|     |
| --- |

Present-tense reassurance —
&#x20; "It's turning onto Main Street now"

|     |
| --- |

Large pulsing dot speeds up on
&#x20; approach; distinct haptic/sound for boarding

# **The Honest Tension to Name (in the report)**

Combining three sensory
channels risks becoming cluttered or overstimulating if we're not careful — the
opposite of the calm we're aiming for. Our stated principle, and something we
should say explicitly in the report:

*Every screen leads with one primary channel at
a time — never all three shouting at once. Visual clarity is always the
baseline; warmth and rhythm are quiet additions underneath it, not competing
layers.*

Naming this restraint
ourselves, rather than waiting for a judge to notice the risk, is exactly the
kind of design responsibility the brief is scoring for.

NOVA's philosophy of "you never pick a mode"
doesn't mean the modes disappear from the design — it means **NOVA absorbs the
complexity of composing bus + train + air + smart road into one trip, and only
reveals each mode at the moment it's actually relevant to the traveler.** The
brief explicitly wants to see all four woven into one coherent experience, not
just implied. Here's exactly how each shows up in NOVA:

**How Each
Mode Surfaces in the NOVA Experience**

**Autonomous
buses/shuttles** — handled at the "first/last mile" nodes on the
journey line: the short local hop from your door to a transit point. This is
the leg most people don't think about as "a mode" at all — NOVA
treats it that way too (plain: "Your ride arrives," not
"Autonomous Bus Route 4B").

**Autonomous
trains** — the "backbone" leg for medium-distance travel across the
city. Shown on the journey line as a distinct node with a platform reference
(since trains are the one mode where a physical platform number is genuinely
useful information, not jargon).

**Air
transport** — for longer cross-district or cross-city hops, appears as its
own node on the same line, styled identically to every other step (no special
"flight mode" screen). This is the clearest test of NOVA's
philosophy: air travel today comes with its own airport-style anxiety (gates,
security, boarding). NOVA's job is to strip that down to the same plain pattern
as everything else — "Your air pod boards in 6 minutes," nothing more
alarming than a bus update.

**Smart roads**
— mostly invisible to the traveler (they're the roads autonomous vehicles use,
not something a passenger "chooses"), but they surface in two honest
ways: (1) in the "Why this route?" explanation, when routing logic
references road congestion, and (2) as the actual path drawn on the optional
map view.

**The Design
Rule This Creates**

**One trip can
touch all four modes, but the interface never asks the user to think in terms
of modes — only in terms of one continuous line getting them from here to
there.** Mode names appear only as supporting detail on each step (small text
under the main plain-language title), never as the primary decision point.

This is
actually a strong point to state explicitly in your report — it directly
answers the brief's line about designing "a coherent, unified experience
across multiple interconnected transport systems, rather than a single simple
app."

**What I'm
Updating in the Build**

Right now the
prototype's Journey Details screen only shows shuttle → train. Let me extend it
to a realistic multi-modal trip that actually demonstrates bus + train + air +
smart-road composition in one line, plus reference smart-road routing in the "Why
this route?" panel — since judges will specifically be checking whether
you handled the "multiple interconnected transport systems"
requirement, not just built a nice single-mode app.

Task Objective  Your experience must make travelling simple, efficient, safe, and accessible. Specifically, your platform should help users:  Discover routes across multiple modes of transport (bus, train, air, smart roads)  Manage journeys from planning through to completion  Receive real-time updates on delays, arrivals, and transfers  Interact with different transport modes through a single, seamless, unified experience — rather than separate disconnected tools for each mod  

Platform Requirements  You must build a real, working front-end web application (a backend/database is not required).  Any framework or tool may be used — React, HTML/CSS/JavaScript, Vue, or any other front-end technology.  Your application must be hosted on a free hosting service — examples include Vercel, Netlify, or GitHub Pages. Your application must be fully mobile responsive. This is a hard requirement, not optional — judging will be conducted primarily on mobile view, so test and refine your app on a mobile device or a mobile-simulated browser view first  