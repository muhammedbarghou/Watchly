import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../../../firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';

const db = getFirestore(); // Initialize Firestore outside the component

function PersonalInformations() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle photo update
  const handleUpdatePhoto = () => {
    const newPhotoUrl = prompt('Enter new photo URL:');
    if (newPhotoUrl) {
      setProfilePhoto(newPhotoUrl);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    setProfilePhoto('https://via.placeholder.com/100');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    const profileData = { username, phone, birthday, profilePhoto };
    const userRef = doc(db, 'users', user.uid);

    try {
      // Save updated data to Firestore
      await setDoc(userRef, profileData, { merge: true });

      // Optionally update profile in Firebase Authentication
      if (username && username !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: username,
          phoneNumber: phone,
          birthday: birthday,
        });
      }

      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Handle input field change
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 w-full min-h-auto text-gray-900 dark:text-gray-100">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20">
            <img
              src={userData?.profilePhoto || user.photoURL || profilePhoto}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="text-gray-700 dark:text-gray-300 hover:text-emerald-500 font-medium"
              onClick={handleUpdatePhoto}
            >
              Update Photo
            </button>
            <button
              type="button"
              className="text-red-600 dark:text-red-400 hover:text-red-700 font-medium"
              onClick={handleRemovePhoto}
            >
              Remove Photo
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Name</label>
          <input
            type="text"
            placeholder={user.displayName || ''}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            value={username || userData?.username || ''}
            disabled
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Name</label>
          <input
            type="text"
            placeholder="Enter New name"
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            onChange={(e) => handleInputChange(e, setUsername)}
          />
        </div>
        <button
          type="submit"
          className="self-start bg-[#d00000] hover:bg-[#e60000] text-white font-medium rounded-md px-5 py-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}

export default PersonalInformations;
