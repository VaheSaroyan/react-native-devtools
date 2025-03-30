import React from "react";
import { User } from "../types/User";

interface Props {
  userData: User;
}

export const UserInfo: React.FC<Props> = ({ userData }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 shadow-md">
      <h2 className="text-lg font-semibold mb-3 text-gray-200 border-b border-gray-700 pb-2">
        {userData.username}
      </h2>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-400">Client Type:</div>
        <div className="text-gray-200 font-mono">{userData.clientType}</div>

        <div className="text-gray-400">User Type:</div>
        <div className="text-gray-200 font-mono">{userData.userType}</div>

        <div className="text-gray-400">ID:</div>
        <div className="text-gray-200 font-mono overflow-hidden text-ellipsis">
          {userData.id}
        </div>
      </div>

      {userData.allQueries && userData.allQueries.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2 text-gray-300 border-b border-gray-700 pb-1">
            Queries
          </h3>
          <div className="overflow-auto max-h-40 bg-gray-900 rounded p-2">
            {userData.allQueries.map((query: any, index) => (
              <div
                key={index}
                className="mb-2 text-xs font-mono text-gray-300 border-b border-gray-800 pb-1"
              >
                {JSON.stringify(query, null, 2)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
