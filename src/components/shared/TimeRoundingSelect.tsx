import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RoundingConfig, RoundingDirection } from "@/lib/rounding";

interface TimeRoundingSelectProps {
  config: RoundingConfig;
  onChange: (config: RoundingConfig) => void;
}

export function TimeRoundingSelect({ config, onChange }: TimeRoundingSelectProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="rounding-toggle">Enable time rounding</Label>
        <Switch
          id="rounding-toggle"
          checked={config.enabled}
          onCheckedChange={(checked) =>
            onChange({ ...config, enabled: checked })
          }
        />
      </div>

      {config.enabled && (
        <>
          <div className="space-y-2">
            <Label>Rounding interval</Label>
            <Select
              value={String(config.minutes)}
              onValueChange={(v) =>
                onChange({ ...config, minutes: parseInt(v, 10) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rounding direction</Label>
            <Select
              value={config.direction}
              onValueChange={(v) =>
                onChange({ ...config, direction: v as RoundingDirection })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up">Round up</SelectItem>
                <SelectItem value="down">Round down</SelectItem>
                <SelectItem value="nearest">Round to nearest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
