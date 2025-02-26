<template>
  <canvas id="webgl"></canvas>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import img from "@/assets/image.png";
import { createProgram, createShader, resize } from "../utils";
onMounted(() => {
  main()
})
const vertexShaderSource = /*glsl*/` 
        attribute vec2 a_position;
        attribute vec2 a_texCoord;

        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

        void main() {
          // convert the rectangle from pixels to 0.0 to 1.0
          vec2 zeroToOne = a_position / u_resolution;

          // convert from 0->1 to 0->2
          vec2 zeroToTwo = zeroToOne * 2.0;

          // convert from 0->2 to -1->+1 (clipspace)
          vec2 clipSpace = zeroToTwo - 1.0;

          gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

          // pass the texCoord to the fragment shader
          // The GPU will interpolate this value between points.
          v_texCoord = a_texCoord;
        }
`;

const fragmentShaderSource =  /*glsl*/`
    precision mediump float;
    // our texture
    uniform sampler2D u_image;
    uniform float u_kernel[9];
    uniform float u_kernelWeight;
    uniform vec2 u_textureSize;
    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
       // 计算1像素对应的纹理坐标
      vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
      // vec4 color = texture2D(u_image, v_texCoord);
      // vec3 rgb = color.rgb;
      // float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
      // vec3 vivid = clamp(mix(vec3(gray), rgb, 2.0), 0.0, 1.0);
      // gl_FragColor = vec4(vivid.brg, color.a);
      // gl_FragColor = color.bgra;

      // gl_FragColor = (
      //  texture2D(u_image, v_texCoord) +
      //  texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)) +
      //  texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0))) / 3.0;


      vec4 colorSum =
        texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
        texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
        texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
        texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
        texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
        texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
        texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
        texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
        texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8] ;
    
      // 只把rgb值求和除以权重
      // 将阿尔法值设为 1.0
      gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1.0);
    }
`;
function main() {
  var image = new Image();
  image.src = img; // 必须在同一域名下
  image.onload = function () {
    render(image);
  };
}
function computeKernelWeight(kernel: number[]) {
   var weight = kernel.reduce(function(prev: any, curr: any) {
       return prev + curr;
   });
   return weight <= 0 ? 1 : weight;
 }
function render(image: HTMLImageElement) {


  const canvas = document.querySelector("#webgl") as HTMLCanvasElement;
  const gl = canvas.getContext("webgl")!;
  if (!gl) {
    return;
  }

  console.log(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS), "最大纹理单元数量");
  console.log(gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS), "最大顶点纹理单元数量");

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;
  // setup GLSL program
  const program = createProgram(gl, vertexShader, fragmentShader)!;
  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, image.width, image.height);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      0.0,  1.0,
      0.0,  1.0,
      1.0,  0.0,
      1.0,  1.0,
  ]), gl.STATIC_DRAW);

  // Create a texture.
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  var kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
  var kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionLocation, size, type, normalize, stride, offset);

  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // bind the texcoord buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texcoordLocation, size, type, normalize, stride, offset);

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  // 设置图像的大小
  gl.uniform2f(textureSizeLocation, image.width, image.height);

  // var edgeDetectKernel = [
  //     -1, -1, -1,
  //     -1,  8, -1,
  //     -1, -1, -1
  // ];

  var edgeDetectKernel = [
      -1.2, -1.2, -1.2,
      -1.2,  9.6, -1.2,
      -1.2, -1.2, -1.2
  ];
  gl.uniform1fv(kernelLocation, edgeDetectKernel);
  gl.uniform1f(kernelWeightLocation, computeKernelWeight(edgeDetectKernel));
  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function setRectangle(gl: WebGLRenderingContext, x: number, y: number, width: any, height: any) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}
</script>
