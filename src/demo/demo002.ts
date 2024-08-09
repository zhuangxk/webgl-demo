// 属性（Attributes）和缓冲
// 全局变量（Uniforms）
// 纹理（Textures）
import { createProgram, createShader, resize } from "../utils";

// 可变量（Varyings）
const canvas = document.querySelector("#webgl") as HTMLCanvasElement;
const gl = canvas.getContext("webgl")!;
resize(gl.canvas as HTMLCanvasElement)

const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    void main() {
        // 从像素坐标转换到 0.0 到 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // 再把 0->1 转换 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // 把 0->2 转换到 -1->+1 (裁剪空间)
        vec2 clipSpace = zeroToTwo - 1.0;
        // gl_Position = vec4(clipSpace, 0, 1);
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;

const fragmentShaderSource =   `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

 
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;
const program = createProgram(gl, vertexShader, fragmentShader)!;

// 找到 a_position 位置
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
// 找到 u_resolution 位置
const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
// 创建缓冲区
const positionBuffer = gl.createBuffer();
// 绑定缓冲区 到绑定点
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
    10, 20,
    80, 20,
    10, 30,
    10, 30,
    80, 20,
    80, 30,
  ];
// 通过绑定点传数据到缓冲区 
// gl.STATIC_DRAW 提示WebGL我们不会经常改变这些数据。
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// 渲染
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);


// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation);
// Bind the position buffer.
// gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
// 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
const size = 2;          // 每次迭代运行提取两个单位数据
const type = gl.FLOAT;   // 每个单位的数据类型是32位浮点型
const normalize = false; // 不需要归一化数据
const stride = 0;        // 0 = 移动单位数量 * 每个单位占用内存（sizeof(type)）
                         // 每次迭代运行运动多少内存到下一个数据开始点
const offset = 0;        // 从缓冲起始位置开始读取
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

const primitiveType = gl.TRIANGLES;
// var offset = 0;
const count = 6;
// 从向量数组中绘制图元
gl.drawArrays(primitiveType, 0, count);

console.log(gl, 2222)
const colorUniformLocation = gl.getUniformLocation(program, "u_color");
  // 绘制50个随机颜色矩形
for (var ii = 0; ii < 50; ++ii) {
// 创建一个随机矩形
// 并将写入位置缓冲
// 因为位置缓冲是我们绑定在
// `ARRAY_BUFFER`绑定点上的最后一个缓冲
    setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

    // 设置一个随机颜色
    gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);

    // 绘制矩形
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function randomInt(range: number) {
    return Math.floor(Math.random() * range);
}

function setRectangle(gl:WebGLRenderingContext, x:number, y:number, width: number, height: number) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
   
    // 注意: gl.bufferData(gl.ARRAY_BUFFER, ...) 将会影响到
    // 当前绑定点`ARRAY_BUFFER`的绑定缓冲
    // 目前我们只有一个缓冲，如果我们有多个缓冲
    // 我们需要先将所需缓冲绑定到`ARRAY_BUFFER`
   
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2]), gl.STATIC_DRAW);
  }
