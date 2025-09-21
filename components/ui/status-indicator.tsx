'use client';

import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  Info,
  AlertTriangle,
  WifiOff,
  Wifi,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock
} from 'lucide-react';

type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'pending'
  | 'idle'
  | 'offline'
  | 'online'
  // Cybersecurity status types
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'secure'
  | 'vulnerable'
  | 'encrypted'
  | 'unencrypted';

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'minimal' | 'badge';
  className?: string;
  showIcon?: boolean;
  showMessage?: boolean;
}

function StatusIndicator({
  status,
  message,
  size = 'default',
  variant = 'default',
  className,
  showIcon = true,
  showMessage = true
}: StatusIndicatorProps) {
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      success: {
        icon: CheckCircle,
        color: 'text-status-success',
        bgColor: 'bg-status-success/10',
        borderColor: 'border-status-success/20',
        defaultMessage: 'Success'
      },
      error: {
        icon: XCircle,
        color: 'text-status-critical',
        bgColor: 'bg-status-critical/10',
        borderColor: 'border-status-critical/20',
        defaultMessage: 'Error'
      },
      warning: {
        icon: AlertTriangle,
        color: 'text-status-warning',
        bgColor: 'bg-status-warning/10',
        borderColor: 'border-status-warning/20',
        defaultMessage: 'Warning'
      },
      info: {
        icon: Info,
        color: 'text-status-info',
        bgColor: 'bg-status-info/10',
        borderColor: 'border-status-info/20',
        defaultMessage: 'Information'
      },
      loading: {
        icon: Loader2,
        color: 'text-primary',
        bgColor: 'bg-primary/5',
        borderColor: 'border-primary/20',
        defaultMessage: 'Loading...',
        animate: true
      },
      pending: {
        icon: Clock,
        color: 'text-status-warning',
        bgColor: 'bg-status-warning/10',
        borderColor: 'border-status-warning/20',
        defaultMessage: 'Pending'
      },
      idle: {
        icon: Clock,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        borderColor: 'border-border',
        defaultMessage: 'Idle'
      },
      offline: {
        icon: WifiOff,
        color: 'text-status-critical',
        bgColor: 'bg-status-critical/10',
        borderColor: 'border-status-critical/20',
        defaultMessage: 'Offline'
      },
      online: {
        icon: Wifi,
        color: 'text-status-success',
        bgColor: 'bg-status-success/10',
        borderColor: 'border-status-success/20',
        defaultMessage: 'Online'
      },
      // Cybersecurity-specific status configs
      critical: {
        icon: ShieldX,
        color: 'text-status-critical',
        bgColor: 'bg-status-critical/10',
        borderColor: 'border-status-critical/20',
        defaultMessage: 'Critical',
        pulse: true
      },
      high: {
        icon: ShieldAlert,
        color: 'text-status-high',
        bgColor: 'bg-status-high/10',
        borderColor: 'border-status-high/20',
        defaultMessage: 'High'
      },
      medium: {
        icon: AlertTriangle,
        color: 'text-status-medium',
        bgColor: 'bg-status-medium/10',
        borderColor: 'border-status-medium/20',
        defaultMessage: 'Medium'
      },
      low: {
        icon: Shield,
        color: 'text-status-low',
        bgColor: 'bg-status-low/10',
        borderColor: 'border-status-low/20',
        defaultMessage: 'Low'
      },
      secure: {
        icon: ShieldCheck,
        color: 'text-status-success',
        bgColor: 'bg-status-success/10',
        borderColor: 'border-status-success/20',
        defaultMessage: 'Secure'
      },
      vulnerable: {
        icon: ShieldX,
        color: 'text-status-critical',
        bgColor: 'bg-status-critical/10',
        borderColor: 'border-status-critical/20',
        defaultMessage: 'Vulnerable',
        pulse: true
      },
      encrypted: {
        icon: Lock,
        color: 'text-status-success',
        bgColor: 'bg-status-success/10',
        borderColor: 'border-status-success/20',
        defaultMessage: 'Encrypted'
      },
      unencrypted: {
        icon: Unlock,
        color: 'text-status-warning',
        bgColor: 'bg-status-warning/10',
        borderColor: 'border-status-warning/20',
        defaultMessage: 'Unencrypted'
      }
    };

    return configs[status];
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  const sizeClasses = {
    sm: 'text-enterprise-xs',
    default: 'text-enterprise-sm',
    lg: 'text-enterprise-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-space-grid-2 transition-all', className)}>
        {showIcon && (
          <Icon
            className={cn(
              iconSizes[size],
              config.color,
              config.animate && 'animate-spin',
              config.pulse && 'animate-pulse'
            )}
          />
        )}
        {showMessage && (
          <span className={cn(sizeClasses[size], config.color, 'font-medium')}>
            {displayMessage}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={cn(
        'inline-flex items-center gap-space-grid-2 px-3 py-1.5 rounded-professional-md border',
        'shadow-xs transition-all font-medium select-none',
        sizeClasses[size],
        config.color,
        config.bgColor,
        config.borderColor,
        config.pulse && 'animate-pulse',
        className
      )}>
        {showIcon && (
          <Icon
            className={cn(
              iconSizes[size],
              config.animate && 'animate-spin'
            )}
          />
        )}
        {showMessage && <span>{displayMessage}</span>}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-space-grid-3 p-4 rounded-professional-lg border',
      'shadow-sm transition-all',
      config.bgColor,
      config.borderColor,
      config.pulse && 'animate-pulse',
      className
    )}>
      {showIcon && (
        <Icon
          className={cn(
            iconSizes[size],
            config.color,
            config.animate && 'animate-spin'
          )}
        />
      )}
      {showMessage && (
        <span className={cn(sizeClasses[size], config.color, 'font-medium')}>
          {displayMessage}
        </span>
      )}
    </div>
  );
}

