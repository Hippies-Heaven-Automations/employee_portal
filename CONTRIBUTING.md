# 🤝 Contributing Guidelines

Welcome!  
These guidelines ensure that our automation projects stay **organized, transparent, and easy to maintain**, while making it smooth for new teammates to onboard.

---

## 📂 Repository Naming
- Use **kebab-case** (`-` between words).
- Keep names short but descriptive.
- Avoid spaces, uppercase, or special characters.

✅ Examples:  
- `hippies-voice-bot`  
- `hippies-ring-scanner`  
- `hippies-n8n-flows`  
- `hippies-shared-utils`  

---

## 🌿 Branch Setup
We follow a **3-branch workflow**:
- **dev** → development  
- **staging** → testing  
- **main** → production  

---

## 🌱 Branch Naming
Format: `type/short-description`  

**Types**:  
- `feature/` → new feature  
- `bugfix/` → non-critical fix  
- `hotfix/` → urgent production fix  
- `chore/` → maintenance (deps, configs, cleanup)  
- `docs/` → documentation updates  

✅ Examples:  
- `feature/add-dialpad-api`  
- `bugfix/fix-logger-crash`  
- `hotfix/ssl-patch`  
- `chore/update-gitignore`  

---

## 📝 Commit Messages
We follow **Conventional Commits**:

Format:  
<type>(optional scope): short description

**Types**:  
- `feat` → new feature  
- `fix` → bug fix  
- `docs` → documentation only  
- `style` → formatting/linting (no code change)  
- `refactor` → code restructuring (not a fix or feature)  
- `test` → add or update tests  
- `chore` → maintenance tasks  

✅ Examples:  
- `feat: add Dialpad call duration tracking`  
- `fix(auth): correct JWT token expiration handling`  
- `docs: update README with setup instructions`  
- `chore: bump Node.js version in Dockerfile`  

---

## 🔄 Daily Push Transparency
- Push work **at least once per day**.  
- If unfinished, open a **Draft PR** → ensures visibility.  
- Convert to a regular PR when ready for review.  

---

## 🧹 Linting & Testing
- Run linters before committing:  
  - Node.js → `eslint`  
  - Python → `black`, `pylint`  
- Run tests (`npm test` or `pytest`) before pushing.  
- CI/CD workflows will re-check linting and tests automatically.  

---

## 🔒 Secrets & Security
- Never commit API keys, passwords, or `.env` files.  
- Always add `.env` to `.gitignore`.  
- Use **GitHub Secrets** or a password manager for sensitive values.  

---

## 📖 Documentation
Each repo must include:  
- `README.md` → overview + setup steps  
- `.env.example` → required env variables (no real values)  
- `CONTRIBUTING.md` → these guidelines  

---

✨ Following these guidelines helps keep our team in sync, our codebase clean, and our onboarding smooth. Thank you for contributing!
