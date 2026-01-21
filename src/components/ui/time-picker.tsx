import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);

  const [hour, setHour] = React.useState(date ? date.getHours().toString().padStart(2, "0") : "12");
  const [minute, setMinute] = React.useState(date ? date.getMinutes().toString().padStart(2, "0") : "00");

  React.useEffect(() => {
    if (date) {
      setHour(date.getHours().toString().padStart(2, "0"));
      setMinute(date.getMinutes().toString().padStart(2, "0"));
    }
  }, [date]);

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (!date) return;
    const newDate = new Date(date);
    if (type === "hour") {
      const val = parseInt(value);
      if (val >= 0 && val < 24) {
        newDate.setHours(val);
        setHour(value);
      }
    } else {
      const val = parseInt(value);
      if (val >= 0 && val < 60) {
        newDate.setMinutes(val);
        setMinute(value);
      }
    }
    setDate(newDate);
  };

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Hours
        </Label>
        <Input
          id="hours"
          className="w-[64px]" // Fixed width to ensure it fits
          ref={hourRef}
          type="number"
          min={0}
          max={23}
          value={hour}
          onChange={(e) => handleTimeChange("hour", e.target.value)}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minutes
        </Label>
        <Input
          id="minutes"
          className="w-[64px]" // Fixed width to ensure it fits
          ref={minuteRef}
          type="number"
          min={0}
          max={59}
          value={minute}
          onChange={(e) => handleTimeChange("minute", e.target.value)}
        />
      </div>
    </div>
  );
}
