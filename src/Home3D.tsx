import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useCursor, RoundedBox } from "@react-three/drei";


const LINKS = [
    { label: "Coming Soon",
        href: "/",
        disabled: true,
    videoSrc:"/videos/graceBlakely.mp4"},
    { label: "Coming Soon",
        href: "/",
        disabled: true,
        videoSrc:"/videos/AngelaCarter.mp4"},
    { label: "Coming Soon",
        href: "/",
        disabled: true,
        videoSrc:"/videos/MattK.mp4"},
    { label: "Freelance",
        href: "https://outerscopemedia.com/",
        videoSrc:"/videos/Cranberry.mp4"},
    { label: "SomethingAboutBooks",
        href: "https://outerscopemedia.com/something-about-books/",
        videoSrc:"/videos/MattKennard.mp4"},
    { label: "Coming Soon",
        href: "/",
        disabled: true,
        videoSrc:"/videos/Yannis.mp4"},
    { label: "Coming Soon",
        href: "/",
        disabled: true,
        videoSrc:"/videos/YuYu.mp4"},
    { label: "Coming Soon",
        href: "/",
        disabled: true,
        videoSrc:"/videos/env.mp4"},
    { label: "Coming Soon",
        href: "/",
        disabled: true,
        videoSrc:"/videos/carrilovsShadow.mp4"},
];

export default function Home3D() {
    const [entered, setEntered] = useState(false);
    const [introDone, setIntroDone] = useState(false);

    const isMobile = useIsMobile();


    return (

        <div className="h-[100svh] w-full bg-black">
            {!entered && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black">

                    {/* Background video */}
                    <video autoPlay
                           loop
                           muted
                           className="absolute inset-0 w-full h-full object-cover scale-105 blur-[1px]">
                        <source
                            src="/videos/run.mp4"
                            type="video/mp4"/>
                    </video>

                    {/* dark overlay so button is visible */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    <button
                        onClick={() => setEntered(true)}
                        className="rounded-full border border-zinc-200 px-6 py-3 text-xs uppercase tracking-[0.25em] text-zinc-100 hover:bg-zinc-100 hover:text-black z-1000"
                    >
                        Enter
                    </button>

                </div>
            )}

            <div className="fixed left-4 top-4 z-40 flex items-center gap-3">
                <div className="hidden sm:block text-xs uppercase tracking-[0.25em] text-zinc-400">
                    Drag to look • Scroll to zoom • Hover screens
                </div>
            </div>

            {entered && (
                <Canvas
                    camera={{
                        position: isMobile ? [0, 2.75, 8.2] : [0, 2.95, 7.4],
                        fov: isMobile ? 72 : 65,
                    }}
                    dpr={[1, 2]}
                    gl={{ antialias: true }}
                >
                    {/* earth-tone background, not pure black */}
                    <color attach="background" args={["#141311"]} />

                    {/* camera ease-in rig (zoomed out -> closer) */}
                    <SceneRig entered={entered} onDone={() => setIntroDone(true)} />

                    <OrbitControls
                        enabled={introDone}
                        target={[0, 1.2, -2.6]}
                        enablePan={!isMobile}
                        minDistance={isMobile ? 3.0 : 2.2}
                        maxDistance={isMobile ? 8.5 : 7.0}
                        minPolarAngle={0.2}
                        maxPolarAngle={Math.PI - 0.15}
                        rotateSpeed={0.6}
                        zoomSpeed={0.8}
                    />

                    {/* council-flat lighting (orange + green + warm concrete) */}
                    <CouncilFlatLighting />

                    {/* room */}
                    <CouncilFlatRoom />

                    {/* vintage fluorescent fixtures */}
                    <CeilingFluorescents />

                    {/* vine tree on the left */}
                    <VineTree position={[-4.8, 0, -0.8]} />

                    {/* sofa facing TV wall */}
                    <Sofa position={[0, 0.18, 1.35]} rotation={[0, Math.PI, 0]} />

                    {/* ONE tv wall only */}
                    <CRTWall links={LINKS} isMobile={isMobile} />

                </Canvas>
            )}
        </div>
    );
}

/** Lighting tuned for “brutalist council flat”:
 * warm concrete + orange practical + green bounce
 */
