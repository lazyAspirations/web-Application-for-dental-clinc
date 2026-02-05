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
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode(["error" => $message]));
}

function sendJsonSuccess($message) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["message" => $message]);
}

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    try {
        // Fetch all products including Fournisseur
        $stmt = $conn->prepare("SELECT REF, LIBELLE, QTE, TYPE_P, DATE_Achat, DATE_Exp, Fournisseur FROM produits");
        $stmt->execute();
        $products = $stmt->fetchAll();
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($products);
    } catch (PDOException $e) {
        sendJsonError(500, "Error fetching products: " . $e->getMessage());
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = isset($_POST['action']) ? $_POST['action'] : null;

    if ($action == 'update') {
        $ref = isset($_POST['ref']) ? $_POST['ref'] : null;
        $libelle = isset($_POST['libelle']) ? $_POST['libelle'] : null;
        $qte = isset($_POST['qte']) ? $_POST['qte'] : null;
        $type = isset($_POST['type']) ? $_POST['type'] : null;
        $dateExp = isset($_POST['dateExp']) ? $_POST['dateExp'] : null;
        $fournisseur = isset($_POST['fournisseur']) ? $_POST['fournisseur'] : null; // Corrected to fournisseur

        if (!$ref || !$libelle || !$qte || !$type || !$fournisseur) {
            sendJsonError(400, "Missing required parameters for update.");
        }

        try {
            // Update product including Fournisseur
            $sql = "UPDATE produits SET LIBELLE = :libelle, QTE = :qte, TYPE_P = :type, Fournisseur = :fournisseur";
            $params = [
                ':libelle' => $libelle,
                ':qte' => $qte,
                ':type' => $type,
                ':fournisseur' => $fournisseur, // Corrected to fournisseur
                ':ref' => $ref,
            ];

            if ($type === 'Medicament' && $dateExp) {
                $sql .= ", DATE_Exp = :dateExp";
                $params[':dateExp'] = $dateExp;
            }

            $sql .= " WHERE REF = :ref";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            sendJsonSuccess("Product updated successfully");
        } catch (PDOException $e) {
            sendJsonError(500, "Error updating product: " . $e->getMessage());
        }
    } elseif ($action == 'delete') {
        $ref = isset($_POST['ref']) ? $_POST['ref'] : null;
        if (!$ref) {
            sendJsonError(400, "Missing required parameter 'ref' for delete.");
        }
        try {
            $stmt = $conn->prepare("DELETE FROM produits WHERE REF = :ref");
            $stmt->execute([':ref' => $ref]);
            sendJsonSuccess("Product deleted successfully");
        } catch (PDOException $e) {
            sendJsonError(500, "Error deleting product: " . $e->getMessage());
        }
    } elseif ($action == 'add') {
        $ref = isset($_POST['ref']) ? $_POST['ref'] : null;
        $libelle = isset($_POST['libelle']) ? $_POST['libelle'] : null;
        $qte = isset($_POST['qte']) ? $_POST['qte'] : null;
        $type = isset($_POST['type']) ? $_POST['type'] : null;
        $dateAchat = isset($_POST['dateAchat']) ? $_POST['dateAchat'] : null;
        $dateExp = isset($_POST['dateExp']) ? $_POST['dateExp'] : null;
        $fournisseur = isset($_POST['fournisseur']) ? $_POST['fournisseur'] : null; // Corrected to fournisseur

        if (!$ref || !$libelle || !$qte || !$type || !$dateAchat || !$fournisseur) {
            sendJsonError(400, "Missing required parameters for add.");
        }

        try {
            // Insert product including Fournisseur
            $sql = "INSERT INTO produits (REF, LIBELLE, QTE, TYPE_P, DATE_Achat, Fournisseur";
            $params = [
                ':ref' => $ref,
                ':libelle' => $libelle,
                ':qte' => $qte,
                ':type' => $type,
                ':dateAchat' => $dateAchat,
                ':fournisseur' => $fournisseur, // Corrected to fournisseur
            ];

            if ($type === 'Medicament' && $dateExp) {
                $sql .= ", DATE_Exp";
                $params[':dateExp'] = $dateExp;
            }

            $sql .= ") VALUES (:ref, :libelle, :qte, :type, :dateAchat, :fournisseur";
            if ($type === 'Medicament' && $dateExp) {
                $sql .= ", :dateExp";
            }
            $sql .= ")";

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            sendJsonSuccess("Product added successfully");
        } catch (PDOException $e) {
            if ($e->getCode() == '23000') { // Check for duplicate key error (MySQL)
                sendJsonError(400, "Product with this REF already exists.");
            } else {
                sendJsonError(500, "Error adding product: " . $e->getMessage()); // Other database errors
            }
        }
    } else {
        sendJsonError(400, "Invalid action.");
    }
}

$conn = null; // Close the connection
?>