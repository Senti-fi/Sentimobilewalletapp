import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useSupabaseSync } from './hooks/useSupabaseSync';

function SyncInit() {
  useSupabaseSync();
  return null;
}

export default function App() {
  return (
    <>
      <SyncInit />
      <RouterProvider router={router} />
    </>
  );
}
