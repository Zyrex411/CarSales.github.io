$(document).ready(function() {
    // Autocomplete for car search
    const cars = ['Maruti Swift', 'Honda City', 'Kia Seltos', 'Tata Altroz', 'Hyundai Creta'];
    $('#carSearch').autocomplete({
        source: cars,
        minLength: 2
    });

    // Form submission
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

        $('#sellCarModal').modal('show');
        this.reset();
    });

    // Car details
    $('.view-details').click(function() {
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
            }
        });
    });

    // Search function
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

            $('#search-results').show();
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

                // Rebind view-details click
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
                        }
                    });
                });
            }
        });
    };

    // Language switcher (placeholder)
    window.changeLanguage = function(lang) {
        alert(`Switching to ${lang}`);
    };
});