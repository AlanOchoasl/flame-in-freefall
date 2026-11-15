# Smooth ambient glow

## Why
The existing decorative glow exposes rectangular gradient boundaries and reverses direction abruptly.

## What Changes
- Nice-to-have visual correction, explicitly requested for implementation by the team.
- Fade every glow edge to transparent, blur its silhouette and use continuous motion.
- Preserve dark/light themes, reduced motion, hidden-tab pausing and pointer transparency.

## Impact
Only the ambient component and its CSS change. No dependencies, assets or datasets are added. Existing NASA PSI data remains unchanged: https://psi.nasa.gov/physci/repo/search?q=combustion.

## No
No changes to dashboard content, scientific calculations or data access.
