const SPREADSHEET_ID = '1fs9p0wUwJxyDwiLaSJ9ZH9K9FZS1tjAV_1hrX_mzuic'; // Google Sheet ID
const API_KEY = 'AIzaSyB9X6vArhzlQtB8eLtd3fRJmf4tyA_OkCo';

const itemAmount = 2;


const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();










function startCountdownToNextMonth(display) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const timeRemaining = nextMonth - now;

    let timer = Math.floor(timeRemaining / 1000);

    const interval = setInterval(() => {
        const days = Math.floor(timer / (24 * 3600));
        const hours = Math.floor((timer % (24 * 3600)) / 3600);
        const minutes = Math.floor((timer % 3600) / 60);
        const seconds = timer % 60;

        display.textContent = `${days.toString().padStart(2, '0')}:${hours
            .toString()
            .padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (--timer < 0) {
            clearInterval(interval);
            location.reload()
        }
    }, 1000);
}

function convertToDriveImageUrl(driveLink) {
    if (driveLink) {
        const match = driveLink.match(/\/d\/([a-zA-Z0-9_-]+)\//);
        if (match) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        } else {
            console.error("Google Drive link format is invalid.");
            return 'images/item/Placeholder.png';
        }
    } else {
        console.error("Google Drive link format is invalid.");
        return 'images/item/Placeholder.png';
    }
}

function fetchSheetData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${currentYear}!A3:K?key=${API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            const currentRow = rows[currentMonth];

            const discountPercent = parseInt(rows[16][1].replace('%', ''), 10);
            const discountActive = rows[16][2];
            for (let i = 0; i < itemAmount; i++) {
                const productStartCol = i * 5;
                const itemName = currentRow[productStartCol + 1];
                const price = currentRow[productStartCol + 2];
                const tokopediaLink = currentRow[productStartCol + 3];
                const shopeeLink = currentRow[productStartCol + 4];
                const imageLink = convertToDriveImageUrl(currentRow[productStartCol + 5]);

                const priceInt = parseInt(price.replace(/[Rp,]/g, ''), 10);

                const productContainer = document.getElementById('product-container');

                const productItem = document.createElement('div');
                productItem.classList.add('product-item');

                const productImageContainer = document.createElement('div');
                productImageContainer.classList.add('product-image-container')


                const productImage = document.createElement('img');
                productImage.src = imageLink;
                productImage.alt = 'Product Image';
                productImage.classList.add('product-image');
                productImageContainer.appendChild(productImage);

                const productDetails = document.createElement('div');
                productDetails.classList.add('product-details');

                const productName = document.createElement('p');
                productName.classList.add('product-text');
                productName.textContent = itemName;
                productDetails.appendChild(productName);

                if (discountActive.toLowerCase() === 'true') {
                    const productOldPrice = document.createElement('p');
                    productOldPrice.classList.add('product-old-price');
                    productOldPrice.textContent = "Rp" + priceInt.toLocaleString('id-ID') + ",00";
                    productDetails.appendChild(productOldPrice);

                    const productPrice = document.createElement('p');
                    productPrice.classList.add('product-price');
                    productPrice.textContent = "Rp" + (priceInt - priceInt * discountPercent/100).toLocaleString('id-ID') + ",00";
                    productDetails.appendChild(productPrice);
                } else {
                    const productPrice = document.createElement('p');
                    productPrice.classList.add('product-price');
                    productPrice.textContent = "Rp" + priceInt.toLocaleString('id-ID') + ",00";
                    productDetails.appendChild(productPrice);
                }

                const purchaseButton = document.createElement('button');
                purchaseButton.classList.add('purchase-button');
                purchaseButton.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> BUY';
                productDetails.appendChild(purchaseButton);

                productItem.appendChild(productImageContainer);
                productItem.appendChild(productDetails);
                productContainer.appendChild(productItem);

                purchaseButton.addEventListener("click", function () {
                    document.getElementById("popup-modal").style.display = "flex";
                    document.body.classList.add("no-scroll");

                    document.getElementById('tokopedia-link').href = tokopediaLink;
                    document.getElementById('shopee-link').href = shopeeLink;
                });
            }
        })
        .catch(error => console.error('Error fetching data from Google Sheets:', error));
}

fetchSheetData();

const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
    menu.classList.toggle("active");
});

document.addEventListener("DOMContentLoaded", () => {
    const overlayTitle = document.querySelector(".overlay-title");

    const year = currentDate.getFullYear();

    const monthText = `${monthNames[currentMonth]} '${year.toString().slice(-2)} Collection`;

    overlayTitle.textContent = monthText.toUpperCase();
    document.getElementById('current-month').textContent = monthText;

    const nextMonthText = `${monthNames[currentMonth + 1]} '${year.toString().slice(-2)} Collection`

    document.getElementById('next-month').textContent = nextMonthText;
});

function fetchReviews() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Reviews!B2:C?key=${API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;

            if (!rows || rows.length === 0) {
                console.error('No data found in the sheet.');
                return;
            }

            const reviewsContainer = document.getElementById('reviews-container');

            rows.forEach((row, index) => {

                const [review, approval] = row;

                if (approval && approval.toLowerCase() === 'true') {
                    const reviewCard = document.createElement('div');
                    reviewCard.classList.add('review-card');

                    const reviewElem = document.createElement('p');
                    reviewElem.classList.add('review');
                    reviewElem.textContent = review;

                    reviewCard.appendChild(reviewElem);

                    reviewsContainer.appendChild(reviewCard);
                }
            });

            updateScrollButtons();
        })
        .catch(error => console.error('Error fetching data from Google Sheets:', error));
}

const reviewForm = document.getElementById('review-form');

reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const reviewText = document.getElementById('review-text').value;

    const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSeAwa8b85UBFSmVAsnhSoFwAq8ddv_MjvcX29ejcCw0ArP_Gg/formResponse";

    const formData = new URLSearchParams();
    formData.append("entry.1843220470", reviewText);

    fetch(googleFormURL, {
        method: "POST",
        body: formData,
        mode: "no-cors",
    })
        .then(() => {
            alert("Review submitted successfully!");
            reviewForm.reset();
        })
        .catch((error) => {
            console.error("Error submitting the form:", error);
        });
});





const reviewsContainer = document.querySelector('.reviews-container');
const leftBtn = document.querySelector('.scroll-btn.left');
const rightBtn = document.querySelector('.scroll-btn.right');


const scrollAmount = 300;

function updateScrollButtons() {
    if (reviewsContainer.scrollLeft <= 0) {
        leftBtn.style.display = 'none';
    } else {
        leftBtn.style.display = 'block';
    }

    if (reviewsContainer.scrollLeft >= reviewsContainer.scrollWidth - reviewsContainer.clientWidth) {
        rightBtn.style.display = 'none';
    } else {
        rightBtn.style.display = 'block';
    }
}

rightBtn.addEventListener('click', () => {
    reviewsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

leftBtn.addEventListener('click', () => {
    reviewsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});

reviewsContainer.addEventListener('scroll', updateScrollButtons);


fetchReviews();
updateScrollButtons();


document.getElementById("close-btn").addEventListener("click", function () {
    document.getElementById("popup-modal").style.display = "none";
    document.body.classList.remove("no-scroll");
});

document.getElementById("popup-modal").addEventListener("click", function (e) {
    if (e.target === document.getElementById("popup-modal")) {
        document.getElementById("popup-modal").style.display = "none";
        document.body.classList.remove("no-scroll");
    }
});




/* KEEP THIS ALWAYS ON THE BOTTOM */

