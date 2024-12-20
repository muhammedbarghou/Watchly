import React from 'react';

const CodeStep = ({ onNext, onBack }) => {
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef([]);

  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if value is entered
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // If all fields are filled, submit
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      onNext(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && index > 0 && code[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (!/^[0-9]*$/.test(pastedData.join(''))) return;
    
    const newCode = [...code];
    pastedData.forEach((value, index) => {
      if (index < 6) newCode[index] = value;
    });
    setCode(newCode);

    // Focus last filled input or first empty input
    const lastFilledIndex = newCode.findLastIndex(digit => digit !== '');
    const focusIndex = lastFilledIndex === 5 ? 5 : lastFilledIndex + 1;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Reset Code
        </label>
        <div className="flex gap-2 sm:gap-3 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="block w-[40px] h-[40px] text-center border-gray-300 dark:border-gray-700 rounded-md text-sm focus:border-[#d00000] focus:ring-0 focus:outline-none disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-800 dark:text-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="⚬"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          onClick={() => onNext(code.join(''))}
          disabled={!code.every(digit => digit !== '')}
          className="w-full sm:flex-1 bg-[#d00000] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#d00000]/90 focus:outline-none focus:ring-2 focus:ring-[#d00000] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          Verify Code
        </button>
      </div>
    </form>
  );
};

export { CodeStep };