function CouncilFlatLighting() {
    return (
        <>
            {/* soft daylight fill */}
            <ambientLight intensity={0.55} color="#efe9dd" />

            {/* key light (warm-ish) */}
            <directionalLight position={[3, 5, 2]} intensity={1.1} color="#ffe2c6" />

            {/* green bounce (plants / courtyard vibe) */}
            <pointLight position={[-4.2, 1.6, 0.6]} intensity={1.1} color="#6f7f3a" />

            {/* orange practical (lamp / tungsten) */}
            <pointLight position={[2.8, 1.3, 2.2]} intensity={1.0} color="#d07a3c" />

            {/* rim from TV wall so CRT edges pop */}
            <pointLight position={[0, 1.6, -2.4]} intensity={0.9} color="#c9b08a" />
        </>
    );
}

/** Simple brutalist room:
 * - concrete walls
 * - slightly warmer floor
 * - long media ledge on TV wall
 */
function CouncilFlatRoom() {
    const wallMat = (
        <meshStandardMaterial color="#cfc6b9" roughness={0.95} metalness={0.02} />
    );
    const floorMat = (
        <meshStandardMaterial color="#bdb3a6" roughness={0.9} metalness={0.03} />
    );
    const ceilingMat = (
        <meshStandardMaterial color="#ded6cb" roughness={1} metalness={0} />
    );

    // ✅ One source of truth
    const floorY = 0;
    const ceilingY = 4.6;

    // Wall height must be exactly floor -> ceiling
    const wallH = ceilingY - floorY;

    // Center of a plane wall is halfway up
    const wallCenterY = (floorY + ceilingY) / 2;

    return (
        <group>
            {/* floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floorY, 0]}>
                <planeGeometry args={[12, 10]} />
                {floorMat}
            </mesh>

            {/* TV wall (back) */}
            <mesh position={[0, wallCenterY, -3]}>
                <planeGeometry args={[12, wallH]} />
                {wallMat}
            </mesh>

            {/* left wall */}
            <mesh rotation={[0, Math.PI / 2, 0]} position={[-6, wallCenterY, 0]}>
                <planeGeometry args={[10, wallH]} />
                {wallMat}
            </mesh>

            {/* right wall */}
            <mesh rotation={[0, -Math.PI / 2, 0]} position={[6, wallCenterY, 0]}>
                <planeGeometry args={[10, wallH]} />
                {wallMat}
            </mesh>

            {/* ceiling */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ceilingY, 0]}>
                <planeGeometry args={[12, 10]} />
                {ceilingMat}
            </mesh>


        </group>
    );
}

/** Modular-ish sofa placeholder with orange piping */
function Sofa({
                  position,
                  rotation,
              }: {
    position: [number, number, number];
    rotation: [number, number, number];
}) {
    const baseMat = (
        <meshStandardMaterial color="#2b2b2a" roughness={0.75} metalness={0.05} />
    );
    const seamMat = (
        <meshStandardMaterial
            color="#c7773c"
            roughness={0.6}
            metalness={0}
            emissive="#3a1a08"
            emissiveIntensity={0.12}
        />
    );

    return (
        <group position={position} rotation={rotation}>
            {/* base */}
            <mesh>
                <boxGeometry args={[4.9, 0.35, 1.85]} />
                {baseMat}
            </mesh>

            {/* backrest */}
            <mesh position={[0, 0.35, -0.72]}>
                <boxGeometry args={[4.9, 0.55, 0.35]} />
                {baseMat}
            </mesh>

            {/* seat cushions */}
            <mesh position={[-1.25, 0.35, 0.12]}>
                <boxGeometry args={[1.35, 0.22, 1.25]} />
                {baseMat}
            </mesh>
            <mesh position={[0.0, 0.35, 0.12]}>
                <boxGeometry args={[1.35, 0.22, 1.25]} />
                {baseMat}
            </mesh>
            <mesh position={[1.25, 0.35, 0.12]}>
                <boxGeometry args={[1.35, 0.22, 1.25]} />
                {baseMat}
            </mesh>

            {/* orange piping accents */}
            <mesh position={[0, 0.18, 0.93]}>
                <boxGeometry args={[4.95, 0.02, 0.03]} />
                {seamMat}
            </mesh>
            <mesh position={[0, 0.18, -0.93]}>
                <boxGeometry args={[4.95, 0.02, 0.03]} />
                {seamMat}
            </mesh>
        </group>
    );
}

