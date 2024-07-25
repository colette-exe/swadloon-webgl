// FUNCTIONS USED FOR WEBGL, SHADERS, DRAWING

import { fillColors, drawTriangles, drawTStrip, drawTriangleFan, drawPoints, getColor } from "./functions.js";
import { getPoints, getConfig, namePoints, getMVPMatrices } from "./values.js";

// -- DRAWING --
function drawPokemon(gl, points, config, point_sizes, pointers, transformationMatrix, matrices, blending) {
    // clear the screen before drawing anything
    gl.clearColor(0.08235294, 0.08235294, 0.08235294, 1.0); // blue - RGBA
    gl.clear(gl.COLOR_BUFFER_BIT); //execute

    // multiply the transformation matrix to the vertices
    gl.uniformMatrix4fv(pointers[5], false, new Float32Array(transformationMatrix));
    gl.uniformMatrix4fv(pointers[6], false, new Float32Array(matrices[0]));
    gl.uniformMatrix4fv(pointers[7], false, new Float32Array(matrices[1]));
    gl.uniformMatrix4fv(pointers[8], false, new Float32Array(matrices[2]));

    // set up blending equations
    if (blending[0] > -1) {
        //Must disable depth test to enable blending
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND); // disable for varying colors

        // alpha blending
        if (blending[0] == 0) {
            gl.enable(gl.BLEND); // enable for alpha blending
            gl.blendFunc(blending[1], blending[2]);
            gl.blendEquation(blending[3]);
        }
    } else {
        // for normal coloring
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }

    // draw
    for (let i = 0; i < points.length; i++) {
        // iterate through each set of vertices
        for (let j = 0; j < points[i].length; j++) {
            let primitive = config[i][j][0];
            switch (primitive) {
                case 0: // LINE_STRIP
                    // one color only
                    // COLOR
                    let results = fillColors(getColor(config[i][j][1]), points[i][j].length, config[i][j][2], config[i][j][3], 0);

                    // WRITE DATA
                    gl.enableVertexAttribArray(pointers[2]);
                    gl.bindBuffer(gl.ARRAY_BUFFER,pointers[0]);
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points[i][j]),gl.STATIC_DRAW); // points contain 3 vertices
                    gl.vertexAttribPointer(pointers[2],4,gl.FLOAT,false,0,0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    // COLOR
                    gl.enableVertexAttribArray(pointers[4]);
                    gl.bindBuffer(gl.ARRAY_BUFFER,pointers[1]);
                    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(results[0]),gl.STATIC_DRAW);
                    gl.vertexAttribPointer(pointers[4],4,gl.FLOAT,false,0,0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.drawArrays(gl.LINE_STRIP, 0, points[i][j].length / 4);
                    break;
                case 1: // TRIANGLES
                    drawTriangles(gl,points[i][j],config[i][j],pointers);
                    break;
                case 2: // TRIANGLE_STRIP
                    drawTStrip(gl,points[i][j],config[i][j],pointers);
                    break;
                case 3: // TRIANGLE_FAN
                    drawTriangleFan(gl,points[i][j],config[i][j],pointers);
                    break;
                case 4: // POINTS
                    // draw the points

                    // check type 
                    if (typeof points[i][j][0] == 'object') {
                        for (let k = 0; k < points[i][j].length; k++) {
                            drawPoints(gl, points[i][j][k], config[i][j], point_sizes[i][j], pointers);
                        }
                    }
                    else drawPoints(gl, points[i][j], config[i][j], point_sizes[i][j], pointers);
                    break
                default:
                    break;
            }
        }
    }
}

