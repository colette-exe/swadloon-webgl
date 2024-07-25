// MAIN FILE - event listeners, called in the html file

import { main, drawPokemon } from "./vertex.js";
import { getPoints, getConfig, getMatrices, getValues, getMVPMatrices, getPointBlend, getConfigBlend, getPointSizes, getPointSizesBlend } from "./values.js";
import { translate, scale, rotate, reset, matrixMul, currMulNew, setToIdentity } from "./transformation.js"

// draw once
window.onload = function () {
    var mats = getMatrices();
    var transformationMatrix = Object.assign([], mats[0]);
    var inputValues = getValues(); //  [translateCoords, rotateValues, scaleValues]
    var values = main(); // [gl, points, config, point_sizes pointers, matrices]
    var mvpMatrices = getMVPMatrices();
    var varyingColorsConfig = [];
    var blendConfig = [-1];

    // transformation
    function translatePokemon() {
        console.log("translate [executed]")
        let checked_blend = document.getElementById("blend-checkbox").checked;
        if (!checked_blend) values[2] = getConfig(); // make sure the config hasnt changed
        else {
            if (document.querySelector('#colors').value == 'alpha-blending')
                values[2] = getConfigBlend();
            else {
                if (varyingColorsConfig.length != 0) // blend buttin has been clicked
                    values[2] = Object.assign([], varyingColorsConfig);
                else
                    values[2] = getConfig();
            }
        }

        // get values from the input boxes
        let x = (document.getElementById("x-units")).value;
        x = x == "" ? 0 : parseFloat(x);
        let y = (document.getElementById("y-units")).value;
        y = y == "" ? 0 : parseFloat(y);

        // update position
        inputValues[0][0]+=x;
        inputValues[0][1]+=y;

        // update values displayed
        updateValuesDisplayed();

        // add to transformation matrices
        addToTransMat(translate(x, y), "translate");

        // redraw
        drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
    }

    function scalePokemon() {
        console.log("scale [executed]");
        let checked_blend = document.getElementById("blend-checkbox").checked;
        if (!checked_blend) values[2] = getConfig(); // make sure the config hasnt changed
        else {
            if (document.querySelector('#colors').value == 'alpha-blending')
                values[2] = getConfigBlend();
            else {
                if (varyingColorsConfig.length != 0) // blend buttin has been clicked
                    values[2] = Object.assign([], varyingColorsConfig);
                else
                    values[2] = getConfig();
            }
        }

        // get values from the input boxes
        let Sx = (document.getElementById("x-scale")).value;
        Sx = Sx == "" ? 1 : parseFloat(Sx);
        let Sy = (document.getElementById("y-scale")).value;
        Sy = Sy == "" ? 1 : parseFloat(Sy);
        inputValues[2][0] = Sx;
        inputValues[2][1] = Sy;

        // update values displayed
        updateValuesDisplayed();

        // add to transformation matrices
        addToTransMat(scale(Sx, Sy), "scale");

        // redraw
        drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
    }

    function rotatePokemon() {
        console.log("rotate [executed]");
        let checked_blend = document.getElementById("blend-checkbox").checked;
        if (!checked_blend) values[2] = getConfig(); // make sure the config hasnt changed
        else {
            if (document.querySelector('#colors').value == 'alpha-blending')
                values[2] = getConfigBlend();
            else {
                if (varyingColorsConfig.length != 0) // blend buttin has been clicked
                    values[2] = Object.assign([], varyingColorsConfig);
                else
                    values[2] = getConfig();
            }
        }

        // get values from the input boxes
        let origin_x = (document.getElementById("anchor-point-x")).value;

        // here, the default value of the origin coordinates is the inverse of the current position of the object
        //      so that when rotating, it will still rotate at the default origin (0,0)
        // if there's a specified anchor point, subtract the current position from the anchor point
        //      so that the anchor points' values will be based off of the default origin (0,0)
        origin_x = (origin_x == "" || origin_x == "0") ? -inputValues[0][0] : parseFloat(origin_x)-inputValues[0][0];
        let origin_y = (document.getElementById("anchor-point-y")).value;
        origin_y = (origin_y == "" || origin_y == "0") ? -inputValues[0][1] : parseFloat(origin_y)-inputValues[0][1];
        let angle = (document.getElementById("angle")).value;
        angle = angle == "" ? 0 : parseFloat(angle);
        inputValues[1][0] = [origin_x, origin_y];
        inputValues[1][1] = angle;
        
        // update values displayed
        updateValuesDisplayed();

        // add to transformation matrices
        addToTransMat(rotate(inputValues[1][0], angle), "rotate");

        // redraw
        drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
    }

    // resetting values and the view
    function resetPokemon() {
        console.log("reset [executed]");
        values[1] = getPoints();
        values[2] = getConfig();
        values[3] = getPointSizes();
        inputValues = getValues();
        varyingColorsConfig = [];
        blendConfig = [-1];

        // reset input box values
        (document.getElementById("x-units")).value = "";
        (document.getElementById("y-units")).value = "";
        (document.getElementById("x-scale")).value = "";
        (document.getElementById("y-scale")).value = "";
        (document.getElementById("anchor-point-x")).value = "";
        (document.getElementById("anchor-point-y")).value = "";
        (document.getElementById("angle")).value = "";
        document.getElementById("current-origin").innerHTML = "origin (for rotation): (0, 0)";
        document.getElementById("current-position").innerHTML = "position with respect to the origin: (0, 0)";
        document.getElementById("current-angle").innerHTML = "angle: 0";
        document.getElementById("current-scale-values").innerHTML = "scale values: (1, 1)";

        // reset slidebars 
        // ---------- MODEL ----------
        document.getElementById("angle-slider").value = 0;

        // ---------- VIEW MATRIX ----------
        // view point
        document.getElementById("x-view-point").value = 0;
        document.getElementById("y-view-point").value = 0;
        document.getElementById("z-view-point").value = 0;

        // center point
        document.getElementById("x-center-point").value = 0;
        document.getElementById("y-center-point").value = 0;
        document.getElementById("z-center-point").value = 0;

        // up vector
        document.getElementById("x-up-vector").value = 0;
        document.getElementById("y-up-vector").value = 0;
        document.getElementById("z-up-vector").value = 0;

        // ---------- PROJECTION ----------
        document.getElementById("near").value = 0;
        document.getElementById("far").value = 1;

        document.getElementById("left").value = "";
        document.getElementById("right").value = "";
        document.getElementById("top").value = "";
        document.getElementById("bottom").value = "";

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

        // UP VECTOR
        document.getElementById("near-value").innerHTML = "0.0";
        document.getElementById("far-value").innerHTML = "1.0";
        document.getElementById("angle-value").innerHTML = "0.0";

        document.getElementById("pers-checkbox").checked = false;

        document.getElementById("blend-checkbox").checked = false;
        document.getElementById("colors").disabled = true;
        document.getElementById("src-blend").disabled = true;
        document.getElementById("dst-blend").disabled = true;
        document.getElementById("equation").disabled = true;
        document.getElementById("alpha-blending-btn").disabled = true;
        document.getElementById("random-color-btn").disabled = true;


        // add to transformation matrices
        addToTransMat(reset(), "reset");

        mvpMatrices = getMVPMatrices();

        // redraw
        drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
    }

    // computing multiple transformations
    // scale x rotation x translation
    function addToTransMat(mat, func) {

        // each element in the global variable `mat` are matrices for scale, rotate, and translate
        // this function makes it so that what is kept in these matrices are the combination of all
        // the scale, rotation, and translation operations done
        if (func == "scale") {
            mats[0] = currMulNew(mats[0], mat);
        }
        else if (func == "rotate") {
            mats[1] = currMulNew(mats[1], mat);
        }
        else if (func == "translate") {
            mats[2] = currMulNew(mats[2], mat);
        }
        else { // reset
            mats[0] = setToIdentity(mats[0]);
            mats[1] = setToIdentity(mats[1]);
            mats[2] = setToIdentity(mats[2]);
            transformationMatrix = reset();
        }

        transformationMatrix = matrixMul(mats);// redraw
        // return transformMat;
    }

    // updating values displayed 
    function updateValuesDisplayed() {
        let origin_x = (document.getElementById("anchor-point-x")).value;
        if (origin_x == "") origin_x = 0;
        let origin_y = (document.getElementById("anchor-point-y")).value;
        if (origin_y == "") origin_y = 0;

        document.getElementById("current-origin").innerHTML = "origin (for rotation): (" + origin_x + ", " + origin_y + ")";
        document.getElementById("current-position").innerHTML = "position with respect to the origin: (" + inputValues[0][0] + ", " + inputValues[0][1] + ")";
        document.getElementById("current-angle").innerHTML = "angle: " + inputValues[1][1];
        document.getElementById("current-scale-values").innerHTML = "scale values: (" + inputValues[2][0] + ", " + inputValues[2][1] + ")";
    }

    function updateProjection() {
        let checked_blend = document.getElementById("blend-checkbox").checked;
        if (!checked_blend) values[2] = getConfig(); // make sure the config hasnt changed
        else {
            if (document.querySelector('#colors').value == 'alpha-blending')
                values[2] = getConfigBlend();
            else {
                if (varyingColorsConfig.length != 0) // blend buttin has been clicked
                    values[2] = Object.assign([], varyingColorsConfig);
                else
                    values[2] = getConfig();
            }
        }

        // ---------- MODEL ----------
        let angle = parseFloat(document.getElementById("angle-slider").value);

        // ---------- VIEW MATRIX ----------
        // view point
        let viewX = parseFloat(document.getElementById("x-view-point").value);
        let viewY = parseFloat(document.getElementById("y-view-point").value);
        let viewZ = parseFloat(document.getElementById("z-view-point").value);

        // center point
        let centerX = parseFloat(document.getElementById("x-center-point").value);
        let centerY = parseFloat(document.getElementById("y-center-point").value);
        let centerZ = parseFloat(document.getElementById("z-center-point").value);

        // up vector
        let upX = parseFloat(document.getElementById("x-up-vector").value);
        let upY = parseFloat(document.getElementById("y-up-vector").value);
        let upZ = parseFloat(document.getElementById("z-up-vector").value);

        // ---------- PROJECTION ----------
        let left = document.getElementById("left").value == "" ? -1 : parseFloat(document.getElementById("left").value);
        let right = document.getElementById("right").value == "" ? 1 : parseFloat(document.getElementById("right").value);
        let top = document.getElementById("top").value == "" ? 1 : parseFloat(document.getElementById("top").value);
        let bottom = document.getElementById("bottom").value == "" ? -1 : parseFloat(document.getElementById("bottom").value);
        let near = document.getElementById("near").value == "" ? 0 : parseFloat(document.getElementById("near").value);
        let far = document.getElementById("far").value == "" ? 1 : parseFloat(document.getElementById("far").value);
        let checked = document.getElementById("pers-checkbox").checked;

        // matrices
        // setup model matrix;
        const modelMatrix = glMatrix.mat4.create();
        glMatrix.mat4.rotateZ(modelMatrix, modelMatrix, glMatrix.glMatrix.toRadian(angle));
        
        // setup view matrix
        const viewMatrix = glMatrix.mat4.create();
        // view, center, up vector
        glMatrix.mat4.lookAt(viewMatrix,[viewX,viewY,viewZ,1],[centerX,centerY,centerZ,1],[upX,upY,upZ,0]);
        
        // setup projection matrix
        const projectionMatrix = glMatrix.mat4.create();
        if (!checked) { // ortho
            console.log("[ orthogonal ]");
            glMatrix.mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);
        } else { // perspective
            console.log("[ perspective ]");
            glMatrix.mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(angle), Math.abs(top) / Math.abs(right), near, far);
        }

        mvpMatrices[0] = modelMatrix;
        mvpMatrices[1] = viewMatrix;
        mvpMatrices[2] = projectionMatrix;
        // console.log(transformationMatrix);

        // redraw
        drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);

    }

    // for blending
    function blending() {
        let checked = document.getElementById("blend-checkbox").checked;

        if (!checked) { // disable all buttons for blending
            // reset values
            values[1] = getPoints();
            values[2] = getConfig();
            values[3] = getPointSizes();
            
            document.getElementById("colors").disabled = true;
            document.getElementById("src-blend").disabled = true;
            document.getElementById("dst-blend").disabled = true;
            document.getElementById("equation").disabled = true;
            document.getElementById("alpha-blending-btn").disabled = true;
            document.getElementById("random-color-btn").disabled = true;

            drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, [-1]);
        } else {
            document.getElementById("colors").disabled = false;
            // check which between alpha blending and varying colors is picked
            // enable buttons depending on which coloring mode was picked
            let selectElement = document.querySelector('#colors');
            let chosen = (selectElement.value);
            
            // for alpha blending
            if (chosen == 'alpha-blending') {
                // reset values
                values[1] = getPointBlend();
                values[2] = getConfigBlend();
                values[3] = getPointSizesBlend();
                varyingColorsConfig = [];

                document.getElementById("src-blend").disabled = false;
                document.getElementById("dst-blend").disabled = false;
                document.getElementById("equation").disabled = false;
                document.getElementById("alpha-blending-btn").disabled = false;
                document.getElementById("random-color-btn").disabled = true;

                drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
            }
            
            // for varying colors
            else {
                // reset values
                values[1] = getPoints();
                values[2] = getConfig();
                values[3] = getPointSizes();
                blendConfig = [1];

                document.getElementById("src-blend").disabled = true;
                document.getElementById("dst-blend").disabled = true;
                document.getElementById("equation").disabled = true;
                document.getElementById("alpha-blending-btn").disabled = true;
                document.getElementById("random-color-btn").disabled = false;

                drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
            }
            
        }
    }

    // setting up alpha blending variables
    function setUpAlphaBlending() {
        console.log('blend is clicked');
        values[1] = getPointBlend();
        values[2] = getConfigBlend();
        values[3] = getPointSizesBlend();
        varyingColorsConfig = [];
        
        // set up blend equations
        // get values
        let src_input = document.querySelector('#src-blend').value;
        let dst_input = document.querySelector('#dst-blend').value;
        let eq_input = document.querySelector('#equation').value;

        // get constant values
        let src, dst, eq;
        src = getConstant(values[0], src_input);
        dst = getConstant(values[0], dst_input);
        eq = getEquation(values[0], eq_input);

        // 0: alpha blending, 1: varying colors
        let blending = [0, src, dst, eq]; // new parameter for drawPokemon that contains color blending information
        blendConfig = Object.assign([], blending);
        drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
    }

    // retirns constant values for gl.blendFunc
    function getConstant(gl, input) {
        let res;
        switch (input) {
            case "ZERO":
                res = gl.ZERO;
                break;
            
            case "ONE":
                res = gl.ONE;
                break;
            
            case "SRC_COLOR":
                res = gl.SRC_COLOR;
                break;
            
            case "ONE_MINUS_SRC_COLOR":
                res = gl.ONE_MINUS_SRC_COLOR;
                break;
            
            case "DST_COLOR":
                res = gl.DST_COLOR;
                break;
            
            case "ONE_MINUS_DST_COLOR":
                res = gl.ONE_MINUS_DST_COLOR;
                break;
            
            case "SRC_ALPHA":
                res = gl.SRC_ALPHA;
                break;
            
            case "ONE_MINUS_SRC_ALPHA":
                res = gl.ONE_MINUS_SRC_ALPHA;
                break;
            
            case "DST_ALPHA":
                res = gl.DST_ALPHA;
                break;
            
            case "ONE_MINUS_DST_ALPHA":
                res = gl.ONE_MINUS_DST_ALPHA;
            break;
        
            case "CONSTANT_COLOR":
                res = gl.CONSTANT_COLOR;
                break;
            
            case "ONE_MINUS_CONSTANT_COLOR":
                res = gl.ONE_MINUS_CONSTANT_COLOR;
                break;
            
            case "CONSTANT_ALPHA":
                res = gl.CONSTANT_ALPHA;
                break;
            
            case "ONE_MINUS_CONSTANT_ALPHA":
                res = gl.ONE_MINUS_CONSTANT_ALPHA;
                break;
            
            case "SRC_ALPHA_SATURATE":
                res = gl.SRC_ALPHA_SATURATE;
                break;
        
            default:
                res = gl.ONE;
                break;
        }
        return res;
    }

    // return constant values for gl.blendFuncEquation
    function getEquation(gl, input) {
        switch (input) {
            case "FUNC_ADD":
                return gl.FUNC_ADD;
            
            case "FUNC_SUBTRACT":
                return gl.FUNC_SUBTRACT;
        
            default:
                return gl.FUNC_ADD;
        }
    }

    // keeping track of whether 
    function generateRandColors() {
        blendConfig = [1];
        // change each config mode as -1 (config[1])
        // mode -1 is for generating random colors
        if (varyingColorsConfig.length == 0) {
            for (let i = 0; i < values[2].length; i++) {
                for (let j = 0; j < values[2][i].length; j++) {
                    values[2][i][j][2] = -1;
                }
            }
            // copy the updated config to a separate variable
            // this variable is used for drawing while randomizing the colors
            varyingColorsConfig = Object.assign([], values[2]);
        }
        else // the variable has already been populated so just reassign
            values[2] = Object.assign([],varyingColorsConfig);

        drawPokemon(values[0], values[1], values[2], values[3], values[4], transformationMatrix, mvpMatrices, blendConfig);
    }

    //Event listeners for user inputs for the transformations
    document.getElementById("translate-btn").addEventListener("click", function () {translatePokemon()});
    document.getElementById("rotate-btn").addEventListener("click", function () {rotatePokemon()});
    document.getElementById("scale-btn").addEventListener("click",function () {scalePokemon()});
    document.getElementById("reset-btn").addEventListener("click", function () { resetPokemon() });
    
    // view-point
    document.getElementById("x-view-point").oninput = function () { document.getElementById("x-view-point-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("y-view-point").oninput = function () { document.getElementById("y-view-point-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("z-view-point").oninput = function () { document.getElementById("z-view-point-value").innerHTML = this.value; updateProjection(); };

    // center-point
    document.getElementById("x-center-point").oninput = function () { document.getElementById("x-center-point-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("y-center-point").oninput = function () { document.getElementById("y-center-point-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("z-center-point").oninput = function () { document.getElementById("z-center-point-value").innerHTML = this.value; updateProjection(); };

    // up-vector
    document.getElementById("x-up-vector").oninput = function () { document.getElementById("x-up-vector-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("y-up-vector").oninput = function () { document.getElementById("y-up-vector-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("z-up-vector").oninput = function () { document.getElementById("z-up-vector-value").innerHTML = this.value; updateProjection(); };

    // perspective
    // document.getElementById("upd-project").addEventListener("click", function () { updateProjection() });
    document.getElementById("pers-checkbox").onclick = function () { updateProjection() };
    document.getElementById("upd-project").addEventListener("click", function () { updateProjection() });
    document.getElementById("near").oninput = function () { document.getElementById("near-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("far").oninput = function () { document.getElementById("far-value").innerHTML = this.value; updateProjection(); };
    document.getElementById("angle-slider").oninput = function () { document.getElementById("angle-value").innerHTML = this.value; updateProjection(); };

    // coloring
    document.getElementById("blend-checkbox").onclick = function () { blending() };
    document.getElementById("colors").oninput = function () { blending() };
    document.getElementById("alpha-blending-btn").addEventListener("click", function () { setUpAlphaBlending() });
    document.getElementById("random-color-btn").addEventListener("click", function () { generateRandColors() });
}