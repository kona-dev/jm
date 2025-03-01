"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const rainContainerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showExpandedBox, setShowExpandedBox] = useState(false);
  const [expandedBoxVisible, setExpandedBoxVisible] = useState(false);
  const expandedBoxRef = useRef<HTMLDivElement>(null);
  const drinkSearchRef = useRef<HTMLInputElement>(null);
  const drinkDropdownRef = useRef<HTMLDivElement>(null);
  const locationSearchRef = useRef<HTMLInputElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  
  // Sample energy drinks data with variations
  const energyDrinks = [
    { name: "Monster Energy Original", variations: ["monsterenergy", "monster"] },
    { name: "Red Bull", variations: ["redbull", "red bull"] },
    { name: "Bang Energy", variations: ["bangenergy", "bang"] },
    { name: "Celsius", variations: ["celsius"] },
    { name: "Rockstar Energy", variations: ["rockstarenergy", "rockstar"] },
    { name: "NOS Energy", variations: ["nosenergy", "nos"] },
    { name: "Reign Total Body Fuel", variations: ["reign", "reignbodyfuel"] },
    { name: "G Fuel", variations: ["gfuel", "g fuel"] },
    { name: "5-Hour Energy", variations: ["5hourenergy", "5hour"] },
    { name: "Monster Energy Zero Ultra", variations: ["monsterzero", "monsterzeraultra"] },
    { name: "Red Bull Sugar Free", variations: ["redbullsugarfree", "sugarfreeredbull"] },
    { name: "Bang Star Blast", variations: ["bangstarblast"] },
    { name: "Celsius Sparkling Orange", variations: ["celsiusorange", "sparkling orange"] }
  ];
  
  // Sample locations data (empty array since we're using geocoding API)
  const locations: string[] = [];

  // State for search functionality
  const [drinkSearchValue, setDrinkSearchValue] = useState('');
  const [locationSearchValue, setLocationSearchValue] = useState('');
  const [filteredDrinks, setFilteredDrinks] = useState<string[]>(energyDrinks.map(drink => drink.name));
  const [filteredLocations, setFilteredLocations] = useState<string[]>(locations);
  const [showDrinkDropdown, setShowDrinkDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutoCompleteToast, setShowAutoCompleteToast] = useState(false);
  const [autoCompleteMessage, setAutoCompleteMessage] = useState('');
  const [toastFadingOut, setToastFadingOut] = useState(false);

  // State for geolocation
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null);
  
  // New state for search results and errors
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastFadingOut, setErrorToastFadingOut] = useState(false);
  const findDealsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!rainContainerRef.current) return;
    
    // Clear any existing raindrops
    rainContainerRef.current.innerHTML = '';
    
    // Create raindrops
    const containerWidth = rainContainerRef.current.offsetWidth;
    const containerHeight = rainContainerRef.current.offsetHeight;
    const raindropsCount = 200;
    
    for (let i = 0; i < raindropsCount; i++) {
      const drop = document.createElement('div');
      drop.classList.add('rain-drop');
      
      // Random positioning
      const posX = Math.random() * containerWidth;
      const delay = Math.random() * 5;
      const duration = 0.5 + Math.random() * 0.8;
      
      // Random height for variation
      const height = 15 + Math.random() * 15;
      
      // Apply styles
      drop.style.left = `${posX}px`;
      drop.style.height = `${height}px`;
      drop.style.animationDelay = `${delay}s`;
      drop.style.animationDuration = `${duration}s`;
      
      // Set the final opacity for the animation to reach
      const finalOpacity = 0.2 + Math.random() * 0.5;
      drop.style.setProperty('--final-opacity', finalOpacity.toString());
      
      // Add to container
      rainContainerRef.current.appendChild(drop);
    }
  }, []);

  const handleLetsGoClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Show expanded box after a delay that matches the dissolve animation
    setTimeout(() => {
      setShowExpandedBox(true);
      
      // Make expanded box visible after it's rendered
      setTimeout(() => {
        setExpandedBoxVisible(true);
      }, 50);
    }, 600); // Increased from 400ms to 600ms to match slower transitions
  };

  // Handle drink search input with enhanced matching
  const handleDrinkSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDrinkSearchValue(value);
    
    if (value.length > 0) {
      const searchTerm = value.toLowerCase().replace(/\s+/g, '');
      
      const filtered = energyDrinks.filter(drink => {
        // Check the main name (with and without spaces)
        const nameNoSpaces = drink.name.toLowerCase().replace(/\s+/g, '');
        if (nameNoSpaces.includes(searchTerm)) return true;
        
        // Check if the name with spaces includes the search term
        if (drink.name.toLowerCase().includes(value.toLowerCase())) return true;
        
        // Check all variations
        return drink.variations.some(variation => 
          variation.toLowerCase().replace(/\s+/g, '').includes(searchTerm)
        );
      });
      
      setFilteredDrinks(filtered.map(drink => drink.name));
      setShowDrinkDropdown(true);
    } else {
      setFilteredDrinks(energyDrinks.map(drink => drink.name));
      setShowDrinkDropdown(false);
    }
  };

  // Geocode address search (forward geocoding)
  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'JuiceMe Energy Drink Finder'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to search locations');
      }
      
      const data = await response.json();
      
      // Format the addresses
      const formattedAddresses = data.map((item: any) => {
        const addr = item.address;
        return [
          addr.road ? `${addr.house_number || ''} ${addr.road}`.trim() : '',
          addr.city || addr.town || addr.village || '',
          addr.state || addr.state_district || '',
          addr.postcode || ''
        ].filter(Boolean).join(', ');
      });
      
      setFilteredLocations(formattedAddresses);
      setShowLocationDropdown(formattedAddresses.length > 0);
      
    } catch (error) {
      console.error('Error searching locations:', error);
      // If API fails, show no results
      setFilteredLocations([]);
      setShowLocationDropdown(false);
    }
  };
  
  // Debounce the location search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationSearchValue && locationSearchValue.length >= 3) {
        searchLocations(locationSearchValue);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [locationSearchValue]);

  // Handle location search input
  const handleLocationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationSearchValue(value);
    
    if (value.length === 0) {
      setFilteredLocations([]);
      setShowLocationDropdown(false);
    } else if (value.length < 3) {
      // For very short queries, don't show dropdown yet
      setShowLocationDropdown(false);
    }
    // For queries >= 3 characters, the useEffect will trigger the API call
  };

  // Handle selecting a drink from dropdown
  const handleSelectDrink = (drink: string) => {
    setDrinkSearchValue(drink);
    setShowDrinkDropdown(false);
  };

  // Handle selecting a location from dropdown
  const handleSelectLocation = (location: string) => {
    setLocationSearchValue(location);
    setShowLocationDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drinkDropdownRef.current && !drinkDropdownRef.current.contains(event.target as Node) && 
          drinkSearchRef.current && !drinkSearchRef.current.contains(event.target as Node)) {
        setShowDrinkDropdown(false);
      }
      
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node) && 
          locationSearchRef.current && !locationSearchRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search button click
  const handleSearch = () => {
    // Reset any previous errors or results
    setSearchError(null);
    setShowErrorToast(false);
    
    // Validate inputs
    if (!drinkSearchValue.trim() || !locationSearchValue.trim()) {
      displayErrorToast("Please enter both a drink and location");
      flashErrorButton();
      return;
    }
    
    // Show loading state
    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSearching(false);
      
      // For demo purposes, randomly decide if we found results or not
      const hasResults = Math.random() > 0.3; // 70% chance of finding results
      
      if (hasResults) {
        // Simulate finding some results
        const mockResults = [
          {
            id: 1,
            store: "QuickMart",
            address: "123 Main St, Anytown",
            price: "$2.49",
            distance: "0.8 miles"
          },
          {
            id: 2,
            store: "SuperValue",
            address: "456 Oak Ave, Anytown",
            price: "$2.79",
            distance: "1.2 miles"
          },
          {
            id: 3,
            store: "MegaStore",
            address: "789 Pine Rd, Anytown",
            price: "$2.29",
            distance: "1.5 miles"
          }
        ];
        
        setSearchResults(mockResults);
        
        // Fade out search container and show results
        setShowResults(true);
      } else {
        // No results found
        setSearchResults([]);
        displayErrorToast(`No results found for ${drinkSearchValue} near ${locationSearchValue}`);
        flashErrorButton();
      }
    }, 1500);
  };

  // Handle key press in drink search input
  const handleDrinkKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's no input, do nothing
      if (!drinkSearchValue.trim()) return;
      
      // If there are filtered results, use the first one
      if (filteredDrinks.length > 0) {
        const originalValue = drinkSearchValue;
        const correctedValue = filteredDrinks[0];
        
        setDrinkSearchValue(correctedValue);
        setShowDrinkDropdown(false);
        
        // Only show toast if there was a correction
        if (originalValue !== correctedValue) {
          showToast(`Corrected to "${correctedValue}"`);
        }
        
        return;
      }
      
      // If no direct matches, try to find the closest match
      const searchTerm = drinkSearchValue.toLowerCase().replace(/\s+/g, '');
      
      // Find the best match based on similarity
      let bestMatch = null;
      let highestScore = 0;
      
      energyDrinks.forEach(drink => {
        // Check name similarity
        const nameNoSpaces = drink.name.toLowerCase().replace(/\s+/g, '');
        let score = 0;
        
        // Calculate a simple similarity score
        if (nameNoSpaces.includes(searchTerm) || searchTerm.includes(nameNoSpaces)) {
          // Higher score for more complete matches
          score = Math.min(searchTerm.length, nameNoSpaces.length) / 
                 Math.max(searchTerm.length, nameNoSpaces.length) * 100;
        }
        
        // Check variations
        drink.variations.forEach(variation => {
          const variationNoSpaces = variation.toLowerCase().replace(/\s+/g, '');
          if (variationNoSpaces.includes(searchTerm) || searchTerm.includes(variationNoSpaces)) {
            const variationScore = Math.min(searchTerm.length, variationNoSpaces.length) / 
                                  Math.max(searchTerm.length, variationNoSpaces.length) * 90; // Slightly lower score for variations
            score = Math.max(score, variationScore);
          }
        });
        
        // Update best match if this score is higher
        if (score > highestScore) {
          highestScore = score;
          bestMatch = drink.name;
        }
      });
      
      // If we found a reasonable match (score > 40%), use it
      if (bestMatch && highestScore > 40) {
        const originalValue = drinkSearchValue;
        
        setDrinkSearchValue(bestMatch);
        setShowDrinkDropdown(false);
        
        showToast(`Auto-completed to "${bestMatch}"`);
      }
    }
  };

  // Handle key press in location search input
  const handleLocationKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there are filtered results, use the first one
      if (filteredLocations.length > 0) {
        const originalValue = locationSearchValue;
        const correctedValue = filteredLocations[0];
        
        setLocationSearchValue(correctedValue);
        setShowLocationDropdown(false);
        
        // Only show toast if there was a correction
        if (originalValue !== correctedValue) {
          showToast(`Corrected to "${correctedValue}"`);
        }
      }
    }
  };

  // Function to show toast with message
  const showToast = (message: string) => {
    // If a toast is already showing, fade it out first
    if (showAutoCompleteToast) {
      setToastFadingOut(true);
      setTimeout(() => {
        setShowAutoCompleteToast(false);
        setToastFadingOut(false);
        displayNewToast(message);
      }, 300); // Match the duration of the fade-out animation
    } else {
      displayNewToast(message);
    }
  };
  
  // Helper to display a new toast
  const displayNewToast = (message: string) => {
    setAutoCompleteMessage(message);
    setShowAutoCompleteToast(true);
    
    // Hide toast after 3 seconds with fade-out animation
    setTimeout(() => {
      setToastFadingOut(true);
      setTimeout(() => {
        setShowAutoCompleteToast(false);
        setToastFadingOut(false);
      }, 300); // Match the duration of the fade-out animation
    }, 3000);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLoadingLocation(true);
    setGeoLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success - now reverse geocode to get address
        reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = "Unable to retrieve your location";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        setGeoLocationError(errorMessage);
        showToast(errorMessage);
      }
    );
  };
  
  // Reverse geocode coordinates to address using OpenStreetMap Nominatim API
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'JuiceMe Energy Drink Finder'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get address');
      }
      
      const data = await response.json();
      
      // Format the address
      let address = '';
      if (data.address) {
        const addr = data.address;
        address = [
          addr.road ? `${addr.house_number || ''} ${addr.road}`.trim() : '',
          addr.city || addr.town || addr.village || '',
          addr.state || addr.state_district || '',
          addr.postcode || ''
        ].filter(Boolean).join(', ');
      } else {
        address = data.display_name || `${latitude}, ${longitude}`;
      }
      
      setLocationSearchValue(address);
      setIsLoadingLocation(false);
      showToast("Location detected");
      
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setIsLoadingLocation(false);
      setGeoLocationError('Failed to get your address. Using coordinates instead.');
      setLocationSearchValue(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      showToast("Using coordinates as location");
    }
  };
  
  // Function to handle "Use Current Location" click
  const handleUseCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    getCurrentLocation();
    setShowLocationDropdown(false);
  };

  // Function to display error toast
  const displayErrorToast = (message: string) => {
    setSearchError(message);
    
    // If a toast is already showing, fade it out first
    if (showErrorToast === true) {
      setErrorToastFadingOut(true);
      setTimeout(() => {
        setShowErrorToast(false);
        setErrorToastFadingOut(false);
        showNewErrorToast(message);
      }, 300);
    } else {
      showNewErrorToast(message);
    }
  };
  
  // Helper to display a new error toast
  const showNewErrorToast = (message: string) => {
    setSearchError(message);
    setShowErrorToast(true);
    
    // Hide toast after 3 seconds with fade-out animation
    setTimeout(() => {
      setErrorToastFadingOut(true);
      setTimeout(() => {
        setShowErrorToast(false);
        setErrorToastFadingOut(false);
      }, 300);
    }, 3000);
  };
  
  // Flash the Find Deals button red to indicate error
  const flashErrorButton = () => {
    if (findDealsButtonRef.current) {
      findDealsButtonRef.current.classList.add('button-error');
      
      // Remove the error class after animation completes
      setTimeout(() => {
        if (findDealsButtonRef.current) {
          findDealsButtonRef.current.classList.remove('button-error');
        }
      }, 600); // Match the duration of the error-flash animation
    }
  };
  
  // Reset search and go back to search form
  const handleBackToSearch = () => {
    setShowResults(false);
    setSearchResults([]);
    setExpandedBoxVisible(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden relative">
      {/* Distant lightning effect with blurred blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* First lightning blob */}
        <div 
          className="absolute rounded-full bg-teal-400/30 blur-[100px]"
          style={{
            width: '30%',
            height: '40%',
            top: '15%',
            left: '65%',
            animation: 'lightning-flash 10s infinite ease-in-out',
            animationDelay: '0s'
          }}
        ></div>
        
        {/* Second lightning blob */}
        <div 
          className="absolute rounded-full bg-emerald-400/25 blur-[120px]"
          style={{
            width: '25%',
            height: '35%',
            top: '60%',
            left: '10%',
            animation: 'lightning-flash 13s infinite ease-in-out',
            animationDelay: '2s'
          }}
        ></div>
        
        {/* Third lightning blob */}
        <div 
          className="absolute rounded-full bg-cyan-400/20 blur-[150px]"
          style={{
            width: '40%',
            height: '30%',
            top: '5%',
            left: '5%',
            animation: 'lightning-flash 15s infinite ease-in-out',
            animationDelay: '5s'
          }}
        ></div>
      </div>

      {/* Rain effect overlay */}
      <div ref={rainContainerRef} className="absolute inset-0 z-0 rain-container overflow-hidden pointer-events-none"></div>

      {/* Navigation Bar with title */}
      <nav className="bg-transparent text-white p-4 relative z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold font-major-mono nav-title-glow">
            juiceMe
          </h1>
          <div>
            {/* Empty div to maintain flex spacing */}
          </div>
        </div>
      </nav>

      {/* Main Content with radial gradient background */}
      <main className="flex-grow container mx-auto px-4 py-6 relative z-10 flex flex-col items-center justify-center">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/40 via-gray-900/60 to-gray-900 -z-10 rounded-lg"></div>
        
        {/* Big centered title with slower gradient animation */}
        <h1 className={`text-6xl md:text-8xl lg:text-9xl font-black mb-12 text-center tracking-tight font-major-mono gradient-text-slow drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] ${isAnimating ? 'dissolve-title' : ''}`}>
          juiceMe
        </h1>
        
        {/* Initial box that dissolves */}
        <div className={`initial-box bg-gray-800/70 px-6 sm:px-10 py-8 rounded-lg border-2 border-emerald-500/50 shadow-2xl backdrop-blur-sm max-w-lg w-full mx-auto ${isAnimating ? 'dissolve' : ''}`}>
          <p className="text-xl text-center mb-8 font-major-mono tracking-tight font-semibold">
            <span className="gradient-text">find the </span>
            <span className="gold-gradient-text">best-priced</span>
            <br/>
            <span className="gradient-text">energy drinks in your area</span>
          </p>
          <div className="flex justify-center">
            <button 
              onClick={handleLetsGoClick}
              className="relative overflow-hidden group px-8 py-3 rounded-full bg-transparent border-2 border-emerald-500 text-white font-major-mono tracking-wider transition-all duration-300 hover:border-teal-400 hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]"
            >
              <span className="relative z-10 font-semibold transition-colors duration-300 group-hover:text-gray-900">
                lets go
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-x-0 group-hover:scale-x-100 origin-left"></span>
            </button>
          </div>
        </div>
      </main>

      {/* Expanded box that fades in */}
      {showExpandedBox && (
        <div 
          ref={expandedBoxRef} 
          className={`container-fixed-center expanded-box ${expandedBoxVisible ? 'visible' : ''} ${showResults ? 'search-container fade-out' : ''} bg-gray-800/90 px-6 sm:px-10 py-8 rounded-lg border-2 border-emerald-500/50 shadow-2xl backdrop-blur-sm`}
        >
          <div className="h-full flex flex-col relative">
            <h2 className="text-2xl font-major-mono gradient-text text-center mb-8 font-bold title-glow">
              find your juice
            </h2>
            
            {/* Energy Drink Search */}
            <div className="mb-8">
              <label htmlFor="drink-search" className="block text-emerald-400 font-medium mb-2 font-orbitron text-sm">
                ENERGY DRINK
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="drink-search"
                  placeholder="Search for an energy drink..."
                  className="w-full bg-gray-900/80 border border-emerald-500/30 focus:border-emerald-500/70 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  ref={drinkSearchRef}
                  value={drinkSearchValue}
                  onChange={handleDrinkSearch}
                  onKeyDown={handleDrinkKeyPress}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {/* Dropdown for search results */}
                {showDrinkDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-900/95 border border-emerald-500/30 rounded-md shadow-lg py-1 max-h-60 overflow-auto" ref={drinkDropdownRef}>
                    <div className="px-4 py-2 text-sm text-emerald-400 border-b border-emerald-500/20">Popular Drinks</div>
                    <div className="py-1">
                      {filteredDrinks.map((drink, index) => (
                        <a key={`drink-${index}-${drink}`} href="#" className="block px-4 py-2 text-sm text-white hover:bg-emerald-500/20 transition-colors duration-150" onClick={() => handleSelectDrink(drink)}>{drink}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Location Search */}
            <div className="mb-8">
              <label htmlFor="location-search" className="block text-emerald-400 font-medium mb-2 font-orbitron text-sm">
                LOCATION
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location-search"
                  placeholder="Enter your address or zip code..."
                  className="w-full bg-gray-900/80 border border-emerald-500/30 focus:border-emerald-500/70 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300"
                  ref={locationSearchRef}
                  value={locationSearchValue}
                  onChange={handleLocationSearch}
                  onKeyDown={handleLocationKeyPress}
                  disabled={isLoadingLocation}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isLoadingLocation ? (
                    <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <button 
                      onClick={getCurrentLocation}
                      className="text-emerald-500 hover:text-emerald-400 transition-colors duration-200 focus:outline-none"
                      title="Use current location"
                      type="button"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Dropdown for location suggestions */}
                {showLocationDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-gray-900/95 border border-emerald-500/30 rounded-md shadow-lg py-1 max-h-60 overflow-auto" ref={locationDropdownRef}>
                    <div className="px-4 py-2 text-sm text-emerald-400 border-b border-emerald-500/20">Suggested Locations</div>
                    <div className="py-1">
                      <a 
                        href="#" 
                        className="block px-4 py-2 text-sm text-white hover:bg-emerald-500/20 transition-colors duration-150 flex items-center" 
                        onClick={handleUseCurrentLocation}
                        key="use-current-location"
                      >
                        <svg className="h-4 w-4 mr-2 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Use Current Location
                      </a>
                      {filteredLocations.map((location, index) => (
                        <a key={`location-${index}-${location}`} href="#" className="block px-4 py-2 text-sm text-white hover:bg-emerald-500/20 transition-colors duration-150" onClick={() => handleSelectLocation(location)}>{location}</a>
                      ))}
                    </div>
                  </div>
                )}
                
                {geoLocationError && (
                  <div className="text-red-400 text-xs mt-1">{geoLocationError}</div>
                )}
              </div>
            </div>
            
            {/* Search Button */}
            <div className="mt-auto">
              <button 
                ref={findDealsButtonRef}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-md text-white font-medium transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 font-orbitron tracking-wide disabled:opacity-70 disabled:cursor-not-allowed" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    SEARCHING...
                  </span>
                ) : (
                  'FIND DEALS'
                )}
              </button>
            </div>
            
            {/* Auto-complete Toast */}
            {showAutoCompleteToast && (
              <div className="toast-container">
                <div className={`toast toast-success ${toastFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white text-sm">{autoCompleteMessage}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Results Container */}
      {showExpandedBox && showResults && (
        <div className={`container-fixed-center results-container ${showResults ? 'fade-in' : ''} bg-gray-800/90 px-6 sm:px-10 py-8 rounded-lg border-2 border-emerald-500/50 shadow-2xl backdrop-blur-sm`}>
          <div className="h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-major-mono gradient-text font-bold title-glow">
                best deAls
              </h2>
              <button 
                onClick={handleBackToSearch}
                className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 flex items-center text-sm"
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Search
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-white text-sm mb-1">Results for:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium">
                  {drinkSearchValue}
                </span>
                <span className="bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <svg className="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {locationSearchValue}
                </span>
              </div>
            </div>
            
            {/* Results List */}
            <div className="flex-grow overflow-auto">
              {searchResults.map((result) => (
                <div key={result.id} className="bg-gray-900/70 rounded-lg p-4 mb-3 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium">{result.store}</h3>
                      <p className="text-gray-400 text-sm">{result.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-xl">{result.price}</p>
                      <p className="text-gray-400 text-xs">{result.distance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center text-gray-400 text-sm">
              <p>Prices last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Toast - Move inside the expanded box */}
      {showErrorToast && showExpandedBox && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="toast-container" style={{ bottom: "auto" }}>
            <div className={`toast toast-error ${errorToastFadingOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-sm">{searchError}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Ribbon - Much shorter */}
      <footer className="bg-gray-900 text-white py-2 border-t border-emerald-900/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <p className="gradient-text">&copy; {currentYear} <span className="font-major-mono font-bold footer-brand-glow">juiceMe</span> - all rights reserved</p>
            <div>
              <a 
                href="https://produceitem.xyz" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block text-base font-medium px-2 py-1 relative group"
              >
                <span 
                  className="relative z-10 font-orbitron"
                  style={{
                    background: 'linear-gradient(90deg, #10b981 0%, #14b8a6 25%, #06b6d4 50%, #14b8a6 75%, #10b981 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradient-shift 8s ease infinite'
                  }}
                >
                  produce item
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
