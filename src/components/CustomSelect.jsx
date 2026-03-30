import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = options.find((item) => String(item.value) === String(value));

  useEffect(() => {
    function handleClickOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={`custom-select ${className}`} ref={rootRef}>
      <button
        type="button"
        className={`custom-select-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="custom-select-label">{selected?.label || placeholder || "Select"}</span>
        <ChevronDown size={16} className={`custom-select-icon ${open ? "rotate" : ""}`} />
      </button>

      {open && (
        <div className="custom-select-menu">
          {options.map((option) => {
            const isActive = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                type="button"
                className={`custom-select-option ${isActive ? "active" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isActive ? <Check size={16} /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
