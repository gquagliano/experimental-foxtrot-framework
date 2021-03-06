<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

define('_inc',1);

include(__DIR__.'/funciones.php');
include(_raizGlobal.'desarrollo/servidor/foxtrot.php');

foxtrot::inicializar(false);
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="../desarrollo/recursos/css/foxtrot.css">
    <link rel="stylesheet" href="gestor.css">
    <title>Editor de vistas</title>
    <link rel="icon" type="image/png" href="../desarrollo/recursos/img/favicon.png">
  </head>
  <body class="foxtrot-editor foxtrot-trabajando">

    <div id="foxtrot-barra-principal" class="foxtrot-editor foxtrot-barra-herramientas">
        <button class="btn btn-sm separador" onclick="editor.guardar()" title="Guardar"><img src="img/guardar.png"></button>
        <button class="btn btn-sm separador" onclick="editor.previsualizar()" disabled title="Previsualizar la vista en una nueva ventana (sin guardar los cambios)"><img src="img/previsualizar.png"></button>
        <button class="btn btn-sm" onclick="editor.deshacer()" id="foxtrot-btn-deshacer" title="Deshacer"><img src="img/deshacer.png"></button>
        <button class="btn btn-sm" onclick="editor.rehacer()" id="foxtrot-btn-rehacer" title="Rehacer"><img src="img/rehacer.png"></button>
        <div class="float-right text-nowrap">
            <img src="img/cargando.svg" id="foxtrot-cargando">
            <button class="btn btn-sm activo" onclick="editor.alternarBordes()" id="foxtrot-btn-alternar-bordes" title="Activar / desactivar bordes"><img src="img/bordes.png"></button>
            <button class="btn btn-sm" onclick="editor.alternarInvisibles()" id="foxtrot-btn-alternar-invisibles" title="Mostrar / ocultar elementos invisibles"><img src="img/ver.png"></button>
            <button class="btn btn-sm" onclick="editor.alternarMovil()" id="foxtrot-btn-alternar-movil" title="Activar / desactivar estilos para dispositivos móviles"><img src="img/movil.png"></button>
            <select class="custom-select" title="Tamaño de pantalla" onchange="editor.tamanoMarco(this.valor())">
                <option value="g">Global</option>
                <option value="xl">Extra grande</option>
                <option value="lg">Grande</option>
                <option value="md">Medio</option>
                <option value="sm">Pequeño</option>
                <option value="xs">Extra pequeño</option>
            </select>
        </div>
    </div>
    <div id="foxtrot-barra-componentes" class="foxtrot-editor foxtrot-barra-herramientas-flotante">
        <div class="foxtrot-asa-arrastre"></div>
        <div class="foxtrot-contenidos-barra-herramientas"></div>
    </div>
    <div id="foxtrot-barra-propiedades" class="foxtrot-editor foxtrot-barra-herramientas-flotante foxtrot-barra-propiedades-vacia">
        <div class="foxtrot-asa-arrastre"></div>
        <div class="foxtrot-contenidos-barra-herramientas">Ningún componente seleccionado</div>
    </div>    
    
    <iframe id="foxtrot-marco" src="about:blank"></iframe>

    <script src="../desarrollo/cliente/foxtrot.js"></script>    
    <script src="editor.js"></script>
    <script>
    "use strict";
    idioma.establecerIdioma("<?=configuracion::obtener('idioma')?>");
    editor.activar({
        urlBase:"<?=\foxtrot::obtenerUrl()?>"
    });
    window.evento("load",function() {
        //Esto es provisorio, hasta que tengamos el gestor de archivos o al menos diálogos de abrir/guardar
        editor.abrir({
                aplicacion:"<?=$_GET['apl']?>",
                vista:"<?=$_GET['vista']?>",
                modo:"<?=$_GET['modo']?>",
                cliente:"<?=$_GET['cliente']?>"
            });
    });
    </script>
  </body>
</html>