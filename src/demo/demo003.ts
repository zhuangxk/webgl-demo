// WebGL - Triangle with position for color
// from https://webglfundamentals.org/webgl/webgl-2d-triangle-with-position-for-color.html

import { createProgram, createShader } from "../utils";

const canvas = document.querySelector("#webgl") as HTMLCanvasElement;
const gl = canvas.getContext("webgl")!;
// setup GLSL program
const vertexShaderSource = `
    attribute vec2 a_position;

    uniform mat3 u_matrix;

    varying vec4 v_color;

    void main() {
        // Multiply the position by the matrix.
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

        // Convert from clipspace to colorspace.
        // Clipspace goes -1.0 to +1.0
        // Colorspace goes from 0.0 to 1.0
        v_color = gl_Position * 0.5 + 0.5;
    }
`;

const fragmentShaderSource =   `
    precision mediump float;

    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color; 
    }
`;

 
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;
const program = createProgram(gl, vertexShader, fragmentShader)!;

// look up where the vertex data needs to go.
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

// lookup uniforms
const matrixLocation = gl.getUniformLocation(program, "u_matrix");

// Create a buffer.
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Set Geometry.
setGeometry(gl);

const translation = [200, 150];
let angleInRadians = 0;
const scale = [1, 1];

drawScene();

// Setup a ui.
webglLessonsUI.setupSlider("#x", {
  value: translation[0],
  slide: updatePosition(0),
  max: gl.canvas.width,
});
webglLessonsUI.setupSlider("#y", {
  value: translation[1],
  slide: updatePosition(1),
  max: gl.canvas.height,
});
webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
webglLessonsUI.setupSlider("#scaleX", {
  value: scale[0],
  slide: updateScale(0),
  min: -5,
  max: 5,
  step: 0.01,
  precision: 2,
});
webglLessonsUI.setupSlider("#scaleY", {
  value: scale[1],
  slide: updateScale(1),
  min: -5,
  max: 5,
  step: 0.01,
  precision: 2,
});

function updatePosition(index: number) {
  return function (event: any, ui: any) {
    translation[index] = ui.value;
    drawScene();
  };
}

function updateAngle(event: any, ui: any) {
  const angleInDegrees = 360 - ui.value;
  angleInRadians = (angleInDegrees * Math.PI) / 180;
  drawScene();
}

function updateScale(index: number) {
  return function (event:any, ui:any) {
    scale[index] = ui.value;
    drawScene();
  };
}

// Draw the scene.
function drawScene() {
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // Compute the matrix
  // @ts-ignore
  let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
  matrix = m3.translate(matrix, translation[0], translation[1]);
  matrix = m3.rotate(matrix, angleInRadians);
  matrix = m3.scale(matrix, scale[0], scale[1]);

  // Set the matrix.
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Draw the geometry.
  const primitiveType = gl.TRIANGLES;
  offset = 0;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

// Fill the buffer with the values that define a triangle.
// Note, will put the values in whatever buffer is currently
// bound to the ARRAY_BUFFER bind point
function setGeometry(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, -100, 150, 125, -175, 100]),
    gl.STATIC_DRAW
  );
}
