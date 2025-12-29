<?php
$dir = __DIR__ . '/examples';
$baseUrl = 'https://mistert.freeboxos.fr/LogicCompiler2/?id=';

if (!is_dir($dir)) {
    die("Dossier examples introuvable.");
}

$files = scandir($dir);

echo "<h2>Exemples SAP</h2>";
echo "<ul>";

foreach ($files as $file) {

    if ($file === '.' || $file === '..') continue;

    $fullPath = $dir . '/' . $file;

    if (!is_file($fullPath)) continue;

    // on ne prend que les .json
    if (pathinfo($file, PATHINFO_EXTENSION) !== 'json') continue;

    // id = nom du fichier sans extension
    $id = pathinfo($file, PATHINFO_FILENAME);

    $url = $baseUrl . urlencode($id);

    echo "<li><a href=\"$url\">$id</a></li>";
}

echo "</ul>";
?>
