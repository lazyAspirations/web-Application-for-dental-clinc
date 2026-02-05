<?php
session_start();
require 'config.php';

try {
    $conn = new PDO("mysql:host=$servername;port=3306;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    sendJsonError(500, "Database connection failed: " . $e->getMessage());
}

function sendJsonError($code, $message) {
    http_response_code($code);
    header('Content-type: application/json; charset=utf-8');
    die(json_encode(["error" => $message]));
}

function sendJsonSuccess($message) {
    header('Content-type: application/json; charset=utf-8');
    echo json_encode(["message" => $message]);
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['action']) && $_GET['action'] == 'getNextId') {
        try {
            // Get the maximum ID_Client from the table
            $stmt = $conn->prepare("SELECT MAX(Id_Client) AS max_id FROM Clients");
            $stmt->execute();
            $result = $stmt->fetch();
            $nextId = $result['max_id'] + 1;

            // Return the next ID_Client
            header('Content-type: application/json; charset=utf-8');
            echo json_encode(["nextId" => $nextId]);
        } catch (PDOException $e) {
            sendJsonError(500, "Error fetching next ID: " . $e->getMessage());
        }
    } else {
        try {
            $stmt = $conn->prepare("SELECT Id_Client, Nom, Prenom, date_Naiss, nbr_Visites, date_RDV FROM Clients");
            $stmt->execute();
            $clients = $stmt->fetchAll();
            header('Content-type: application/json; charset=utf-8');
            echo json_encode($clients);
        } catch (PDOException $e) {
            sendJsonError(500, "Error fetching clients: " . $e->getMessage());
        }
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = isset($_POST['action']) ? $_POST['action'] : null;

    if ($action == 'update') {
        $Id_Client = isset($_POST['Id_Client']) ? $_POST['Id_Client'] : null;
        $Nom = isset($_POST['Nom']) ? $_POST['Nom'] : null;
        $Prenom = isset($_POST['Prenom']) ? $_POST['Prenom'] : null;
        $date_Naiss = isset($_POST['date_Naiss']) ? $_POST['date_Naiss'] : null;
        $nbr_Visites = isset($_POST['nbr_Visites']) ? $_POST['nbr_Visites'] : null;
        $date_RDV = isset($_POST['date_RDV']) ? $_POST['date_RDV'] : null;

        if (!$Id_Client || !$Nom || !$Prenom || !$date_Naiss || !$nbr_Visites || !$date_RDV) {
            sendJsonError(400, "Missing required parameters for update.");
        }

        try {
            $sql = "UPDATE Clients SET Nom = :Nom, Prenom = :Prenom, date_Naiss = :date_Naiss, nbr_Visites = :nbr_Visites, date_RDV = :date_RDV WHERE Id_Client = :Id_Client";
            $params = [
                ':Nom' => $Nom,
                ':Prenom' => $Prenom,
                ':date_Naiss' => $date_Naiss,
                ':nbr_Visites' => $nbr_Visites,
                ':date_RDV' => $date_RDV,
                ':Id_Client' => $Id_Client,
            ];

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            sendJsonSuccess("Client updated successfully");
        } catch (PDOException $e) {
            sendJsonError(500, "Error updating client: " . $e->getMessage());
        }
    } elseif ($action == 'delete') {
        $Id_Client = isset($_POST['Id_Client']) ? $_POST['Id_Client'] : null;
        if (!$Id_Client) {
            sendJsonError(400, "Missing required parameter 'Id_Client' for delete.");
        }
        try {
            $stmt = $conn->prepare("DELETE FROM Clients WHERE Id_Client = :Id_Client");
            $stmt->execute([':Id_Client' => $Id_Client]);
            sendJsonSuccess("Client deleted successfully");
        } catch (PDOException $e) {
            sendJsonError(500, "Error deleting client: " . $e->getMessage());
        }
    } elseif ($action == 'add') {
        $Id_Client = isset($_POST['Id_Client']) ? $_POST['Id_Client'] : null;
        $Nom = isset($_POST['Nom']) ? $_POST['Nom'] : null;
        $Prenom = isset($_POST['Prenom']) ? $_POST['Prenom'] : null;
        $date_Naiss = isset($_POST['date_Naiss']) ? $_POST['date_Naiss'] : null;
        $nbr_Visites = isset($_POST['nbr_Visites']) ? $_POST['nbr_Visites'] : null;
        $date_RDV = isset($_POST['date_RDV']) ? $_POST['date_RDV'] : null;

        if (!$Id_Client || !$Nom || !$Prenom || !$date_Naiss || !$nbr_Visites || !$date_RDV) {
            sendJsonError(400, "Missing required parameters for add.");
        }

        try {
            $sql = "INSERT INTO Clients (Id_Client, Nom, Prenom, date_Naiss, nbr_Visites, date_RDV) VALUES (:Id_Client, :Nom, :Prenom, :date_Naiss, :nbr_Visites, :date_RDV)";
            $params = [
                ':Id_Client' => $Id_Client,
                ':Nom' => $Nom,
                ':Prenom' => $Prenom,
                ':date_Naiss' => $date_Naiss,
                ':nbr_Visites' => $nbr_Visites,
                ':date_RDV' => $date_RDV,
            ];

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            sendJsonSuccess("Client added successfully");
        } catch (PDOException $e) {
            sendJsonError(500, "Error adding client: " . $e->getMessage());
        }
    } else {
        sendJsonError(400, "Invalid action.");
    }
}

$conn = null; // Close the connection
?>