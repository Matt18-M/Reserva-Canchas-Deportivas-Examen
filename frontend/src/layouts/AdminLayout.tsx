import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Navbar, Sidebar } from '@/components/layout';
import { cn } from '@/utils/cn';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/45 via-surface-muted to-secondary-50/35">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          'min-h-screen transition-[margin] duration-300 ease-in-out',
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
        )}
      >
        <Navbar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
