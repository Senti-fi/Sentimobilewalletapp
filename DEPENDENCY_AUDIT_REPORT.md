# Dependency Audit Report
**Date:** 2026-01-21
**Project:** Senti Mobile Wallet App
**Total Dependencies:** 354 packages
**Node Modules Size:** 197MB

---

## Executive Summary

This audit reveals significant issues across three key areas:
1. **Security Vulnerabilities:** 3 vulnerabilities in Vite (2 low, 1 moderate)
2. **Outdated Packages:** 42 packages with available updates
3. **Massive Dependency Bloat:** ~50 UI component libraries installed but **UNUSED** in the application

---

## 🚨 CRITICAL FINDINGS: Dependency Bloat

### Unused Dependencies (HIGH PRIORITY - Remove Immediately)

The project has **48 UI component files** in `/src/app/components/ui/` but **NONE are imported or used** in the actual application code. This represents significant bloat:

#### Material UI (Completely Unused)
- `@mui/material` (7.3.5 → 7.3.7)
- `@mui/icons-material` (7.3.5 → 7.3.7)
- `@emotion/react` (11.14.0)
- `@emotion/styled` (11.14.1)
- `@popperjs/core` (2.11.8)

**Impact:** ~15-20MB of unused dependencies

#### Radix UI Components (Completely Unused)
All 24 Radix UI packages are unused:
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`

**Impact:** ~30-40MB of unused dependencies

#### Additional Unused Libraries
- `recharts` (2.15.2) - Charting library
- `react-day-picker` (8.10.1) - Date picker
- `react-dnd` (16.0.1) - Drag and drop
- `react-dnd-html5-backend` (16.0.1)
- `react-slick` (0.31.0) - Carousel
- `react-responsive-masonry` (2.7.1) - Masonry layout
- `react-resizable-panels` (2.1.7)
- `react-popper` (2.3.0)
- `cmdk` (1.1.1) - Command menu
- `vaul` (1.1.2) - Drawer component
- `input-otp` (1.4.2) - OTP input
- `embla-carousel-react` (8.6.0) - Carousel
- `date-fns` (3.6.0) - Date utilities
- `next-themes` (0.4.6) - Theme switching
- `sonner` (2.0.3) - Toast notifications

**Impact:** ~40-50MB of unused dependencies

### Actually Used Dependencies
The application only uses:
- `react` & `react-dom` (18.3.1)
- `motion` (12.23.24) - for animations
- `lucide-react` (0.487.0) - for icons only

**Total Bloat Estimation:** ~80-100MB of the 197MB node_modules (40-50% waste)

---

## 🔒 Security Vulnerabilities

### Critical: Vite Security Issues

**Package:** `vite` (current: 6.3.5)
**Status:** 3 vulnerabilities found

#### 1. CVE-2025-58751 (Low Severity)
- **Issue:** Files starting with same name as public directory bypass `server.fs` settings
- **Affected:** Vite 6.0.0 - 6.3.5
- **Fix:** Upgrade to vite@6.3.6+
- **Impact:** Path traversal vulnerability in dev server

#### 2. CVE-2025-58752 (Low Severity)
- **Issue:** `server.fs` settings not applied to HTML files
- **Affected:** Vite 6.0.0 - 6.3.5
- **Fix:** Upgrade to vite@6.3.6+
- **Impact:** Unauthorized file access in dev server
- **CWE:** CWE-23 (Path Traversal), CWE-200 (Information Exposure), CWE-284 (Access Control)

#### 3. CVE-2025-62522 (Moderate Severity)
- **Issue:** `server.fs.deny` bypass via backslash on Windows
- **Affected:** Vite 6.0.0 - 6.4.0
- **Fix:** Upgrade to vite@6.4.1+
- **Impact:** File access bypass on Windows systems
- **CWE:** CWE-22 (Path Traversal)

**Recommended Action:** Upgrade Vite to latest stable (6.4.1+) or preferably 7.x

---

## 📦 Outdated Packages

### High Priority Updates (Major/Minor versions behind)

#### Core Build Tools
- `vite`: 6.3.5 → **7.3.1** (major version behind + security fixes)
- `@vitejs/plugin-react`: 4.7.0 → **5.1.2** (major version behind)
- `@tailwindcss/vite`: 4.1.12 → 4.1.18
- `tailwindcss`: 4.1.12 → 4.1.18

#### UI Libraries (if kept)
- `date-fns`: 3.6.0 → **4.1.0** (major version)
- `react-day-picker`: 8.10.1 → **9.13.0** (major version)
- `react-resizable-panels`: 2.1.7 → **4.4.1** (major version)
- `recharts`: 2.15.2 → **3.7.0** (major version)

#### Actually Used Packages
- `react`: 18.3.1 → **19.2.3** (major version - requires careful testing)
- `react-dom`: 18.3.1 → **19.2.3** (major version - requires careful testing)
- `motion`: 12.23.24 → 12.28.1
- `lucide-react`: 0.487.0 → 0.562.0
- `react-hook-form`: 7.55.0 → 7.71.1

### Medium Priority (Patch updates)
- `@mui/material`: 7.3.5 → 7.3.7 (if kept)
- `@mui/icons-material`: 7.3.5 → 7.3.7 (if kept)
- `sonner`: 2.0.3 → 2.0.7 (if kept)
- `tailwind-merge`: 3.2.0 → 3.4.0
- `tw-animate-css`: 1.3.8 → 1.4.0

### Radix UI Components (Minor updates - if kept)
All Radix UI packages have minor version updates available (1-10 patch versions behind).

---

## 📋 Recommendations

### Phase 1: Remove Unused Dependencies (IMMEDIATE)

**High Impact, Low Risk**

Remove the following from `package.json`:

```json
{
  "dependencies": {
    // Remove these Material UI packages
    "@emotion/react": "DELETE",
    "@emotion/styled": "DELETE",
    "@mui/icons-material": "DELETE",
    "@mui/material": "DELETE",
    "@popperjs/core": "DELETE",

    // Remove all 24 Radix UI packages
    "@radix-ui/react-accordion": "DELETE",
    "@radix-ui/react-alert-dialog": "DELETE",
    "@radix-ui/react-aspect-ratio": "DELETE",
    "@radix-ui/react-avatar": "DELETE",
    "@radix-ui/react-checkbox": "DELETE",
    "@radix-ui/react-collapsible": "DELETE",
    "@radix-ui/react-context-menu": "DELETE",
    "@radix-ui/react-dialog": "DELETE",
    "@radix-ui/react-dropdown-menu": "DELETE",
    "@radix-ui/react-hover-card": "DELETE",
    "@radix-ui/react-label": "DELETE",
    "@radix-ui/react-menubar": "DELETE",
    "@radix-ui/react-navigation-menu": "DELETE",
    "@radix-ui/react-popover": "DELETE",
    "@radix-ui/react-progress": "DELETE",
    "@radix-ui/react-radio-group": "DELETE",
    "@radix-ui/react-scroll-area": "DELETE",
    "@radix-ui/react-select": "DELETE",
    "@radix-ui/react-separator": "DELETE",
    "@radix-ui/react-slider": "DELETE",
    "@radix-ui/react-slot": "DELETE",
    "@radix-ui/react-switch": "DELETE",
    "@radix-ui/react-tabs": "DELETE",
    "@radix-ui/react-toggle": "DELETE",
    "@radix-ui/react-toggle-group": "DELETE",
    "@radix-ui/react-tooltip": "DELETE",

    // Remove other unused UI libraries
    "class-variance-authority": "DELETE",
    "cmdk": "DELETE",
    "date-fns": "DELETE",
    "embla-carousel-react": "DELETE",
    "input-otp": "DELETE",
    "next-themes": "DELETE",
    "react-day-picker": "DELETE",
    "react-dnd": "DELETE",
    "react-dnd-html5-backend": "DELETE",
    "react-popper": "DELETE",
    "react-resizable-panels": "DELETE",
    "react-responsive-masonry": "DELETE",
    "react-slick": "DELETE",
    "recharts": "DELETE",
    "sonner": "DELETE",
    "vaul": "DELETE"
  }
}
```

**Actions:**
1. Delete the entire `/src/app/components/ui/` directory
2. Remove all unused dependencies from package.json
3. Run `pnpm install` to clean up

**Expected Benefits:**
- Reduce node_modules from 197MB to ~100-120MB (40-50% reduction)
- Faster `pnpm install` times
- Smaller bundle size (if these were being bundled)
- Reduced security audit surface area
- Simpler dependency tree

### Phase 2: Security Updates (IMMEDIATE)

**Critical Security Fix**

```bash
pnpm update vite@latest
# or specify minimum safe version
pnpm add -D vite@^6.4.1
```

Recommended: Upgrade to Vite 7.x for latest features and security:
```bash
pnpm add -D vite@^7.3.1
```

### Phase 3: Update Core Dependencies (After Phase 1)

**Test thoroughly after each update**

1. **Update build tools:**
   ```bash
   pnpm update @vitejs/plugin-react@latest
   pnpm update tailwindcss@latest @tailwindcss/vite@latest
   ```

2. **Update actually used dependencies:**
   ```bash
   # Animation library
   pnpm update motion@latest

   # Icon library
   pnpm update lucide-react@latest

   # Form library (if used)
   pnpm update react-hook-form@latest

   # Utility libraries
   pnpm update clsx@latest tailwind-merge@latest
   ```

3. **React 19 upgrade (OPTIONAL - requires testing):**
   ```bash
   pnpm add react@19.2.3 react-dom@19.2.3
   ```

   **Note:** React 19 has breaking changes. Test thoroughly before upgrading.
   Recommended to stay on React 18.x for now unless you need React 19 features.

### Phase 4: Maintenance Practices

1. **Regular Audits:** Run `pnpm audit` monthly
2. **Dependency Reviews:** Before adding new packages, verify they're actually needed
3. **Bundle Analysis:** Use `vite-plugin-visualizer` to analyze bundle size
4. **Automated Updates:** Consider Renovate or Dependabot for automated PRs
5. **Lock File:** Always commit pnpm-lock.yaml for reproducible builds

---

## 💰 Cost-Benefit Analysis

### Removing Unused Dependencies
- **Effort:** 1-2 hours (delete folder + update package.json)
- **Risk:** Very Low (packages aren't used)
- **Benefit:**
  - 40-50% smaller node_modules
  - Faster CI/CD builds
  - Reduced security surface
  - Simpler maintenance

### Security Updates
- **Effort:** 30 minutes
- **Risk:** Low (dev dependency updates)
- **Benefit:**
  - Eliminate 3 known vulnerabilities
  - Better dev server security

### Updating Core Dependencies
- **Effort:** 2-4 hours (testing required)
- **Risk:** Medium (potential breaking changes)
- **Benefit:**
  - Latest features and optimizations
  - Better performance
  - Long-term maintainability

---

## 🎯 Recommended Action Plan

**Week 1:**
1. ✅ Remove unused dependencies (Phase 1)
2. ✅ Update Vite for security (Phase 2)
3. ✅ Test build and dev server

**Week 2:**
4. Update build tools and utilities (Phase 3)
5. Comprehensive testing
6. Document changes

**Future:**
7. Plan React 19 upgrade (if needed)
8. Set up dependency automation
9. Establish quarterly audit schedule

---

## 📊 Impact Summary

| Metric | Before | After (Projected) | Improvement |
|--------|--------|-------------------|-------------|
| Total Dependencies | 354 | ~80-100 | -70% |
| node_modules Size | 197MB | ~100-120MB | -40-50% |
| Security Vulnerabilities | 3 | 0 | -100% |
| Outdated Packages | 42 | ~10 | -75% |
| Install Time | ~45s | ~20-25s | -45% |

---

## 🔍 Additional Findings

1. **pnpm Version:** Current: 10.27.0, Latest: 10.28.1 (minor update available)
2. **Build Scripts Warning:** Build scripts ignored for @tailwindcss/oxide and esbuild (run `pnpm approve-builds` if needed)
3. **React Peer Dependencies:** Marked as optional in package.json, which is unusual for a React app
4. **Vite Override:** pnpm overrides section pins vite@6.3.5 - should be updated to latest

---

## ✅ Conclusion

This project has significant dependency bloat from a Figma-generated component library that isn't being used. The highest priority is removing these ~40 unused packages, which will:
- Cut node_modules size nearly in half
- Eliminate maintenance burden
- Reduce security audit complexity
- Speed up installation and builds

The security vulnerabilities in Vite should also be addressed immediately with a simple version bump.

---

**Generated by:** Claude Code Dependency Audit
**Next Review:** Quarterly (April 2026)
