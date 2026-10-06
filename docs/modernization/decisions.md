# Modernization Gate Decisions
**Date:** 2026-10-06  
**Owner:** Repository Owner

## 1. Feed The Blob Game

**Decision:** KEEP and make it keyboard-accessible.

**Consequence:** An accessibility slice adds keyboard control and an accessible alternative; the game is not deleted.

## 2. KB Securities Project

**Decision:** CLEARED for public mention and framing.

**Consequence:** Keep the card and the live iframe preview as they are (the iframe sandbox hardening in the audit still applies).

## 3. Removal of Vietnamese and Screen-Pet Mode

**Decision:** INTENTIONAL.

**Consequence:** The site is English (en) and Chinese (zh) only; fix the README (remove Vietnamese, the nonexistent SoundToggle.tsx, the PET/screen-pet and cursor-chasing text, and correct the contact rate limit to 5 requests per minute per IP).

## 4. Housekeeping Slice

**Decision:** INCLUDED.

**Consequence:** Delete the constant switches in lib/site.ts (showPixelGrid, navLabels), the Vietnamese leftovers (About.tsx comment and hero.pron handling), the stale screen-pet comment at components/blob/useBlobBrain.ts:15, and check the icon-kit metadata in components/icons.tsx for unused entries.

## Not Contested

All other features in `docs/modernization/as-built.md` were proposed keep or change and were not contested at the gate, so those features stay. Their "change" items go to the backlog for slice selection.

**Status:** No source code has been changed yet.
