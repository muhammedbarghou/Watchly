import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bg from '../../Imgs/bg-2.jpg';
const CreateRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const randomRoomId = Math.floor(Math.random() * 9000) + 1000;
    setRoomId(randomRoomId);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/room?videoLink=${encodeURIComponent(videoLink)}`);
  };

  return (
  <section className="relative w-screen min-h-screen py-10 overflow-hidden bg-black">
    <div className="absolute inset-0">
        <img className="object-cover w-full h-full md:object-left md:scale-150 md:origin-top-left" src={bg} alt="" />
    </div>
    <div className="absolute inset-0 hidden bg-gradient-to-r md:block from-black to-transparent"></div>
    <div className="absolute inset-0 block bg-black/60 md:hidden"></div>

    <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center md:w-2/3 lg:w-1/2 xl:w-1/3 md:text-left">
            <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">Start your own theater</h2>
            <p className="mt-4 text-base text-gray-200">Create a room and share the link with your friends.</p>

            <form action="#" method="POST" className="mt-8 lg:mt-12">
                <div className="flex flex-col items-center sm:flex-col sm:justify-center gap-5 w-full">
                        <div className="relative w-full text-gray-400 ">
                          <input
                            type="number"
                            placeholder="Room ID"
                            className='block w-full py-4 pl-10 pr-4 text-base text-black placeholder-gray-500 transition-all duration-200 border-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-100'
                            value={roomId}
                            readOnly
                          />
                        </div>
                        <div className="relative w-full text-gray-400 ">
                            <input
                                type="text"
                                placeholder="Room Name"
                                className='block w-full py-4 pl-10 pr-4 text-base text-black placeholder-gray-500 transition-all duration-200 border-gray-200 rounded-md dark:bg-gray-900 dark:text-gray-100'
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                maxLength="10"
                                minLength="3"
                                pattern="[a-zA-Z0-9]+"
                                title="Room name can only contain alphabets and numbers."
                            />
                        </div>
                        <div className="relative w-full text-gray-400">
                        <input
                          type="text"
                          placeholder="Room Password"
                          className='block w-full py-4 pl-10 pr-4 text-base  dark:bg-gray-900 dark:text-gray-100 text-black placeholder-gray-500 transition-all duration-200 border-gray-200 rounded-md'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        </div>
                        <div className="relative w-full text-gray-400">
                        <input
                          type="text"
                          placeholder="Video Link"
                          className='block w-full py-4 pl-10 pr-4  dark:bg-gray-900 dark:text-gray-100 text-base text-black placeholder-gray-500 transition-all duration-200 border-gray-200 rounded-md'
                          value={videoLink}
                          onChange={(e) => setVideoLink(e.target.value)}
                        />
                        </div>
                </div>
                <div className="flex items-center justify-center mt-8 lg:mt-12 h-20">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className='bg-[#d00000] h-full w-full transition-all duration-200 hover:bg-[#6A040F] hover:scale-105 rounded-md'
                    >
                    <span className="text-sm font-semibold text-white uppercase">Create Room</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
  </section>
  );
};

export default CreateRoom;