function CRTWall({
                     links,
                     isMobile,
                 }: {
    links: { label: string; href: string ; videoSrc?: string; disabled?:boolean}[];
    isMobile: boolean;
}) {
    const cols = 3;
    const rows = 3;

    // Bigger on desktop, slightly smaller on mobile
    const tvScale = isMobile ? 1.05 : 1.30;

    // These match your CRTScreen proportions (frontH = 1.04 * scale, frontW = 1.34 * scale)
    const tvH = 1.04 * tvScale;
    const tvW = 1.34 * tvScale;

    // spacing based on actual TV size (prevents overlap & keeps rows consistent)
    const spacingX = tvW * (isMobile ? 1.18 : 1.22);
    const spacingY = tvH * (isMobile ? 1.12 : 1.18);

    const gridHalfX = ((cols - 1) * spacingX) / 2;
    const gridHalfY = ((rows - 1) * spacingY) / 2;

    // Place the grid so the bottom row clears the floor by a margin
    const floorMargin = 0.018;

    const centerY = gridHalfY + tvH / 2 + floorMargin;

    // Place TVs forward enough so the CRT backs don’t go into the wall
    // (your wall plane is at z = -3)
    const wallZ = -3;
    const centerZ = wallZ + (isMobile ? 0.95 : 1.05);

    return (
        <group position={[0, centerY, centerZ]}>
            {links.slice(0, cols * rows).map((l, i) => {
                const c = i % cols;
                const r = Math.floor(i / cols);

                const x = -gridHalfX + c * spacingX;
                const y = gridHalfY - r * spacingY;

                return (
                    <CRTScreen
                        key={`${l.href}-${i}`}
                        label={l.label}
                        href={l.href}
                        videoSrc ={l.videoSrc}
                        disabled={l.disabled}
                        position={[x, y, 0]}
                        scale={tvScale}
                    />
                );
            })}
        </group>
    );
}

function SceneRig({ entered, onDone }: { entered: boolean; onDone: () => void }) {
    const { camera } = useThree();
    const tRef = useRef(0);
    const doneRef = useRef(false);

    const startPos = useMemo(() => new THREE.Vector3(0, 1.9, 8.4), []);
    const endPos = useMemo(() => new THREE.Vector3(0, 1.7, 4.6), []);

    useFrame((_, dt) => {
        if (!entered) return;
        if (doneRef.current) return;

        tRef.current = Math.min(1, tRef.current + dt / 1.4);
        const t = tRef.current * tRef.current * (3 - 2 * tRef.current);

        camera.position.lerpVectors(startPos, endPos, t);
        camera.lookAt(0, 1.4, -2.6);

        if (tRef.current >= 1) {
            doneRef.current = true;
            onDone();
        }
    });

    return null;
}

function VineTree({ position }: { position: [number, number, number] }) {

    return (
        <group position={position}>
            <mesh position={[0, 0.18, 0]}>
                <boxGeometry args={[0.9, 0.35, 0.9]} />
                <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
            </mesh>

            <mesh position={[0, 1.0, 0]}>
                <cylinderGeometry args={[0.10, 0.14, 1.6, 10]} />
                <meshStandardMaterial color="#3a2b22" roughness={0.95} />
            </mesh>

            <VineSegment p={[0.10, 1.1, 0.05]} r={[0.2, 0.0, 0.5]} />
            <VineSegment p={[0.22, 1.35, 0.10]} r={[0.1, 0.4, 0.7]} />
            <VineSegment p={[0.15, 1.65, 0.12]} r={[-0.1, 0.7, 0.8]} />
            <VineSegment p={[0.00, 1.95, 0.10]} r={[-0.2, 1.0, 0.6]} />
            <VineSegment p={[-0.15, 2.25, 0.06]} r={[-0.35, 1.2, 0.4]} />

            <LeafCluster position={[0.25, 1.55, 0.12]} />
            <LeafCluster position={[0.05, 1.95, 0.10]} />
            <LeafCluster position={[-0.15, 2.25, 0.06]} />
            <LeafCluster position={[0.00, 2.55, 0.02]} />

            <pointLight position={[0.3, 1.6, 0.2]} intensity={0.35} color="#6f7f3a" distance={4} />
        </group>
    );
}

