<?php

/**
 * Vercel Serverless Function
 * Proxy all requests to the backend router
 */

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set base path for router
chdir(__DIR__ . '/../backend');

// Import and run router
require_once '../backend/router.php';
