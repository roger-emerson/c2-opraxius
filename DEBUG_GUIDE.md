# Debugging Claude Code Agent - Quick Guide

## How to Use This Debug Setup

### 1. Start the Agent with Debug Context

When you start Claude Code on this project, it will read `CLAUDE.md` and enter **step-through debug mode**.

### 2. Monitor Agent Reasoning

Watch these files in real-time as the agent works:

```
.debug/
├── reasoning.md      ← Agent's thought process (WHY)
├── actions.log       ← What the agent DID (timestamped)
├── checkpoints.md    ← Progress snapshots (rollback points)
└── session-state.json ← Machine-readable state
```

**Tip:** Open `.debug/reasoning.md` in a split pane to see the agent's thinking.

### 3. Control Commands

Say these to the Claude Code agent:

| Command | Effect |
|---------|--------|
| `proceed` | Continue to next step |
| `explain` | More detail on current reasoning |
| `back` | Undo last action |
| `pause` | Checkpoint and stop |
| `dump` | Show full reasoning chain |

### 4. Debugging Workflow

```
┌─────────────────────────────────────────────────────────┐
│  1. Agent logs intent to .debug/reasoning.md            │
│                         ↓                               │
│  2. Agent asks: "Ready to proceed with [X]?"            │
│                         ↓                               │
│  3. YOU review and say "proceed" or ask questions       │
│                         ↓                               │
│  4. Agent executes and logs to .debug/actions.log       │
│                         ↓                               │
│  5. Repeat until task complete                          │
└─────────────────────────────────────────────────────────┘
```

### 5. If Something Goes Wrong

1. Check `.debug/checkpoints.md` for last good state
2. Tell agent: `back` to undo
3. Or manually restore from checkpoint

### 6. Sample Prompts to Start

**Option A - Guided Discovery:**
```
Read CLAUDE.md and follow debug mode. 
First, ask me about the Command Center requirements.
```

**Option B - With Requirements:**
```
Read CLAUDE.md and follow debug mode.
Create a test plan for a Command Center with these features:
- Real-time event monitoring dashboard
- Alert management system
- User role management
- Reporting & analytics
```

---

## File Structure After Agent Runs

```
esg-commandcenter/
├── CLAUDE.md                    ← Agent instructions
├── DEBUG_GUIDE.md               ← This file
├── .debug/                      ← Debug artifacts
│   ├── reasoning.md
│   ├── actions.log
│   ├── checkpoints.md
│   └── session-state.json
├── docs/
│   └── TEST_PLAN_TEMPLATE.md    ← Template to fill
└── tests/                       ← Agent creates this
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Observability Tips

### Watch File Changes
```bash
# In terminal, watch debug files update:
watch -n 1 cat .debug/actions.log
```

### Tail Reasoning Live
```bash
tail -f .debug/reasoning.md
```

### JSON State
```bash
cat .debug/session-state.json | jq
```


