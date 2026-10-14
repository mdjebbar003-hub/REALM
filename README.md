# REALM — Property Empire (v2 prototype)

A free, single-player browser prototype for a property and city-infrastructure management game.

## Files
- `index.html` — page structure and sections
- `style.css` — visual design and responsive layout
- `game.js` — economy rules, construction projects, workers, utilities, demolition, save data
- `app.js` — interface rendering and button interactions

## Run locally
1. Put all four files in the same folder.
2. Open `index.html` in a modern browser.
3. Save data is stored in that browser/device using `localStorage`. Use **Save game** as a manual save reminder; most changes auto-save.
4. Use **New game** to reset the local save.

## Publish free with GitHub Pages
1. Sign in to GitHub and create a new **public** repository named `realm-property-empire`.
2. On the repository page, choose **Add file → Upload files**.
3. Upload `index.html`, `style.css`, `game.js`, and `app.js` to the repository root (not inside another folder).
4. Click **Commit changes**.
5. Open **Settings → Pages**.
6. Under Build and deployment, choose **Deploy from a branch**; select `main` and `/(root)`, then Save.
7. Wait for GitHub Pages to publish, then open the URL shown on the Pages settings screen.

## Economy features in this prototype
- Buy zoned land and choose compatible building plans
- Construction projects reserve workers and take in-game days
- Worker housing provides two additional workers per house, with daily operating costs
- Demolition includes machine hire, permit/safety fee and debris cleanup
- Road, electricity, gas and water facilities cost money to build and maintain
- Missing services reduce rent; completed infrastructure enables city-wide coverage in this prototype
- Daily rent, maintenance, taxes, infrastructure upkeep and worker-housing costs
- Financial ledger and CSV export
- Local save in the current browser

## Important limitations
This is a prototype, not a finished commercial game. Prices, rents, taxes, construction durations and service penalties are illustrative balance values. Infrastructure coverage is simplified to city-wide coverage after one facility; it does not yet model physical pipes, power-grid capacity, road-by-road connectivity, worker salaries beyond housing operating costs, or real market demand. There are no user accounts, multiplayer, cloud saves, backend validation, ads, or real payments. Do not accept real money for this version.

## Next recommended upgrades
1. Add visual connection rules for individual roads and utility networks.
2. Add building occupancy, utility capacity, breakdowns and repairs.
3. Add event-driven market prices and demand by district.
4. Add cloud saves and server-side economy validation before multiplayer.
5. Test retention and voluntary cosmetic purchases before implementing real payments.
