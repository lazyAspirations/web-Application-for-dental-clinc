(function ($) {
    "use strict";

    // Spinner - Retain in jQuery
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // Initiate the wowjs (Vanilla JS)
    new WOW().init();

    // Sticky Navbar (Vanilla JS)
    window.addEventListener('scroll', function () {
        if (window.scrollY > 40) {
            document.querySelector('.navbar').classList.add('sticky-top');
        } else {
            document.querySelector('.navbar').classList.remove('sticky-top');
        }
    });

    // Dropdown on mouse hover (Vanilla JS)
    const dropdowns = document.querySelectorAll('.dropdown');
    const mediaQuery = window.matchMedia("(min-width: 992px)");

    function handleDropdownHover() {
        if (mediaQuery.matches) {
            dropdowns.forEach(dropdown => {
                dropdown.addEventListener('mouseenter', function () {
                    this.classList.add('show');
                    this.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'true');
                    this.querySelector('.dropdown-menu').classList.add('show');
                });

                dropdown.addEventListener('mouseleave', function () {
                    this.classList.remove('show');
                    this.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                    this.querySelector('.dropdown-menu').classList.remove('show');
                });
            });
        } else {
            dropdowns.forEach(dropdown => {
                dropdown.removeEventListener('mouseenter', null);
                dropdown.removeEventListener('mouseleave', null);
            });
        }
    }
    window.addEventListener('load', handleDropdownHover);
    window.addEventListener('resize', handleDropdownHover);

    // Back to top button - Retain in jQuery
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
        return false;
    });

    // Date and time picker (Vanilla JS - Example using Flatpickr for simplicity)
    if (document.querySelector('.date')) {
        flatpickr('.date', { dateFormat: "m/d/Y" });
    }
    if (document.querySelector('.time')) {
        flatpickr('.time', { enableTime: true, noCalendar: true, dateFormat: "h:i K" });
    }

    // Image comparison (Vanilla JS - Assuming TwentyTwenty Plugin)
    const containers = document.querySelectorAll('.twentytwenty-container');
    containers.forEach(container => {
        new TwentyTwenty(container);
    });

    // Price carousel (Vanilla JS - Assuming OwlCarousel can be initialized this way)
    const priceCarousel = document.querySelector('.price-carousel');
    if (priceCarousel) {
        $(priceCarousel).owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            margin: 45,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-left"></i>',
                '<i class="bi bi-arrow-right"></i>'
            ],
            responsive: {
                0: { items: 1 },
                768: { items: 2 }
            }
        });
    }

    // Testimonials carousel (Vanilla JS - Assuming OwlCarousel can be initialized this way)
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    if (testimonialCarousel) {
        $(testimonialCarousel).owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            items: 1,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-left"></i>',
                '<i class="bi bi-arrow-right"></i>'
            ],
        });
    }
})(jQuery);


// Check if the user is logged in
window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // Show the sign-out button if logged in
        const signOutButton = document.getElementById('signOutButton');
        if (signOutButton) {
            signOutButton.style.display = 'block';
        }
    } else {
        // Redirect to login page if not logged in (only for appointment page)
        if (window.location.pathname.includes('appointment.html')) {
            window.location.href = 'login.html';
        }
    }
};

function signOut() {
    // Remove the login status from localStorage
    localStorage.removeItem('isLoggedIn');
    // Optionally, clear other user-related data
    // localStorage.removeItem('username'); // Uncomment if you want to clear username
    // localStorage.removeItem('profile'); // Uncomment if you want to clear profile

    // Redirect to the login page
    window.location.href = 'login.html';
    console.log("Script is running");

}



    
   
