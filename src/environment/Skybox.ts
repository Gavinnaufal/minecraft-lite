import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition + offset).y;
    float t = smoothstep(-0.1, 0.6, h);
    gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
  }
`;

export function createSky(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(500, 32, 32);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      topColor: { value: new THREE.Color(0x4da6ff) },
      bottomColor: { value: new THREE.Color(0x87ceeb) },
      offset: { value: 0 },
    },
    side: THREE.BackSide,
    depthWrite: false,
  });

  return new THREE.Mesh(geometry, material);
}
