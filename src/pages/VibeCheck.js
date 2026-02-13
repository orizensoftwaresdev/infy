// src/pages/VibeCheck.js
import React, { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { genderOptions, bodyTypes, sizes, occasions } from '../constants/vibeData';

// No background const here, handled by Layout.js

const VibeCheck = () => {
  const [gender, setGender] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [size, setSize] = useState("");
  const [occasion, setOccasion] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isFormComplete = gender && bodyType && size && occasion;

  const handleSubmit = () => {
    if (!isFormComplete) {
      const missing = [];
      if (!gender) missing.push("Gender");
      if (!bodyType) missing.push("Body Type");
      if (!size) missing.push("Size");
      if (!occasion) missing.push("Occasion");
      setError(`Please select your ${missing.join(", ")}`);
      return;
    }
    setError("");

    console.log({ gender, bodyType, size, occasion });
    navigate('/products', { state: { preferences: { gender, bodyType, size, occasion } } });
  };

  const CustomDropdown = ({ label, selectedValue, setSelectedValue, options, placeholder, imageOptions = false }) => (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-white mb-2">{label}</label>
      <Listbox value={selectedValue} onChange={setSelectedValue}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-full bg-white py-3 pl-4 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
            <span className="block truncate text-gray-700">{selectedValue || placeholder}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
              {options.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`
                  }
                  value={imageOptions ? option.label : option.value || option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {imageOptions ? (
                          <div className="flex items-center space-x-2">
                            <img src={option.img} alt={option.label} className="w-6 h-6 rounded-full" />
                            <span>{option.label}</span>
                          </div>
                        ) : (
                          option.label || option
                        )}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.806 3.806 7.054-9.284a.75.75 0 011.052-.143z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );

  return (
    <div className="flex justify-center items-center w-full h-full py-12 px-4">
      {/* This inner div already has bg-black bg-opacity-70, which is good */}
      <div className="bg-black bg-opacity-70 p-10 rounded-3xl shadow-xl max-w-lg w-full">
        <h2 className="text-white text-3xl font-bold mb-8 text-center">Select Your Preferences</h2>

        <CustomDropdown
          label="Gender"
          selectedValue={gender}
          setSelectedValue={(val) => {
            setGender(val);
            setBodyType("");
          }}
          options={genderOptions}
          placeholder="Choose Gender"
        />

        {gender && (
          <CustomDropdown
            label="Body Type"
            selectedValue={bodyType}
            setSelectedValue={setBodyType}
            options={bodyTypes[gender]}
            placeholder="Choose Body Type"
            imageOptions={true}
          />
        )}

        <CustomDropdown
          label="Size"
          selectedValue={size}
          setSelectedValue={setSize}
          options={sizes.map(s => ({ label: s, value: s }))}
          placeholder="Choose Size"
        />

        <CustomDropdown
          label="Occasion"
          selectedValue={occasion}
          setSelectedValue={setOccasion}
          options={occasions.map(o => ({ label: o, value: o }))}
          placeholder="Choose Occasion"
        />

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <button
          className={`w-full mt-4 px-6 py-3 rounded-full font-semibold text-white transition duration-300 ease-in-out ${isFormComplete ? "bg-blue-600 hover:bg-blue-700 transform hover:scale-105" : "bg-gray-500 cursor-not-allowed opacity-70"}`}
          onClick={handleSubmit}
          disabled={!isFormComplete}
        >
          Let's Customise Your Outfit
        </button>
      </div>
    </div>
  );
};

export default VibeCheck;