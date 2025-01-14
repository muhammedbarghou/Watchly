import { Button } from '../../ui/button';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';


export function AccountSettings() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-lg bg-netflix-gray flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleInformationsChange = () => {
    // Handle password change
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 ">
            <div className="w-20 h-20 rounded-full bg-netflix-gray flex items-center justify-center">
              {user && <img src={user.photoURL ?? ''} alt="" className='rounded-full'/>}
            </div>
            <div className="flex flex-col gap-2">
              <p className='text-xl'>{user?.displayName || 'User'}</p>
              <p className='text-xs text-gray-400'>{user?.email || ''}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
            />
          </div>
        </div>
      </div>
      <footer>
        <Button onClick={handleInformationsChange}>Save Changes</Button>
      </footer>
    </div>
  );
}