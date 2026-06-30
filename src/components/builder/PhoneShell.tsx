// PhoneShell — Renders a device frame around the preview content

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PhoneShellProps { device: 'phone' | 'tablet' | 'desktop'; children: ReactNode; }

const DEVICE_CONFIGS = {
  phone: { width: 393, height: 852, frameClass: 'phone-frame rounded-[40px] border-[6px]', innerClass: 'rounded-[34px]' },
  tablet: { width: 820, height: 1180, frameClass: 'phone-frame rounded-[24px] border-[5px]', innerClass: 'rounded-[20px]' },
  desktop: { width: 1280, height: 800, frameClass: 'rounded-lg border-[3px]', innerClass: 'rounded-md' },
};

export function PhoneShell({ device, children }: PhoneShellProps) {
  const config = DEVICE_CONFIGS[device];
  const scale = device === 'desktop' ? 1 : 0.85;
  return (
    <div className={cn('relative border-black bg-black overflow-hidden shadow-2xl', config.frameClass)}
      style={{ width: config.width, height: config.height, transform: `scale(${scale})`, transformOrigin: 'top center', maxWidth: '100%' }}>
      {device === 'phone' && <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-[120px] h-[28px] bg-black rounded-b-2xl" />}
      <div className={cn('h-full w-full overflow-hidden bg-[#050505] relative', config.innerClass)}>{children}</div>
    </div>
  );
}
