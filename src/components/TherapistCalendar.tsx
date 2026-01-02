import GoogleCalendar from './GoogleCalendar';

interface TherapistCalendarProps {
  therapistId: string;
}

const TherapistCalendar = ({ therapistId }: TherapistCalendarProps) => {
  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <GoogleCalendar therapistId={therapistId} />
    </div>
  );
};

export default TherapistCalendar;