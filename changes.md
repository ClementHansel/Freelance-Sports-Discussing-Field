# 📋 Development Progress Report

This document outlines all the updates and enhancements made during the development and refinement of the **Report Details Modal** and related components in your project.

---

## ✅ Overview of Completed Changes

### 1. 🔧 Component Refactoring

Refactor Vite + React to Next.JS + React 19

- Cleaned and reorganized the JSX layout for improved clarity and maintainability.
- Modularized the component structure to prepare for possible future separation (e.g., image preview, form sections).
- Fix eslint issues

---

### 2. 🖼 Avatar Preview Functionality

- Added avatar preview based on uploaded file or existing avatar URL.
- Supports:
  - 📂 Local image preview via `URL.createObjectURL(file)`
  - 🌐 Display of existing user avatar from remote (e.g., Supabase)

---

### 3. ⚠️ Fixed JSX Syntax Bug

- Original conditional render caused build/runtime errors.
- Corrected nested ternary structure to avoid invalid children in JSX tree.

---

### 4. 🚀 Optimized Image Handling

- Replaced `<img>` (native HTML tag) with Next.js `<Image>` for production optimization.
- Improves:
  - ⏱ Performance (faster LCP)
  - 📉 Bandwidth usage
  - 💤 Lazy loading

---

### 5. ⚙️ Blob vs Remote Handling Logic

- Implemented conditional logic:
  - Uses native `<img>` for local file blobs (`previewUrl`)
  - Uses `<Image>` from `next/image` for external avatar URLs
  - Fallback to "No avatar" message if none available

---

### 6. 🔐 Configured Next.js Remote Image Support

- Ensured external image domains (e.g. Supabase) are declared in `next.config.js`:

```js
module.exports = {
  images: {
    domains: ["your-supabase-domain.supabase.co"],
  },
};
```

---

### 7. 🔐 Add Dashboard

- Centralize admin pages into Dashboard
- Create several Admin role to prepare future scaling and role based management
- Centralized WYSIWYG Editor into 1 Dashboard interface for easy access
- Add preview panel to WYSIWYG for better Admin UX. As the admin will write in MarkDown format, the preview panel will visualize it into JSX. So in realtime Admin can see the changes as what user see
