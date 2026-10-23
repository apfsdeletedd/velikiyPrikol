export const atmosphereVertex = `
  varying vec3 vNormalV;
  void main(){
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const atmosphereFragment = `
  varying vec3 vNormalV;
  void main(){
    float intensity = pow(0.62 + dot(vNormalV, vec3(0.0, 0.0, 1.0)), 4.0);
    gl_FragColor = vec4(0.0, 0.75, 1.0, 1.0) * intensity * 1.2;
  }
`