import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

export function ColorDropdown() {
  const [isOpen, setIsOpen] = useState(false); // For dropdown toggle
  const [hue, setHue] = useState(180); // Default hue
  const [saturation, setSaturation] = useState(50); // Default saturation

  // Get the color from local storage or use defaults
  useEffect(() => {
    const storedHue = localStorage.getItem('color-hue');
    const storedSaturation = localStorage.getItem('color-saturation');
    if (storedHue) setHue(parseInt(storedHue, 10));
    if (storedSaturation) setSaturation(parseInt(storedSaturation, 10));
  }, []);

  // Set CSS variables on the document element
  useEffect(() => {
    const color = `hsl(${hue}, ${saturation}%, 50%)`;
    document.documentElement.style.setProperty('--nextra-primary-hue', hue);
    document.documentElement.style.setProperty('--nextra-primary-saturation', saturation);
    localStorage.setItem('color-hue', hue);
    localStorage.setItem('color-saturation', saturation);
  }, [hue, saturation]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleHueChange = (e) => {
    setHue(e.target.value);
  };

  const handleSaturationChange = (e) => {
    setSaturation(e.target.value);
  };

  return (
    <div className="relative inline-block">
      {/* Dot button with primary color */}
      <button
        className="w-6 h-6 rounded-full border border-gray-400"
        style={{ backgroundColor: `hsl(${hue}, ${saturation}%, 50%)` }}
        onClick={toggleDropdown}
      >Hello</button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            {/* Hue Slider */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Hue</label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="w-full"
              />
              <span className="block text-sm text-gray-500">{hue}°</span>
            </div>

            {/* Saturation Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Saturation</label>
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={handleSaturationChange}
                className="w-full"
              />
              <span className="block text-sm text-gray-500">{saturation}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
