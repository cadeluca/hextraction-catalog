import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255
  )})`;
}

export default function ThemeColorSelector() {
  const [hue, setHue] = useState(180); // Default hue
  const [saturation, setSaturation] = useState(50); // Default saturation
  const [color, setColor] = useState("");

  // Get the color from local storage or use defaults
  useEffect(() => {
    const storedHue = localStorage.getItem("color-hue");
    const storedSaturation = localStorage.getItem("color-saturation");
    if (storedHue) setHue(parseInt(storedHue, 10));
    if (storedSaturation) setSaturation(parseInt(storedSaturation, 10));
  }, []);

  // Set CSS variables on the document element
  useEffect(() => {
    const color = `hsl(${hue}, ${saturation}%, 50%)`;
    document.documentElement.style.setProperty("--nextra-primary-hue", hue);
    document.documentElement.style.setProperty(
      "--nextra-primary-saturation",
      saturation
    );
    localStorage.setItem("color-hue", hue);
    localStorage.setItem("color-saturation", saturation);
  }, [hue, saturation]);

  useEffect(() => {
    setColor(hslToRgb(hue, saturation, 50));
  }, [hue, saturation]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-10 h-10 rounded-full p-0 border-2"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Open color picker</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Hue</h4>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[hue]}
              onValueChange={(value) => setHue(value[0])}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              aria-label="Hue"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Saturation</h4>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[saturation]}
              onValueChange={(value) => setSaturation(value[0])}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              aria-label="Saturation"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
