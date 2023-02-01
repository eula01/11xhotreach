'use client';
/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from 'react';
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import Link from 'next/link';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  let [current, setCurrent] = useState('');

  let handleClick = (e: any) => {
    setCurrent(e.target.href.split('/').pop());
    console.log('current', current);
  };

  return (
    <>
      <div className="max-w-7xl mb-6 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/">
                <div className="text-2xl font-bold mr-4 text-gray-900">
                  11x hotreach
                </div>
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/new"
                onClick={handleClick}
                className={classNames(
                  current === 'new'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                )}
              >
                New
              </Link>
              <Link
                href="/history"
                onClick={handleClick}
                className={classNames(
                  current === 'history'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                )}
              >
                History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
