"use client"

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ShaderPage() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [fragmentShader, setfragmentShader] = useState<string | null>(null);

    useEffect(() => {
        fetch("/shaders/fragment.glsl")
            .then((res) => res.text())
            .then(setfragmentShader)
            .catch((err) => (console.error("Failed to load shader!"), err));
    }, []);

    useEffect(() => {
        if (!fragmentShader || !containerRef.current) return;

        let animationId: number;
        const container = containerRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.Camera();

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        container!.appendChild(renderer.domElement);

        const uniforms = {
            u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
            u_time: { value: 100.0 },
            u_base_color: { value: new THREE.Vector3(0.976, 0.98, 0.984) },
            u_resolution: {
                value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },
            u_mobile: { value: (window.matchMedia("(width < 90rem)").matches) }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
            fragmentShader: fragmentShader!,
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const onMouseMove = (e: MouseEvent) => {
            uniforms.u_mouse.value.set(
                e.clientX / window.innerWidth,
                1.0 - e.clientY / window.innerHeight,
            )
        }
        window.addEventListener("mousemove", onMouseMove);

        const animate = () => {
            uniforms.u_time.value += 0.05;
            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            renderer.dispose();
            window.removeEventListener("mousemove", onMouseMove);
            container!.removeChild(renderer.domElement);
        };
    }, [fragmentShader]);

    return <div ref={containerRef} className="opacity-100 absolute right-0 z-[-10]" />;
}
