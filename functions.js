// FUNCTIONS USED IN RENDERING THE OBJECT ON THE SCREEN

import { getPalette } from "./values.js";

// normalizes the color
function normalizeColor(color) { 
    let new_color = [], new_value;

    for (let i = 0; i < color.length; i++) {
        new_value = color[i];
        if (i != 3 && i != 7) {
            new_value = color[i] / 255; // normalize the color
        }
        new_color.push(new_value);
    }

    return new_color
}

// assigning specific colors to vertices
// PARAMETERS:
// colors - an array of color values (2 colors)
// length - number of vertices defined
// mode - 1: gradient, 0: plain
// value - 1: dark, 0: light
// gradIdx - keeping track of the current shade used (for gradient coloring)
function fillColors(colors, length, mode, value, gradIdx) {
    var newColors = [];
    
    // gradient
    if (mode == 1) { 
        let light, dark, diff = [], temp;
        light = [colors[0], colors[1], colors[2]];
        dark = [colors[4], colors[5], colors[6]];

        // computation
        if (value == 0) { // start with light
            for (let i = 0; i < dark.length; i++) {
                // get a fraction of the difference between the 'starting color' and 'goal color'
                // add this to the 'starting color'
                temp = (dark[i] - light[i]) * (gradIdx/length);
                diff.push(light[i] + temp);
            }
            gradIdx++; // increment to go to the next shade DARKER than the current
            
            // resetting variables
            if (gradIdx == length) {
                value = 1;
            }
            diff.push(1.0); // push the alpha value at the end
        }
        else if (value == 1) { // start with dark
            for (let i = 0; i < dark.length; i++) {
                temp = (dark[i] - light[i]) * (gradIdx/length);
                diff.push(light[i] + temp);
            }
            gradIdx--; // increment to go to the next shade LIGHTER than the current
            
            // resetting variables
            if (gradIdx == 0) {
                value = 0;
                gradIdx = 1;
            }
            diff.push(1.0);
        }
        // color each vertex with the newly computed color shade
        for (var i = 0; i < length / 4; i++) {
            for (var j = 0; j < 4; j++) {
                newColors.push(diff[j]);
            }
        }
    }
    // plain color
    else if (mode==0) {
        for (var i = 0; i < length / 4; i++) {
            if (value == 1) { // dark
                for (var j=4; j<8; j++) { 
                    newColors.push(colors[j]);
                }
            } else { // light
                for (var j=0; j<4; j++) { 
                    newColors.push(colors[j]);
                }
            }
        }
    }

    // varying colors: -1
    else {
        let r, g, b, a;
        a = 1.0;
        for (var i = 0; i < length / 4; i++) {
            // generate random colors
            r = Math.random();
            g = Math.random();
            b = Math.random();
            
            newColors.push(r);
            newColors.push(g);
            newColors.push(b);
            newColors.push(a);
        }
    }

    return [newColors, gradIdx, value];
}

// returns normalized color at colorIdx
function getColor(colorIdx) {
    // normalize color after getting it from the palette
    var fromPalette = getPalette()[colorIdx];
    var color = normalizeColor(fromPalette)
    
    return color;
}

// apply the correct values depending on the mode
function initMode(mode, value, vertices) {
    let gradIdx = 0;
    if (mode == 1 && value == 1) { // gradient, start from dark
        // set value as the number of triangles specified in the vertices
        gradIdx = vertices.length-1;
    } else if (mode == 1 && value == 0) { // gradient, start from light
        gradIdx = 1;
    } else { // plain color
        // retain the set color mode (0: light, 1: dark)
        gradIdx = value;
    }

    return gradIdx;
}

// ------------------ DRAWING ------------------

