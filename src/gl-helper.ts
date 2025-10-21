const fragmentShaderSource = `
precision mediump float;

// our textures
uniform sampler2D u_frame;

// data
uniform float u_premultipliedAlpha;
uniform bool u_enableClip;
uniform vec2 u_clipRatio;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
  vec2 colorCoord;
  vec2 alphaCoord;

  // Calculate the coordinates for the color and alpha
  if (u_enableClip) {
    float clippedX = u_clipRatio.x / 2.0 + v_texCoord.x * (1.0 - u_clipRatio.x);
    float clippedY = u_clipRatio.y / 2.0 + v_texCoord.y * (1.0 - u_clipRatio.y);
    colorCoord = vec2(clippedX, clippedY * 0.5);
    alphaCoord = vec2(clippedX, 0.5 + clippedY * 0.5);
  } else {
    colorCoord = vec2(v_texCoord.x, v_texCoord.y * 0.5);
    alphaCoord = vec2(v_texCoord.x, 0.5 + v_texCoord.y * 0.5);
  }

  vec4 color = texture2D(u_frame, colorCoord);
  float alpha = texture2D(u_frame, alphaCoord).r;

  gl_FragColor = vec4(color.rgb * mix(alpha, 1.0, u_premultipliedAlpha), alpha);
}
`;

const vertexShaderSource = `
precision mediump float;
attribute vec2 a_position;
uniform mat3 u_matrix;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);

  // because we're using a unit quad we can just use
  // the same data for our texcoords.
  v_texCoord = a_position;
}
`;

function loadShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  source: string,
  type: GLenum,
) {
  const shader = gl.createShader(type);
  if (!shader) throw Error('Unable to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    const elErrorCode = gl.getError();
    throw Error(error || `unknown error, gl error code: ${elErrorCode}`);
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext | WebGL2RenderingContext, shaders: WebGLShader[]) {
  const program = gl.createProgram();
  if (!program) throw Error('Unable to create program');
  for (const shader of shaders) gl.attachShader(program, shader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw Error(error || 'unknown error');
  }

  return program;
}

type GLResources = {
  program: WebGLProgram;
  shaders: WebGLShader[];
  positionBuffer: WebGLBuffer;
  texture: WebGLTexture;
};

const resourcesMap = new WeakMap<WebGLRenderingContext | WebGL2RenderingContext, GLResources>();
const premultipliedAlphaLocations = new WeakMap();
const enableClipLocations = new WeakMap();
const clipRatioLocations = new WeakMap();

/**
 * Get a GL context for a canvas.
 * This only needs to be done once per canvas.
 */
export function setupGLContext(canvas: HTMLCanvasElement | OffscreenCanvas) {
  const options: WebGLContextAttributes = {
    antialias: false,
    powerPreference: 'low-power',
    depth: false,
    premultipliedAlpha: true,
  };
  const context = canvas.getContext('webgl2', options) ?? canvas.getContext('webgl', options);

  if (!context) {
    throw Error("Couldn't create GL context");
  }

  const frag = loadShader(context, fragmentShaderSource, context.FRAGMENT_SHADER);
  const vert = loadShader(context, vertexShaderSource, context.VERTEX_SHADER);
  const program = createProgram(context, [frag, vert]);
  context.useProgram(program);

  // look up where the vertex data needs to go.
  const positionLocation = context.getAttribLocation(program, 'a_position');

  // look up uniform locations
  const frameLoc = context.getUniformLocation(program, 'u_frame');
  context.uniform1i(frameLoc, 0); // texture unit 0
  const matrixLoc = context.getUniformLocation(program, 'u_matrix');

  premultipliedAlphaLocations.set(
    context,
    context.getUniformLocation(program, 'u_premultipliedAlpha'),
  );

  enableClipLocations.set(context, context.getUniformLocation(program, 'u_enableClip'));
  clipRatioLocations.set(context, context.getUniformLocation(program, 'u_clipRatio'));

  setPremultipliedAlpha(context, false);
  setEnableClip(context, false);
  setClipRatio(context, [0.0, 0.0]);

  // provide texture coordinates for the rectangle.
  const positionBuffer = context.createBuffer();
  // prettier-ignore
  const rect = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]);

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);
  context.bufferData(context.ARRAY_BUFFER, rect, context.STATIC_DRAW);
  context.enableVertexAttribArray(positionLocation);
  context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);
  context.uniformMatrix3fv(matrixLoc, false, [2, 0, 0, 0, -2, 0, -1, 1, 1]);

  const texture = context.createTexture();
  context.bindTexture(context.TEXTURE_2D, texture);
  // Set the parameters so we can render any size image.
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.NEAREST);
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.NEAREST);

  resourcesMap.set(context, {
    program,
    shaders: [frag, vert],
    positionBuffer,
    texture,
  });

  return context;
}

export function destroyGLContext(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const resources = resourcesMap.get(gl);
  if (!resources) return;

  gl.useProgram(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  gl.deleteBuffer(resources.positionBuffer);
  gl.deleteTexture(resources.texture);
  gl.deleteProgram(resources.program);
  for (const shader of resources.shaders) {
    gl.deleteShader(shader);
  }

  resourcesMap.delete(gl);

  // Try to lose context, only available in some platforms
  // gl.getExtension('WEBGL_lose_context')?.loseContext();
}

/**
 * Set whether the source video uses premultiplied alpha.
 *
 * Set this to `true` if semi-transparent areas or outlines look too dark.
 */
export function setPremultipliedAlpha(
  context: WebGLRenderingContext | WebGL2RenderingContext,
  premultipliedAlpha: boolean,
): void {
  context.uniform1f(premultipliedAlphaLocations.get(context), premultipliedAlpha ? 1 : 0);
}

/**
 * Set whether to enable clipping.
 */
export function setEnableClip(
  context: WebGLRenderingContext | WebGL2RenderingContext,
  enableClip: boolean,
): void {
  context.uniform1i(enableClipLocations.get(context), enableClip ? 1 : 0);
}

/**
 * Set the clipping ratio (width and height ratio).
 *
 * @param clipRatio A vec2 representing the clipping ratio [widthRatio, heightRatio]
 */
export function setClipRatio(
  context: WebGLRenderingContext | WebGL2RenderingContext,
  clipRatio: [number, number],
): void {
  context.uniform2f(clipRatioLocations.get(context), clipRatio[0], clipRatio[1]);
}

/**
 * Clear the canvas by removing all pixels.
 */
export function clearCanvas(context: WebGLRenderingContext | WebGL2RenderingContext): void {
  const canvas = context.canvas;
  context.viewport(0, 0, canvas.width, canvas.height);
  context.clearColor(0, 0, 0, 0);
  context.clear(context.COLOR_BUFFER_BIT);
}

/**
 * Draw a stacked-alpha video frame to a GL context.
 */
export function drawVideo(
  context: WebGLRenderingContext | WebGL2RenderingContext,
  video: HTMLVideoElement,
  checkReadyState = true,
): void {
  const canvas = context.canvas;

  // draw only use current canvas dimensions
  context.viewport(0, 0, canvas.width, canvas.height);

  if (!checkReadyState || video.readyState >= video.HAVE_CURRENT_DATA) {
    context.texImage2D(
      context.TEXTURE_2D,
      0,
      context.RGBA,
      context.RGBA,
      context.UNSIGNED_BYTE,
      video,
    );

    context.drawArrays(context.TRIANGLES, 0, 6);
  }
}
