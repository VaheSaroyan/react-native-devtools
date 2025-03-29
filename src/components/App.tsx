import React from "react";

export const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-4">
          💖 Hello World!
        </h1>
        <p className="text-gray-700 text-center">
          Welcome to your Electron application with React and Tailwind CSS.
        </p>
      </div>
    </div>
  );
};
