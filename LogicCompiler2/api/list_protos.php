<?php
header('Content-Type: application/json; charset=utf-8');

$baseDir = __DIR__ . '/../prototypes';
$result = [];

// Parcours du répertoire prototypes
foreach (scandir($baseDir) as $dir) {

    // Ignorer . et ..
    if ($dir === '.' || $dir === '..') continue;

    $fullDir = $baseDir . '/' . $dir;

    // 🔒 Ignorer TOUT ce qui n'est pas un dossier
    if (!is_dir($fullDir)) continue;

    // --- Récupération des fichiers .txt ---
    $files = [];
    foreach (scandir($fullDir) as $file) {
        if ($file === '.' || $file === '..') continue;

        if (pathinfo($file, PATHINFO_EXTENSION) === 'txt') {
            $files[] = pathinfo($file, PATHINFO_FILENAME);
        }
    }

    // Dossier sans proto → ignoré
    if (empty($files)) continue;

    sort($files);

    // --- Extraction du préfixe numérique (ordre pédagogique) ---
    if (preg_match('/^(\d+)_/', $dir, $m)) {
        $order = intval($m[1]);
    } else {
        $order = 999; // fallback
    }

    $result[] = [
        'folder' => $dir,
        'title'  => str_replace('_', ' ', $dir),
        'files'  => $files,
        'order'  => $order
    ];
}

// --- Tri des catégories par ordre numérique ---
usort($result, function ($a, $b) {
    return $a['order'] <=> $b['order'];
});

// --- Nettoyage : on retire "order" du JSON final ---
foreach ($result as &$g) {
    unset($g['order']);
}

echo json_encode(
    $result,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);
