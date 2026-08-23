
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'DeliverFlow - AI-Powered Product Intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
