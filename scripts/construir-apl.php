<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para construir y compilar los archivos de la aplicación

//TODO Deben exportarse todos los símbolos para poder utilizar --compilation_level ADVANCED con Closure

include(__DIR__.'/configuracion.php');

$opciones=getopt('a::d');

define('_depuracion',array_key_exists('d',$opciones));
validarParametroAplicacion($opciones);

////Copiar framework
$tipos=['*.php','*.html','*.jpg','*.png','*.gif','*.svg','*.js','*.css'];
copiar(_desarrollo.'cliente/',$tipos,_produccion.'cliente/');
copiar(_desarrollo.'servidor/',$tipos,_produccion.'servidor/');
//Omitir los íconos
copiar(_desarrollo.'recursos/css/',$tipos,_produccion.'recursos/css/');
copiar(_desarrollo.'recursos/img/',$tipos,_produccion.'recursos/img/');
copiar(_desarrollo.'recursos/componentes/img/',$tipos,_produccion.'recursos/componentes/img/');

//Intentar copiar y configurar .htaccess y config.php (no reemplazar)
if(!file_exists(_produccion.'.htaccess')) {
    $codigo=file_get_contents(_desarrollo.'.htaccess');
    file_put_contents(
        _produccion.'.htaccess',
        preg_replace('#/desarrollo/#','/produccion/',$codigo)
    );
}

if(!file_exists(_produccion.'config.php')) {
    $codigo=file_get_contents(_desarrollo.'config.php');
    file_put_contents(
        _produccion.'config.php',
        preg_replace('#/desarrollo/#','/produccion/',$codigo)
    );
}

//Otros archivos del raíz
$archivos=[
    'error.php',
    'index.php'
];
foreach($archivos as $archivo) copy(_desarrollo.$archivo,_produccion.$archivo);


//Crear directorio temp vacío (no copiar los archivos que contenga temp en desarrollo)
if(!is_dir(_produccion.'temp/')) mkdir(_produccion.'temp/',0755);
if(!is_dir(_produccion.'temp/temp-privado/')) mkdir(_produccion.'temp/temp-privado/',0755);
copy(_desarrollo.'temp/temp-privado/.htaccess',_produccion.'temp/temp-privado/.htaccess');

////Compilar aplicación

//Limpiar/crear directorios
$archivos=buscarArchivos(_produccion._dirApl,'*.*');
foreach($archivos as $archivo) unlink($archivo);
if(!is_dir(_produccion._dirApl.'cliente/vistas/')) mkdir(_produccion._dirApl.'cliente/vistas/',0755,true); //Creará el árbol completo hasta vistas/

//Copiar archivos PHP tal cual
copy(_desarrollo._dirApl.'config.php',_produccion._dirApl.'config.php');
copy(_desarrollo._dirApl.'config.php',_produccion._dirApl.'config.php');
copiar(_desarrollo._dirApl.'servidor/','*.*',_produccion._dirApl.'servidor/');

//Copiar metadatos comprimido
file_put_contents(_produccion._dirApl.'aplicacion.json',json_encode(json_decode(file_get_contents(_desarrollo._dirApl.'aplicacion.json'))));

//Los archivos del directorio recursos no deben combinarse; comprimir individualmente
$archivos=buscarArchivos(_desarrollo._dirApl.'recursos/','*.*');
foreach($archivos as $archivo) {
    $destino=str_replace(_desarrollo,_produccion,$archivo);
    $dir=dirname($destino);
    $ext=substr($archivo,strrpos($archivo,'.'));
    
    if(!file_exists($dir)) mkdir($dir,0755,true);

    if($ext=='.css') {
        copy($archivo,$destino);
        comprimirCss($destino);
    } elseif($ext=='.js') {
        compilarJs($archivo,$destino,_depuracion);
    } else {
        //Imágenes, etc.
        copy($archivo,$destino);
    }
}

//Combinar los controladores en el archivo JS principal de la aplicación
$archivos=[
    _desarrollo._dirApl.'cliente/aplicacion.js'
];
$archivos=array_merge($archivos,buscarArchivos(_desarrollo._dirApl.'cliente/controladores/','*.js'));
compilarJs($archivos,_produccion._dirApl.'cliente/aplicacion.js',_depuracion);

//Copiar las vistas tal cual
copiar(_desarrollo._dirApl.'cliente/vistas/','*.{json,css,html,php}',_produccion._dirApl.'cliente/vistas/');

//Procesar las vistas
$archivos=buscarArchivos(_produccion._dirApl.'cliente/vistas/','*.{php,html}');
foreach($archivos as $archivo) procesarVista($archivo);
