import { AppShell } from '@/components/shared/AppShell';
import { AppRoutes } from '@/routes/AppRoutes';

export default function App(): JSX.Element {
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}
