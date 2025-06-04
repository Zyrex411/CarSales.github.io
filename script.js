function shareCarOnWhatsApp(carName, carPrice) {
    const message = `Check out this ${carName} for only ₹${carPrice}! Contact us at Kerala Car Sales: https://Zyrex411.github.io/CARPRJ`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}