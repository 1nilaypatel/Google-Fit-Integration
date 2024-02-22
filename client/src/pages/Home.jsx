import React, { useEffect, useState } from 'react'

export default function Home() {
  const [stepCountData, setStepCountData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/fetch-step-count');
        const data = await response.json();
        setStepCountData(data.stepCountData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-10 flex flex-col gap-7 items-center">
      <div className='text-center text-3xl font-semibold'>
        Displaying data of past 30 days
      </div>
      <div className='text-center'>
        {stepCountData.map((stepData, index) => (
          <div key={index} className="mb-5 bg-white p-4 rounded-md shadow-md w-96">
            <p className="text-lg font-semibold">{stepData.date}</p>
            <p className="text-gray-600">Step Count: {stepData.step_count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
