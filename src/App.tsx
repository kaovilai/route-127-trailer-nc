import React, { useState, useEffect, useMemo } from 'react';

const TRAILERS = {
  '4x8': { name: "4' x 8' Cargo Trailer", local: 19.95, oneWay: 110.00 },
  '5x8': { name: "5' x 8' Cargo Trailer", local: 24.95, oneWay: 146.00 },
  '6x12': { name: "6' x 12' Cargo Trailer", local: 34.95, oneWay: 255.00 },
  '5x9': { name: "5' x 9' Utility w/ Ramp", local: 29.95, oneWay: 219.00 },
  '16ft': { name: "Toy Hauler - 16ft Flatbed", local: null, oneWay: 474.00 }
};

const CITIES = [
  { id: 'addison', name: 'Addison, MI', distFromRaleigh: 650, mileMarker: 0 },
  { id: 'vanwert', name: 'Van Wert, OH', distFromRaleigh: 550, mileMarker: 90 },
  { id: 'danville', name: 'Danville, KY', distFromRaleigh: 480, mileMarker: 330 },
  { id: 'crossville', name: 'Crossville, TN', distFromRaleigh: 400, mileMarker: 470 },
  { id: 'gadsden', name: 'Gadsden, AL', distFromRaleigh: 500, mileMarker: 620 }
];

const WarningIcon = ({ tooltip }) => (
  <div className="relative group flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 text-center pointer-events-none">
      {tooltip}
    </div>
  </div>
);

const InfoIcon = ({ tooltip }) => (
  <div className="relative group flex items-center justify-center ml-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-50 text-left pointer-events-none">
      {tooltip}
    </div>
  </div>
);

const RangeSlider = ({ label, value, onChange, min, max, step, unit, tooltip }) => (
  <div className="flex flex-col space-y-1 my-2">
    <div className="flex justify-between text-sm font-medium text-gray-700">
      <div className="flex items-center">
        <label>{label}</label>
        {tooltip && <InfoIcon tooltip={tooltip} />}
      </div>
      <span>{value} {unit}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
    />
  </div>
);

