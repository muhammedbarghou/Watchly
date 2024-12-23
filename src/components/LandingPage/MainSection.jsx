import React from "react";
import {useNavigate } from "react-router-dom";
function Mainsection() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/signmethode");
    }
    return (
        <main className="bg-transparent relative py-10 sm:py-16 lg:py-20 xl:pt-32 xl:pb-40 h-2/5">
            <div className="relative px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                <div className="max-w-xl mx-auto text-center lg:max-w-md xl:max-w-lg lg:text-left lg:mx-0">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl xl:text-5xl xl:leading-tight">Watch Videos Together, Anytime, Anywhere</h1>
                    <p className="mt-8 text-base font-normal leading-7 text-gray-400 lg:max-w-md xl:pr-0 lg:pr-16">Experience a new way to watch videos with friends, no matter where they are. Our app lets you sync videos in real-time, so you can laugh, react, and enjoy your favorite content together.</p>
                    <div className="flex items-center justify-center mt-8 space-x-5 xl:mt-16 lg:justify-start">
                        <button
                            type="button"
                            href="#"
                            title=""
                            className="
                                inline-flex
                                items-center
                                justify-center
                                px-3
                                py-3
                                text-white
                                font-bold
                                leading-7
                                text-gray-900
                                transition-all
                                duration-200
                                bg-[#03071E]
                                border border-transparent
                                rounded-md
                                sm:px-6
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white
                                hover:bg-[#6A040F]
                                transition ease-in duration-200
                            "
                            role="button"
                            onClick={handleClick}
                        >
                            Join Us Now
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Mainsection;