function VineSegment({
                         p,
                         r,
                     }: {
    p: [number, number, number];
    r: [number, number, number];
}) {
    return (
        <mesh position={p} rotation={r}>
            <cylinderGeometry args={[0.03, 0.035, 0.5, 8]} />
            <meshStandardMaterial color="#2f3a1f" roughness={0.9} />
        </mesh>
    );
}

function CeilingFluorescents() {
    const y = 4.58; // ceiling is at y=3.0
    return (
        <group>
            <FluorescentFixture position={[-2.2, y, 0.6]} rotation={[0, 0.15, 0]} />
            <FluorescentFixture position={[2.0, y, -0.4]} rotation={[0, -0.12, 0]} />
        </group>
    );
}

function FluorescentFixture({
                                position,
                                rotation = [0, 0, 0],
                            }: {
    position: [number, number, number];
    rotation?: [number, number, number];
}) {
    return (
        <group position={position} rotation={rotation}>
            <mesh>
                <boxGeometry args={[2.2, 0.08, 0.35]} />
                <meshStandardMaterial color="#6a6a66" roughness={0.55} metalness={0.55} />
            </mesh>

            <mesh position={[0, -0.05, 0]}>
                <boxGeometry args={[2.0, 0.02, 0.25]} />
                <meshStandardMaterial
                    color="#e8e3d6"
                    emissive="#e8e3d6"
                    emissiveIntensity={1.25}
                    roughness={0.4}
                    metalness={0}
                />
            </mesh>

            <pointLight position={[0, -0.25, 0]} intensity={0.9} color="#efe6d2" distance={8} />
            <pointLight position={[0.7, -0.25, 0]} intensity={0.55} color="#efe6d2" distance={6} />
            <pointLight position={[-0.7, -0.25, 0]} intensity={0.55} color="#efe6d2" distance={6} />
        </group>
    );
}

function LeafCluster({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 0.35,
                        (Math.random() - 0.5) * 0.25,
                        (Math.random() - 0.5) * 0.25,
                    ]}
                    rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
                    scale={[0.18, 0.08, 0.18]}
                >
                    <sphereGeometry args={[1, 8, 8]} />
                    <meshStandardMaterial color="#5f7333" roughness={0.95} />
                </mesh>
            ))}
        </group>
    );
}

function CRTScreen({
                       label,
                       href,
                       videoSrc,
                       disabled,
                       position,
                       rotation = [0, 0, 0],
                       scale = 1,
                   }: {
    label: string;
    href: string;
    videoSrc?:string;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    disabled?:boolean;
})

