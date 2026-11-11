# Packaging Guide

## Production build

```bash
npm run build
```

Output: `dist/` — a complete, self-contained extension folder.

## Distributing a ZIP

```bash
cd dist
zip -r ../akbw-importer-0.1.0.zip .
```

> Only ever zip the **contents** of `dist/` (the `manifest.json` must be at
> the archive root).

## Chrome Web Store

1. `npm run build`
2. Zip `dist/` (see above)
3. Prepare store assets (from `public/`):
   - Icon: `icons/128.png`
   - 1280×800 screenshot + small tile + promo
4. Upload at https://chrome.google.com/webstore/devconsole

**Note:** MV3 extensions requesting `<all_urls>` + `tabs` + `scripting` get
extra review scrutiny. For a store listing you typically want to:

- Replace `"matches": ["<all_urls>"]` in `content_scripts` with
  `"http://*/*", "https://*/*"` (still broad but avoids special schemes),
- Keep the permission strings honest and document the privacy policy.

## Versioning

Bump the version in three places (keep them in sync):

1. `package.json` → `"version"`
2. `public/manifest.json` → `"version"`
3. `src/constants/index.ts` → `APP_VERSION`

## Self-hosting / private distribution

Load unpacked from a shared drive, or use `chrome.management.setEnabled` /
enterprise policy to pin the extension. For frequent updates, a versioned
ZIP + a one-line loader script is a practical pattern.

## CI example (GitHub Actions)

```yaml
- uses: actions/setup-node@v4
  with: { node-version: 20, cache: npm }
- run: npm ci
- run: npm run typecheck
- run: npm run lint
- run: npm run build
- uses: actions/upload-artifact@v4
  with:
    name: akbw-importer-dist
    path: ext/dist
```
