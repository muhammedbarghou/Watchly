import React, { useState, useEffect, useRef } from 'react';

const SearchComponent: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock list of users with profile picture, full name, and ID
  interface User {
    profilePicture: string;
    fullName: string;
    id: string;
  }

  const users: User[] = [
    {
      profilePicture: 'https://example.com/pic1.jpg',
      fullName: 'Alice Smith',
      id: '#123456'
    },
    {
      profilePicture: 'https://example.com/pic2.jpg',
      fullName: 'Bob Johnson',
      id: '#234567'
    },
    // Add more users as needed
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length > 0) {
        const results = users.filter(user =>
          user.fullName.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredUsers(results);
      } else {
        setFilteredUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative inline-block z-50">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-64 px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-64 mt-1 bg-white border rounded-md shadow-md overflow-y-auto max-h-60 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:shadow-lg"
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700 dark:text-white"
              >
                <img
                  src={user.profilePicture}
                  alt={`${user.fullName} profile picture`}
                  className="w-10 h-10 rounded-full object-cover mr-2"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')}
                />
                <div>
                  <p className="font-bold">{user.fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.id}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;