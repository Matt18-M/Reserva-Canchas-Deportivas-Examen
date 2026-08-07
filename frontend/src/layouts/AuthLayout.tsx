import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-surface-muted">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
