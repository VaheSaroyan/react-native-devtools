import React, { useState, useRef, useEffect } from "react";
import { User } from "../types/User";

interface Props {
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  users: User[];
}

interface UserOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export const DeviceSelection: React.FC<Props> = ({
  selectedUser,
  setSelectedUser,
  users,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate user options based on available users
  const userOptions: UserOption[] = (() => {
    if (users?.length === 0) {
      // No users available
      return [{ value: "", label: "No users available", disabled: true }];
    } else if (users?.length === 1) {
      // Only one user, no need for "All" option
      return [
        {
          value: users[0].deviceName || "Unknown Device Name",
          label: users[0].deviceName || "Unknown Device Name",
        },
      ];
    } else {
      // Multiple users, include "All" option
      return [
        { value: "All", label: "All" },
        ...users.map((user) => ({
          value: user.deviceName || "Unknown Device Name",
          label: user.deviceName || "Unknown Device Name",
        })),
      ];
    }
  })();

  // Update selectedUser based on the number of available users
  useEffect(() => {
    if (users?.length === 0) {
      // No users available
      setSelectedUser("No users available");
    } else if (users?.length === 1) {
      // Exactly one user available, auto-select it
      const deviceName = users[0].deviceName || "Unknown Device Name";
      setSelectedUser(deviceName);
    } else if (users?.length > 1) {
      // Multiple users available
      if (selectedUser === "No users available" || !selectedUser) {
        // If no valid selection, default to "All"
        setSelectedUser("All");
      } else {
        // Check if the current selection is still valid
        const isValidSelection =
          selectedUser === "All" ||
          users.some((user) => user.deviceName === selectedUser);

        if (!isValidSelection) {
          setSelectedUser("All");
        }
      }
    }
  }, [users, selectedUser, setSelectedUser]);

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <div
        className="w-full p-2 bg-gray-800 text-gray-200 border border-gray-700 rounded-md 
                shadow-sm focus:outline-none text-sm font-mono cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate mr-2">{selectedUser}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-3 h-3 text-gray-400 flex-shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute mt-1 w-full rounded-md bg-gray-800 border border-gray-700 shadow-lg z-50 max-h-60 overflow-auto"
          style={{ position: "absolute", top: "100%", left: 0 }}
        >
          {userOptions.map((option, index) => (
            <div
              key={index}
              className={`px-4 py-2 text-sm font-mono hover:bg-gray-700 cursor-pointer ${
                option.disabled ? "opacity-50 cursor-not-allowed" : ""
              } ${selectedUser === option.value ? "bg-gray-700" : ""}`}
              onClick={() => {
                if (!option.disabled) {
                  setSelectedUser(option.value);
                  setIsOpen(false);
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
