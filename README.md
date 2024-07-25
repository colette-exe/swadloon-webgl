# Swadloon on WebGL
Interactive Computer Graphics output

## Features
1. Affine Transformations (translate, rotate, scale)
2. Orthographic and Perspective Projections
3. Blending (alpha blending and varying colors)

## Files
1. index.html
  - main and only html file
  - shaders and buttons configuration
2. main.js
  - js file imported in the html file
  - applies on click events on the buttons
  - connects the logic and UI
3. vertex.js
  - functions used for WebGL, shaders, and drawing
4. functions.js
  - functions for coloring the object
  - custom written draw functions using WebGL primitives to make them work on the object
5. transformation.js
  - all affine transformation functions
6. values.js
  - constant values used
  - colors, vertices, outline, points, configuration values for `function.js`
