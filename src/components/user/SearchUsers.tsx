import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from '../ui/button';

interface User {
  profilePicture: string;
  fullName: string;
  id: string;
  isFriend: boolean;
}

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const users: User[] = [
    {
      profilePicture: 'https://example.com/pic1.jpg',
      fullName: 'Alice Smith',
      id: '#123456',
      isFriend : true
    },
    {
      profilePicture: 'https://example.com/pic2.jpg',
      fullName: 'Bob Johnson',
      id: '#234567',
      isFriend : false
    },
    {
      profilePicture: 'https://example.com/pic3.jpg',
      fullName: 'Charlie Brown',
      id: '#345678',
      isFriend : false
    },
    {
      profilePicture: 'https://example.com/pic4.jpg',
      fullName: 'David Lee',
      id: '#456789',
      isFriend : true
    },
    {
      profilePicture: 'https://example.com/pic5.jpg',
      fullName: 'Eve Wilson',
      id: '#567890',
      isFriend : false
    },
    
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
    <div className="relative w-64">
      <Input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className="w-full bg-gray-950 border-gray-800 text-gray-200 placeholder:text-gray-500 focus-visible:ring-gray-700"
      />
      {showDropdown && (
        <div ref={dropdownRef} className="absolute w-full z-50 mt-1">
          <Card className="border-gray-800 bg-gray-950">
            <ScrollArea className="h-60">
              <CardContent className="p-0">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-900 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <Avatar>
                        <AvatarImage
                          src={user.profilePicture}
                          alt={`${user.fullName} profile picture`}
                        />
                        <AvatarFallback className="bg-gray-800 text-gray-200">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{user.fullName}</span>
                        <span className="text-sm text-gray-400">
                          {user.id}
                        </span>
                      </div>
                      <div className="ml-auto">
                      {user.isFriend ? (
                        <span className="text-gray-400 text-sm">Friends</span>
                      ) : (
                        <Button className="text-gray-400 text-sm">Add friend</Button>
                      )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-400">
                    No results found
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;