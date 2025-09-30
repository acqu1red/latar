import { motion, useReducedMotion } from "framer-motion";

/**
 * HeroDiagonal – plan assembly animation
 *
 * Structure:
 *  hero1 — background without plan
 *  hero2 — TOP LEFT quarter (plan without furniture)
 *  hero3 — TOP RIGHT quarter (plan without furniture)
 *  hero4 — BOTTOM LEFT quarter (plan without furniture)
 *  hero5 — BOTTOM RIGHT quarter (plan without furniture)
 *  hero6 — FURNITURE overlay (furniture inside the plan)
 */

export type HeroImages = {
  hero1: string; // background
  hero2: string; // top left
  hero3: string; // top right
  hero4: string; // bottom left
  hero5: string; // bottom right
  hero6: string; // furniture
};

interface HeroDiagonalProps {
  images: HeroImages;
  className?: string;
}

export default function HeroDiagonal({ images, className = "" }: HeroDiagonalProps) {
  const prefersReducedMotion = useReducedMotion();

  // Animation timings
  const DURATION = prefersReducedMotion ? 0 : 1.8;

  // Common transition
  const t = { duration: DURATION, ease: [0.22, 1, 0.36, 1] as any };

  // Debug: log images
  console.log('HeroDiagonal images:', images);

  return (
    <section
      className={`relative isolate w-full overflow-hidden bg-[#0a0d12] rounded-2xl ${className}`}
      style={{
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset, 0 40px 120px rgba(0,0,0,0.5)",
        transform: "perspective(1000px) rotateX(20deg) rotateY(-18deg) translateZ(30px)",
        transformOrigin: "left bottom",
        transformStyle: "preserve-3d"
      }}
      aria-label="Plan assembly hero"
    >
      {/* Glow/gradient backdrop for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 70% 30%, rgba(120, 80, 255, 0.20), transparent 60%), radial-gradient(50% 50% at 20% 70%, rgba(18, 169, 255, 0.15), transparent 60%)",
          filter: "saturate(120%) blur(0.2px)",
        }}
      />

      {/* CONTENT CONTAINER */}
      <div className="relative w-full h-full" style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* hero1 – big background */}
        <motion.img
          src={images.hero1}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ ...t, duration: DURATION * 1.1 }}
          onError={(e) => console.error('Failed to load hero1:', e)}
          onLoad={() => console.log('Hero1 loaded successfully')}
        />

        {/* hero2 – TOP LEFT QUARTER (план без мебели) - появляется слева */}
        <motion.div
          className="absolute top-0 left-0 w-1/2 h-1/2 overflow-hidden"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            borderTopLeftRadius: "16px"
          }}
          initial={{ 
            opacity: 0, 
            filter: "blur(20px)",
            x: -150,
            scale: 0.6,
            rotateY: -15
          }}
          animate={{ 
            opacity: 1, 
            filter: "blur(0px)",
            x: 0,
            scale: 1,
            rotateY: 0
          }}
          transition={{ 
            duration: 1.2, 
            delay: 0.2, 
            ease: [0.22, 1, 0.36, 1],
            x: { duration: 1.0, ease: "easeOut" },
            opacity: { duration: 0.8, ease: "easeOut" },
            filter: { duration: 1.0, ease: "easeOut" },
            scale: { duration: 1.0, ease: "easeOut" },
            rotateY: { duration: 1.0, ease: "easeOut" }
          }}
        >
          <img 
            src={images.hero2} 
            alt="Top left plan quarter" 
            className="w-full h-full object-cover"
            style={{ objectPosition: "right bottom" }}
            onError={(e) => console.error('Failed to load hero2:', e)}
            onLoad={() => console.log('Hero2 loaded successfully')}
          />
        </motion.div>

        {/* hero3 – TOP RIGHT QUARTER (план без мебели) - появляется справа */}
        <motion.div
          className="absolute top-0 right-0 w-1/2 h-1/2 overflow-hidden"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            borderTopRightRadius: "16px"
          }}
          initial={{ 
            opacity: 0, 
            filter: "blur(20px)",
            x: 150,
            scale: 0.6,
            rotateY: 15
          }}
          animate={{ 
            opacity: 1, 
            filter: "blur(0px)",
            x: 0,
            scale: 1,
            rotateY: 0
          }}
          transition={{ 
            duration: 1.2, 
            delay: 0.3, 
            ease: [0.22, 1, 0.36, 1],
            x: { duration: 1.0, ease: "easeOut" },
            opacity: { duration: 0.8, ease: "easeOut" },
            filter: { duration: 1.0, ease: "easeOut" },
            scale: { duration: 1.0, ease: "easeOut" },
            rotateY: { duration: 1.0, ease: "easeOut" }
          }}
        >
          <img 
            src={images.hero3} 
            alt="Top right plan quarter" 
            className="w-full h-full object-cover"
            style={{ objectPosition: "left bottom" }}
            onError={(e) => console.error('Failed to load hero3:', e)}
            onLoad={() => console.log('Hero3 loaded successfully')}
          />
        </motion.div>

        {/* hero4 – BOTTOM LEFT QUARTER (план без мебели) - появляется слева */}
        <motion.div
          className="absolute bottom-0 left-0 w-1/2 h-1/2 overflow-hidden"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            borderBottomLeftRadius: "16px"
          }}
          initial={{ 
            opacity: 0, 
            filter: "blur(20px)",
            x: -150,
            scale: 0.6,
            rotateY: -15
          }}
          animate={{ 
            opacity: 1, 
            filter: "blur(0px)",
            x: 0,
            scale: 1,
            rotateY: 0
          }}
          transition={{ 
            duration: 1.2, 
            delay: 0.4, 
            ease: [0.22, 1, 0.36, 1],
            x: { duration: 1.0, ease: "easeOut" },
            opacity: { duration: 0.8, ease: "easeOut" },
            filter: { duration: 1.0, ease: "easeOut" },
            scale: { duration: 1.0, ease: "easeOut" },
            rotateY: { duration: 1.0, ease: "easeOut" }
          }}
        >
          <img 
            src={images.hero4} 
            alt="Bottom left plan quarter" 
            className="w-full h-full object-cover"
            style={{ objectPosition: "right top" }}
            onError={(e) => console.error('Failed to load hero4:', e)}
            onLoad={() => console.log('Hero4 loaded successfully')}
          />
        </motion.div>

        {/* hero5 – BOTTOM RIGHT QUARTER (план без мебели) - появляется справа */}
        <motion.div
          className="absolute bottom-0 right-0 w-1/2 h-1/2 overflow-hidden"
          style={{ 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            borderBottomRightRadius: "16px"
          }}
          initial={{ 
            opacity: 0, 
            filter: "blur(20px)",
            x: 150,
            scale: 0.6,
            rotateY: 15
          }}
          animate={{ 
            opacity: 1, 
            filter: "blur(0px)",
            x: 0,
            scale: 1,
            rotateY: 0
          }}
          transition={{ 
            duration: 1.2, 
            delay: 0.5, 
            ease: [0.22, 1, 0.36, 1],
            x: { duration: 1.0, ease: "easeOut" },
            opacity: { duration: 0.8, ease: "easeOut" },
            filter: { duration: 1.0, ease: "easeOut" },
            scale: { duration: 1.0, ease: "easeOut" },
            rotateY: { duration: 1.0, ease: "easeOut" }
          }}
        >
          <img 
            src={images.hero5} 
            alt="Bottom right plan quarter" 
            className="w-full h-full object-cover"
            style={{ objectPosition: "left top" }}
            onError={(e) => console.error('Failed to load hero5:', e)}
            onLoad={() => console.log('Hero5 loaded successfully')}
          />
        </motion.div>

        {/* hero6 – FURNITURE OVERLAY (мебель поверх плана) */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-11/12 h-11/12 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
          }}
          initial={{ opacity: 0, filter: "blur(15px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.0, delay: 0.8, ease: "easeOut" }}
        >
          <img 
            src={images.hero6} 
            alt="Furniture overlay" 
            className="w-full h-full object-cover"
            style={{ 
              objectPosition: "center",
              transform: "scale(1.1)", // Увеличенное масштабирование
              mixBlendMode: "overlay", // Режим смешивания для лучшей интеграции
              opacity: 0.9 // Немного прозрачности для естественного вида
            }}
            onError={(e) => console.error('Failed to load hero6:', e)}
            onLoad={() => console.log('Hero6 loaded successfully')}
          />
          {/* Overlay для лучшего смешивания с планом */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        </motion.div>

        {/* soft vignette */}
        <div className="pointer-events-none absolute inset-0" style={{
          background:
            "radial-gradient(130% 80% at 50% 60%, transparent 50%, rgba(0,0,0,0.35) 100%)",
        }} />
        
        {/* Smooth fade-out edges for seamless blending - эффект ластика по всему контуру */}
        <div 
          className="pointer-events-none absolute inset-0" 
          style={{
            background: `
              linear-gradient(to right, rgba(10,13,18,0) 0%, rgba(10,13,18,0) 70%, rgba(10,13,18,0.1) 80%, rgba(10,13,18,0.3) 85%, rgba(10,13,18,0.6) 90%, rgba(10,13,18,0.8) 95%, rgba(10,13,18,0.95) 98%, rgba(10,13,18,1) 100%),
              linear-gradient(to left, rgba(10,13,18,0) 0%, rgba(10,13,18,0) 95%, rgba(10,13,18,0.8) 98%, rgba(10,13,18,1) 100%),
              linear-gradient(to bottom, rgba(10,13,18,0) 0%, rgba(10,13,18,0) 90%, rgba(10,13,18,0.5) 95%, rgba(10,13,18,0.8) 98%, rgba(10,13,18,1) 100%),
              linear-gradient(to top, rgba(10,13,18,0) 0%, rgba(10,13,18,0) 90%, rgba(10,13,18,0.5) 95%, rgba(10,13,18,0.8) 98%, rgba(10,13,18,1) 100%)
            `,
            mask: `
              linear-gradient(to right, black 0%, black 70%, rgba(0,0,0,0.9) 80%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0.4) 95%, rgba(0,0,0,0.2) 98%, transparent 100%),
              linear-gradient(to left, black 0%, black 95%, rgba(0,0,0,0.3) 98%, transparent 100%),
              linear-gradient(to bottom, black 0%, black 90%, rgba(0,0,0,0.5) 95%, rgba(0,0,0,0.3) 98%, transparent 100%),
              linear-gradient(to top, black 0%, black 90%, rgba(0,0,0,0.5) 95%, rgba(0,0,0,0.3) 98%, transparent 100%)
            `,
            WebkitMask: `
              linear-gradient(to right, black 0%, black 70%, rgba(0,0,0,0.9) 80%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0.4) 95%, rgba(0,0,0,0.2) 98%, transparent 100%),
              linear-gradient(to left, black 0%, black 95%, rgba(0,0,0,0.3) 98%, transparent 100%),
              linear-gradient(to bottom, black 0%, black 90%, rgba(0,0,0,0.5) 95%, rgba(0,0,0,0.3) 98%, transparent 100%),
              linear-gradient(to top, black 0%, black 90%, rgba(0,0,0,0.5) 95%, rgba(0,0,0,0.3) 98%, transparent 100%)
            `
          }}
        />
        
      </div>
    </section>
  );
}