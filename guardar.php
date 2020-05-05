<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de prueba para guardar los datos provenientes del editor

//Lógicamente, esto tiene que cambiar, es solo una prueba
$url='http://localhost/experimental-foxtrot-framework/';

$previsualizar=$_POST['previsualizar']=='true';

if($previsualizar) {
    $ruta='temp/';
    $nombre=basename(tempnam($ruta,'p')).'.html';
} else {
    $ruta='';
    $nombre=preg_replace('/[^a-z]/i','',$_POST['nombre']).'.html';
}

$html=$_POST['html'];
$json=str_replace('\'','\\\'',$_POST['json']);

$resultado=<<<RE
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <title></title>
  </head>
  <body>
    $html
    
    <script src="util.js"></script>
    <script src="dom.js"></script>
    <link rel="stylesheet" href="dom.css">
    <script src="ui.js"></script>
    <script src="componente.js"></script>
    <script src="componentes/contenedor.js"></script>
    <script src="componentes/texto.js"></script>
    <script>
    ui.establecerJson('$json').ejecutar();
    </script>    
  </body>
</html>
RE;

file_put_contents(__DIR__.'/'.$ruta.$nombre,$resultado);

echo json_encode([
    'nombre'=>$nombre,
    'url'=>$url.$ruta.$nombre 
]);