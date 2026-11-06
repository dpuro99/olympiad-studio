# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primarily students preparing for Science Olympiad competitions (Division B and C). They range from first-time participants to experienced team members looking for event-specific practice tools. They use it during team practices, at home for individual study, or to quickly verify calculations.

## Product Purpose
Olympiad Studio provides rule-grounded, event-specific preparation tools for Science Olympiad teams. It brings calculators, practice tools, and study aids into one cohesive workspace where students can prepare with confidence in the accuracy of formulas and rules.

## Positioning
Rule-grounded preparation tools with official manual citations. Unlike generic quiz sites or flashcard apps, every calculation cites the official rules manual, distinguishes rule-derived calculators from practice aids, and never invents scoring formulas. The platform is built specifically for Science Olympiad's unique event structure.

## Operating Context
Students use this during team practices, at home for individual study, or to quickly verify calculations. Tools must work offline in the browser (localStorage persistence), load quickly, and not require complex accounts for basic functionality. Single-page application with local state navigation.

## Capabilities and Constraints
- **Registry-driven architecture**: All events and modules registered in `src/components/events/registry.js` - this MUST remain unchanged functionally
- **Local navigation**: No router, state managed in `src/App.jsx` - must preserve navigation behavior
- **Rule-grounded**: All formulas must cite official manual, never invent rules/scoring
- **Browser persistence**: Uses localStorage for practice data (keys must remain compatible)
- **Auth optional**: Google OAuth via Supabase for some features, but core tools work as guest
- **All tools must remain functional**: Every existing calculator, logger, and practice tool must continue to work with same inputs/outputs
- **Event structure**: 8 Division C events + Write It, Do It B from 2027 slate

## Brand Commitments
Current branding uses "Olympiad Studio" with a logo component. Open to redesign of visual identity (colors, typography, layout) as long as it remains recognizable and professional.

## Evidence on Hand
- Full codebase with 25+ modules across 9 events
- Comprehensive test suite (unit + e2e)
- Memory bank with full project context
- Season-based architecture for rule updates
- Established UI primitives and patterns

## Product Principles
1. **Accuracy over speed**: Never invent rules or formulas - cite the official manual
2. **Student-first**: Tools should be intuitive and approachable for students of all experience levels
3. **Pragmatic engineering**: Feels like a workbench - practical, not gamified
4. **Preserve function**: All calculations and logic must remain correct
5. **Progressive enhancement**: Core tools work without auth, advanced features can require it

## Accessibility & Inclusion
Tools need to be keyboard-navigable where interactive, with proper ARIA labels. Responsive design for various screen sizes. The redesign should improve accessibility while maintaining functionality.
