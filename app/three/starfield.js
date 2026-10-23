import * as THREE from 'three'

export function createStarfield(count = 1200) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 40 + Math.random() * 40
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    pos[i * 3]     = r * Math.sin(ph) * Math.cos(th)
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
    pos[i * 3 + 2] = r * Math.cos(ph)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xaaccff, size: 0.1, sizeAttenuation: true, transparent: true, opacity: 0.9,
  }))
}