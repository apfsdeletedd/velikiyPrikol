import { onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { planetVertex, planetFragment } from '../three/shaders/planet'
import { atmosphereVertex, atmosphereFragment } from '../three/shaders/atmosphere'
import { createStarfield } from '../three/starfield'

export function useCyberPlanet(containerRef) {
  let renderer, scene, camera, mesh, material, atmo, stars
  let rafId = null
  const startTime = performance.now()
  const RADIUS = 1.5

  const mouse = { current: new THREE.Vector2(0, 0), target: new THREE.Vector2(0, 0) }
  let craterStrength = 0
  let craterStrengthTarget = 0

  const hitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), RADIUS + 0.2)
  const rayOrigin = new THREE.Vector3()
  const rayDir = new THREE.Vector3()
  const hitPoint = new THREE.Vector3()
  const craterDir = new THREE.Vector3(0, 0, 1)
  const tmpRay = new THREE.Ray()

  const onMouseMove = (e) => {
    mouse.target.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.target.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  const onResize = () => {
    if (!camera || !renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  onMounted(() => {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200)
    camera.position.set(0, 0, 4.6)
    camera.updateMatrixWorld()

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x020208, 1)
    containerRef.value.appendChild(renderer.domElement)

    stars = createStarfield(1200)
    scene.add(stars)

    const geometry = new THREE.SphereGeometry(RADIUS, 160, 160)
    material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uCraterDir: { value: craterDir },
        uCraterStrength: { value: 0 },
        uRadius: { value: RADIUS },
        uLightDir: { value: new THREE.Vector3(4, 3, 5).normalize() },
      },
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
    })
    mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = 0.18
    scene.add(mesh)

    atmo = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.35, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      })
    )
    scene.add(atmo)

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('resize', onResize)

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = (performance.now() - startTime) * 0.001
      mouse.current.lerp(mouse.target, 0.08)
      rayDir.set(mouse.current.x, mouse.current.y, 0.5).unproject(camera).sub(camera.position).normalize()
      rayOrigin.copy(camera.position)
      tmpRay.origin.copy(rayOrigin)
      tmpRay.direction.copy(rayDir)
      const hit = tmpRay.intersectSphere(hitSphere, hitPoint)
      if (hit) {
        mesh.updateMatrixWorld()
        mesh.worldToLocal(hitPoint)
        craterDir.copy(hitPoint).normalize()
        craterStrengthTarget = 1
      } else {
        craterStrengthTarget = 0
      }
      craterStrength += (craterStrengthTarget - craterStrength) * 0.1
      material.uniforms.uTime.value = t
      material.uniforms.uCraterStrength.value = craterStrength
      mesh.rotation.y = t * 0.04
      stars.rotation.y = t * 0.004
      renderer.render(scene, camera)
    }
    animate()
  })

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('resize', onResize)
    if (renderer) {
      renderer.dispose()
      if (containerRef.value?.contains(renderer.domElement)) {
        containerRef.value.removeChild(renderer.domElement)
      }
    }
  })
}