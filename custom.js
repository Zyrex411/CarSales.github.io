$(document).ready(function() {
    // Simulate password hashing
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString();
    }

    // Load users
    function getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Save users
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Sign up
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        const userId = $('#signupUserId').val();
        const email = $('#signupEmail').val();
        const password = $('#signupPassword').val();
        const role = $('#signupRole').val();
        const hashedPassword = simpleHash(password);

        let users = getUsers();
        if (users.find(u => u.userId === userId || u.email === email)) {
            alert('User ID or email already exists!');
            return;
        }

        const file = $('#signupProfilePic')[0].files[0];
        const user = { userId, email, hashedPassword, role, profilePic: '', favorites: [], searches: [] };
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                user.profilePic = e.target.result;
                users.push(user);
                saveUsers(users);
                localStorage.setItem('authToken', userId);
                localStorage.setItem('authRole', role);
                redirectUser(role);
            };
            reader.readAsDataURL(file);
        } else {
            users.push(user);
            saveUsers(users);
            localStorage.setItem('authToken', userId);
            localStorage.setItem('authRole', role);
            redirectUser(role);
        }
    });

    // Login
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        const userId = $('#loginUserId').val();
        const email = $('#loginEmail').val();
        const password = $('#loginPassword').val();
        const role = $('#loginRole').val();
        const hashedPassword = simpleHash(password);

        const users = getUsers();
        const user = users.find(u => u.userId === userId && u.email === email && u.hashedPassword === hashedPassword && u.role === role);
        if (user) {
            localStorage.setItem('authToken', userId);
            localStorage.setItem('authRole', role);
            redirectUser(role);
        } else {
            alert('Invalid credentials!');
        }
    });

    // Redirect
    function redirectUser(role) {
        if (role === 'admin') {
            window.location.href = 'admin-panel.html';
        } else {
            window.location.href = 'profile.html';
        }
    }

    // Check auth
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('authRole');
    if (token) {
        $('#authLink').text('Profile').attr('href', 'profile.html');
        if (window.location.pathname.includes('profile.html')) {
            const users = getUsers();
            const user = users.find(u => u.userId === token);
            if (user) {
                $('#profileUserId').text(user.userId);
                $('#profileEmail').text(user.email);
                $('#profileRole').text(user.role);
                $('#profilePic').attr('src', user.profilePic || 'images/default-profile.jpg');
                loadFavorites(user.favorites);
                loadSearches(user.searches);
            }
        }
    }

    // Protect admin panel
    if (window.location.pathname.includes('admin-panel.html') && (!token || role !== 'admin')) {
        window.location.href = 'auth.html';
    }

    // Logout
    window.logout = function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authRole');
        window.location.href = 'auth.html';
    };

    // Theme switcher
    window.switchTheme = function(theme) {
        gsap.to('body', { opacity: 0, duration: 0.3, onComplete: () => {
            $('html').attr('data-theme', theme);
            localStorage.setItem('theme', theme);
            gsap.to('body', { opacity: 1, duration: 0.3 });
        }});
        $('.theme-switcher').val(theme);
    };

    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    $('html').attr('data-theme', savedTheme);
    $('.theme-switcher').val(savedTheme);

    // Load cars
    function loadCars() {
        $.getJSON('data/cars.json', function(data) {
            $('#newCarsContainer, #usedCarsContainer, #carList').empty();
            $('#compareCar1, #compareCar2, #compareCar3').empty().append('<option value="">Select Car</option>');
            data.forEach(car => {
                const card = `
                    <div class="col-md-4 col-sm-6 mb-4 car-card flip-card" data-car-id="${car.id}">
                        <div class="flip-card-inner">
                            <div class="flip-card-front">
                                <div class="card">
                                    <img src="${car.image}" class="card-img-top" alt="${car.model}">
                                    <div class="card-body">
                                        <h5 class="card-title">${car.model}</h5>
                                        <p class="card-text">Price: ₹${car.price.toLocaleString()}</p>
                                        <button class="btn btn-primary view-details" data-bs-toggle="modal" data-bs-target="#carDetailsModal" aria-label="View Details for ${car.model}">View Details</button>
                                        <button onclick="shareCarOnWhatsApp('${car.model}', '${car.price}')" class="btn btn-success mt-2" aria-label="Share ${car.model}"><i class="fab fa-whatsapp"></i> Share</button>
                                    </div>
                                </div>
                            </div>
                            <div class="flip-card-back">
                                <div class="card">
                                    <div class="card-body text-center">
                                        <h5>${car.model}</h5>
                                        <p>${car.fuel} | ${car.city}</p>
                                        <button class="btn btn-warning add-compare" data-id="${car.id}" aria-label="Add ${car.model} to Compare">Add to Compare</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                if (car.type === 'new') {
                    $('#newCarsContainer').append(card);
                } else {
                    $('#usedCarsContainer').append(card);
                }

                // Admin panel list
                const adminCard = `
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card">
                            <img src="${car.image}" class="card-img-top" alt="${car.model}">
                            <div class="card-body">
                                <h5>${car.model}</h5>
                                <p>Price: ₹${car.price.toLocaleString()}</p>
                                <button class="btn btn-warning edit-car" data-id="${car.id}" aria-label="Edit ${car.model}">Edit</button>
                                <button class="btn btn-danger delete-car" data-id="${car.id}" aria-label="Delete ${car.model}">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                $('#carList').append(adminCard);

                // Compare dropdowns
                const option = `<option value="${car.id}">${car.model}</option>`;
                $('#compareCar1, #compareCar2, #compareCar3').append(option);
            });

            bindCarEvents();
        });
    }

    // Bind car events
    function bindCarEvents() {
        $('.view-details').off('click').click(function() {
            const carId = $(this).closest('.car-card').data('car-id');
            $.getJSON('data/cars.json', function(data) {
                const car = data.find(c => c.id == carId);
                if (car) {
                    $('#carModel').text(car.model);
                    $('#carPrice').text(`₹${car.price.toLocaleString()}`);
                    $('#carFuel').text(car.fuel);
                    $('#carCity').text(car.city);
                    $('#carDetails').text(car.details);
                    $('#carImage').attr('src', car.image);
                    $('#favoriteCarBtn').data('car-id', carId);
                    gsap.from('.modal-content', { scale: 0.8, opacity: 0, duration: 0.3 });
                    $('#carDetailsModal').modal('show');
                }
            });
        });

        $('.edit-car').off('click').click(function() {
            const carId = $(this).data('id');
            $.getJSON('data/cars.json', function(data) {
                const car = data.find(c => c.id == carId);
                if (car) {
                    $('#carId').val(car.id);
                    $('#carModel').val(car.model);
                    $('#carType').val(car.type);
                    $('#carPrice').val(car.price);
                    $('#carFuel').val(car.fuel);
                    $('#carCity').val(car.city);
                    $('#carDetails').val(car.details);
                    gsap.to('html, body', { scrollTop: $('#carForm').offset().top, duration: 0.5 });
                }
            });
        });

        $('.delete-car').off('click').click(function() {
            if (confirm('Are you sure you want to delete this car?')) {
                const carId = $(this).data('id');
                alert('Please update cars.json manually to remove car ID ' + carId);
                loadCars();
            }
        });

        $('.add-compare').off('click').click(function() {
            const carId = $(this).data('id');
            const selects = ['#compareCar1', '#compareCar2', '#compareCar3'];
            for (let select of selects) {
                if (!$(select).val()) {
                    $(select).val(carId);
                    break;
                }
            }
        });
    }

    // Admin car form
    $('#carForm').submit(function(e) {
        e.preventDefault();
        const carId = $('#carId').val();
        const newCar = {
            id: carId ? parseInt(carId) : Date.now(),
            model: $('#carModel').val(),
            type: $('#carType').val(),
            price: parseInt($('#carPrice').val()),
            fuel: $('#carFuel').val(),
            city: $('#carCity').val(),
            details: $('#carDetails').val(),
            image: 'images/placeholder.jpg'
        };

        const file = $('#carImage')[0].files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newCar.image = e.target.result;
                saveCar(newCar);
            };
            reader.readAsDataURL(file);
        } else {
            saveCar(newCar);
        }
    });

    function saveCar(car) {
        alert('Please update cars.json manually with: ' + JSON.stringify(car));
        resetForm();
        loadCars();
    }

    function resetForm() {
        $('#carForm')[0].reset();
        $('#carId').val('');
    }

    // Seller form
    $('#sellCarForm').submit(function(e) {
        e.preventDefault();
        const name = $('#sellerName').val();
        const email = $('#sellerEmail').val();
        const model = $('#carModel').val();
        const year = $('#carYear').val();
        const price = $('#carPrice').val();

        $('#submittedName').text(name);
        $('#submittedEmail').text(email);
        $('#submittedModel').text(model);
        $('#submittedYear').text(year);
        $('#submittedPrice').text(price);

        const file = $('#sellerImage')[0].files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#submittedImage').attr('src', e.target.result);
                $('#sellCarModal').modal('show');
            };
            reader.readAsDataURL(file);
        } else {
            $('#submittedImage').attr('src', '');
            $('#sellCarModal').modal('show');
        }

        this.reset();
    });

    // Search
    window.searchCars = function(save = true) {
        const city = $('#citySelect').val();
        const type = $('#carType').val();
        const budget = $('#budgetFilter').val();
        const name = $('#carSearch').val().toLowerCase();

        $.getJSON('data/cars.json', function(data) {
            let results = data.filter(car => {
                const budgetMatch = budget === '' ||
                    (budget === 'under10' && car.price < 1000000) ||
                    (budget === '10to20' && car.price >= 1000000 && car.price < 2000000) ||
                    (budget === '20to30' && car.price >= 2000000 && car.price < 3000000) ||
                    (budget === 'luxury' && car.price >= 3000000);
                return (!city || car.city === city) &&
                       (!type || car.type === type) &&
                       budgetMatch &&
                       (!name || car.model.toLowerCase().includes(name));
            });

            if (save && token && role === 'user') {
                const users = getUsers();
                const user = users.find(u => u.userId === token);
                if (user) {
                    user.searches = user.searches || [];
                    user.searches.push({ city, type, budget, name, timestamp: new Date().toLocaleString() });
                    saveUsers(users);
                }
            }

            gsap.to('#search-results', { height: 'auto', opacity: 1, duration: 0.5 });
            const container = $('#results-container').empty();

            if (results.length === 0) {
                container.append('<p class="col-12 text-center">No cars found for your search.</p>');
            } else {
                results.forEach(car => {
                    const card = `
                        <div class="col-md-4 col-sm-6 mb-4 car-card flip-card" data-car-id="${car.id}">
                            <div class="flip-card-inner">
                                <div class="flip-card-front">
                                    <div class="card">
                                        <img src="${car.image}" class="card-img-top" alt="${car.model}">
                                        <div class="card-body">
                                            <h5 class="card-title">${car.model}</h5>
                                            <p class="card-text">Price: ₹${car.price.toLocaleString()}</p>
                                            <button class="btn btn-primary view-details" data-bs-toggle="modal" data-bs-target="#carDetailsModal" aria-label="View Details for ${car.model}">View Details</button>
                                            <button onclick="shareCarOnWhatsApp('${car.model}', '${car.price}')" class="btn btn-success mt-2" aria-label="Share ${car.model}"><i class="fab fa-whatsapp"></i> Share</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="flip-card-back">
                                    <div class="card">
                                        <div class="card-body text-center">
                                            <h5>${car.model}</h5>
                                            <p>${car.fuel} | ${car.city}</p>
                                            <button class="btn btn-warning add-compare" data-id="${car.id}" aria-label="Add ${car.model} to Compare">Add to Compare</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(card);
                });
                bindCarEvents();
            }
        });
    };

    // Autocomplete
    $.getJSON('data/cars.json', function(data) {
        const carNames = [...new Set(data.map(car => car.model))];
        $('#carSearch').autocomplete({
            source: carNames,
            minLength: 2
        });
    });

    // Favorite cars
    window.addFavoriteCar = function() {
        if (!token || role !== 'user') {
            alert('Please log in as a user to add favorites!');
            return;
        }
        const carId = $('#favoriteCarBtn').data('car-id');
        const users = getUsers();
        const user = users.find(u => u.userId === token);
        if (user) {
            user.favorites = user.favorites || [];
            if (!user.favorites.includes(carId)) {
                user.favorites.push(carId);
                saveUsers(users);
                alert('Car added to favorites!');
            } else {
                alert('Car already in favorites!');
            }
        }
    };

    function loadFavorites(favorites) {
        if (!favorites || favorites.length === 0) {
            $('#favoriteCars').append('<p>No favorite cars yet.</p>');
            return;
        }
        $.getJSON('data/cars.json', function(data) {
            favorites.forEach(carId => {
                const car = data.find(c => c.id == carId);
                if (car) {
                    const card = `
                        <div class="col-md-4 col-sm-6 mb-4 car-card">
                            <div class="card">
                                <img src="${car.image}" class="card-img-top" alt="${car.model}">
                                <div class="card-body">
                                    <h5 class="card-title">${car.model}</h5>
                                    <p class="card-text">Price: ₹${car.price.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    $('#favoriteCars').append(card);
                }
            });
        });
    }

    function loadSearches(searches) {
        if (!searches || searches.length === 0) {
            $('#savedSearches').append('<li>No saved searches yet.</li>');
            return;
        }
        searches.forEach(search => {
            const li = `<li><a href="#" class="saved-search" data-city="${search.city}" data-type="${search.type}" data-budget="${search.budget}" data-name="${search.name}">${search.name || 'All'} in ${search.city || 'Any City'} (${search.type || 'Any Type'}, ${search.budget || 'Any Budget'}) - ${search.timestamp}</a></li>`;
            $('#savedSearches').append(li);
        });
        $('.saved-search').click(function(e) {
            e.preventDefault();
            $('#citySelect').val($(this).data('city'));
            $('#carType').val($(this).data('type'));
            $('#budgetFilter').val($(this).data('budget'));
            $('#carSearch').val($(this).data('name'));
            searchCars(false);
        });
    }

    // Compare cars
    window.compareCars = function() {
        const carIds = [
            $('#compareCar1').val(),
            $('#compareCar2').val(),
            $('#compareCar3').val()
        ].filter(id => id);
        if (carIds.length < 2) {
            alert('Please select at least two cars to compare!');
            return;
        }
        $.getJSON('data/cars.json', function(data) {
            const cars = carIds.map(id => data.find(c => c.id == parseInt(id)));
            const container = $('#compareResults').empty();
            const table = `
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                ${cars.map(car => `<th>${car.model}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Price</td>${cars.map(car => `<td>₹${car.price.toLocaleString()}</td>`).join('')}</tr>
                            <tr><td>Fuel</td>${cars.map(car => `<td>${car.fuel}</td>`).join('')}</tr>
                            <tr><td>City</td>${cars.map(car => `<td>${car.city}</td>`).join('')}</tr>
                            <tr><td>Details</td>${cars.map(car => `<td>${car.details}</td>`).join('')}</tr>
                        </tbody>
                    </table>
                </div>
            `;
            container.append(table);
            gsap.from('#compareResults', { y: 50, opacity: 0, duration: 0.5 });
        });
    };

    // Google Maps
    function initMap() {
        const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 9.9312, lng: 76.2673 }, // Kochi
            zoom: 8
        });
        const markers = [
            { lat: 9.9312, lng: 76.2673, title: 'Kochi Dealer' },
            { lat: 10.5276, lng: 76.2144, title: 'Thrissur Dealer' }
        ];
        markers.forEach(m => {
            new google.maps.Marker({
                position: { lat: m.lat, lng: m.lng },
                map,
                title: m.title
            });
        });
    }

    if (window.location.pathname.includes('index.html')) {
        initMap();
    }

    // Load cars
    if (window.location.pathname.includes('admin-panel.html') || window.location.pathname.includes('index.html')) {
        loadCars();
    }
});