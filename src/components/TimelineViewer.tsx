// src/components/TimelineViewer.tsx
import { useEffect, useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { getTimelineColor, getStatusIndicatorColor } from '../utils/helpers';
import { format } from 'date-fns';
import { Calendar, Download, Loader2 } from 'lucide-react';

const TimelineViewer = () => {
  const { timelineData, dateRange, setDateRange, loadTimelineData, exportToCSV, isLoading } = useMachineStore();
  const [fromDate, setFromDate] = useState(format(dateRange.from, "yyyy-MM-dd'T'HH:mm"));
  const [toDate, setToDate] = useState(format(dateRange.to, "yyyy-MM-dd'T'HH:mm"));
  
  useEffect(() => {
    loadTimelineData();
  }, []);
  
  const handleUpdate = () => {
    setDateRange({
      from: new Date(fromDate),
      to: new Date(toDate)
    });
    loadTimelineData();
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Timeline Viewer</h1>
        
        {/* Date Controls */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">From:</span>
              <input
                type="datetime-local"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-gray-700 px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">To:</span>
              <input
                type="datetime-local"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-gray-700 px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium transition-colors"
            >
              UPDATE
            </button>
            
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              EXPORT
            </button>
          </div>
        </div>
        
        {/* Timeline Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left border-r border-gray-600 sticky left-0 bg-gray-700 z-10 min-w-[150px]">Name</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">Run</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">Warning</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">Stop</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">Actual<br/>Ratio 1</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">Actual<br/>Ratio 2</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">True<br/>Ratio 1</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">True<br/>Ratio 2</th>
                    <th className="px-3 py-3 text-center border-r border-gray-600">Warning<br/>Ratio</th>
                    <th className="px-4 py-3 text-left min-w-[500px]">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineData.map((item, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-3 border-r border-gray-700 sticky left-0 bg-gray-800 z-10">
                        {item.machineName}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-gray-700">{item.run.toFixed(1)}</td>
                      <td className="px-3 py-3 text-center border-r border-gray-700">{item.warning}</td>
                      <td className="px-3 py-3 text-center border-r border-gray-700">{item.stop.toFixed(1)}</td>
                      <td 
                        className="px-3 py-3 text-center border-r border-gray-700 font-medium"
                        style={{ 
                          backgroundColor: `rgb(${item.actualRatio1 >= item.trueRatio2 * 0.8 ? '74, 222, 128' : item.actualRatio1 >= item.trueRatio2 * 0.5 ? '251, 191, 36' : '248, 113, 113'})`,
                          color: item.actualRatio1 < item.trueRatio2 * 0.5 ? 'white' : 'black'
                        }}
                      >
                        {item.actualRatio1.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-gray-700">{item.actualRatio2.toFixed(2)}</td>
                      <td 
                        className="px-3 py-3 text-center border-r border-gray-700 font-medium"
                        style={{ 
                          backgroundColor: `rgb(${item.trueRatio1 >= item.trueRatio2 * 0.8 ? '74, 222, 128' : item.trueRatio1 >= item.trueRatio2 * 0.5 ? '251, 191, 36' : '248, 113, 113'})`,
                          color: item.trueRatio1 < item.trueRatio2 * 0.5 ? 'white' : 'black'
                        }}
                      >
                        {item.trueRatio1.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-gray-700">{item.trueRatio2.toFixed(2)}</td>
                      <td className="px-3 py-3 text-center border-r border-gray-700">{item.warningRatio}</td>
                      <td className="px-4 py-3">
                        <div className="flex h-10 rounded overflow-hidden border border-gray-600">
                          {item.timeline.map((segment, idx) => {
                            const totalDuration = item.timeline.reduce((sum, s) => sum + s.duration, 0);
                            const widthPercent = (segment.duration / totalDuration) * 100;
                            
                            return (
                              <div
                                key={idx}
                                className={`${getTimelineColor(segment.state)} border-r border-gray-800 hover:opacity-80 transition-opacity cursor-pointer`}
                                style={{ width: `${widthPercent}%` }}
                                title={`${segment.state}: ${segment.duration.toFixed(1)}h\n${format(segment.start, 'HH:mm')} - ${format(segment.end, 'HH:mm')}`}
                              />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineViewer;
