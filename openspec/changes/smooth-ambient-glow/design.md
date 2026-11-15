# Design

Keep the existing decorative element. Center all radial gradients inside its box, fade them fully before its boundary, and apply an elliptical mask and modest blur as a final edge falloff. Use theme-specific color variables with the same geometry in both themes.

Replace reflected linear velocity with a sinusoidal trajectory calculated from elapsed animation time. Its position and velocity stay continuous at turning points. Read viewport dimensions only on resize; animate only transform. Pause while hidden and render a stationary glow for reduced motion.

Data flow: cached PSI JSON -> existing data access -> unchanged dashboard. This decorative layer does not read data.
