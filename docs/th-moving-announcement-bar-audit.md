# th-moving-announcement-bar Audit

## Scope checked
- `src/views/components`
- `src/assets/js`
- `src/assets/styles`

## Findings
1. There is **no component template** under `src/views/components` that includes `th-moving-announcement-bar` by name.
2. There is **no JavaScript hook** in `src/assets/js` for `th-moving-announcement-bar`.
3. The only direct reference found in the repository is in `twilight.json` as a home block configuration path:
   - `path`: `home.th-moving-announcement-bar`
   - fields include `announcement_text` and `announcement_link`

## Conclusion
The block appears to be configured in theme settings (`twilight.json`) but its render implementation is currently missing (or named differently) from the components directory.
