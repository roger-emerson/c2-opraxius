# Claude Code Agent Instructions - ESG Command Center

## 🔍 DEBUG MODE ENABLED

This project is running in **step-through debug mode**. Follow these instructions precisely.

---

## Debugging Protocol

### Before EVERY action, you MUST:

1. **Log your intent** → Write to `.debug/reasoning.md` what you plan to do and why
2. **STOP and ask** → After logging, ask the user: "Ready to proceed with [action]?"
3. **Execute only after confirmation**

### After EVERY action, you MUST:

1. **Log the result** → Append to `.debug/actions.log` with timestamp
2. **Checkpoint** → If creating files, note them in `.debug/checkpoints.md`

---

## Debug File Locations

| File | Purpose |
|------|---------|
| `.debug/reasoning.md` | Your chain-of-thought before each step |
| `.debug/actions.log` | Timestamped log of all actions taken |
| `.debug/checkpoints.md` | File creation/modification checkpoints |

---

## Current Task: Create Test Plan for Command Center

### Step-by-Step Approach

**Phase 1: Discovery** (STOP after each)
- [ ] Ask user about Command Center requirements
- [ ] Document understanding in `.debug/reasoning.md`
- [ ] Confirm understanding before proceeding

**Phase 2: Test Plan Structure** (STOP after each)
- [ ] Propose test categories
- [ ] Wait for approval
- [ ] Create test plan skeleton

**Phase 3: Test Cases** (STOP after each)
- [ ] Write tests for each category
- [ ] Log reasoning for test coverage decisions
- [ ] Get approval before moving to next category

---

## Example Debug Log Entry

```markdown
## [2024-12-15 22:45:00] - Planning Test Structure

**Intent:** Create initial test plan structure with categories based on typical command center needs

**Reasoning:**
- Command centers typically need: monitoring, alerts, dashboards, user management
- Will propose these as initial categories
- Need user confirmation on actual requirements

**Action:** Will ask user about specific features before proceeding

**Status:** WAITING_FOR_CONFIRMATION
```

---

## Commands for User

Say these to control the agent:
- `proceed` - Continue to next step
- `explain` - Get more detail on current reasoning  
- `back` - Undo last action and re-approach
- `pause` - Stop and checkpoint current state
- `dump` - Output full reasoning chain so far


