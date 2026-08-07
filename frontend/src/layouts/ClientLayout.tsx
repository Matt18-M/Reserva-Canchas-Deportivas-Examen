import { Outlet } from 'react-router-dom';

import ClientNavbar from '@/components/layout/ClientNavbar';

const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-surface-muted">
      <ClientNavbar />
      <Outlet />
    </div>
  );
};

export default ClientLayout;
