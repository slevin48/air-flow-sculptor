import { useRef, useEffect } from "react";

interface SimulationParams {
  velocity: number;
  angleOfAttack: number;
  airfoilType: string;
  reynoldsNumber: number;
}

interface Results {
  liftCoefficient: number;
  dragCoefficient: number;
  pressureCoefficient: number;
  maxVelocity: number;
}

interface FlowVisualizationProps {
  params: SimulationParams;
  results: Results;
  isRunning: boolean;
}

export const FlowVisualization = ({ params, results, isRunning }: FlowVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawAirfoil = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) => {
    const chord = 200 * scale;
    const thickness = 0.12; // 12% thickness for NACA 0012
    
    ctx.beginPath();
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 3;
    
    // Simple airfoil shape (NACA 0012 approximation)
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * chord;
      const yt = 5 * thickness * (0.2969 * Math.sqrt(x/chord) - 0.1260 * (x/chord) - 
                                   0.3516 * Math.pow(x/chord, 2) + 0.2843 * Math.pow(x/chord, 3) - 
                                   0.1015 * Math.pow(x/chord, 4));
      
      const angle = (params.angleOfAttack * Math.PI) / 180;
      const xRot = (x - chord/2) * Math.cos(angle) - yt * Math.sin(angle) + centerX;
      const yRot = (x - chord/2) * Math.sin(angle) + yt * Math.cos(angle) + centerY;
      
      if (i === 0) ctx.moveTo(xRot, yRot);
      else ctx.lineTo(xRot, yRot);
    }
    
    // Bottom surface
    for (let i = 100; i >= 0; i--) {
      const x = (i / 100) * chord;
      const yt = -5 * thickness * (0.2969 * Math.sqrt(x/chord) - 0.1260 * (x/chord) - 
                                    0.3516 * Math.pow(x/chord, 2) + 0.2843 * Math.pow(x/chord, 3) - 
                                    0.1015 * Math.pow(x/chord, 4));
      
      const angle = (params.angleOfAttack * Math.PI) / 180;
      const xRot = (x - chord/2) * Math.cos(angle) - yt * Math.sin(angle) + centerX;
      const yRot = (x - chord/2) * Math.sin(angle) + yt * Math.cos(angle) + centerY;
      
      ctx.lineTo(xRot, yRot);
    }
    
    ctx.closePath();
    ctx.stroke();
    
    // Fill airfoil
    ctx.fillStyle = '#001122';
    ctx.fill();
  };

  const drawStreamlines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const numLines = 20;
    
    ctx.strokeStyle = '#00ccff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    
    for (let i = 0; i < numLines; i++) {
      const startY = (height / numLines) * i;
      
      ctx.beginPath();
      ctx.moveTo(0, startY);
      
      // Create curved streamlines around airfoil
      for (let x = 0; x <= width; x += 5) {
        const distanceFromCenter = Math.abs(startY - centerY);
        const deflection = Math.exp(-Math.pow((x - centerX) / 100, 2)) * 
                          (distanceFromCenter > 30 ? params.angleOfAttack * 2 : params.angleOfAttack * 4);
        const y = startY + deflection * Math.sin((x / width) * Math.PI);
        
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  };

  const drawVelocityField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const gridSize = 40;
    
    for (let x = gridSize; x < width; x += gridSize) {
      for (let y = gridSize; y < height; y += gridSize) {
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        if (distance > 80) { // Don't draw inside airfoil
          const velocity = params.velocity * (1 + Math.random() * 0.3);
          const alpha = Math.atan2(y - centerY, x - centerX) + (params.angleOfAttack * Math.PI) / 180;
          
          const arrowLength = Math.min(20, velocity / 5);
          const endX = x + arrowLength * Math.cos(alpha);
          const endY = y + arrowLength * Math.sin(alpha);
          
          // Color based on velocity magnitude
          const intensity = Math.min(255, velocity * 2);
          ctx.strokeStyle = `rgb(0, ${intensity}, 255)`;
          ctx.lineWidth = 2;
          
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          
          // Arrow head
          const headSize = 4;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headSize * Math.cos(alpha - Math.PI / 6),
            endY - headSize * Math.sin(alpha - Math.PI / 6)
          );
          ctx.moveTo(endX, endY);
          ctx.lineTo(
            endX - headSize * Math.cos(alpha + Math.PI / 6),
            endY - headSize * Math.sin(alpha + Math.PI / 6)
          );
          ctx.stroke();
        }
      }
    }
  };

  const drawPressureField = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create pressure visualization
    const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 200);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)'); // High pressure (red)
    gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.2)'); // Medium pressure (green)
    gradient.addColorStop(1, 'rgba(0, 0, 255, 0.1)'); // Low pressure (blue)
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw pressure field
    drawPressureField(ctx, width, height);
    
    // Draw streamlines
    drawStreamlines(ctx, width, height);
    
    // Draw velocity field
    drawVelocityField(ctx, width, height);
    
    // Draw airfoil
    drawAirfoil(ctx, width / 2, height / 2, 1);
    
    // Add flow direction indicator
    ctx.fillStyle = '#00ccff';
    ctx.font = '14px monospace';
    ctx.fillText(`Flow: ${params.velocity} m/s →`, 20, 30);
    ctx.fillText(`α: ${params.angleOfAttack}°`, 20, 50);
    
  }, [params, results]);

  return (
    <div className="relative bg-gradient-to-br from-background to-secondary/20 rounded-lg overflow-hidden border border-border/50">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-auto"
      />
      
      {isRunning && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gradient-panel p-6 rounded-lg border border-border/50 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-foreground font-medium">Computing CFD Solution...</p>
            <p className="text-muted-foreground text-sm">Solving Navier-Stokes equations</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded border border-border/50">
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span>Streamlines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-50"></div>
            <span>Pressure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cyan-400"></div>
            <span>Velocity</span>
          </div>
        </div>
      </div>
    </div>
  );
};