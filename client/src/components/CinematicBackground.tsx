/* Star positions — deterministic to avoid hydration issues */
const STARS: [number, number][] = [
  [8,6],[18,3],[32,9],[47,4],[61,11],[74,6],[88,8],[95,14],
  [5,18],[22,22],[38,16],[53,20],[67,17],[81,23],[93,19],
  [11,28],[28,32],[44,27],[59,30],[72,35],[86,29],[3,38],
  [16,42],[35,45],[50,40],[65,44],[79,48],[92,43],
  [7,54],[24,58],[41,52],[56,57],[70,53],[84,59],[97,55],
  [13,64],[30,68],[46,63],[62,67],[77,62],[90,69],
  [4,75],[20,78],[37,73],[54,77],[68,74],[83,79],[96,76],
  [9,85],[26,88],[43,83],[58,87],[73,84],[87,89],
  [15,93],[33,96],[51,91],[66,95],[80,92],[94,97],
];

export default function CinematicBackground(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, backgroundColor: "#020000" }}>
      
      {/* Opt-out of any distortion by using explicit pixel-circle gradients and hardware acceleration (translateZ) */}
      
      {/* 3D Perspective Grid - Left */}
      <div 
        className="absolute opacity-40 mix-blend-screen"
        style={{
          left: '-20%',
          top: '20%',
          width: '50%',
          height: '80%',
          backgroundImage: `
            linear-gradient(90deg, rgba(234,88,12,0.6) 1px, transparent 1px),
            linear-gradient(0deg, rgba(234,88,12,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(1000px) rotateY(60deg) rotateX(20deg) translateZ(0)',
          WebkitMaskImage: 'radial-gradient(circle 350px at center, black 10%, transparent 80%)',
          maskImage: 'radial-gradient(circle 350px at center, black 10%, transparent 80%)',
        }}
      />

      {/* 3D Perspective Grid - Right */}
      <div 
        className="absolute opacity-50 mix-blend-screen"
        style={{
          right: '-15%',
          top: '10%',
          width: '60%',
          height: '100%',
          backgroundImage: `
            linear-gradient(90deg, rgba(234,88,12,0.5) 1px, transparent 1px),
            linear-gradient(0deg, rgba(234,88,12,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '35px 35px',
          transform: 'perspective(1200px) rotateY(-50deg) rotateZ(10deg) translateZ(0)',
          WebkitMaskImage: 'radial-gradient(circle 500px at center, black 10%, transparent 70%)',
          maskImage: 'radial-gradient(circle 500px at center, black 10%, transparent 70%)',
        }}
      />

      {/* Stars field */}
      <div className="absolute inset-0">
        {STARS.map(([x, y], i) => {
          const size = i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1;
          const isOrange = i % 9 === 0;
          const isGlowing = i % 7 === 0;
          
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: isOrange ? "rgba(255,160,80,0.95)" : "rgba(255,255,255,0.6)",
                boxShadow: isGlowing
                  ? "0 0 8px 1.5px rgba(234, 88, 12, 0.6)"
                  : i % 4 === 0
                  ? "0 0 4px rgba(255,255,255,0.4)"
                  : "none",
                transform: 'translateZ(0)',
              }}
            />
          );
        })}
      </div>

      {/* Top ambient glow - Fixed dimensions prevent distortion */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: '1200px',
          height: '600px',
          background: 'radial-gradient(circle 400px at center 100px, rgba(234, 88, 12, 0.12) 0%, transparent 100%)',
          transform: 'translateY(-50%) translateZ(0)'
        }}
      />
      
      {/* Bottom large horizon glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '1800px',
          height: '800px',
          background: 'radial-gradient(ellipse 900px 500px at center bottom, rgba(194, 65, 12, 0.25) 0%, rgba(120, 30, 0, 0.15) 55%, transparent 100%)',
          transform: 'translateZ(0)'
        }}
      />

      {/* Bright center spotlight at the bottom */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse 400px 250px at center bottom, rgba(255, 100, 20, 0.45) 0%, transparent 100%)',
          transform: 'translateZ(0)'
        }}
      />
    </div>
  );
}
