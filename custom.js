$(document).ready(function() {
    // Theme switcher
    window.switchTheme = function(theme) {
        $('html').attr('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    $('html').attr('data-theme', savedTheme);
    $('.theme-switcher').val(savedTheme);

    // Language switcher
    window.changeLanguage = function(lang) {
        console.log(`Switching to ${lang}`);
    };

    // Search cars
    window.searchCars = function() {
        const city = $('#citySelect').val();
        const type = $('#carType').val();
        const name = $('#carSearch').val().toLowerCase();

        console.log('Searching:', { city, type, name });

        $.getJSON('data/cars.json', function(data) {
            console.log('Cars data:', data);
            let results = data.filter(car => {
                return (!city || car.city === city) &&
                       (!type || car.type === type) &&
                       (!name || car.model.toLowerCase().includes(name));
            });

            $('#search-results').fadeIn(500);
            const container = $('#results-container').empty();

            if (results.length === 0) {
                container.append('<p class="col-12 text-center">No cars found for your search.</p>');
            } else {
                results.forEach((car, index) => {
                    const card = `
                        <div class="col-md-4 col-sm-6 mb-4">
                            <div class="card">
                                <!-- [IMAGE PLACEHOLDER] Car image: Referenced in cars.json (e.g., images/car${car.id}.jpg) -->
                                <img src="${car.image}" class="card-img-top" alt="${car.model}">
                                <div class="card-body">
                                    <h5 class="card-title">${car.model}</h5>
                                    <p class="card-text">Price: ₹${car.price.toLocaleString()}</p>
                                    <button class="btn btn-primary view-details" data-id="${car.id}" data-bs-toggle="modal" data-bs-target="#carDetailsModal" aria-label="View Details for ${car.model}">View Details</button>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(card);
                    setTimeout(() => {
                        container.find('.card').eq(index).addClass('show');
                    }, index * 100);
                });

                $('.view-details').click(function() {
                    const carId = $(this).data('id');
                    const car = data.find(c => c.id == carId);
                    if (car) {
                        $('#carImage').attr('src', car.image);
                        $('#carModel').text(car.model);
                        $('#carPrice').text(`₹${car.price.toLocaleString()}`);
                        $('#carFuel').text(car.fuel);
                        $('#carCity').text(car.city);
                        $('#carDetails').text(car.details);
                    } else {
                        console.error('Car not found:', carId);
                    }
                });
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to load cars.json:', textStatus, errorThrown);
            $('#results-container').html('<p class="col-12 text-center">Error loading cars. Please try again.</p>');
        });
    };

    // Load cars on page load
    function loadCars() {
        $.getJSON('data/cars.json', function(data) {
            $('#newCarsContainer, #usedCarsContainer').empty();
            data.forEach((car, index) => {
                const card = `
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card">
                            <!-- [IMAGE PLACEHOLDER] Car image: Referenced in cars.json (e.g., images/car${car.id}.jpg) -->
                            <img src="${car.image}" class="card-img-top" alt="${car.model}">
                            <div class="card-body">
                                <h5 class="card-title">${car.model}</h5>
                                <p class="card-text">Price: ₹${car.price.toLocaleString()}</p>
                                <button class="btn btn-primary view-details" data-id="${car.id}" data-bs-toggle="modal" data-bs-target="#carDetailsModal" aria-label="View Details for ${car.model}">View Details</button>
                            </div>
                        </div>
                    </div>
                `;
                if (car.type === 'new') {
                    $('#newCarsContainer').append(card);
                } else {
                    $('#usedCarsContainer').append(card);
                }
                setTimeout(() => {
                    $(car.type === 'new' ? '#newCarsContainer' : '#usedCarsContainer').find('.card').eq(index % 2).addClass('show');
                }, index * 100);
            });

            $('.view-details').click(function() {
                const carId = $(this).data('id');
                const car = data.find(c => c.id == carId);
                if (car) {
                    $('#carImage').attr('src', car.image);
                    $('#carModel').text(car.model);
                    $('#carPrice').text(`₹${car.price.toLocaleString()}`);
                    $('#carFuel').text(car.fuel);
                    $('#carCity').text(car.city);
                    $('#carDetails').text(car.details);
                }
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Failed to load cars.json:', textStatus, errorThrown);
        });
    }

    // Sell car form
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

        const picture = $('#sellerPicture')[0].files[0];
        const video = $('#sellerVideo')[0].files[0];
        const document = $('#sellerDocument')[0].files[0];

        function readFile(file, elementId, isVideo = false, isDocument = false) {
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (isVideo) {
                        $(`#${elementId}`).attr('src', e.target.result).show();
                    } else if (isDocument) {
                        $(`#${elementId}`).attr('href', e.target.result).text('View PDF').show();
                    } else {
                        $(`#${elementId}`).attr('src', e.target.result).show();
                    }
                };
                reader.readAsDataURL(file);
            } else {
                $(`#${elementId}`).hide();
            }
        }

        readFile(picture, 'submittedPicture');
        readFile(video, 'submittedVideo', true);
        readFile(document, 'submittedDocument', false, true);

        $('#sellCarModal').modal('show');
        this.reset();
    });

    // Validate file types
    $('#sellerPicture').change(function() {
        const file = this.files[0];
        if (file && !['image/jpeg', 'image/png'].includes(file.type)) {
            alert('Please upload a JPEG or PNG image.');
            this.value = '';
        }
    });

    $('#sellerVideo').change(function() {
        const file = this.files[0];
        if (file && file.type !== 'video/mp4') {
            alert('Please upload an MP4 video.');
            this.value = '';
        }
    });

    $('#sellerDocument').change(function() {
        const file = this.files[0];
        if (file && file.type !== 'application/pdf') {
            alert('Please upload a PDF document.');
            this.value = '';
        }
    });

    // Load cars on page load
    loadCars();
});