// TRIANGLES
// params:
// gl
// vertices
// config: [drawingMode, colorIdx, mode, value, (to be added: gradIdx)]
//  pointers = [shapeBuffer, colorBuffer, aPositionPointer, aPointSizePointer, vertexColorPointer];
function drawTriangles(gl, vertices, config, pointers) {
    var colorIdx, mode, value, color, gradIdx, results;

    // make sure VALUE has the correct value
    config.push(initMode(config[2], config[3], vertices));
    // console.log(config);

    for (let i = 0; i < vertices.length; i++) {
        colorIdx = config[1];
        mode = config[2];
        value = config[3];
        gradIdx = config[4]; // to keep track of the current color shade used

        // get color
        results = fillColors(getColor(colorIdx), vertices[i].length, mode, value, gradIdx);
        color = results[0];

        // update config to keep track of the current color shade used
        config[4] = results[1];
        config[3] = results[2];

        // WRITE DATA
        gl.enableVertexAttribArray(pointers[2]);
        gl.bindBuffer(gl.ARRAY_BUFFER,pointers[0]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices[i]),gl.STATIC_DRAW); // points contain 3 vertices
        gl.vertexAttribPointer(pointers[2],4,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // COLOR
        gl.enableVertexAttribArray(pointers[4]);
        gl.bindBuffer(gl.ARRAY_BUFFER,pointers[1]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(color),gl.STATIC_DRAW);
        gl.vertexAttribPointer(pointers[4],4,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(gl.TRIANGLES, 0, vertices[i].length / 4);
    }
}

// TRIANGLE_STRIP
// combines two triangles into one array and is drawn as a triangle strip
function drawTStrip(gl, vertices, config, pointers) {
    var new_vertices = [], start, vert = [], temp;
    
    // group by 2s
    for (let i = 0; i < vertices.length; i++) {
        temp = [];
        if (i%2==0 && i<vertices.length-1) {
            for (let j = 0; j < vertices[i].length; j++) {
                temp.push(vertices[i][j]);
            }
            for (let j = 8; j < vertices[i+1].length; j++) {
                temp.push(vertices[i+1][j]);
            }
            vert.push(temp);
        }
        
    }
    if (vertices.length % 2 != 0) {
        temp = [];
        for (let j = 0; j < vertices[vertices.length-1].length; j++) {
            temp.push(vertices[vertices.length-1][j]);
        }
        vert.push(temp);
    }
    new_vertices = vert;

    // initialize config variables
    var colorIdx, mode, value, color, gradIdx, results;
    config.push(initMode(config[2], config[3], vertices));

    // start drawing
    for (let i = 0; i < new_vertices.length; i++) {
        colorIdx = config[1];
        mode = config[2];
        value = config[3];
        gradIdx = config[4];

        // get color
        results = fillColors(getColor(colorIdx), new_vertices[i].length, mode, value, gradIdx);
        color = results[0];
        
        // update config to keep track of the current color shade used
        config[4] = results[1];
        config[3] = results[2];
        
        // WRITE DATA
        gl.enableVertexAttribArray(pointers[2]);
        gl.bindBuffer(gl.ARRAY_BUFFER,pointers[0]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(new_vertices[i]),gl.STATIC_DRAW); // points contain 3 vertices
        gl.vertexAttribPointer(pointers[2],4,gl.FLOAT,false,0,0);
        // gl.vertexAttrib1f(pointers[3], point_sizes[i][j]);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // COLOR
        // console.log(baseColor);
        gl.enableVertexAttribArray(pointers[4]);
        gl.bindBuffer(gl.ARRAY_BUFFER,pointers[1]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(color),gl.STATIC_DRAW);
        gl.vertexAttribPointer(pointers[4],4,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, new_vertices[i].length / 4);
    }
}

// TRIANGLE_FAN
// uses the first index as the center point
// combines all the points, alongwith the center point, to one array
// and uses the newly created array to draw a triangle fan
// ONLY PLAIN COLORING
function drawTriangleFan(gl, vertices, config, pointers) {
    // fix vertices
    var new_vertices = [], start; // get the first indices and add to new_vertices
    for (let i = 0; i < vertices.length; i++) {
        if (i == 0) {
            start = 0;
        } else {
            start = 8;
        }
        for (let j = start; j < vertices[i].length; j++)
            new_vertices.push(vertices[i][j])
    }
    // compute center vertex
    // first set of vertices (first triangle)
    //      X - get 0-idx and 1-idx
    var X1, X2, middle, middle_vertex = [];

    // for X values
    X1 = vertices[0][0];
    X2 = vertices[1][0];
    middle = (X1 + X2)/2;

    middle_vertex.push(middle);

    // for Y
    middle_vertex.push(vertices[0][1]);

    middle_vertex.push(0.0);
    middle_vertex.push(1.0);

    var new_new_vertices = [
        middle_vertex[0],
        middle_vertex[1],
        middle_vertex[2],
        middle_vertex[3],
    ];
    for (let i = 0; i < new_vertices.length; i++) {
        new_new_vertices.push(new_vertices[i]);
    }

    var colorIdx, mode, value, color, gradIdx, results;
    config.push(initMode(config[2], config[3], vertices));
    for (let i = 0; i < new_new_vertices.length; i++) {
        colorIdx = config[1];
        mode = config[2];
        value = config[3];
        gradIdx = config[4];

        // get color
        results = fillColors(getColor(colorIdx), new_new_vertices.length, mode, value, gradIdx);
        color = results[0];

        // update config to keep track of the current color shade used
        config[4] = results[1];
        config[3] = results[2];
        
        // WRITE DATA
        gl.enableVertexAttribArray(pointers[2]);
        gl.bindBuffer(gl.ARRAY_BUFFER,pointers[0]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(new_new_vertices),gl.STATIC_DRAW); // points contain 3 vertices
        gl.vertexAttribPointer(pointers[2],4,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // COLOR
        gl.enableVertexAttribArray(pointers[4]);
        gl.bindBuffer(gl.ARRAY_BUFFER,pointers[1]);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(color),gl.STATIC_DRAW);
        gl.vertexAttribPointer(pointers[4],4,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, new_new_vertices.length / 4);
    }
}

// POINTS
// takes in point_sizes along with the same parameters as previous functions
function drawPoints(gl, vertices, config, point_sizes, pointers) {
    var colorIdx, mode, value, color, results;
    // console.log(vertices)
    
    colorIdx = config[1];
    mode = config[2];
    value = config[3];

    results = fillColors(getColor(colorIdx), vertices.length, mode, value, 0);
    color = results[0];
    config[3] = results[2];

    // WRITE DATA
    gl.enableVertexAttribArray(pointers[2]);
    gl.bindBuffer(gl.ARRAY_BUFFER,pointers[0]);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
    gl.vertexAttribPointer(pointers[2],4,gl.FLOAT,false,0,0);
    gl.vertexAttrib1f(pointers[3], point_sizes);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // COLOR
    gl.enableVertexAttribArray(pointers[4]);
    gl.bindBuffer(gl.ARRAY_BUFFER,pointers[1]);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(color),gl.STATIC_DRAW);
    gl.vertexAttribPointer(pointers[4],4,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.drawArrays(gl.POINTS, 0, vertices.length / 4);
}

export { fillColors, drawTriangles, drawTStrip, drawTriangleFan, drawPoints, getColor}