export default function App() {
  // Vehicle & Fuel
  const [gasPrice, setGasPrice] = useState(3.50);
  const [emptyMPG, setEmptyMPG] = useState(24);
  const [towingMPG, setTowingMPG] = useState(14);
  
  // Trip Setup
  const [startCity, setStartCity] = useState('addison');
  const [endCity, setEndCity] = useState('gadsden');
  const [tripDays, setTripDays] = useState(7);
  
  // Trailer & Pricing
  const [trailer, setTrailer] = useState('5x8');
  const [customLocalRate, setCustomLocalRate] = useState('');
  const [customOneWayRate, setCustomOneWayRate] = useState('');
  
  // Distances
  const [customTransitDist, setCustomTransitDist] = useState('');
  const [customRouteDist, setCustomRouteDist] = useState('');
  
  // Schedule & Pace
  const [transitSpeed, setTransitSpeed] = useState(65);
  const [routeSpeed, setRouteSpeed] = useState(25);
  const [stopsPerDay, setStopsPerDay] = useState(8);
  const [minsPerStop, setMinsPerStop] = useState(20);

  const calculations = useMemo(() => {
    // 1. Calculate Distances
    const startObj = CITIES.find(c => c.id === startCity);
    const endObj = CITIES.find(c => c.id === endCity);
    
    const autoTransitDist = startObj.distFromRaleigh; // From Raleigh to Start
    const returnTransitDist = endObj.distFromRaleigh; // From End back to Raleigh
    const autoRouteDist = Math.abs(endObj.mileMarker - startObj.mileMarker);
    
    const transitToStart = customTransitDist !== '' ? parseFloat(customTransitDist) : autoTransitDist;
    const routeDist = customRouteDist !== '' ? parseFloat(customRouteDist) : autoRouteDist;
    
    // 2. Pricing Rules
    const tData = TRAILERS[trailer];
    const baseLocal = tData.local;
    const baseOneWay = tData.oneWay;
    
    const localRate = customLocalRate !== '' ? parseFloat(customLocalRate) : baseLocal;
    const oneWayRate = customOneWayRate !== '' ? parseFloat(customOneWayRate) : baseOneWay;
    
    // Option 1: Rent Local & Tow Round Trip
    // Distances: Towing from Raleigh -> Start -> End -> Raleigh
    const opt1TotalDist = transitToStart + routeDist + returnTransitDist;
    const opt1TransitFuelCost = ((transitToStart + returnTransitDist) / towingMPG) * gasPrice;
    const opt1RouteFuelCost = (routeDist / towingMPG) * gasPrice;
    const opt1FuelCost = opt1TransitFuelCost + opt1RouteFuelCost;
    const opt1RentCost = localRate !== null ? localRate * tripDays : null;
    const opt1Total = localRate !== null ? opt1FuelCost + opt1RentCost : null;
    
    // Option 2: Drive Empty, Rent One-Way
    // Distances: Empty from Raleigh -> Start. Towing from Start -> End -> Raleigh
    const opt2EmptyDist = transitToStart;
    const opt2TowingDist = routeDist + returnTransitDist;
    
    const opt2TransitEmptyFuel = (transitToStart / emptyMPG) * gasPrice;
    const opt2TransitTowingFuel = (returnTransitDist / towingMPG) * gasPrice;
    const opt2TransitFuelCost = opt2TransitEmptyFuel + opt2TransitTowingFuel;
    const opt2RouteFuelCost = (routeDist / towingMPG) * gasPrice;

    const opt2EmptyFuel = (opt2EmptyDist / emptyMPG) * gasPrice;
    const opt2TowingFuel = (opt2TowingDist / towingMPG) * gasPrice;
    const opt2FuelCost = opt2TransitFuelCost + opt2RouteFuelCost;
    
    // One-Way Rule: 4 days included, $20/day overage
    const overageDays = Math.max(0, tripDays - 4);
    const overageCost = overageDays * 20;
    const opt2RentCost = oneWayRate + overageCost;
    const opt2Total = opt2FuelCost + opt2RentCost;
    
    // 3. Pace Feasibility
    const totalDriveHours = ((transitToStart + returnTransitDist) / transitSpeed) + (routeDist / routeSpeed);
    const totalStopHours = (stopsPerDay * minsPerStop * tripDays) / 60;
    const totalTripHours = totalDriveHours + totalStopHours;
    const avgHoursPerDay = totalTripHours / tripDays;
    const isPaceFeasible = avgHoursPerDay <= 12;

    return {
      autoTransitDist, autoRouteDist, returnTransitDist,
      transitToStart, routeDist,
      opt1FuelCost, opt1TransitFuelCost, opt1RouteFuelCost, opt1RentCost, opt1Total, localRate,
      opt2FuelCost, opt2TransitFuelCost, opt2RouteFuelCost, opt2RentCost, opt2Total, overageDays, overageCost, oneWayRate,
      opt2EmptyFuel, opt2TowingFuel, opt2EmptyDist, opt2TowingDist,
      avgHoursPerDay, isPaceFeasible, totalDriveHours, totalStopHours
    };
  }, [
    startCity, endCity, gasPrice, emptyMPG, towingMPG, tripDays, 
    trailer, customLocalRate, customOneWayRate, customTransitDist, customRouteDist,
    transitSpeed, routeSpeed, stopsPerDay, minsPerStop
  ]);

  const isOpt1Winner = calculations.opt1Total !== null && calculations.opt1Total < calculations.opt2Total;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-orange-500">Route 127</span> Trailer Strategy
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Base Vehicle Config: <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">2019 Lexus RX 350 (FWD)</span>
            <span className="text-xs border border-orange-200 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Max Tow Speed: 55 MPH</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm max-w-sm border border-blue-100">
          <p className="font-semibold">Goal:</p> Find the cheapest strategy between towing a local rental round-trip vs. driving empty and grabbing a one-way trailer.
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Trailer Selection */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">1. Equipment & Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Trailer</label>
                <select 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 bg-gray-50"
                  value={trailer} onChange={(e) => setTrailer(e.target.value)}
                >
                  {Object.entries(TRAILERS).map(([key, data]) => (
                    <option key={key} value={key}>{data.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-1">
                    Local Rate/Day
                    {customLocalRate !== '' && <WarningIcon tooltip={`Overridden! Default is $${TRAILERS[trailer].local}`} />}
                  </label>
                  <input 
                    type="number" 
                    placeholder={TRAILERS[trailer].local || 'N/A'} 
                    value={customLocalRate}
                    onChange={(e) => setCustomLocalRate(e.target.value)}
                    disabled={TRAILERS[trailer].local === null}
                    className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center gap-1">
                    One-Way Rate
                    {customOneWayRate !== '' && <WarningIcon tooltip={`Overridden! Default is $${TRAILERS[trailer].oneWay}`} />}
                  </label>
                  <input 
                    type="number" 
                    placeholder={TRAILERS[trailer].oneWay} 
                    value={customOneWayRate}
                    onChange={(e) => setCustomOneWayRate(e.target.value)}
                    className="w-full border-gray-300 rounded-lg p-2 bg-gray-50 focus:ring-orange-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">One-way includes 4 days. +$20/day penalty applied automatically.</p>
            </div>
          </div>

          {/* Vehicle & Fuel */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">2. Vehicle & Fuel Math</h2>
            <RangeSlider label="Gas Price" value={gasPrice} min={2.00} max={6.00} step={0.05} unit="/ gal" onChange={setGasPrice} tooltip="Estimated average price of regular gasoline during your trip." />
            <div className="grid grid-cols-2 gap-4 mt-2">
              <RangeSlider label="Empty MPG" value={emptyMPG} min={10} max={40} step={1} unit="mpg" onChange={setEmptyMPG} tooltip="Your vehicle's standard highway MPG when NOT towing a trailer." />
              <RangeSlider label="Towing MPG" value={towingMPG} min={5} max={25} step={1} unit="mpg" onChange={setTowingMPG} tooltip="Your expected MPG when towing a loaded trailer. Usually 30-50% lower than empty MPG."/>
            </div>
          </div>
          
          {/* Pace & Schedule */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">3. Pace & Schedule</h2>
            <RangeSlider label="Trip Duration" value={tripDays} min={1} max={14} step={1} unit="days" onChange={setTripDays} tooltip="Total days you will be away, including travel days to and from the route."/>
            <div className="grid grid-cols-2 gap-4">
              <RangeSlider label="Stops/Day" value={stopsPerDay} min={0} max={30} step={1} unit="" onChange={setStopsPerDay} tooltip="Estimated number of yard sales or antique shops you plan to stop at per day."/>
              <RangeSlider label="Mins/Stop" value={minsPerStop} min={5} max={60} step={5} unit="m" onChange={setMinsPerStop} tooltip="Average amount of time you spend browsing or haggling at each stop."/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <RangeSlider label="Transit Speed" value={transitSpeed} min={45} max={80} step={5} unit="mph" onChange={setTransitSpeed} tooltip="Your average speed on the highway traveling TO and FROM the Route 127 corridor."/>
              <RangeSlider label="Route Speed" value={routeSpeed} min={10} max={55} step={5} unit="mph" onChange={setRouteSpeed} tooltip="Your average creeping speed driving ALONG Route 127, dealing with yard sale traffic and slow-moving vehicles."/>
            </div>
          </div>

        </div>

        {/* Middle Column: Route & Map */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-grow flex flex-col">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">4. Route Mapping</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start City</label>
                <select className="w-full border-gray-300 rounded-lg p-2 bg-gray-50" value={startCity} onChange={(e) => setStartCity(e.target.value)}>
                  {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End City</label>
                <select className="w-full border-gray-300 rounded-lg p-2 bg-gray-50" value={endCity} onChange={(e) => setEndCity(e.target.value)}>
                  {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Overrides */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
               <div>
                  <label className="flex text-xs font-medium text-gray-700 mb-1 items-center gap-1">
                    Transit Miles
                    {customTransitDist !== '' && <WarningIcon tooltip={`Auto-calculated: ${calculations.autoTransitDist} miles`} />}
                  </label>
                  <input type="number" placeholder={String(calculations.autoTransitDist)} value={customTransitDist} onChange={(e) => setCustomTransitDist(e.target.value)} className="w-full border-gray-300 rounded text-sm p-1" />
                </div>
                <div>
                  <label className="flex text-xs font-medium text-gray-700 mb-1 items-center gap-1">
                    Route Miles
                    {customRouteDist !== '' && <WarningIcon tooltip={`Auto-calculated: ${calculations.autoRouteDist} miles`} />}
                  </label>
                  <input type="number" placeholder={String(calculations.autoRouteDist)} value={customRouteDist} onChange={(e) => setCustomRouteDist(e.target.value)} className="w-full border-gray-300 rounded text-sm p-1" />
                </div>
            </div>

            {/* SVG Visual Map */}
            <div className="flex-grow flex justify-center items-center py-4 bg-gray-900 rounded-xl relative overflow-hidden">
               {/* Abstract Highway Lines */}
               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, #fff 10px, #fff 20px)', backgroundSize: '100% 40px', width: '2px', left: '50%', marginLeft: '-1px' }}></div>
               
               <svg width="200" height="350" viewBox="0 0 200 350" className="relative z-10">
                  {/* Background Line */}
                  <line x1="40" y1="20" x2="40" y2="320" stroke="#374151" strokeWidth="6" strokeLinecap="round" />
                  
                  {/* Active Segment Line */}
                  {(() => {
                    const s = CITIES.findIndex(c => c.id === startCity);
                    const e = CITIES.findIndex(c => c.id === endCity);
                    const minIdx = Math.min(s, e);
                    const maxIdx = Math.max(s, e);
                    const y1 = 20 + (minIdx * 75);
                    const y2 = 20 + (maxIdx * 75);
                    return (
                      <line x1="40" y1={y1} x2="40" y2={y2} stroke="#f97316" strokeWidth="6" strokeLinecap="round" />
                    );
                  })()}

                  {/* City Nodes */}
                  {CITIES.map((city, idx) => {
                    const yPos = 20 + (idx * 75);
                    const isSelected = city.id === startCity || city.id === endCity;
                    const isActiveRoute = (() => {
                       const s = CITIES.findIndex(c => c.id === startCity);
                       const e = CITIES.findIndex(c => c.id === endCity);
                       const minIdx = Math.min(s, e);
                       const maxIdx = Math.max(s, e);
                       return idx >= minIdx && idx <= maxIdx;
                    })();

                    return (
                      <g key={city.id} className="group">
                        <circle 
                          cx="40" cy={yPos} r="8" 
                          fill={isSelected ? "#f97316" : (isActiveRoute ? "#fff" : "#4b5563")} 
                          stroke="#1f2937" strokeWidth="3" 
                        />
                        <text x="60" y={yPos + 5} fontSize="12" fill={isSelected ? "#f97316" : "#9ca3af"} fontWeight={isSelected ? "bold" : "normal"}>
                          {city.name}
                        </text>
                        {/* Hover Data */}
                        <rect x="60" y={yPos - 25} width="120" height="20" fill="#1f2937" rx="4" className="hidden group-hover:block" />
                        <text x="65" y={yPos - 11} fontSize="10" fill="#fff" className="hidden group-hover:block">
                          {city.distFromRaleigh} mi from NC
                        </text>
                      </g>
                    )
                  })}
               </svg>
            </div>
            
          </div>
        </div>

        {/* Right Column: Results & Comparison */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Option 1 */}
            <div className={`relative p-5 rounded-2xl shadow-lg border-2 transition-all ${isOpt1Winner ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
              {isOpt1Winner && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                   Most Cost Effective
                 </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-1">Option 1</h3>
              <p className="text-xs text-center text-gray-500 mb-4 h-8">Rent Local in NC &<br/>Tow Round-Trip</p>
              
              {calculations.opt1Total === null ? (
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg text-gray-400 text-sm text-center px-4 border border-dashed border-gray-300">
                  Trailer not available for local round-trip rental.
                </div>
              ) : (
                <>
                  <div className="text-3xl font-black text-center text-gray-900 mb-6">
                    ${calculations.opt1Total.toFixed(2)}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Rental (${calculations.localRate}/day)</span>
                      <span className="font-semibold">${calculations.opt1RentCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100 group relative">
                      <span className="text-gray-600 underline decoration-dashed cursor-help">Fuel (Towing All)</span>
                      <span className="font-semibold">${calculations.opt1FuelCost.toFixed(2)}</span>
                      {/* Tooltip */}
                      <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-56 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-10 text-right">
                        <div className="font-semibold text-gray-300 mb-1 border-b border-gray-600 pb-1">Fuel Breakdown (All Towing)</div>
                        <div className="flex justify-between">
                          <span>Transit ({calculations.transitToStart + calculations.returnTransitDist} mi):</span>
                          <span>${calculations.opt1TransitFuelCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Route ({calculations.routeDist} mi):</span>
                          <span>${calculations.opt1RouteFuelCost.toFixed(2)}</span>
                        </div>
                        <div className="mt-1 pt-1 border-t border-gray-600 font-bold flex justify-between">
                           <span>Total ({(calculations.transitToStart + calculations.routeDist + calculations.returnTransitDist).toFixed(0)} mi):</span>
                           <span>${calculations.opt1FuelCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Option 2 */}
            <div className={`relative p-5 rounded-2xl shadow-lg border-2 transition-all ${!isOpt1Winner ? 'border-green-500 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
              {!isOpt1Winner && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                   Most Cost Effective
                 </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-1">Option 2</h3>
              <p className="text-xs text-center text-gray-500 mb-4 h-8">Drive Empty &<br/>Rent One-Way</p>
              
              <div className="text-3xl font-black text-center text-gray-900 mb-6">
                ${calculations.opt2Total.toFixed(2)}
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Base Rental (One-Way)</span>
                  <span className="font-semibold">${calculations.oneWayRate.toFixed(2)}</span>
                </div>
                {calculations.overageDays > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100 text-red-600">
                    <span className="flex items-center gap-1">
                      Overage ({calculations.overageDays} days) 
                      <WarningIcon tooltip={`One-way includes 4 days. You selected ${tripDays} days. Adding $20/day penalty.`} />
                    </span>
                    <span className="font-semibold">+${calculations.overageCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-gray-100 group relative">
                  <span className="text-gray-600 underline decoration-dashed cursor-help">Fuel (Split Math)</span>
                  <span className="font-semibold">${calculations.opt2FuelCost.toFixed(2)}</span>
                  <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-10 text-right">
                     <div className="font-semibold text-gray-300 mb-1 border-b border-gray-600 pb-1">Fuel Breakdown (Split MPG)</div>
                     
                     <div className="mb-2">
                       <div className="font-semibold text-gray-400">Transit (To & From Route)</div>
                       <div className="flex justify-between pl-2">
                         <span>Empty To Start ({calculations.transitToStart} mi @ {emptyMPG} MPG):</span>
                         <span>${((calculations.transitToStart / emptyMPG) * gasPrice).toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between pl-2">
                         <span>Tow Home ({calculations.returnTransitDist} mi @ {towingMPG} MPG):</span>
                         <span>${((calculations.returnTransitDist / towingMPG) * gasPrice).toFixed(2)}</span>
                       </div>
                     </div>
                     
                     <div>
                       <div className="font-semibold text-gray-400">Route (Along 127)</div>
                       <div className="flex justify-between pl-2">
                         <span>Towing Route ({calculations.routeDist} mi @ {towingMPG} MPG):</span>
                         <span>${calculations.opt2RouteFuelCost.toFixed(2)}</span>
                       </div>
                     </div>
                     
                     <div className="mt-2 pt-1 border-t border-gray-600 font-bold flex justify-between">
                         <span>Total Fuel:</span>
                         <span>${calculations.opt2FuelCost.toFixed(2)}</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Schedule Feasibility Engine */}
          <div className={`p-5 rounded-2xl shadow-sm border ${calculations.isPaceFeasible ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-200'}`}>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${calculations.isPaceFeasible ? 'text-blue-500' : 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Schedule Feasibility
            </h2>
            
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
               <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Drive</p>
                  <p className="font-bold text-gray-800">{calculations.totalDriveHours.toFixed(1)}h</p>
               </div>
               <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total Stops</p>
                  <p className="font-bold text-gray-800">{calculations.totalStopHours.toFixed(1)}h</p>
               </div>
               <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Daily</p>
                  <p className={`font-bold ${calculations.isPaceFeasible ? 'text-blue-600' : 'text-red-600'}`}>{calculations.avgHoursPerDay.toFixed(1)}h</p>
               </div>
            </div>

            {!calculations.isPaceFeasible ? (
               <p className="text-sm text-red-700 bg-red-100/50 p-3 rounded-lg flex items-start gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
                 Warning: Your current plan requires {calculations.avgHoursPerDay.toFixed(1)} hours of active time per day. This exceeds available daylight (12h). Consider extending trip duration or reducing stops.
               </p>
            ) : (
               <p className="text-sm text-blue-800">
                 Looks good! Your pacing fits comfortably within a standard daylight driving schedule.
               </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
