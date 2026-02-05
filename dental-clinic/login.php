<?php
session_start();
require 'config.php';

$email = $_POST['emaill'] ?? '';
$password = $_POST['passw'] ?? '';

$stmt = $conn->prepare("SELECT * FROM users WHERE email = :email");
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch();

if ($user && password_verify($password, $user['Password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];

    echo '<script>
    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "' . ($email === 'medecin@admin.com' ? 'clients.html' : 'appointment.html') . '";
  </script>';
exit();
} else {
// Pass error via URL; ensure login.php handles the error
header('Location: login.html?loginError=invalid');
exit();
}
?>