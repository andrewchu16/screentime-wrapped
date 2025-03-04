"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AnimatedBackground() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bgRef.current) return;
    
    const panels1 = bgRef.current.querySelectorAll('.panel1');
    const panels2 = bgRef.current.querySelectorAll('.panel2');
    
    // Initialize GSAP timeline
    const tl = gsap.timeline({ repeat: -1 });
    
    // Set initial positions
    gsap.set(panels1, { 
      rotation: (i: number) => i * 30,
      transformOrigin: "center center",
      opacity: 0.7
    });
    
    gsap.set(panels2, { 
      rotation: (i: number) => i * 30 + 15,
      transformOrigin: "center center",
      opacity: 0.7
    });
    
    // Animate panels
    tl.to(panels1, {
      rotation: "+=360",
      duration: 40,
      ease: "none",
      stagger: {
        each: 0.1,
        repeat: -1,
        yoyo: true
      }
    }, 0);
    
    tl.to(panels2, {
      rotation: "-=360",
      duration: 30,
      ease: "none",
      stagger: {
        each: 0.1,
        repeat: -1,
        yoyo: true
      }
    }, 0);
    
    // Pulse animation
    tl.to([panels1, panels2], {
      scale: 1.1,
      duration: 15,
      ease: "sine.inOut",
      stagger: {
        each: 0.2,
        repeat: -1,
        yoyo: true
      }
    }, 0);
    
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={bgRef} className="animated-bg">
      {/* First set of panels */}
      <div className="panel panel1" style={{ zIndex: 1, opacity: 0.3 }}></div>
      <div className="panel panel1" style={{ zIndex: 2, opacity: 0.3 }}></div>
      <div className="panel panel1" style={{ zIndex: 3, opacity: 0.3 }}></div>
      <div className="panel panel1" style={{ zIndex: 4, opacity: 0.3 }}></div>
      <div className="panel panel1" style={{ zIndex: 5, opacity: 0.3 }}></div>
      <div className="panel panel1" style={{ zIndex: 6, opacity: 0.3 }}></div>
      
      {/* Second set of panels */}
      <div className="panel panel2" style={{ zIndex: 1, opacity: 0.3 }}></div>
      <div className="panel panel2" style={{ zIndex: 2, opacity: 0.3 }}></div>
      <div className="panel panel2" style={{ zIndex: 3, opacity: 0.3 }}></div>
      <div className="panel panel2" style={{ zIndex: 4, opacity: 0.3 }}></div>
      <div className="panel panel2" style={{ zIndex: 5, opacity: 0.3 }}></div>
      <div className="panel panel2" style={{ zIndex: 6, opacity: 0.3 }}></div>
    </div>
  );
} 