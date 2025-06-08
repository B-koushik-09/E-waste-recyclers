const recyclingCenters = [
    {
        name: "E-Waste Recyclers India",
        certification: "TSPCB Authorized",
        address: "Plot No. 37, Hardware Park, Kancha Imarat, Hyderabad-501510",
        timings: "Mon-Sat: 9AM-6PM",
        phone: "+91 40-2869-8868",
        distance: "12.3 km",
        city: "Hyderabad"
    },
    {
        name: "Z Enviro Industries",
        certification: "CPCB & TSPCB Certified",
        address: "Plot 79/A, Phase-1, IDA Jeedimetla, Hyderabad-500055",
        timings: "Mon-Sat: 10AM-7PM",
        phone: "+91 40-2309-9876",
        distance: "8.5 km",
        city: "Hyderabad"
    },
    {
        name: "Ramky E-Waste Facility",
        certification: "ISO 14001 Certified",
        address: "Survey No. 1800, Dundigal Village, Quthbullapur, Hyderabad-500043",
        timings: "Mon-Fri: 8:30AM-5:30PM",
        phone: "+91 40-2364-7890",
        distance: "15.2 km",
        city: "Hyderabad"
    },
    {
        name: "Green Tech Recyclers",
        certification: "TSPCB Authorized",
        address: "Plot 45, Sanathnagar Industrial Estate, Bangalore-560001",
        timings: "Mon-Sat: 9:30AM-6:30PM",
        phone: "+91 40-2789-4532",
        distance: "6.8 km",
        city: "Bangalore"
    },
    {
        name: "Eco E-Waste Solutions",
        certification: "CPCB Approved",
        address: "Plot 10, MG Road, Bangalore-560001",
        timings: "Mon-Sat: 9AM-7PM",
        phone: "+91 80-1234-5678",
        distance: "5.5 km",
        city: "Bangalore"
    },
    {
        name: "Clean E-Waste Recyclers",
        certification: "ISO Certified",
        address: "Sector 18,Bangalore-560001",
        timings: "Mon-Fri: 9AM-6PM",
        phone: "+91 120-6789-4321",
        distance: "7.2 km",
        city: "Bangalore"
    }
];

async function searchCenters() {
    let city = document.getElementById("searchInput").value.trim().toLowerCase();
    let resultsContainer = document.getElementById("results-container");

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    let resultsHTML = "";

    // 🔹 1. Show Static Data First
    let filteredStaticCenters = recyclingCenters.filter(center => center.city.toLowerCase() === city);

    if (filteredStaticCenters.length > 0) {
        filteredStaticCenters.forEach(center => {
            resultsHTML += `
                <div class="center-card">
                    <div class="center-info">
                        <h3>${center.name} <span class="distance">${center.distance}</span></h3>
                        <p><strong>${center.certification}</strong></p>
                        <p>${center.address}</p>
                        <p>${center.timings}</p>
                        <p>${center.phone}</p>
                    </div>
                    <div class="buttons">
                        <button class="get-directions">Get Directions</button>
                        <button class="view-details-btn" onclick="redirectToPickup('${center.name}')">View Details</button>
                    </div>
                </div>
            `;
        });

        resultsContainer.innerHTML = resultsHTML; // Show static data first
    }

    // 🔹 2. Fetch Dynamic Data from Geoapify
    let geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&format=json&apiKey=7956d3cdc5434a6fb5a3987bc657472a`;

    try {
        let geoResponse = await fetch(geoUrl);
        let geoData = await geoResponse.json();

        if (!geoData.results.length) {
            if (!filteredStaticCenters.length) {
                resultsContainer.innerHTML = `<p>No results found for "${city}". Try another location.</p>`;
            }
            return;
        }

        let { lat, lon } = geoData.results[0];

        let apiUrl = `https://api.geoapify.com/v2/places?categories=service.recycling&filter=circle:${lon},${lat},200000&limit=5&apiKey=7956d3cdc5434a6fb5a3987bc657472a`;
        let response = await fetch(apiUrl);
        let data = await response.json();

        if (data.features.length > 0) {
            data.features.forEach(center => {
                let properties = center.properties;
                resultsHTML += `
                    <div class="center-card">
                        <div class="center-info">
                            <h3>${properties.name || "Recycling Center"} <span class="distance">${(properties.distance / 1000).toFixed(1)} km</span></h3>
                            <p><strong>${properties.categories ? properties.categories.join(", ") : "Recycling Center"}</strong></p>
                            <p>${properties.address_line1 || "Address not available"}</p>
                            <p>${properties.address_line2 || ""}</p>
                        </div>
                        <div class="buttons">
                            <button class="get-directions" onclick="window.open('https://www.google.com/maps?q=${properties.lat},${properties.lon}')">Get Directions</button>
                            <button class="view-details-btn" onclick="redirectToPickup('${properties.name || "Recycling Center"}')">View Details</button>
                        </div>
                    </div>
                `;
            });

            resultsContainer.innerHTML = resultsHTML; // Show updated results
        } else if (!filteredStaticCenters.length) {
            resultsContainer.innerHTML = `<p>No recycling centers found in ${city}. Try another location.</p>`;
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        resultsContainer.innerHTML = `<p>Error fetching data. Try again later.</p>`;
    }
}

// 🔹 Redirect function for "View Details" button
function redirectToPickup(centerName) {
    window.location.href = `pickup-details.html?center=${encodeURIComponent(centerName)}`;
}
