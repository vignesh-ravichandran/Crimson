// Effort Level Selector Component
// Visual selector for effort levels 1-5

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const EFFORT_LEVELS = [
  { value: 0, label: 'Skip', emoji: '🚫', color: 'bg-gray-400 text-gray-800 dark:bg-gray-600 dark:text-gray-200', penalty: true },
  { value: 1, label: 'Minimal', emoji: '😴', color: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 2, label: 'Moderate', emoji: '💪', color: 'bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 3, label: 'Strong', emoji: '🔥', color: 'bg-orange-300 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { value: 4, label: 'Maximum', emoji: '⚡', color: 'bg-red-400 text-red-900 dark:bg-red-900 dark:text-red-200' },
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
          min="0"
          max="4"
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
      <div className={`text-center p-3 rounded-lg ${
        value === 0 
          ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600' 
          : 'bg-surface'
      }`}>
        <p className="text-sm text-muted mb-1">Selected Effort Level</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{EFFORT_LEVELS[value].emoji}</span>
          <span className={`text-xl font-bold ${value === 0 ? 'text-gray-600 dark:text-gray-400' : 'text-primary-500'}`}>
            {value}
          </span>
          <span className="text-sm text-text">- {EFFORT_LEVELS[value].label}</span>
        </div>
        {value === 0 && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            ⚠️ Skip will result in a penalty score
          </p>
        )}
      </div>
    </div>
  );
}