// Form status component for validation feedback
interface FormStatusProps {
  status: 'idle' | 'validating' | 'valid' | 'invalid';
  message?: string;
  className?: string;
}

function FormStatus({ status, message, className }: FormStatusProps) {
  if (status === 'idle') return null;

  const statusMap: Record<typeof status, StatusType> = {
    validating: 'loading',
    valid: 'success',
    invalid: 'error',
    idle: 'idle'
  };

  return (
    <StatusIndicator
      status={statusMap[status]}
      message={message}
      variant="minimal"
      size="sm"
      className={className}
    />
  );
}

// Connection status component
interface ConnectionStatusProps {
  isOnline: boolean;
  className?: string;
  showLabel?: boolean;
}

function ConnectionStatus({
  isOnline,
  className,
  showLabel = true
}: ConnectionStatusProps) {
  return (
    <StatusIndicator
      status={isOnline ? 'online' : 'offline'}
      message={showLabel ? (isOnline ? 'Connected' : 'Disconnected') : undefined}
      variant="badge"
      size="sm"
      className={className}
      showMessage={showLabel}
    />
  );
}

// Simple status dots for compact displays
interface StatusDotProps {
  status: StatusType;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  pulse?: boolean;
}

function StatusDot({ status, size = 'default', className, pulse }: StatusDotProps) {
  const config = {
    success: 'bg-status-success',
    error: 'bg-status-critical',
    warning: 'bg-status-warning',
    info: 'bg-status-info',
    loading: 'bg-primary',
    pending: 'bg-status-warning',
    idle: 'bg-muted-foreground',
    offline: 'bg-status-critical',
    online: 'bg-status-success',
    // Cybersecurity statuses
    critical: 'bg-status-critical',
    high: 'bg-status-high',
    medium: 'bg-status-medium',
    low: 'bg-status-low',
    secure: 'bg-status-success',
    vulnerable: 'bg-status-critical',
    encrypted: 'bg-status-success',
    unencrypted: 'bg-status-warning'
  };

  const sizes = {
    sm: 'h-2 w-2',
    default: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const shouldPulse = pulse || status === 'critical' || status === 'vulnerable';

  return (
    <div
      className={cn(
        'rounded-full shadow-xs',
        sizes[size],
        config[status],
        shouldPulse && 'animate-pulse',
        className
      )}
      aria-label={`Status: ${status}`}
    />
  );
}

// Cybersecurity-specific status components
interface ThreatLevelProps {
  level: 'critical' | 'high' | 'medium' | 'low';
  className?: string;
  variant?: 'default' | 'minimal' | 'badge';
  showIcon?: boolean;
  customMessage?: string;
}

function ThreatLevel({
  level,
  className,
  variant = 'badge',
  showIcon = true,
  customMessage
}: ThreatLevelProps) {
  const message = customMessage || `${level.charAt(0).toUpperCase() + level.slice(1)} Threat`;

  return (
    <StatusIndicator
      status={level}
      message={message}
      variant={variant}
      showIcon={showIcon}
      className={className}
    />
  );
}

interface VulnerabilityStatusProps {
  status: 'critical' | 'high' | 'medium' | 'low' | 'secure';
  count?: number;
  className?: string;
  variant?: 'default' | 'minimal' | 'badge';
}

function VulnerabilityStatus({
  status,
  count,
  className,
  variant = 'badge'
}: VulnerabilityStatusProps) {
  const getVulnMessage = () => {
    if (status === 'secure') return 'No Vulnerabilities';
    const countText = count ? ` (${count})` : '';
    return `${status.charAt(0).toUpperCase() + status.slice(1)} Vulnerabilities${countText}`;
  };

  return (
    <StatusIndicator
      status={status}
      message={getVulnMessage()}
      variant={variant}
      className={className}
    />
  );
}

interface SecurityScoreProps {
  score: number;
  className?: string;
  variant?: 'default' | 'minimal' | 'badge';
}

function SecurityScore({
  score,
  className,
  variant = 'badge'
}: SecurityScoreProps) {
  const getStatusFromScore = (): StatusType => {
    if (score >= 90) return 'secure';
    if (score >= 80) return 'low';
    if (score >= 70) return 'medium';
    if (score >= 60) return 'high';
    return 'critical';
  };

  return (
    <StatusIndicator
      status={getStatusFromScore()}
      message={`Security Score: ${score}%`}
      variant={variant}
      className={className}
    />
  );
}

interface ComplianceStatusProps {
  compliant: boolean;
  standard?: string;
  className?: string;
  variant?: 'default' | 'minimal' | 'badge';
}

function ComplianceStatus({
  compliant,
  standard,
  className,
  variant = 'badge'
}: ComplianceStatusProps) {
  const message = `${standard ? `${standard}: ` : ''}${compliant ? 'Compliant' : 'Non-Compliant'}`;

  return (
    <StatusIndicator
      status={compliant ? 'secure' : 'critical'}
      message={message}
      variant={variant}
      className={className}
    />
  );
}

interface EncryptionStatusProps {
  encrypted: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'badge';
}

function EncryptionStatus({
  encrypted,
  className,
  variant = 'badge'
}: EncryptionStatusProps) {
  return (
    <StatusIndicator
      status={encrypted ? 'encrypted' : 'unencrypted'}
      variant={variant}
      className={className}
    />
  );
}

export {
  StatusIndicator,
  FormStatus,
  ConnectionStatus,
  StatusDot,
  ThreatLevel,
  VulnerabilityStatus,
  SecurityScore,
  ComplianceStatus,
  EncryptionStatus,
  type StatusType
};