// 属性（Attributes）和缓冲
// 全局变量（Uniforms）
// 纹理（Textures）
import { createProgram, createShader, resize } from "../utils";

// 可变量（Varyings）
const canvas = document.querySelector("#webgl") as HTMLCanvasElement;
const gl = canvas.getContext("webgl")!;
resize(gl.canvas as HTMLCanvasElement)

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSource =   `
    precision mediump float;
    // uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = vec4(1, 0, 0.5, 1);
    }
`;

 
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!;
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!;
const program = createProgram(gl, vertexShader, fragmentShader)!;

// 找到 a_position 位置
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
// 创建缓冲区
const positionBuffer = gl.createBuffer();
// 绑定缓冲区 到绑定点
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
    0, 0,
    0, 0.5,
    0.7, 0,
];
// 通过绑定点传数据到缓冲区 
// gl.STATIC_DRAW 提示WebGL我们不会经常改变这些数据。
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// 渲染
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);


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
const count = 3;
// 从向量数组中绘制图元
gl.drawArrays(primitiveType, 0, count);

console.log(gl, 2222)

/**
 * 
 * 总结 
 * 1 创建顶点 shader 颜色shader
 * 2 链接程序
 * 3 寻找变量 
 * 4 创建缓冲区 绑定变量到点
 * 5 通过绑定点传送变量到缓冲区
 * 6 渲染 清楚缓冲区 设置程序
 * 7 开启变量 设置变量读取方式
 * 8 从向量数组中绘制图元
 */