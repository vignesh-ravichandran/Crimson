// Effort Level Selector Component
// Visual selector for effort levels 1-5

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const EFFORT_LEVELS = [
  { value: 1, label: 'Minimal', emoji: '😴', color: 'bg-gray-300 text-gray-700' },
  { value: 2, label: 'Light', emoji: '😊', color: 'bg-blue-300 text-blue-700' },
  { value: 3, label: 'Moderate', emoji: '💪', color: 'bg-green-300 text-green-700' },
  { value: 4, label: 'Strong', emoji: '🔥', color: 'bg-orange-300 text-orange-700' },
  { value: 5, label: 'Maximum', emoji: '⚡', color: 'bg-red-300 text-red-700' },
];

export function EffortLevelSelector({ value, onChange, disabled = false }: Props) {
  return (
    <div className="space-y-4">
      {/* Visual Buttons */}
      <div className="flex justify-between gap-2">
        {EFFORT_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => !disabled && onChange(level.value)}
            disabled={disabled}
            className={`
              flex-1 py-4 px-2 rounded-lg border-2 transition-all
              ${
                value === level.value
                  ? `${level.color} border-current scale-105 shadow-lg`
                  : 'bg-surface border-border hover:border-primary-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-3xl mb-1">{level.emoji}</div>
            <div className="text-xs font-medium">{level.value}</div>
          </button>
        ))}
      </div>

      {/* Slider (alternative input) */}
      <div className="px-2">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full accent-primary-500"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          {EFFORT_LEVELS.map((level) => (
            <span key={level.value}>{level.label}</span>
          ))}
        </div>
      </div>

      {/* Selected Level Display */}
      <div className="text-center p-3 bg-surface rounded-lg">
        <p className="text-sm text-muted mb-1">Selected Effort Level</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{EFFORT_LEVELS[value - 1].emoji}</span>
          <span className="text-xl font-bold text-primary-500">{value}</span>
          <span className="text-sm text-text">- {EFFORT_LEVELS[value - 1].label}</span>
        </div>
      </div>
    </div>
  );
}

