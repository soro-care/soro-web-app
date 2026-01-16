import React from 'react';
import { CalendarDays, Video, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SessionCard = ({ session }) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <CalendarDays className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-800">
                {session.professional?.isPeerCounselor 
                  ? `Peer Counselor (ID: ${session.professional.counselorId})`
                  : session.user?.userId}
              </h4>
              {session.professional?.isPeerCounselor && (
                <p className="text-xs text-gray-500 mt-1">
                  User ID: {session.user?.userId}
                </p>
              )}
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
              Confirmed
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{session.concern}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date(session.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>{session.startTime} - {session.endTime}</span>
            <span>•</span>
            {session.modality === 'Video' ? (
              <Video className="w-4 h-4 text-blue-600" />
            ) : (
              <Phone className="w-4 h-4 text-blue-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SessionCard);