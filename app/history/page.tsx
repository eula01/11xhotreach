'use client';

import { XIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';

import useSWR from 'swr';

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export default function Page() {
  const [open, setOpen] = useState(false);
  const [showCopyClicked, setShowCopyClicked] = useState(false);

  let { data, mutate } = useSWR('/api/getHistory', fetcher);

  console.log('HISTORY data: ', data);

  let handleDelete = async (id: any) => {
    console.log('handleDelete', id);

    await fetch(`/api/deleteHistory?id=${id}`);
    mutate(data.filter((el: any) => el.id !== id));
  };

  let handleGotReply = async (e: any, id: any) => {
    console.log('e.target.checked', e.target.checked);
    console.log('handleGotReply', id);

    await fetch(`/api/updateHistory?id=${id}&got_reply=${e.target.checked}`);
    mutate(
      data.map((el: any) => {
        el.id === id ? (el.got_reply = e.target.checked) : el;
      })
    );
  };

  let handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopyClicked(true);
    setTimeout(() => {
      setShowCopyClicked(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col">
      <div className="-my-2">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Got reply?
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data &&
                  data.map((el: any) => (
                    <tr key={el?.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {el?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {el?.companyname}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => setOpen(true)}
                        >
                          {el?.body?.substring(0, 30) + '...'}{' '}
                        </a>
                        {/* <Transition.Root show={open} as={Fragment}> */}
                        <Dialog
                          as="div"
                          className="fixed z-10 inset-0 overflow-y-auto"
                          onClose={setOpen}
                          open={open}
                        >
                          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <Dialog.Panel className="fixed inset-0 bg-gray-500 bg-opacity-10 transition-opacity" />

                            {/* This element is to trick the browser into centering the modal contents. */}
                            <span
                              className="hidden sm:inline-block sm:align-middle sm:h-screen"
                              aria-hidden="true"
                            >
                              &#8203;
                            </span>

                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                              <div>
                                <div className="mx-auto flex items-center justify-center h-auto w-auto rounded-full">
                                  {el?.body}
                                </div>
                              </div>
                              <div className="mt-5">
                                <button
                                  type="button"
                                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
                                  onClick={() => {
                                    handleCopy(el?.body);
                                    setOpen(false);
                                  }}
                                >
                                  {showCopyClicked ? (
                                    <span className="inline-flex">Copied!</span>
                                  ) : (
                                    <span className="inline-flex">
                                      Copy text
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </Dialog>
                      </td>
                      <td className="px-6 whitespace-nowrap text-sm text-gray-500">
                        <input
                          name="gotReply"
                          type="checkbox"
                          checked={el?.got_reply}
                          onChange={(e) => handleGotReply(e, el?.id)}
                          className="h-5 w-5 text-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          className="text-red-500 hover:text-red-900"
                          onClick={() => handleDelete(el?.id)}
                        >
                          <XIcon className="h-7 w-7" aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
