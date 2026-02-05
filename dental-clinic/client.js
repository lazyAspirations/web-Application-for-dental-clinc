document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#ClientsTable tbody');
    const searchInput = document.getElementById('search');
    const typeCheckboxes = document.querySelectorAll('.filter-bar input[type="checkbox"]');
    const modal = document.getElementById('editClientsModal');
    const detailsModal = document.getElementById('ClientsDetailsModal');
    const closeBtns = document.querySelectorAll('.close');
    const saveBtn = document.getElementById('saveButton');
    const editBtn = document.getElementById('editButton');
    const deleteBtn = document.getElementById('deleteButton');
    const addButton = document.getElementById('addButton');
    const modalDate_Naiss = document.getElementById('modalDate_naiss');
    const nbr_VisitesRange = document.getElementById('qteRange');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');

    // Fetch clients from the server
    function fetchClients() {
        fetch('Client.php')
            .then(response => response.json())
            .then(clients => {
                console.log(clients); // Log the fetched data
                tableBody.innerHTML = '';
                clients.forEach(client => {
                    const row = tableBody.insertRow();
                    row.dataset.ID_Client = client.Id_Client;
                    row.dataset.date_Naiss = client.date_Naiss;

                    [client.Id_Client, client.Nom, client.Prenom, client.date_Naiss, client.nbr_Visites, client.date_RDV].forEach((data, index) => {
                        const cell = row.insertCell();
                        cell.textContent = data;
                        if (index === 2) cell.dataset.Prenom = client.Prenom;
                    });
                });
                applyFilters();
            })
            .catch(error => {
                console.error("Error:", error);
                tableBody.innerHTML = "<tr><td colspan='6'>Error loading clients.</td></tr>";
            });
    }

    // Apply filters to the client table
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedTypes = Array.from(typeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const minQte = 0;
        const maxQte = parseFloat(nbr_VisitesRange.value);

        tableBody.querySelectorAll('tr').forEach(row => {
            const clientID = row.cells[0].textContent.toLowerCase(); // ID Client
            const clientNom = row.cells[1].textContent.toLowerCase(); // Nom
            const clientPrenom = row.cells[2].textContent.toLowerCase(); // Prenom
            const clientDateNaiss = row.cells[3].textContent.toLowerCase(); // Date de Naissance
            const clientNbrVisites = row.cells[4].textContent.toLowerCase(); // Nombre de Visites
            const clientDateRDV = row.cells[5].textContent.toLowerCase(); // Date de Rendez-vous

            // Check if the search term matches any of the columns
            const searchMatch = clientID.includes(searchTerm) || 
                               clientNom.includes(searchTerm) || 
                               clientPrenom.includes(searchTerm) || 
                               clientDateNaiss.includes(searchTerm) || 
                               clientNbrVisites.includes(searchTerm) || 
                               clientDateRDV.includes(searchTerm);

            const typeMatch = !selectedTypes.length || selectedTypes.includes(row.dataset.date_Naiss);
            const qteMatch = true; // No quantity filter for clients

            row.style.display = (typeMatch && qteMatch && searchMatch) ? '' : 'none';
        });
    }

    // Add event listeners
    nbr_VisitesRange.addEventListener('input', () => {
        maxValue.textContent = nbr_VisitesRange.value;
        applyFilters();
    });

    searchInput.addEventListener('input', applyFilters);
    typeCheckboxes.forEach(checkbox => checkbox.addEventListener('change', applyFilters));

    // Event listener for row clicks
    tableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row) {
            // Populate modal with row data
            document.getElementById('detailsId_Client').textContent = row.cells[0].textContent;
            document.getElementById('detailsNom').textContent = row.cells[1].textContent;
            document.getElementById('detailsPrenom').textContent = row.cells[2].textContent;
            document.getElementById('detailsDate_Naiss').textContent = row.cells[3].textContent;
            document.getElementById('detailsnbr_Visites').textContent = row.cells[4].textContent;
            document.getElementById('detailsDate_RDV').textContent = row.cells[5].textContent;

            // Show the modal
            detailsModal.style.display = 'block';
        }
    });

    // Edit button event listener
    editBtn.addEventListener('click', () => {
        // Set the modal fields with the client details
        document.getElementById('modalID_Client').value = document.getElementById('detailsId_Client').textContent;
        document.getElementById('modalNom').value = document.getElementById('detailsNom').textContent;
        document.getElementById('modalPrenom').value = document.getElementById('detailsPrenom').textContent;
        document.getElementById('modalDate_naiss').value = document.getElementById('detailsDate_Naiss').textContent;
        document.getElementById('modalnbr_Visites').value = document.getElementById('detailsnbr_Visites').textContent;
        document.getElementById('modalDate_RDV').value = document.getElementById('detailsDate_RDV').textContent;

        // Hide the details modal and show the edit modal
        detailsModal.style.display = 'none';
        modal.style.display = 'block';
    });

    // Delete button event listener
    deleteBtn.addEventListener('click', () => {
        const formData = new URLSearchParams({ action: 'delete', Id_Client: document.getElementById('detailsId_Client').textContent });
        fetch('client.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                fetchClients();
                detailsModal.style.display = 'none';
                alert("Client deleted successfully!");
            })
            .catch(error => {
                console.error("Error:", error);
                alert(`Error deleting client: ${error.message}`);
            });
    });

    // Add button event listener
    addButton.addEventListener('click', () => {
        // Clear all inputs
        ['modalNom', 'modalPrenom', 'modalDate_naiss', 'modalnbr_Visites', 'modalDate_RDV'].forEach(id => document.getElementById(id).value = '');

        // Fetch the next ID_Client from the server
        fetch('client.php?action=getNextId')
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                document.getElementById('modalID_Client').value = data.nextId; // Populate the ID_Client field
            })
            .catch(error => {
                console.error("Error:", error);
                alert(`Error fetching next ID: ${error.message}`);
            });

        // Set the modal title
        document.querySelector('#editClientsModal .modal-content h2').textContent = "Add Client";
        modal.style.display = 'block';
    });

    // Save button event listener
    saveBtn.addEventListener('click', () => {
        const action = document.querySelector('#editClientsModal .modal-content h2').textContent.includes("Add") ? "add" : "update";
        const Id_Client = document.getElementById('modalID_Client').value;
        const Nom = document.getElementById('modalNom').value;
        const Prenom = document.getElementById('modalPrenom').value;
        const date_Naiss = document.getElementById('modalDate_naiss').value;
        const nbr_Visites = document.getElementById('modalnbr_Visites').value;
        const date_RDV = document.getElementById('modalDate_RDV').value;

        // Validate required fields
        if (!Id_Client || !Nom || !Prenom || !date_Naiss || !nbr_Visites || !date_RDV) {
            alert("Please fill in all required fields.");
            return;
        }

        // Prepare form data
        const formData = new URLSearchParams({
            action,
            Id_Client,
            Nom,
            Prenom,
            date_Naiss,
            nbr_Visites,
            date_RDV,
        });

        // Send the request to the server
        fetch('client.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                fetchClients();
                modal.style.display = 'none';
                alert(`Client ${action}ed successfully!`);
            })
            .catch(error => {
                console.error("Error:", error);
                alert(`Error ${action}ing client: ${error.message}`);
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

    // Sorting functionality
    const tableHeaders = document.querySelectorAll('#ClientsTable th');
    tableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortTable(index);
        });
    });

    function sortTable(columnIndex) {
        const rows = Array.from(tableBody.querySelectorAll('tr'));
        const isAscending = tableHeaders[columnIndex].classList.toggle('asc');

        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();

            // Simple alphabetical sorting
            return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        });

        // Clear the table body
        tableBody.innerHTML = '';

        // Append sorted rows
        rows.forEach(row => tableBody.appendChild(row));
    }

    // Fetch clients on page load
    fetchClients();
});