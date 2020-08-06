<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

//Relación dominio=>aplicación. Este listado es utilizado por el enrutador de aplicación predeterminado, pero puede desarrollarse un
//enrutador nunevo que determine la aplicación por cualquier otro mecanismo. Soporta expresiones regulares. Las claves deben ser expresiones
//regulares.
$dominios=[
    'localhost'=>'ejemplo'
];

foxtrot::establecerEnrutadorAplicacion(new enrutadorAplicacionPredeterminado($dominios));

configuracion::establecer([
    'url'=>'http://localhost/experimental-foxtrot-framework/desarrollo/',
    //El parámetro rutaBase permite configurar el sistema en un subdirectorio (omitir si se instala en el raíz del servidor web)
    'rutaBase'=>'/experimental-foxtrot-framework/desarrollo/'
]);