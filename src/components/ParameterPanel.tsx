import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Play, RotateCcw } from "lucide-react";

interface SimulationParams {
  velocity: number;
  angleOfAttack: number;
  airfoilType: string;
  reynoldsNumber: number;
}

interface ParameterPanelProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export const ParameterPanel = ({ params, onParamsChange, onRunSimulation, isRunning }: ParameterPanelProps) => {
  const updateParam = (key: keyof SimulationParams, value: any) => {
    onParamsChange({ ...params, [key]: value });
  };

  const resetParams = () => {
    onParamsChange({
      velocity: 50,
      angleOfAttack: 5,
      airfoilType: "NACA 0012",
      reynoldsNumber: 1e6
    });
  };

  return (
    <Card className="bg-gradient-panel border-border/50 shadow-2xl">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Simulation Parameters</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={resetParams}
            className="hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Separator className="bg-border/50" />

        {/* Airfoil Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Airfoil Profile</Label>
          <Select
            value={params.airfoilType}
            onValueChange={(value) => updateParam('airfoilType', value)}
          >
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NACA 0012">NACA 0012</SelectItem>
              <SelectItem value="NACA 2412">NACA 2412</SelectItem>
              <SelectItem value="NACA 4415">NACA 4415</SelectItem>
              <SelectItem value="Clark Y">Clark Y</SelectItem>
              <SelectItem value="Supercritical">Supercritical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flow Velocity */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">Flow Velocity</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {params.velocity} m/s
            </span>
          </div>
          <Slider
            value={[params.velocity]}
            onValueChange={(value) => updateParam('velocity', value[0])}
            min={10}
            max={200}
            step={5}
            className="w-full"
          />
        </div>

        {/* Angle of Attack */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">Angle of Attack</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {params.angleOfAttack}°
            </span>
          </div>
          <Slider
            value={[params.angleOfAttack]}
            onValueChange={(value) => updateParam('angleOfAttack', value[0])}
            min={-20}
            max={20}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Reynolds Number */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">Reynolds Number</Label>
            <span className="text-sm text-muted-foreground font-mono">
              {params.reynoldsNumber.toExponential(1)}
            </span>
          </div>
          <Slider
            value={[Math.log10(params.reynoldsNumber)]}
            onValueChange={(value) => updateParam('reynoldsNumber', Math.pow(10, value[0]))}
            min={4}
            max={7}
            step={0.1}
            className="w-full"
          />
        </div>

        <Separator className="bg-border/50" />

        {/* Run Simulation Button */}
        <Button
          onClick={onRunSimulation}
          disabled={isRunning}
          className="w-full bg-gradient-button hover:scale-105 transition-transform duration-200 shadow-glow"
          size="lg"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
              Computing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Simulation
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};