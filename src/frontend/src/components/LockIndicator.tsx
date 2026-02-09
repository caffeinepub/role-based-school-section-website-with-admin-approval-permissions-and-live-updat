import { Lock, Unlock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LockIndicatorProps {
  isLocked: boolean;
  tooltipText?: string;
  className?: string;
}

export default function LockIndicator({ isLocked, tooltipText, className = '' }: LockIndicatorProps) {
  const Icon = isLocked ? Lock : Unlock;
  const defaultTooltip = isLocked ? 'This section is locked by admin.' : 'Unlocked';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center transition-all duration-300 ${className}`}>
            <Icon 
              className={`w-5 h-5 transition-colors duration-300 ${
                isLocked ? 'text-red-500' : 'text-green-500'
              }`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText || defaultTooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
