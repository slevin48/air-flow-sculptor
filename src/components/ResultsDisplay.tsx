import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wind, Gauge } from "lucide-react";

interface Results {
  liftCoefficient: number;
  dragCoefficient: number;
  pressureCoefficient: number;
  maxVelocity: number;
}

interface ResultsDisplayProps {
  results: Results;
  isRunning: boolean;
}

export const ResultsDisplay = ({ results, isRunning }: ResultsDisplayProps) => {
  const formatNumber = (num: number, decimals: number = 3) => {
    return num.toFixed(decimals);
  };

  const getPerformanceRating = (cl: number, cd: number) => {
    const liftToDrag = Math.abs(cl / (cd || 0.001));
    if (liftToDrag > 50) return { rating: "Excellent", color: "bg-green-500" };
    if (liftToDrag > 30) return { rating: "Good", color: "bg-blue-500" };
    if (liftToDrag > 15) return { rating: "Fair", color: "bg-yellow-500" };
    return { rating: "Poor", color: "bg-red-500" };
  };

  const performance = getPerformanceRating(results.liftCoefficient, results.dragCoefficient);
  const liftToDragRatio = Math.abs(results.liftCoefficient / (results.dragCoefficient || 0.001));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Lift Coefficient */}
      <Card className="bg-gradient-panel border-border/50 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Lift Coefficient</h4>
            </div>
            <Badge variant="outline" className="font-mono">CL</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-3xl font-bold text-primary">
              {isRunning ? "—" : formatNumber(results.liftCoefficient)}
            </div>
            
            <Progress 
              value={Math.abs(results.liftCoefficient) * 50} 
              className="h-2"
            />
            
            <div className="text-sm text-muted-foreground">
              {results.liftCoefficient > 0 ? "Positive lift" : "Negative lift"}
            </div>
          </div>
        </div>
      </Card>

      {/* Drag Coefficient */}
      <Card className="bg-gradient-panel border-border/50 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <h4 className="font-semibold">Drag Coefficient</h4>
            </div>
            <Badge variant="outline" className="font-mono">CD</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-3xl font-bold text-red-400">
              {isRunning ? "—" : formatNumber(results.dragCoefficient)}
            </div>
            
            <Progress 
              value={results.dragCoefficient * 500} 
              className="h-2"
            />
            
            <div className="text-sm text-muted-foreground">
              Parasitic + induced drag
            </div>
          </div>
        </div>
      </Card>

      {/* Pressure Coefficient */}
      <Card className="bg-gradient-panel border-border/50 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-yellow-400" />
              <h4 className="font-semibold">Pressure Coefficient</h4>
            </div>
            <Badge variant="outline" className="font-mono">CP</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-3xl font-bold text-yellow-400">
              {isRunning ? "—" : formatNumber(results.pressureCoefficient)}
            </div>
            
            <Progress 
              value={Math.abs(results.pressureCoefficient) * 50} 
              className="h-2"
            />
            
            <div className="text-sm text-muted-foreground">
              Surface pressure distribution
            </div>
          </div>
        </div>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-gradient-panel border-border/50 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-cyan-400" />
              <h4 className="font-semibold">Performance</h4>
            </div>
            <Badge variant="outline" className="font-mono">L/D</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="text-3xl font-bold text-cyan-400">
              {isRunning ? "—" : formatNumber(liftToDragRatio, 1)}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${performance.color}`}></div>
              <span className="text-sm font-medium">{performance.rating}</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Lift-to-drag ratio
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};