import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Scene
 */

const scene = new THREE.Scene()

/**
 * Debug UI
 */
const gui = new dat.GUI()
gui.close()

const params = {
  materialColor: '#adb3ff'
}

gui
  .addColor(params, 'materialColor')
  .onChange(() =>{
    material.color.set(params.materialColor)
  })

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()

const gradientTexture = textureLoader.load('./static/texture/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Objects
 */
const objectDistance = 5

const material = new THREE.MeshToonMaterial({
  color: params.materialColor,
  gradientMap: gradientTexture
})

const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  material
)

const mesh2 = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 32),
  material
)

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
)

mesh1.position.y = - objectDistance * 0
mesh2.position.y = - objectDistance * 1
mesh3.position.y = - objectDistance * 2

mesh1.position.x = 1.7
mesh2.position.x = - 1.7
mesh3.position.x = 1.7

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [ mesh1, mesh2, mesh3 ]

/**
 * Particles
 */
//Geometry
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++){
  positions[i*3 + 0] = (Math.random() - 0.5) * 10
  positions[i*3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * 3
  positions[i*3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

//Material
const particlesMaterial = new THREE.PointsMaterial({
  color: params.materialColor,
  sizeAttenuation: true,
  size: 0.03
})

//Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)


/**
 * Lights
 */

const light1 = new THREE.PointLight('#ffffff', 3)
const light2 = new THREE.PointLight('#ffffff', 3)
const light3 = new THREE.PointLight('#ffffff', 3)
scene.add(light1, light2, light3)

light1.position.y = mesh1.position.y 
light2.position.y = mesh2.position.y - 0.5
light3.position.y = mesh3.position.y + 2

light1.position.x = mesh1.position.x - 1.5
light2.position.x = mesh2.position.x - 1.5
light3.position.x = mesh3.position.x - 1.5

const lightFolder = gui.addFolder('Light')
const lightPosition = lightFolder.addFolder('Position')

lightPosition
  .add(light1.position,'x')
  .min(-3)
  .max(3)
  .step(0.01)
 
lightPosition
  .add(light1.position,'y')
  .min(-3)
  .max(3)
  .step(0.01)
 
lightPosition
  .add(light1.position,'z')
  .min(-3)
  .max(3)
  .step(0.01)
 

/**
 * Camera
 */
//Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */

const canvas = document.querySelector('.canvas')
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', ()=>{
  scrollY = window.scrollY

  const newSection = Math.round(scrollY / window.innerHeight)
  if(newSection != currentSection){
    currentSection = newSection

    gsap.to(
      sectionMeshes[currentSection].rotation,{
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=6',
        y: '+=3',
        z: '+=1.5'
      }
    )
  }
})

/**
 * Cursor
 */

const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) =>{
  cursor.x = event.clientX / window.innerWidth - 0.5
  cursor.y = event.clientY / window.innerHeight - 0.5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0
const animate = () =>{
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  //Animate Camera
  camera.position.y = -scrollY / window.innerHeight * objectDistance

  const parallaxX = cursor.x
  const parallaxY =  - cursor.y
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 2 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 2 * deltaTime
  
  //Animate Meshes
  for(const mesh of sectionMeshes){
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.12
  }

  renderer.render(scene, camera)
  window.requestAnimationFrame(animate)
}

animate()

/**
 * Event Listeners
 */
//Resize
window.addEventListener('resize', ()=>{
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, innerHeight)
})