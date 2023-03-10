'use client';

import { useState } from 'react';
import {
  ExternalLinkIcon,
  DuplicateIcon,
  CheckIcon,
  ClockIcon,
} from '@heroicons/react/outline';

export default function Page() {
  const [inputs, setInputs] = useState({
    company: '',
    linkedin: '',
    email: '',
    preview: '',
  });
  const [linkedinData, setLinkedinData] = useState({
    name: '',
    title: '',
    companyName: '',
    education: '',
    job: '',
  });
  const [companyData, setCompanyData] = useState('');
  const [showCopyClicked, setShowCopyClicked] = useState(false);

  const handleChange = (e: any) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('form submitted with these inputs', inputs);

    // get linkedin profile data
    const linkedinReponse = await fetch('/api/getLinkedin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs.linkedin),
    });
    let linkedinReponseJson = await linkedinReponse.json();
    console.log('linkedinReponseJson', linkedinReponseJson);
    setLinkedinData(linkedinReponseJson);

    let body = {
      companySite: inputs.company,
      companyName: linkedinReponseJson.companyName,
    };

    // get company summary data
    const companyReponse = await fetch('/api/getCompany', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    let companyReponseJson = await companyReponse.json();
    console.log('companyReponseJson', companyReponseJson);
    setCompanyData(companyReponseJson.body);

    // get email body
    const preview = await fetch('/api/createEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: linkedinData.name,
        title: linkedinData.title,
        companyName: linkedinData.companyName,
        job: linkedinData.job,
        company: companyData,
        email: inputs.email,
      }),
    });
    let previewResponse = await preview.json();
    setInputs({ ...inputs, preview: previewResponse.body.trim() });
  };

  let handleCopy = () => {
    navigator.clipboard.writeText(inputs.preview);
    setShowCopyClicked(true);
    setTimeout(() => {
      setShowCopyClicked(false);
    }, 3000);
  };

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto">
            <div className="py-7">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700"
              >
                Company website (*)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  name="company"
                  id="company"
                  value={inputs.company}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
            <div className="pb-7">
              <label
                htmlFor="linkedin"
                className="block text-sm font-medium text-gray-700"
              >
                LinkedIn profile (*)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  // required
                  name="linkedin"
                  id="linkedin"
                  value={inputs.linkedin}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://www.linkedin.com/in/seaneula/"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={inputs.email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 mt-5 border border-transparent text-sm rounded-md bg-indigo-300 hover:bg-indigo-400"
            >
              Generate email
              <ClockIcon className="h-5 w-5 text-gray-800 ml-1" />
            </button>
          </div>
        </form>
        <div className="mt-8">
          <label
            htmlFor="preview"
            className="block text-sm font-medium text-gray-700"
          >
            Email preview
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="preview"
              id="preview"
              value={inputs.preview}
              onChange={handleChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <a
            href={`https://mail.google.com/mail/u/0/#inbox?compose=new`}
            rel="noreferrer"
            target="_blank"
          >
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 mt-5 border border-transparent text-sm rounded-md bg-indigo-300 hover:bg-indigo-400"
            >
              Open Gmail
              <ExternalLinkIcon className="h-5 w-5 text-gray-800 ml-1" />
            </button>
          </a>
          <button
            type="button"
            onClick={() => handleCopy()}
            className="inline-flex items-center px-3 py-2 mt-5 ml-3 border border-transparent text-sm rounded-md bg-indigo-300 hover:bg-indigo-400"
          >
            {showCopyClicked ? (
              <span className="inline-flex">
                Copied!
                <CheckIcon className="h-5 w-5 text-gray-800 ml-1" />
              </span>
            ) : (
              <span className="inline-flex">
                Copy text
                <DuplicateIcon className="h-5 w-5 text-gray-800 ml-1" />
              </span>
            )}
          </button>
        </div>
      </div>
      {/* <div>
        <br />
        <br />
        inputs: {JSON.stringify(inputs)}
        <br />
        <br />
        linkedinData: {JSON.stringify(linkedinData)}
        <br />
        <br />
        companyData: {companyData}
        <br />
        <br />
        preview: {inputs.preview}
      </div> */}
    </main>
  );
}
