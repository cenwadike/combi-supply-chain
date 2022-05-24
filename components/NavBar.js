import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
    const [active, setActive] = useState(false);

    const handleClick = () => {
        setActive(!active);
    };

    return (
        <>
            <nav className='fixed w-full flex items-center flex-wrap bg-white px-2 py-2 navbar-expand-lg shadow-md'>
                <Link href='/'>
                    <a className='inline-flex items-center p-2 mr-0'>
                        <svg
                            viewBox='0 0 24 24'
                            xmlns='http://www.w3.org/2000/svg'
                            className='fill-current text-blue-700 hover:text-indigo-800 h-8 w-8 mr-2'
                        >
                            <path d='M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z' />
                        </svg>
                        <span className='text-xl text-blue-700 hover:text-indigo-800 font-bold uppercase tracking-wide'>
                            AgroTrace
                        </span>
                    </a>
                </Link>
                <button
                    className=' inline-flex p-3 hover:bg-indigo-600 rounded lg:hidden text-indigo-600 ml-auto hover:text-white outline-none'
                    onClick={handleClick}
                >
                    <i className="fas fa-bars"></i>
                </button>
                {/*Note that in this div we will use a ternary operator to decide whether or not to display the content of the div  */}
                <div
                    className={`${active ? '' : 'hidden'
                        }   w-full lg:inline-flex lg:flex-grow lg:w-auto`}
                >
                    <div className='lg:inline-flex lg:flex-row lg:ml-auto lg:w-auto w-full lg:items-center items-start  flex flex-col lg:h-auto'>
                        <Link href='/dashboard'>
                            <a className="p-2 lg:px-4 md:mx-2 text-indigo-600 text-center border border-transparent rounded hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-300">Dashboard</a>
                        </Link>
                        <Link href='/about'>
                            <a className="p-2 lg:px-4 md:mx-2 text-indigo-600 text-center border border-transparent rounded hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-300">About</a>
                        </Link>
                        <Link href='/#'>
                            <a className="p-2 lg:px-4 md:mx-2 bg-indigo-200 text-indigo-600 text-center border border-transparent rounded hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-300">Connect Wallet</a>
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
};
