---
description: Diagnoses and fixes common reasons for the chat/commands getting stuck (e.g., lock file conflicts, hanging processes).
---

This workflow runs a diagnostic script to identify and resolve environment issues that cause command freezes.

// turbo
1. Run the quick fix script:
   `powershell -ExecutionPolicy Bypass -File c:\Users\user\connect-care\scripts\fix_freeze.ps1`

2. If the issue was related to dependencies, you may want to reinstall:
   `npm install`
