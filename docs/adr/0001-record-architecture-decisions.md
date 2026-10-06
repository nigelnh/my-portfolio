# 0001. Record architecture decisions

- Status: Accepted
- Date: 2026-10-06

## Context
Decisions that are expensive to reverse were being made implicitly or recorded only in chat, commit messages or one-off reports. Later sessions, people and agents cannot tell what was chosen or why.

## Decision
Record each such decision as a short ADR in `docs/adr/`, numbered in order and never rewritten: a changed decision gets a new ADR that supersedes the old one.

## Consequences
New work can start from the written context instead of re-deriving it. The architect stage of the delivery pipeline writes ADRs here, and reviewers check changes against them. The cost is a few minutes per significant decision.
