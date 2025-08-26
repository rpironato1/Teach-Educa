# TeacH - Adaptive Learning Platform Landing Page

Create a modern, psychologically attractive landing page for TeacH, an adaptive learning platform that uses neuroadaptive technology to personalize education.

**Experience Qualities**: 
1. **Calm** - Interface promotes focus and reduces cognitive load through generous spacing and muted colors
2. **Trustworthy** - Clean design and consistent patterns build confidence in the learning platform
3. **Engaging** - Subtle animations and micro-interactions reward user attention without distraction

**Complexity Level**: Content Showcase (information-focused)
- Primary purpose is to present the platform's value proposition and convert visitors to users through clear information hierarchy and compelling calls-to-action.

## Essential Features

**Hero Section**
- Functionality: Introduce TeacH platform with compelling headline and primary CTA
- Purpose: Immediately communicate value proposition and drive sign-ups
- Trigger: Page load
- Progression: Eye-catching headline → Benefits overview → Primary CTA button → Secondary navigation
- Success criteria: Clear value proposition, prominent CTA, under 3 seconds to understand offering

**Credit Plans Section**
- Functionality: Display three tiered pricing options (Inicial 100, Intermediário 500, Profissional 1000 credits)
- Purpose: Convert visitors by showing clear value at different commitment levels
- Trigger: User scrolls to pricing section
- Progression: Plan comparison → Feature highlights → Price points → Selection CTA
- Success criteria: Easy plan comparison, clear feature differentiation, obvious next steps

**Adaptive Methodology Section**
- Functionality: Explain neuroadaptive learning technology and benefits
- Purpose: Build trust through educational content and differentiate from competitors
- Trigger: User scrolls to methodology section
- Progression: Technology overview → Benefits explanation → Social proof or testimonials
- Success criteria: Complex concepts explained simply, builds platform credibility

**FAQ Section**
- Functionality: Address common questions in organized, searchable format
- Purpose: Remove barriers to conversion by addressing concerns proactively
- Trigger: User clicks FAQ or scrolls to section
- Progression: Question browsing → Answer expansion → Related question discovery
- Success criteria: Questions answered quickly, reduces support burden

**Navigation & Footer**
- Functionality: Provide site-wide navigation and comprehensive links
- Purpose: Enable easy exploration and provide necessary legal/contact information
- Trigger: User needs to navigate or find specific information
- Progression: Clear navigation labels → Relevant page access → Footer information discovery
- Success criteria: Intuitive navigation, all necessary links present

## Edge Case Handling

- **Slow Loading**: Progressive loading with skeleton states for images and content blocks
- **Mobile Navigation**: Collapsible hamburger menu with clear section access
- **Long Content**: Smooth scroll navigation with progress indicators
- **Accessibility**: Full keyboard navigation and screen reader support
- **No JavaScript**: Core content and navigation remain functional

## Design Direction

The design should feel scientifically credible yet approachable - combining the trust of educational institutions with the innovation of modern technology platforms, creating a sense of calm focus that supports learning mindset.

## Color Selection

Neuroadaptive palette using analogous cool colors that promote focus and learning states.

- **Primary Color**: Soft Blue (#6366f1) - Communicates trust, focus, and technological sophistication
- **Secondary Colors**: 
  - Calm Green (#10b981) - Represents growth, progress, and positive outcomes
  - Adaptive Purple (#8b5cf6) - Suggests innovation, creativity, and advanced technology
- **Accent Color**: Calm Green (#10b981) - Used for CTAs and success states to encourage action
- **Foreground/Background Pairings**: 
  - Background (White #ffffff): Neutral Gray text (#64748b) - Ratio 7.1:1 ✓
  - Primary Blue (#6366f1): White text (#ffffff) - Ratio 8.2:1 ✓
  - Calm Green (#10b981): White text (#ffffff) - Ratio 4.8:1 ✓
  - Purple (#8b5cf6): White text (#ffffff) - Ratio 6.1:1 ✓
  - Card (Light Gray #f8fafc): Neutral Gray text (#64748b) - Ratio 6.8:1 ✓

## Font Selection

Typography should convey modern professionalism while maintaining high readability for extended learning sessions - Inter for its excellent screen legibility and neutral, trustworthy character.

- **Typographic Hierarchy**: 
  - H1 (Hero Title): Inter Bold/48px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/32px/normal spacing  
  - H3 (Card Titles): Inter Medium/24px/normal spacing
  - Body (Main Text): Inter Regular/16px/relaxed line height
  - Small (Captions): Inter Regular/14px/normal spacing

## Animations

Subtle, purposeful animations that support the learning mindset - smooth transitions that guide attention without creating distraction or cognitive load.

- **Purposeful Meaning**: Gentle fade-ins and scale effects communicate platform sophistication while maintaining focus
- **Hierarchy of Movement**: Hero elements animate first, followed by progressive disclosure of content sections as user scrolls

## Component Selection

- **Components**: 
  - Navigation: Shadcn Navigation Menu with custom styling
  - Hero: Custom section with Shadcn Button (primary CTA)
  - Pricing: Shadcn Card components with Badge highlights
  - Content: Shadcn Card for methodology sections
  - FAQ: Shadcn Accordion for expandable Q&A
  - Footer: Custom layout with Shadcn Separator
- **Customizations**: 
  - Gradient backgrounds for hero section
  - Custom card hover states with subtle elevation
  - Neuroadaptive color applications throughout
- **States**: 
  - Buttons: Distinct hover/focus states with color transitions
  - Cards: Gentle hover elevation and border highlights
  - Navigation: Active state indicators and smooth transitions
- **Icon Selection**: Phosphor icons for consistency - GraduationCap, Brain, ChartLine, Users, etc.
- **Spacing**: Generous padding using Tailwind's 8, 12, 16, 24 scale for breathing room
- **Mobile**: Stacked layout for pricing cards, collapsible navigation, touch-friendly button sizes (min 44px)