import React from "react";
import { User } from "../types/User";

interface Props {
  userData: User;
}

export const UserInfo: React.FC<Props> = ({ userData }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 shadow-md">
      <h2 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-700 pb-2">
        {userData.deviceName}
      </h2>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-400">ID:</div>
        <div className="text-gray-200 font-mono overflow-hidden text-ellipsis">
          {userData.id}
        </div>
      </div>
    </div>
  );
};
