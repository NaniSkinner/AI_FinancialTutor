import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 mt-auto border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Made with 🍵 by{" "}
          <a
            href="https://www.naniskinner.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Nani Skinner
          </a>
        </p>
      </div>
    </footer>
  );
};
