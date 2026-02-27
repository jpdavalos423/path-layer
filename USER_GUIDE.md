# PathLayer User Guide

## What PathLayer Does
PathLayer helps you find the best warm-introduction path to people at a target company.

It compares:
- **Shortest-hop path (BFS):** fewest introductions
- **Lowest-friction path (Dijkstra):** easiest social path based on shared context

## Quick Start
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Prepare data:
   ```bash
   pnpm generate:data
   ```
3. Run the app:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Main Workflow
1. Enter your profile in the left panel:
   - Name (optional)
   - School
   - Graduation year (optional)
   - Organizations (choose from the list and/or add your own)
2. Select a target company from the top controls.
3. Choose `Top N` to set how many candidate employees to rank.
4. Click a candidate in the ranking table.
5. Compare:
   - **Weighted Best Path**
   - **Shortest Hop Path**
6. Read the **Edge-Level Breakdown** to understand why the weighted path was chosen.
7. Open **System Metrics** only if you want runtime and graph-size details.

## How Ranking Works
- Primary sort: **lowest weighted friction**
- Secondary sort: **fewest hops**
- Tie-break: candidate name

`Differs? = Yes` means the lowest-friction path is not the same as the fewest-hop path.

## Friction Model
Each edge starts at base cost **10**, then modifiers apply:
- Same school: `-3`
- Shared organizations: `-4` each (capped at `-6` total)
- First-degree edge touching **You**: `-2`
- Same graduation year: `-1`

Final edge cost is clamped to at least `1`.

## Troubleshooting
- **The app opens but shows no data**
  - Run:
  ```bash
  pnpm generate:data
  ```
- **No ranking results for a company**
  - Try another company.
  - Update your school/orgs so your profile is closer to more parts of the network.
- **Path results look surprising**
  - Check `Differs?` and the Edge-Level Breakdown; weighted paths optimize total friction, not only hop count.

## Daily Use Command
After setup, start the app with:
```bash
pnpm dev
```
