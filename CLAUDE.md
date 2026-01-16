# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI prompt framework and standards system for structured software development workflows. It follows a Research → Create → Generate → Execute workflow that breaks down complex projects into manageable pieces with built-in checkpoints and approval gates.

**Key point:** This is NOT a compiled codebase - it's a collection of prompt templates and organizational standards in Markdown. There are no build, test, or lint commands.

## Architecture

### Workflow Phases

```
RESEARCH → CREATE → GENERATE → EXECUTE
    ↓         ↓         ↓          ↓
   RSD    PRD/CRD/DRD  tasks-*   Implementation
```

1. **Research Phase** (`research.md`): Ask clarifying questions, conduct internal/external research, output RSD
2. **Create Phase**: Choose appropriate document type:
   - `create-prd.md` → Product requirements (features & functionality)
   - `create-crd.md` → Content requirements (copy, messaging)
   - `create-drd.md` → Design requirements (UI, visuals)
3. **Generate Phase** (`generate-tasks.md`): Convert requirements to hierarchical task list
4. **Execute Phase** (`execute-tasks.md`): Work through tasks with pause-and-approve checkpoints

### Directory Structure

- `/standards/` - Corporate standards system
  - `standards-manifest.yml` - Central version & phase mapping
  - `global/` - Standards that apply to ALL phases (principles, security, accessibility, terminology)
  - `domains/` - Domain-specific standards (code-architecture, content-voice, design-ui)
  - `phases/` - Phase-specific rules
- `/tasks/` - Auto-created output directory for RSD, PRD, CRD, DRD, and task files
- Root `.md` files - Prompt templates for each workflow phase

### Standards System

All outputs must track standards compliance. Standards use rule IDs (e.g., CODE-1, VOICE-2, DESIGN-5):
- **Musts** (1-9): Non-negotiable rules
- **Shoulds** (10+): Strong recommendations

Every generated document should include applied standards and any deviations with justification.

## Key Conventions

### Target Platform
When generating code, the primary target is **.NET/C#** with these patterns:
- Clean Architecture (Domain/Application/Infrastructure/Presentation layers)
- Nullable reference types enabled
- Async all the way
- Result pattern over exceptions
- MediatR/CQRS for commands/queries

### Design System
UI follows a Linear.app-inspired aesthetic:
- Dark mode primary
- Muted colors with subtle gradients
- Generous whitespace
- Keyboard-first (Cmd+K command palette)

### Document Output Format
All generated documents use YAML frontmatter:
```markdown
---
standards_version: 1.0.0
applied_standards:
  - global/principles.md
  - domains/code-architecture.md
---
```

### Task Execution Pattern
- Hierarchical parent/child task structure
- Pause for approval between sub-tasks
- Auto-commit on parent task completion
- Task 0.0 is always "Create feature branch"
