import { createProgram, createShader, resize } from "../utils";

// 可变量（Varyings）
const canvas = document.querySelector("#webgl") as HTMLCanvasElement;
const gl = canvas.getContext("webgl")!;
resize(gl.canvas as HTMLCanvasElement)

const vertexShaderSource = /*glsl*/`
    
    // attribute 用于传递顶点位置
    attribute vec2 a_position;

    // uniform 用于传递画布分辨率
    uniform vec2 u_resolution;
    void main() {
        // 从像素坐标转换到 0.0 到 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // // 再把 0->1 转换 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // // 把 0->2 转换到 -1->+1 (裁剪空间)
        vec2 clipSpace = zeroToTwo - 1.0;
        // gl_Position = vec4(clipSpace, 0, 1);
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;

const fragmentShaderSource =  /*glsl*/`
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
