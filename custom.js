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

    // Admin login
    $('#adminLoginForm').submit(function(e) {
        e.preventDefault();
        const userId = $('#userId').val();
        const email = $('#email').val();
        const password = $('#password').val();
        const hashedPassword = simpleHash(password);

        const defaultAdmin = {
            userId: 'admin1',
            email: 'admin@keralacars.com',
            hashedPassword: simpleHash('Admin123!')
        };

        if (userId === defaultAdmin.userId && email === defaultAdmin.email && hashedPassword === defaultAdmin.hashedPassword) {
            localStorage.setItem('adminToken', 'authenticated');
            window.location.href = 'admin-panel.html';
        } else {
            alert('Invalid credentials!');
        }
    });

    // Admin panel protection
    if (window.location.pathname.includes('admin-panel.html') && !localStorage.getItem('adminToken')) {
        window.location.href = 'admin-login.html';
    }

    // Logout
    window.logout = function() {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    };

    // Load cars
    function loadCars() {
        $.getJSON('data/cars.json', function(data) {
            $('#newCarsContainer, #usedCarsContainer, #carList').empty();
            data.forEach(car => {
                const card = `
                    <div class="col-md-4 mb-4 car-card" data-car-id="${car.id}">
                        <div class="card">
                            <img src="${car.image}" class="card-img-top" alt="${car.model}">
                            <div class="card-body">
                                <h5 class="card-title">${car.model}</h5>
                                <p class="card-text">Price: ₹${car.price.toLocaleString()}</p>
                                <button class="btn btn-primary view-details" data-bs-toggle="modal" data-bs-target="#carDetailsModal">View Details</button>
                                <button onclick="shareCarOnWhatsApp('${car.model}', '${car.price}')" class="btn btn-success mt-2"><i class="fab fa-whatsapp"></i> Share</button>
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
                    <div class="col-md-4 mb-4">
                        <div class="card">
                            <img src="${car.image}" class="card-img-top" alt="${car.model}">
                            <div class="card-body">
                                <h5>${car.model}</h5>
                                <p>Price: ₹${car.price.toLocaleString()}</p>
                                <button class="btn btn-warning edit-car" data-id="${car.id}">Edit</button>
                                <button class="btn btn-danger delete-car" data-id="${car.id}">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                $('#carList').append(adminCard);
            });

            // Bind events
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
                    $('html, body').animate({ scrollTop: $('#carForm').offset().top }, 500);
                }
            });
        });

        $('.delete-car').off('click').click(function() {
            if (confirm('Are you sure you want to delete this car?')) {
                const carId = $(this).data('id');
                // Simulate delete (update cars.json manually)
                alert('Please update cars.json manually to remove car ID ' + carId);
                loadCars();
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
            image: 'images/placeholder.jpg' // Default
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
        // Simulate save (update cars.json manually)
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
    window.searchCars = function() {
        const city = $('#citySelect').val();
        const type = $('#carType').val();
        const name = $('#carSearch').val().toLowerCase();

        $.getJSON('data/cars.json', function(data) {
            let results = data.filter(car => {
                return (!city || car.city === city) &&
                       (!type || car.type === type) &&
                       (!name || car.model.toLowerCase().includes(name));
            });

            $('#search-results').slideDown(500);
            const container = $('#results-container').empty();

            if (results.length === 0) {
                container.append('<p class="col-12 text-center">No cars found for your search.</p>');
            } else {
                results.forEach(car => {
                    const card = `
                        <div class="col-md-4 mb-4 car-card" data-car-id="${car.id}">
                            <div class="card">
                                <img src="${car.image}" class="card-img-top" alt="${car.model}">
                                <div class="card-body">
                                    <h5 class="card-title">${car.model}</h5>
                                    <p class="card-text">Price: ₹${car.price.toLocaleString()}</p>
                                    <button class="btn btn-primary view-details" data-bs-toggle="modal" data-bs-target="#carDetailsModal">View Details</button>
                                    <button onclick="shareCarOnWhatsApp('${car.model}', '${car.price}')" class="btn btn-success mt-2"><i class="fab fa-whatsapp"></i> Share</button>
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

    // Language switcher
    window.changeLanguage = function(lang) {
        alert(`Switching to ${lang}`);
    };

    // Load cars on admin panel
    if (window.location.pathname.includes('admin-panel.html')) {
        loadCars();
    }
});