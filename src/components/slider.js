import { useEffect, useState } from "react";

export function Hue() {
  // State to manage the hue value
  const [hue, setHue] = useState("0");

  // Effect to load the value from local storage when the component mounts
  useEffect(() => {
    const storedHue = localStorage.getItem("nextra-primary-hue");
    if (storedHue) {
      setHue(storedHue);
      document.documentElement.style.setProperty(
        "--nextra-primary-hue",
        `${storedHue}deg`
      );
    }
  }, []);

  // Handle changes in the hue value
  const handleHueChange = (e) => {
    const value = e.target.value;
    const hueValue = `${value}deg`;

    // Update the CSS variable
    document.documentElement.style.setProperty(
      "--nextra-primary-hue",
      hueValue
    );

    // Update the label
    e.target.nextSibling.textContent = hueValue;

    // Store the hue value in local storage
    localStorage.setItem("nextra-primary-hue", value);

    // Update state
    setHue(value);
  };

  return (
    <div className="flex h-6 items-center gap-2">
      <input
        type="range"
        min="0"
        max="360"
        step="1"
        value={hue}
        onChange={handleHueChange}
      />
      <label className="text-sm text-gray-500 w-14" />
      {/* <label className="text-sm text-gray-500 w-14">{`${hue}deg`}</label> */}
    </div>
  );
}

export function Saturation() {
  return (
    <div className="flex h-6 items-center gap-2">
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        onChange={(e) => {
          const value = `${e.target.value}%`;
          e.target.nextSibling.textContent = value;
          document.documentElement.style.setProperty(
            "--nextra-primary-saturation",
            value
          );
        }}
      />
      <label className="text-sm text-gray-500 w-14" />
    </div>
  );
}