{
    const[muted, setMuted] = useState(true);
    const [hovered, setHovered] = useState(false);
    useCursor(hovered);
    const shaderRef = useRef<THREE.ShaderMaterial | null>(null);

    const video = useMemo(() => {
        if (!videoSrc) return null;
        const v = document.createElement("video");
        v.src = videoSrc;
        v.crossOrigin = "anonymous";
        v.loop = true;
        v.playsInline = true;
        v.setAttribute("playsinline", "");
        v.preload = "auto";
        v.muted = true;       // start muted (autoplay rules)
        v.autoplay = true;
        v.play().catch(() => {});

        return v;
    }, [videoSrc]);

    useEffect(() => {
        if (!video) return;
        video.muted = muted;
    }, [muted, video]);

    const videoTex = useMemo(() => {
        if (!video) return null;
        const t = new THREE.VideoTexture(video);
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
        return t;
    }, [video]);

    useEffect(() => {
        if (!shaderRef.current) return;
        // Push the texture into the shader uniform when it becomes available
        if (shaderRef.current.uniforms.uVideo) {
            shaderRef.current.uniforms.uVideo.value = videoTex;
        }
        if (shaderRef.current.uniforms.uHasVideo) {
            shaderRef.current.uniforms.uHasVideo.value = videoTex ? 1 : 0;
        }
    }, [videoTex]);

    useFrame((_, dt) => {
        const m = shaderRef.current;
        if (!m) return;

        m.uniforms.uTime.value += dt;
        m.uniforms.uHover.value = hovered ? 1 : 0;

        // guard: only set if present
        if (m.uniforms.uHasVideo) {
            m.uniforms.uHasVideo.value = videoTex ? 1 : 0;
        }
    });

    const go = () =>{
        if (disabled) return;
        window.location.href=href;
    }


    // “fat-butt CRT” proportions
    const frontW = 1.34 * scale;
    const frontH = 1.17 * scale;
    const frontD = 0.45 * scale;

    const buttW = 1.02 * scale;
    const buttH = 0.78 * scale;
    const buttD = 0.42 * scale; // ✅ much shorter depth (prevents wall collision)

    const zGlass = frontD / 2 + 0.012 * scale;      // glass slightly in front

// BIG square glass/static area
    const screenSize = 0.75 * frontH;   // change 0.92 → 0.96 for even bigger
    const screenW = screenSize;
    const screenH = screenSize;

    // lifted dark materials so they read in warm concrete light
    const bodyColor = "#1a1a1a";
    const buttColor = "#141414";
    const bezelColor = "#101010";

    return (
        <group position={position} rotation={rotation}>

            {/* FAT BACK / TUBE HOUSING */}
            <group position={[0, -0.03 * scale, -(frontD / 2 + buttD / 2) + 0.04 * scale]}>
                <RoundedBox args={[buttW, buttH, buttD]} radius={0.14} smoothness={8}>
                    <meshStandardMaterial color={buttColor} roughness={0.92} metalness={0.03} />
                </RoundedBox>


                {/* vent plate */}
                <mesh position={[0, 0.02 * scale, 0.10 * scale]}>
                    <boxGeometry args={[buttW * 0.74, buttH * 0.30, 0.012]} />
                    <meshStandardMaterial color="#1f1f1f" roughness={1} />
                </mesh>
            </group>

            {/* FRONT CABINET */}
            <RoundedBox args={[frontW, frontH, frontD]} radius={0.11} smoothness={8}>
                <meshStandardMaterial color={bodyColor} roughness={0.85} metalness={0.06} />
            </RoundedBox>

            {/* BEZEL FRAME (REAL frame: 4 strips, open middle) */}
            {(() => {
                const frameOuter = screenSize + 0.24 * scale; // overall bezel size
                const frameInner = screenSize + 0.02 * scale; // opening size (almost the glass)
                const frameT = (frameOuter - frameInner) / 8; // strip thickness
                const zBezel = frontD / 2 - 0.085 * scale;    // slightly behind the glass

                return (
                    <group position={[0, 0.06 * scale, zBezel]}>
                        {/* top */}
                        <mesh position={[0, (frameInner / 2 + frameT / 2), 0]}>
                            <boxGeometry args={[frameOuter, frameT, 0.06 * scale]} />
                            <meshStandardMaterial color={bezelColor} roughness={0.95} metalness={0.02} />
                        </mesh>

                        {/* bottom */}
                        <mesh position={[0, -(frameInner / 2 + frameT / 2), 0]}>
                            <boxGeometry args={[frameOuter, frameT, 0.06 * scale]} />
                            <meshStandardMaterial color={bezelColor} roughness={0.95} metalness={0.02} />
                        </mesh>

                        {/* left */}
                        <mesh position={[-(frameInner / 2 + frameT / 2), 0, 0]}>
                            <boxGeometry args={[frameT, frameInner, 0.06 * scale]} />
                            <meshStandardMaterial color={bezelColor} roughness={0.95} metalness={0.02} />
                        </mesh>

                        {/* right */}
                        <mesh position={[(frameInner / 2 + frameT / 2), 0, 0]}>
                            <boxGeometry args={[frameT, frameInner, 0.06 * scale]} />
                            <meshStandardMaterial color={bezelColor} roughness={0.95} metalness={0.02} />
                        </mesh>
                    </group>
                );
            })()}

            {/* CURVED GLASS SCREEN (static + glow) */}
            <mesh
                position={[0, 0.08 * scale,zGlass]}
                onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
                onPointerOut={(e) => (e.stopPropagation(), setHovered(false))}
                onClick={(e) => (e.stopPropagation(), go())}
            >
                <planeGeometry args={[screenW, screenH, 40, 26]} />
                <shaderMaterial
                    ref={shaderRef}
                    uniforms={{
                        uTime: { value: 0 },
                        uHover: { value: 0 },
                        uVideo: { value: videoTex },          // ✅ add
                        uHasVideo: { value: videoTex ? 1 : 0 } // ✅ add
                    }}
                    vertexShader={`  
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;

      vec2 c = (uv - 0.5) * 2.0;
      float r2 = dot(c, c);

      float bulge = (1.0 - r2) * 0.02; // flatter
      bulge = max(bulge, -0.02);
      p.z += bulge;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `}
                    fragmentShader={`
varying vec2 vUv;
uniform float uTime;
uniform float uHover;
uniform sampler2D uVideo;
uniform float uHasVideo;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float boxMask(vec2 uv, float size, float feather) {
  vec2 d = abs(uv - 0.5);
  return 1.0 - smoothstep(size, size + feather, max(d.x, d.y));
}

void main() {
  // base video (or fallback to gray)
  vec3 vid = vec3(0.12);
  if (uHasVideo > 0.5) {
    vid = texture2D(uVideo, vUv).rgb;
  }

  // scanlines + noise
  float scan = sin((vUv.y + uTime * 0.6) * 1100.0) * 0.06;
  float n = hash(vUv * vec2(520.0, 300.0) + uTime * 3.0);
  float snow = (n - 0.5) * 0.22;

  // subtle rgb split on hover
  float shift = 0.0015 + uHover * 0.0025;
  vec3 vidR = (uHasVideo > 0.5) ? texture2D(uVideo, vUv + vec2( shift, 0.0)).rgb : vid;
  vec3 vidB = (uHasVideo > 0.5) ? texture2D(uVideo, vUv + vec2(-shift, 0.0)).rgb : vid;
  vec3 col = vec3(vidR.r, vid.g, vidB.b);

  // CRT lift + contrast
  col = pow(col, vec3(0.85));
  col *= 1.15;

  // add scan/noise like old TV
  col += scan;
  col += snow;

  // square mask for the glass area
  float m = boxMask(vUv, 0.495, 0.004);
  col *= m;

  gl_FragColor = vec4(col, 1.0);
}
`}
                />
            </mesh>

            {/* POWER LED */}
            <mesh position={[frontW * 0.34, -frontH * 0.34, frontD /1.77 - 0.03]}>
                <sphereGeometry args={[0.02 * scale, 12, 12]} />
                <meshStandardMaterial
                    emissive={hovered ? "#d07a3c" : "#6f7f3a"}
                    emissiveIntensity={hovered ? 1.2 : 0.6}
                    color="#111"
                />
            </mesh>

            {/* HOVER LABEL */}
            {(hovered || isMobile)&& (
                <Html position={[0, frontH * 0.25, frontD / 1.1]} center transform style ={{pointerEvents: "none"}}>
                    <div className="select-none rounded-full border border-zinc-700 bg-black/70 px-2 py-1 text-[5px] uppercase tracking-[0.25em] text-zinc-100 backdrop-blur hover:bg-white hover:text-black">
                        {label}
                    </div>
                </Html>
            )}

            {(hovered || useIsMobile()) && video && (
                <Html
                    position={[0, frontH * 0.009, frontD / 1.1]}
                    center
                    transform
                    style={{ pointerEvents: "none" }}
                >
                    <button
                        style={{ pointerEvents: "auto", touchAction: "manipulation" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMuted((m) => !m);
                        }}
                        onTouchStart={(e) => {
                            e.stopPropagation();
                        }}
                        className="rounded-full border border-zinc-700 bg-black/70 px-2 py-1 text-[5px] uppercase tracking-[0.2em] text-zinc-100 backdrop-blur hover:bg-white hover:text-black"
                    >
                        {muted ? "Unmute" : "Mute"}
                    </button>
                </Html>
            )}
        </group>


    );

}
function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.innerWidth < breakpoint;
    });

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [breakpoint]);

    return isMobile;
}

