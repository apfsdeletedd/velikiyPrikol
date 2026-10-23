import { NOISE_GLSL } from './noise'

export const planetVertex = `
  ${NOISE_GLSL}
  uniform float uTime;
  uniform vec3 uCraterDir;
  uniform float uCraterStrength;
  uniform float uRadius;

  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  varying float vElev;
  varying float vCrater;

  float elevationAt(vec3 dir, out float crater){
    float e = terrainH(dir, uTime) * 0.17;
    e += snoise(dir * 9.0) * 0.02;
    float ang = distance(dir, uCraterDir);
    float k = 1.0 - smoothstep(0.0, 0.8, ang);
    crater = uCraterStrength * k * k;
    e -= crater * 0.35;
    return clamp(e, -0.4, 0.4);
  }

  void main(){
    vec3 n = normalize(position);
    float crater0;
    float e0 = elevationAt(n, crater0);

    vec3 helper = vec3(0.0, 1.0, 0.0);
    if (abs(n.y) > 0.99) helper = vec3(1.0, 0.0, 0.0);
    vec3 t = normalize(cross(n, helper));
    vec3 b = cross(n, t);
    float eps = 0.015;
    vec3 nT = normalize(n + t * eps);
    vec3 nB = normalize(n + b * eps);

    float craterT; float craterB;
    float eT = elevationAt(nT, craterT);
    float eB = elevationAt(nB, craterB);

    vec3 C = n  * (uRadius + e0);
    vec3 T = nT * (uRadius + eT);
    vec3 B = nB * (uRadius + eB);

    vec3 newNormal = normalize(cross(T - C, B - C));
    if (dot(newNormal, n) < 0.0) newNormal = -newNormal;

    vElev = e0;
    vCrater = crater0;
    vNormalW = normalize((modelMatrix * vec4(newNormal, 0.0)).xyz);
    vec4 worldPos = modelMatrix * vec4(C, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const planetFragment = `
  uniform vec3 uLightDir;
  uniform float uTime;

  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  varying float vElev;
  varying float vCrater;

  void main(){
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uLightDir);
    vec3 H = normalize(L + V);

    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 90.0) * 0.9;
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);

    vec3 abyss  = vec3(0.01, 0.01, 0.06);
    vec3 deep   = vec3(0.06, 0.02, 0.20);
    vec3 mid    = vec3(0.20, 0.05, 0.55);
    vec3 ridge  = vec3(0.55, 0.12, 1.00);
    vec3 peak   = vec3(1.00, 0.45, 1.00);
    vec3 hot    = vec3(1.00, 0.12, 0.30);
    vec3 line   = vec3(0.00, 0.90, 1.00);

    float h = vElev;
    float q = floor(clamp(h, -0.3, 0.3) * 20.0) / 20.0;

    vec3 c = abyss;
    c = mix(c, deep,  smoothstep(-0.16, -0.14, q));
    c = mix(c, mid,   smoothstep(-0.06, -0.04, q));
    c = mix(c, ridge, smoothstep( 0.04,  0.06, q));
    c = mix(c, peak,  smoothstep( 0.14,  0.16, q));

    float cl = abs(fract(h * 14.0 + 0.5) - 0.5);
    float topo = 1.0 - smoothstep(0.0, 0.06, cl);
    c += line * topo * 0.25 * (0.3 + diff);

    c = mix(c, hot, clamp(vCrater, 0.0, 1.0));
    c += hot * vCrater * 0.9;

    vec3 col = c * (0.10 + diff * 1.05);
    col += vec3(0.7, 0.9, 1.0) * spec * diff;
    col += line * fres * 1.4;

    gl_FragColor = vec4(col, 1.0);
  }
`