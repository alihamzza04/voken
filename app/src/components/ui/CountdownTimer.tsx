import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  deadline: number;
  showIcon?: boolean;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(deadline: number): TimeLeft {
  const now = Math.floor(Date.now() / 1000);
  const difference = deadline - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / 86400),
    hours: Math.floor((difference % 86400) / 3600),
    minutes: Math.floor((difference % 3600) / 60),
    seconds: difference % 60,
    total: difference,
  };
}

export function CountdownTimer({
  deadline,
  showIcon = false,
  compact = false,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(deadline)
  );
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(deadline);
      setTimeLeft(remaining);
      setIsUrgent(remaining.total < 3600); // Less than 1 hour
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.total <= 0) {
    return (
      <span className="text-red-400 font-medium">
        {showIcon && <Clock className="w-4 h-4 inline mr-1" />}
        Ended
      </span>
    );
  }

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (compact) {
    if (timeLeft.days > 0) {
      return (
        <span className={isUrgent ? "text-orange-400" : "text-green-400"}>
          {timeLeft.days}d {formatNumber(timeLeft.hours)}h
        </span>
      );
    }
    return (
      <span className={isUrgent ? "text-orange-400" : "text-green-400"}>
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:
        {formatNumber(timeLeft.seconds)}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 ${
        isUrgent ? "text-orange-400" : "text-green-400"
      }`}
    >
      {showIcon && <Clock className="w-4 h-4" />}
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <span className="font-mono font-semibold">{timeLeft.days}d</span>
        )}
        <span className="font-mono font-semibold">
          {formatNumber(timeLeft.hours)}h
        </span>
        <span className="font-mono font-semibold">
          {formatNumber(timeLeft.minutes)}m
        </span>
        {timeLeft.days === 0 && (
          <span className="font-mono font-semibold">
            {formatNumber(timeLeft.seconds)}s
          </span>
        )}
      </div>
    </div>
  );
}
