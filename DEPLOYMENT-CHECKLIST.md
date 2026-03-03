# FFM Website Deployment Checklist

**Purpose:** Prevent deployment bugs and ensure quality before pushing to production.

**Created:** 2026-03-03 (after gallery modal bug incident)

---

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] All changes committed with clear commit messages
- [ ] No console.log() or debugging code left in
- [ ] No commented-out code blocks (unless documented why)
- [ ] No localhost URLs or hardcoded IPs
- [ ] No TODO comments for critical functionality

### 2. Build & Test
```bash
# Run from /Users/clawdbot/clawd/ffm-website/app/

# 1. Clean build
npm run build

# 2. Check for build errors
# If build fails, DO NOT DEPLOY

# 3. Check bundle size warnings
# Large chunks may indicate import issues
```

- [ ] Build completes successfully
- [ ] No TypeScript/ESLint errors
- [ ] No broken imports or missing files

### 3. Manual Testing (CRITICAL)

**Test in LOCAL DEV first:**
```bash
npm run dev
# Visit http://localhost:5173
```

#### Gallery System Tests
- [ ] Can create new category (button opens modal)
- [ ] Modal form works (can type and submit)
- [ ] Can switch between category tabs
- [ ] Can upload photos to selected category
- [ ] Photos appear in correct category
- [ ] Can move photos between categories
- [ ] Can rename category (click edit button)
- [ ] Can delete category
- [ ] Search/filter works
- [ ] Select all works
- [ ] Delete selected works

#### Livestream Tests
- [ ] Events page loads
- [ ] Can view event details
- [ ] Purchase flow works (test mode)
- [ ] "LIVE NOW" shows only for active events
- [ ] Ended events don't show "LIVE NOW"

#### Portal Tests
- [ ] Can log in
- [ ] Dashboard loads
- [ ] All nav tabs work
- [ ] Can create/edit galleries
- [ ] Can upload photos/videos

### 4. Browser Compatibility
Test in multiple browsers if major UI changes:
- [ ] Chrome/Brave (primary)
- [ ] Safari (Mac/iPhone)
- [ ] Firefox
- [ ] Mobile responsive (iPhone/Android)

### 5. JSX Structure Validation

**Common Mistakes:**
- Conditional rendering (`{condition ? ... : ...}`)
- Fragment placement (`<>...</>`)
- Modal/Dialog components (must render outside conditionals)

**Check:**
- [ ] Modals render at component root level (not inside conditionals)
- [ ] Fragments are properly closed
- [ ] Conditional JSX doesn't hide critical UI elements

### 6. Database/Backend

**If SQL migrations were added:**
- [ ] SQL syntax is valid (test in Supabase SQL Editor first)
- [ ] Migrations are documented in commit message
- [ ] RLS policies are correct
- [ ] Indexes are added for new queries

**If Edge Functions were modified:**
- [ ] Edge Function code is tested
- [ ] Error handling is present
- [ ] Deployment command is documented

### 7. Git Workflow
```bash
# 1. Create feature branch
git checkout -b feature/description

# 2. Commit changes
git add .
git commit -m "feat: clear description"

# 3. Push to GitHub
git push origin feature/description

# 4. Create PR on GitHub
# https://github.com/FitFocusMedia/ffm-website/pulls

# 5. Wait for review (or self-review thoroughly)

# 6. If approved, merge to main
# 7. Then deploy
```

- [ ] Changes are in a feature branch (not main)
- [ ] PR created with description
- [ ] Code reviewed (or self-reviewed carefully)
- [ ] Merged to main

### 8. Deployment

```bash
cd /Users/clawdbot/clawd/ffm-website/app

# 1. Ensure on main branch with latest
git checkout main
git pull origin main

# 2. Build
npm run build

# 3. Deploy to GitHub Pages
npm run deploy

# 4. Wait for deployment (check GitHub Actions)
# https://github.com/FitFocusMedia/ffm-website/actions

# 5. Verify in production
# Visit https://fitfocusmedia.com.au
```

- [ ] Deployed successfully (no errors)
- [ ] GitHub Actions workflow passed
- [ ] Changes visible on production site

### 9. Post-Deployment Verification

**CRITICAL: Test on production site**

Visit https://fitfocusmedia.com.au:
- [ ] Home page loads
- [ ] No console errors (F12 → Console)
- [ ] Changed feature works as expected
- [ ] No regressions (old features still work)
- [ ] Mobile view works (test on phone)

**If bugs found:**
- Don't panic
- Document the bug
- Create hotfix branch
- Fix and redeploy
- Learn from mistake

### 10. Communication

- [ ] Notify Brandon if major changes
- [ ] Update documentation if new features
- [ ] Log changes in memory/YYYY-MM-DD.md
- [ ] Update NIGHTSHIFT.md if built during nightshift

---

## Common Mistakes & Lessons Learned

### March 3, 2026 - Gallery Modal Bug

**Mistake:** Modal component was inside a conditional that prevented it from rendering when gallery was empty.

**Code:**
```jsx
{photos.length === 0 ? (
  <div>Empty state</div>
) : (
  <>
    <div>Photo grid</div>
    {showModal && <Modal />}  // ← BUG: Modal only renders when photos exist!
  </>
)}
```

**Fix:** Move modal outside conditional:
```jsx
{showModal && <Modal />}  // ← Always renders when showModal is true

{photos.length === 0 ? (
  <div>Empty state</div>
) : (
  <div>Photo grid</div>
)}
```

**Lesson:** Modals/dialogs should render at component root level, not inside conditionals that might prevent them from mounting.

**Prevention:** Always test UI interactions (click buttons, open modals) BEFORE deploying.

---

### March 3, 2026 - Forgot to Deploy

**Mistake:** Pushed code to GitHub but didn't run `npm run deploy` to deploy to production.

**Result:** Brandon saw old version on production site even though code was in GitHub.

**Fix:** Always run deployment command after merging to main.

**Prevention:** Add this to checklist. Consider automating deployment with GitHub Actions.

---

## Emergency Rollback

If production is broken:

```bash
cd /Users/clawdbot/clawd/ffm-website/app

# 1. Find last working commit
git log --oneline -10

# 2. Checkout that commit
git checkout <commit-hash>

# 3. Redeploy
npm run build
npm run deploy

# 4. Fix issue in separate branch
git checkout main
git checkout -b hotfix/issue-description

# 5. Fix, test, commit, deploy properly
```

---

## Testing Philosophy

**Rule 1:** If you click it, it should work.
**Rule 2:** Test in dev before deploying.
**Rule 3:** Test in production after deploying.
**Rule 4:** If it's broken, fix it before building new features.
**Rule 5:** Quality > Speed. Better to deploy tomorrow than deploy broken today.

---

**Last Updated:** 2026-03-03 23:15  
**Maintained by:** Scarlet (AI Agent)  
**Review Schedule:** Update after each deployment incident
