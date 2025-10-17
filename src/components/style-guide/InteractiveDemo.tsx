import { ReactNode, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface DemoControl {
  type: 'slider' | 'switch' | 'select';
  label: string;
  prop: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
}

interface InteractiveDemoProps {
  title: string;
  description?: string;
  controls: DemoControl[];
  render: (props: Record<string, any>) => ReactNode;
}

export function InteractiveDemo({ title, description, controls, render }: InteractiveDemoProps) {
  const [props, setProps] = useState<Record<string, any>>(
    controls.reduce((acc, control) => ({
      ...acc,
      [control.prop]: control.defaultValue ?? (control.type === 'switch' ? false : control.type === 'slider' ? control.min : '')
    }), {})
  );

  const updateProp = (prop: string, value: any) => {
    setProps(prev => ({ ...prev, [prop]: value }));
  };

  return (
    <Card className="surface-elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="p-6 rounded-lg border border-border bg-card flex items-center justify-center min-h-[200px]">
            {render(props)}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Controles</h4>
            {controls.map((control) => (
              <div key={control.prop} className="space-y-2">
                <Label htmlFor={control.prop}>{control.label}</Label>
                
                {control.type === 'slider' && (
                  <div className="space-y-2">
                    <Slider
                      id={control.prop}
                      min={control.min}
                      max={control.max}
                      step={control.step ?? 1}
                      value={[props[control.prop]]}
                      onValueChange={(value) => updateProp(control.prop, value[0])}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {props[control.prop]}
                    </div>
                  </div>
                )}

                {control.type === 'switch' && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={control.prop}
                      checked={props[control.prop]}
                      onCheckedChange={(checked) => updateProp(control.prop, checked)}
                    />
                    <Label htmlFor={control.prop} className="text-muted-foreground">
                      {props[control.prop] ? 'Ativado' : 'Desativado'}
                    </Label>
                  </div>
                )}

                {control.type === 'select' && control.options && (
                  <Select
                    value={props[control.prop]}
                    onValueChange={(value) => updateProp(control.prop, value)}
                  >
                    <SelectTrigger id={control.prop}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {control.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}