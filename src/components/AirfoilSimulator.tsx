import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FlowVisualization } from "./FlowVisualization";
import { ParameterPanel } from "./ParameterPanel";
import { ResultsDisplay } from "./ResultsDisplay";

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

export const AirfoilSimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [params, setParams] = useState<SimulationParams>({
    velocity: 50,
    angleOfAttack: 5,
    airfoilType: "NACA 0012",
    reynoldsNumber: 1e6
  });

  const [results, setResults] = useState<Results>({
    liftCoefficient: 0,
    dragCoefficient: 0,
    pressureCoefficient: 0,
    maxVelocity: 0
  });

  // Simple CFD calculations (simplified for demo)
  const calculateResults = (params: SimulationParams): Results => {
    const alpha = (params.angleOfAttack * Math.PI) / 180;
    const cl = 2 * Math.PI * alpha * Math.cos(alpha); // Simplified lift coefficient
    const cd = 0.01 + (cl * cl) / (Math.PI * 8); // Simplified drag coefficient
    const cp = -4 * alpha * alpha + 1; // Simplified pressure coefficient
    const maxVel = params.velocity * (1 + Math.abs(alpha)); // Max velocity around airfoil
    
    return {
      liftCoefficient: Math.max(-2, Math.min(2, cl)),
      dragCoefficient: Math.max(0, Math.min(0.2, cd)),
      pressureCoefficient: Math.max(-2, Math.min(2, cp)),
      maxVelocity: maxVel
    };
  };

  const runSimulation = () => {
    setIsRunning(true);
    
    // Simulate computation time
    setTimeout(() => {
      const newResults = calculateResults(params);
      setResults(newResults);
      setIsRunning(false);
    }, 1500);
  };

  useEffect(() => {
    // Auto-calculate when parameters change
    const newResults = calculateResults(params);
    setResults(newResults);
  }, [params]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-button bg-clip-text text-transparent">
            Airfoil CFD Simulator
          </h1>
          <p className="text-muted-foreground text-lg">
            Computational Fluid Dynamics simulation of airfoil aerodynamics
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="font-mono">Re = {params.reynoldsNumber.toExponential(1)}</Badge>
            <Badge variant="outline" className="font-mono">{params.airfoilType}</Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parameters Panel */}
          <div className="lg:col-span-1">
            <ParameterPanel 
              params={params}
              onParamsChange={setParams}
              onRunSimulation={runSimulation}
              isRunning={isRunning}
            />
          </div>

          {/* Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-panel border-border/50 shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Flow Visualization</h3>
                  <div className="flex gap-2">
                    <Badge variant={isRunning ? "default" : "secondary"}>
                      {isRunning ? "Computing..." : "Ready"}
                    </Badge>
                  </div>
                </div>
                <FlowVisualization 
                  params={params}
                  results={results}
                  isRunning={isRunning}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Results */}
        <ResultsDisplay results={results} isRunning={isRunning} />
      </div>
    </div>
  );
};