/**
 * SpendSense Logo Component
 * Modern globe-inspired design with tagline
 */

interface LogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
  variant?: "light" | "dark";
}

export function Logo({ size = "medium", showTagline = true, variant = "dark" }: LogoProps) {
  const sizes = {
    small: {
      icon: "w-9 h-9",
      text: "text-base",
      tagline: "text-[10px]",
      gap: "gap-2.5",
    },
    medium: {
      icon: "w-12 h-12",
      text: "text-2xl",
      tagline: "text-xs",
      gap: "gap-3",
    },
    large: {
      icon: "w-20 h-20",
      text: "text-5xl",
      tagline: "text-sm",
      gap: "gap-4",
    },
  };

  const config = sizes[size];
  const isDark = variant === "dark";

  return (
    <div className={`flex items-center ${config.gap}`}>
      {/* Globe Icon */}
      <div
        className={`${config.icon} rounded-full flex items-center justify-center relative overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30"
            : "bg-gradient-to-br from-indigo-600 to-blue-700 shadow-lg shadow-indigo-600/40"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[60%] h-[60%] text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe with financial theme */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <path
            d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M2 12H22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M5 7H19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M5 17H19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Dollar sign accent */}
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fill="currentColor"
            fontSize="10"
            fontWeight="bold"
            opacity="0.4"
          >
            $
          </text>
        </svg>
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <h1
          className={`${config.text} font-bold tracking-tight ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          SpendSense
        </h1>
        {showTagline && (
          <p
            className={`${config.tagline} font-semibold tracking-wider uppercase ${
              isDark ? "text-indigo-400" : "text-indigo-600"
            }`}
          >
            Your Financial Learning Hub
          </p>
        )}
      </div>
    </div>
  );
}

// Compact version for header
export function LogoCompact() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Globe Icon */}
      <div className="w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-indigo-500 dark:to-blue-600 shadow-md shadow-indigo-500/20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[60%] h-[60%] text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <path
            d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 2C12 2 16 6 16 12C16 18 12 22 12 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M2 12H22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M5 7H19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M5 17H19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
        SpendSense
      </h1>
    </div>
  );
}

