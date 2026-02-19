import { HeroUIProvider, ToastProvider } from '@heroui/react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" />
      {children}
    </HeroUIProvider>
  );
}
