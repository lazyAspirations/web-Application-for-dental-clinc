document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#productTable tbody');
    const searchInput = document.getElementById('search');
    const typeCheckboxes = document.querySelectorAll('.filter-bar input[type="checkbox"]');
    const modal = document.getElementById('editProductModal');
    const detailsModal = document.getElementById('productDetailsModal');
    const closeBtns = document.querySelectorAll('.close');
    const saveBtn = document.getElementById('saveButton');
    const editBtn = document.getElementById('editButton');
    const deleteBtn = document.getElementById('deleteButton');
    const addButton = document.getElementById('addButton');
    const modalType = document.getElementById('modalType');
    const expirationDateContainer = document.getElementById('expirationDateContainer');
    const modalDateExp = document.getElementById('modalDateExp');
    const qteRange = document.getElementById('qteRange');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');

    // Initially hide the expiration date input
    expirationDateContainer.style.display = 'none';

    // Show/hide expiration date input based on product type
    modalType.addEventListener('change', () => {
        if (modalType.value === 'Medicament') {
            expirationDateContainer.style.display = 'block';
        } else {
            expirationDateContainer.style.display = 'none';
            modalDateExp.value = '';
        }
    });

    // Fetch products from the server
    function fetchProducts() {
        fetch('products.php')
            .then(response => response.json())
            .then(products => {
                tableBody.innerHTML = '';
                products.forEach(product => {
                    const row = tableBody.insertRow();
                    row.dataset.ref = product.REF;
                    row.dataset.fournisseur = product.Fournisseur || 'N/A'; // Corrected to fournisseur
                    row.dataset.type = product.TYPE_P;
                    row.dataset.qte = product.QTE;

                    [product.REF, product.LIBELLE, product.QTE, product.TYPE_P, product.DATE_Achat].forEach((data, index) => {
                        const cell = row.insertCell();
                        cell.textContent = data;
                        if (index === 2) cell.dataset.qte = product.QTE;
                    });

                    const expirationCell = row.insertCell();
                    if (product.TYPE_P === 'Medicament' && product.DATE_Exp) {
                        const daysRemaining = calculateDaysRemaining(product.DATE_Exp);
                        expirationCell.textContent = product.DATE_Exp;
                        const alertIcon = createAlertIcon(daysRemaining);
                        expirationCell.appendChild(alertIcon);
                    } else {
                        expirationCell.textContent = product.DATE_Exp || '-';
                    }

                    const fournisseurCell = row.insertCell();
                    fournisseurCell.textContent = product.Fournisseur; // Corrected to Fournisseur
                });
                applyFilters();
            })
            .catch(error => {
                console.error("Error:", error);
                tableBody.innerHTML = "<tr><td colspan='7'>Error loading products.</td></tr>";
            });
    }

    // Calculate days remaining until expiration
    function calculateDaysRemaining(expirationDate) {
        const today = new Date();
        const expDate = new Date(expirationDate);
        const timeDiff = expDate - today;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }

    // Create alert icon
    function createAlertIcon(daysRemaining) {
        const icon = document.createElement('span');
        icon.style.marginLeft = '10px';
        icon.style.cursor = 'pointer';

        if (daysRemaining < 1) {
            icon.textContent = '❌';
            icon.style.color = 'red';
            icon.title = 'Expiré';
        } else if (daysRemaining <= 15) {
            icon.textContent = '⚠️';
            icon.style.color = 'orange';
            icon.title = `Il reste ${daysRemaining} jours`;
        }

        // Add hover effect
        addHoverEffect(icon);

        return icon;
    }

    // Function to add hover effect to an icon
    function addHoverEffect(icon) {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.2)';
        });

        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1)';
        });
    }

    // Apply filters to the product table
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedTypes = Array.from(typeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const minQte = 0;
        const maxQte = parseFloat(qteRange.value);

        tableBody.querySelectorAll('tr').forEach(row => {
            const productRef = row.cells[0].textContent.toLowerCase();
            const productName = row.cells[1].textContent.toLowerCase();
            const productType = row.dataset.type;
            const productQte = parseFloat(row.dataset.qte);

            const searchMatch = productRef.includes(searchTerm) || productName.includes(searchTerm);
            const typeMatch = !selectedTypes.length || selectedTypes.includes(productType);
            const qteMatch = productQte >= minQte && productQte <= maxQte;

            row.style.display = (typeMatch && qteMatch && searchMatch) ? '' : 'none';
        });
    }

    // Add event listeners
    qteRange.addEventListener('input', () => {
        maxValue.textContent = qteRange.value;
        applyFilters();
    });

    searchInput.addEventListener('input', applyFilters);
    typeCheckboxes.forEach(checkbox => checkbox.addEventListener('change', applyFilters));

    // Event listener for row clicks
    tableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row) {
            // Populate modal with row data
            document.getElementById('detailsRef').textContent = row.cells[0].textContent;
            document.getElementById('detailsLibelle').textContent = row.cells[1].textContent;
            document.getElementById('detailsQte').textContent = row.cells[2].textContent;
            document.getElementById('detailsType').textContent = row.cells[3].textContent;
            document.getElementById('detailsDateAchat').textContent = row.cells[4].textContent;
            document.getElementById('detailsFournisseur').textContent = row.dataset.fournisseur; // Corrected to fournisseur

            // Handle expiration date and alert icon
            const expirationCell = row.cells[5];
            const dateText = expirationCell.childNodes[0].textContent; // Get the date text
            document.getElementById('detailsDateExp').textContent = dateText;

            // Clear any existing alert icon in the modal
            const detailsDateExp = document.getElementById('detailsDateExp');
            const existingIcon = detailsDateExp.querySelector('span');
            if (existingIcon) {
                existingIcon.remove();
            }

            // Add the alert icon to the modal if applicable
            const alertIcon = expirationCell.querySelector('span');
            if (alertIcon) {
                const clonedIcon = alertIcon.cloneNode(true); // Clone the icon
                addHoverEffect(clonedIcon); // Re-attach the hover effect
                detailsDateExp.appendChild(clonedIcon); // Append it to the modal
            }

            document.getElementById('detailsFournisseur').textContent = row.cells[6].textContent;

            // Show the modal
            detailsModal.style.display = 'block';
        }
    });

    // Edit button event listener
    editBtn.addEventListener('click', () => {
        // Set the modal fields with the product details
        document.getElementById('modalRef').value = document.getElementById('detailsRef').textContent;
        document.getElementById('modalLibelle').value = document.getElementById('detailsLibelle').textContent;
        document.getElementById('modalQte').value = document.getElementById('detailsQte').textContent;
        document.getElementById('modalType').value = document.getElementById('detailsType').textContent;
        document.getElementById('modalFournisseur').value = document.getElementById('detailsFournisseur').textContent;

        // Set the purchase date
        const dateAchat = document.getElementById('detailsDateAchat').textContent;
        document.getElementById('modalDateAchat').value = formatDateForInput(dateAchat);

        // Set the expiration date (if applicable)
        const expirationCell = document.getElementById('detailsDateExp');
        const dateText = expirationCell.childNodes[0].textContent.trim(); // Get only the date text (ignore the icon)
        if (dateText && dateText !== '-') {
            document.getElementById('modalDateExp').value = formatDateForInput(dateText); // Format and set the expiration date
        } else {
            document.getElementById('modalDateExp').value = ''; // Clear the expiration date if it's not applicable
        }

        // Debugging logs
        console.log("Date Expiration (Raw):", dateText);
        console.log("Date Expiration (Formatted):", formatDateForInput(dateText));

        // Manually trigger the 'change' event for the Type dropdown
        const event = new Event('change', { bubbles: true });
        modalType.dispatchEvent(event);

        // Hide the details modal and show the edit modal
        detailsModal.style.display = 'none';
        modal.style.display = 'block';
    });

    // Delete button event listener
    deleteBtn.addEventListener('click', () => {
        const formData = new URLSearchParams({ action: 'delete', ref: document.getElementById('detailsRef').textContent });
        fetch('products.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                fetchProducts();
                detailsModal.style.display = 'none';
                alert("Product deleted successfully!");
            })
            .catch(error => {
                console.error("Error:", error);
                alert(`Error deleting product: ${error.message}`);
            });
    });

    // Add button event listener
    addButton.addEventListener('click', () => {
        // Clear all inputs
        ['modalRef', 'modalLibelle', 'modalQte', 'modalType', 'modalFournisseur', 'modalDateExp'].forEach(id => document.getElementById(id).value = '');

        // Set the purchase date to the current date
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        document.getElementById('modalDateAchat').value = currentDate;

        // Hide the expiration date input initially
        expirationDateContainer.style.display = 'none';

        // Set the modal title
        document.querySelector('#editProductModal .modal-content h2').textContent = "Add Product";
        modal.style.display = 'block';
    });

    // Save button event listener
    saveBtn.addEventListener('click', () => {
        const action = document.querySelector('#editProductModal .modal-content h2').textContent.includes("Add") ? "add" : "update";
        const ref = document.getElementById('modalRef').value;
        const libelle = document.getElementById('modalLibelle').value;
        const qte = document.getElementById('modalQte').value;
        const type = document.getElementById('modalType').value;
        const fournisseur = document.getElementById('modalFournisseur').value; // Corrected to fournisseur
        const dateAchat = document.getElementById('modalDateAchat').value; // Get the purchase date
        const dateExp = document.getElementById('modalDateExp').value; // Get the expiration date

        // Validate required fields
        if (!ref || !libelle || !qte || !type || !fournisseur || !dateAchat) {
            alert("Please fill in all required fields.");
            return;
        }

        // Validate expiration date for Medicament
        if (type === 'Medicament' && !dateExp) {
            alert("Expiration date is required for Medicament.");
            return;
        }

        // Prepare form data
        const formData = new URLSearchParams({
            action,
            ref,
            libelle,
            qte,
            type,
            fournisseur, // Corrected to fournisseur
            dateAchat,
            dateExp: type === 'Medicament' ? dateExp : null, // Include expiration date only for Medicament
        });

        // Send the request to the server
        fetch('products.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                fetchProducts();
                modal.style.display = 'none';
                alert(`Product ${action}ed successfully!`);
            })
            .catch(error => {
                console.error("Error:", error);
                alert(`Error ${action}ing product: ${error.message}`);
            });
    });

    // Close modals when the close button is clicked
    closeBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.style.display = 'none';
        detailsModal.style.display = 'none';
    }));

    // Close modals when clicking outside the modal
    window.addEventListener('click', (event) => {
        if (event.target === modal || event.target === detailsModal) {
            modal.style.display = 'none';
            detailsModal.style.display = 'none';
        }
    });

    // Helper function to format the date for the input field
    function formatDateForInput(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error("Invalid date format:", dateString);
            return ''; // Return empty string if the date is invalid
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
    }

    // Function to sort the table rows based on the column index
    function sortTable(columnIndex, isNumeric = false) {
        const rows = Array.from(tableBody.querySelectorAll('tr')); // Get all rows as an array
        const isAscending = tableBody.dataset.sortOrder === 'asc'; // Check current sort order

        // Sort the rows
        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[columnIndex].textContent.trim(); // Get cell content from row A
            const cellB = rowB.cells[columnIndex].textContent.trim(); // Get cell content from row B

            if (isNumeric) {
                // Sort numerically
                return isAscending ? parseFloat(cellA) - parseFloat(cellB) : parseFloat(cellB) - parseFloat(cellA);
            } else {
                // Sort alphabetically
                return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            }
        });

        // Toggle the sort order for the next click
        tableBody.dataset.sortOrder = isAscending ? 'desc' : 'asc';

        // Clear the table and re-append the sorted rows
        tableBody.innerHTML = '';
        rows.forEach(row => tableBody.appendChild(row));
    }

    // Add click event listeners to table headers for sorting
    document.querySelectorAll('#productTable th').forEach((header, index) => {
        header.style.cursor = 'pointer'; // Add pointer cursor to indicate clickable headers
        header.addEventListener('click', () => {
            // Determine if the column is numeric (e.g., Qte, Fournisseur)
            const isNumeric = index === 2 || index === 6; // Qte is column 2, Fournisseur is column 6
            sortTable(index, isNumeric); // Sort the table based on the clicked column
        });
    });

    // Fetch products on page load
    fetchProducts();
});



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