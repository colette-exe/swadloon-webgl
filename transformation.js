// AFFINE TRANSFORMATION FUNCTIONS

// multiply matrices
function matrixMul(matrices) {
    let resultIdx, temp, tempResult;
    // iterate through each matrix
    let result;
    if (matrices.length > 1) {
        result = Object.assign([], [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    } else result = matrices;

    // computation
    for (let i = 0; i < matrices.length; i++) { // every transformationMatrix
        if (matrices[i].length == 0) {
            matrices[i] = Object.assign([], [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
        }
        result = currMulNew(result, matrices[i]);
    }

    return result;
}

// multiply two matrices
function currMulNew(currMat, newMat) {
    let result = [], colIdx = 0, tempResult = 0, rowIdx = 0;
    if (currMat.length < 0) {
        currMat = Object.assign([], [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    for (let i = 0; i < newMat.length; i++) {
        tempResult = 0;
        // col from result x row from the curr matrix in the iteration
        if (i != 0 && i % 4 == 0) {
            colIdx = 0;
            rowIdx += 4;
        }
        tempResult = (currMat[rowIdx] * newMat[colIdx])
            + (currMat[rowIdx+1] * newMat[colIdx+4])
            + (currMat[rowIdx+2] * newMat[colIdx+8])
            + (currMat[rowIdx+3] * newMat[colIdx+12]);
        result.push(tempResult);
        colIdx++;
    }

    return result;
}

// set input matrix to identity matrix
function setToIdentity(mat) {
    mat = Object.assign([], [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

    return mat;
}

// set up transformationMatrix for translation
function translate(x, y) {
    let transformationMatrix = [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        x,y,0,1
    ];

    return transformationMatrix;
}

// set up transformationMatrix for scaling
function scale(Sx, Sy) {
    let transformationMatrix = [
        Sx,0,0,0,
        0,Sy,0,0,
        0,0,1,0,
        0,0,0,1
    ];

    return transformationMatrix;
}

// set up transformationMatrix for rotation
function rotate(anchor, degrees) {
    console.log(anchor);
    //For ROTATION
    let transformationMatrix;
    let x = anchor[0];
    let y = anchor[1];
    
    // steps for rotation (from 161 lecture)
    // 1. subtract current origin from default origin
    let T = [0 - x, 0 - y];

    // 2. translate by T
    let translateByT =
        currMulNew(translate(T[0], T[1]), setToIdentity([]));

    // rotate
    let radians = Math.PI*degrees/180;
    let cosValue = Math.cos(radians);
    let sinValue = Math.sin(radians);

    transformationMatrix = [
        cosValue, sinValue, 0, 0,
        -sinValue, cosValue, 0, 0, 
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    // 2. rotate according to angle
    transformationMatrix = currMulNew(translateByT, transformationMatrix);

    // 3. translate by -T
    transformationMatrix = currMulNew(transformationMatrix, translate(-T[0], -T[1]));

    return transformationMatrix;
}

function reset() {
    let transformationMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    return transformationMatrix;
}

export { translate, scale, rotate, reset, matrixMul, currMulNew, setToIdentity };