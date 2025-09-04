import React from 'react';

interface ResultComparisonProps {
  userResult: any[];
  expectedResult?: any[];
  isCorrect: boolean;
  error?: string;
}

export const ResultComparison: React.FC<ResultComparisonProps> = ({
  userResult,
  expectedResult,
  isCorrect,
  error
}) => {
  const formatTableData = (data: any[]) => {
    if (!data || data.length === 0) {
      return null;
    }

    const columns = Object.keys(data[0]);
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : 'NULL'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">Query Error:</h4>
          <code className="text-red-700 text-sm">{error}</code>
        </div>
      ) : (
        <>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Your Query Result:</h4>
            {userResult && userResult.length > 0 ? (
              <div className="border rounded-lg">
                {formatTableData(userResult)}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border rounded-lg text-gray-600 text-center">
                No results returned
              </div>
            )}
            <div className="text-sm text-gray-500 mt-2">
              {userResult.length} row(s) returned
            </div>
          </div>

          {!isCorrect && expectedResult && expectedResult.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Expected Result:</h4>
              <div className="border rounded-lg">
                {formatTableData(expectedResult)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {expectedResult.length} row(s) expected
              </div>
            </div>
          )}
        </>
      )}

      {isCorrect && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800">
            🎉 Perfect! Your query returned the correct results.
          </div>
        </div>
      )}
    </div>
  );
};
