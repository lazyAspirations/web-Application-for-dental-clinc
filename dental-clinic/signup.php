<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fieldErrors = [];
    $formData = [];

    // Collect and sanitize data
    $tel = preg_replace('/\D/', '', $_POST['Tel'] ?? '');
    $formData = [
        'nom' => trim($_POST['nom']),
        'prenom' => trim($_POST['prenom']),
        'dateN' => $_POST['dateN'],
        'email' => filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL),
        'Tel' => $tel
    ];

    // Validation
    if (empty($formData['nom'])) $fieldErrors['nom'] = 'Nom requis';
    if (empty($formData['prenom'])) $fieldErrors['prenom'] = 'Prénom requis';
    
    // Date validation
    if (empty($formData['dateN'])) {
        $fieldErrors['dateN'] = 'Date de naissance requise';
    } elseif (!DateTime::createFromFormat('Y-m-d', $formData['dateN'])) {
        $fieldErrors['dateN'] = 'Format date invalide';
    }

    // Email validation
    if (empty($formData['email'])) {
        $fieldErrors['email'] = 'Email requis';
    } elseif (!filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
        $fieldErrors['email'] = 'Email invalide';
    } else {
        // Check email existence
        $stmt = $conn->prepare("SELECT ID_Client FROM users WHERE email = ?");
        $stmt->execute([$formData['email']]);
        if ($stmt->fetch()) $fieldErrors['email'] = 'Email déjà utilisé';
    }

    // Password validation
    if (strlen($_POST['password']) < 8) $fieldErrors['password'] = '8 caractères minimum';

    // Phone validation
    if (strlen($tel) !== 10) $fieldErrors['Tel'] = 'Numéro invalide (10 chiffres)';

    // Handle errors
    if (!empty($fieldErrors)) {
        $query = http_build_query([
            'fieldErrors' => json_encode($fieldErrors),
            'formData' => json_encode($formData)
        ]);
        header("Location: login.html?$query");
        exit();
    }

    // Insert new user
    try {
        $hashedPassword = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (nom, prenom, dateN, email, Password, Tel) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $formData['nom'],
            $formData['prenom'],
            $formData['dateN'],
            $formData['email'],
            $hashedPassword,
            $formData['Tel']
        ]);
        header('Location: login.html?success=1');
        exit();
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        header('Location: login.html?error=Erreur technique');
        exit();
    }
}