// -- MAIN FUNCTION (using WebGL) --
function main() {
    // setting the context
    const canvas = document.querySelector("#output");
    if (!canvas) {
        console.log("Canvas element with specified ID ('output') cannot be found.");
    }
    const gl = canvas.getContext('webgl2');

    // Getting the source code from the file
    const vertexShaderSource = document.querySelector('#vertex-shader').text;
    const fragmentShaderSource = document.querySelector('#fragment-shader').text;
    // Function call to createShader; the return value is captured
    // by vertexShader and fragmentShader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Creation and initialization of GL program
    var program = gl.createProgram();
    // Attach pre-existing shaders
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(program);
        throw new Error('Could not compile WebGL program. \n\n' + info);
    }
    // Set the program created earlier
    gl.useProgram(program);

    // clear the screen before drawing anything
    gl.clearColor(0.08235294, 0.08235294, 0.08235294, 1.0); // blue - RGBA
    gl.clear(gl.COLOR_BUFFER_BIT); //execute

    // Declaration of pointers to the attributes
    const aPositionPointer = gl.getAttribLocation(program, 'a_position'); // updating the value of a_position
    const aPointSizePointer = gl.getAttribLocation(program, 'a_point_size');
    const vertexColorPointer = gl.getAttribLocation(program, 'vertexColor'); // pointer for vertex colors

    //Used for affine transformation
    const uTransformationMatrixPointer = gl.getUniformLocation(program, 'u_transformation_matrix');
    const uModelMatrixPointer = gl.getUniformLocation(program, 'u_model_matrix');
    const uViewMatrixPointer = gl.getUniformLocation(program, 'u_view_matrix');
    const uProjectionMatrixPointer = gl.getUniformLocation(program, 'u_projection_matrix');
    // ------------------ VALUES ------------------
    gl.enable(gl.DEPTH_TEST);

    // current values
    document.getElementById("current-origin").innerHTML = "origin (for rotation): (0, 0)";
    document.getElementById("current-position").innerHTML = "position with respect to the origin: (0, 0)";
    document.getElementById("current-angle").innerHTML = "angle: 0";
    document.getElementById("current-scale-values").innerHTML = "scale values: (1, 1)";

    // PROJECTION
    // VIEW
    document.getElementById("x-view-point-value").innerHTML = "0.0";
    document.getElementById("y-view-point-value").innerHTML = "0.0";
    document.getElementById("z-view-point-value").innerHTML = "0.0";
    

    // CENTER
    document.getElementById("x-center-point-value").innerHTML = "0.0";
    document.getElementById("y-center-point-value").innerHTML = "0.0"; 
    document.getElementById("z-center-point-value").innerHTML = "0.0";
    

    // UP VECTOR
    document.getElementById("x-up-vector-value").innerHTML = "0.0";
    document.getElementById("y-up-vector-value").innerHTML = "0.0";
    document.getElementById("z-up-vector-value").innerHTML = "0.0";

    // PROJECTION
    document.getElementById("near-value").innerHTML = "0.0";
    document.getElementById("far-value").innerHTML = "1.0";
    document.getElementById("angle-value").innerHTML = "0.0";

    document.getElementById("colors").disabled = "disabled";
    document.getElementById("src-blend").disabled = "disabled";
    document.getElementById("dst-blend").disabled = "disabled";
    document.getElementById("equation").disabled = "disabled";
    document.getElementById("alpha-blending-btn").disabled = "disabled";
    document.getElementById("random-color-btn").disabled = "disabled";

    // each point size value for every set of points in `vertices`
    let swad_sizes = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]; // 19
    let outline = new Array(138).fill(1.0); // 138
    let name_sizes = [3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0];
    let swad_points_sizes = [3.0, 3.0];

    // name points
    // name: S W A D L O O N
    let name = namePoints();

    // compile configurations into one array (for each config type: vertices, colors, point sizes)
    // let points = [vertices, name, name, swad_points];
    let points = getPoints();
    // let config = [config_swad, config_name, config_name_points, config_swad_points];
    let config = getConfig();
    // console.log(config);
    // let point_sizes = [swad_sizes, name_sizes, name_sizes, swad_points_sizes];
    let point_sizes = [swad_sizes, outline, swad_sizes, swad_points_sizes];

    //set up buffer object
    let shapeBuffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();

    // to easily access pointers
    let pointers = [shapeBuffer, colorBuffer, aPositionPointer, aPointSizePointer, vertexColorPointer, uTransformationMatrixPointer, uModelMatrixPointer, uViewMatrixPointer, uProjectionMatrixPointer];
    let transformationMatrix = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];

    let matrices = getMVPMatrices();
    // ------------------ DRAWING ------------------
    drawPokemon(gl, points, config, point_sizes, pointers, transformationMatrix, matrices, [-1]);

    return [gl, points, config, point_sizes, pointers, matrices];
}

export { main, drawPokemon }