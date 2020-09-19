<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

include(__DIR__.'/operaciones/funciones.php');
include(__DIR__.'/asistentes/asistente.php');

foxtrot::inicializar(false);
gestor::inicializar();
asistentes::inicializar();

/**
 * Procesa las solicitudes del gestor de aplicaciones.
 */
class gestor {
    /** @var string $aplicacion Nombre de la aplicación activa. */
    protected static $aplicacion;
    /** @var object $jsonApl JSON de la aplicación actual. */
    protected static $jsonApl;
    /** @var string[] $aplicaciones Listado de aplicaciones. */
    protected static $aplicaciones;

    //TODO *Desharcodear* rutas

    /**
     * Devuelve el nombre de la aplicación activa.
     * @return string
     */
    public static function obtenerNombreAplicacion() {
        return self::$aplicacion;
    }

    /**
     * Devuelve el listado de nombres de aplicaciones.
     * @return string[]
     */
    public static function obtenerAplicaciones() {
        return self::$aplicaciones;
    }

    /**
     * Devuelve el JSON de la aplicación activa.
     * @return object
     */
    public static function obtenerJsonAplicacion() {
        return self::$jsonApl;
    }

    /**
     * Inicializa la clase.
     */
    public static function inicializar() {
        //TODO Esto debe venir de foxtrot
        self::$aplicaciones=[];
        foreach(glob(_aplicaciones.'*',GLOB_ONLYDIR) as $ruta) self::$aplicaciones[]=basename($ruta);
        
        $aplicacion=$_SESSION['_gestorAplicacion'];
        if(!$aplicacion) $aplicacion=$_SESSION['_gestorAplicacion']=self::$aplicaciones[0];

        define('_gestorAplicacion',$aplicacion);
        self::$aplicacion=$_SESSION['_gestorAplicacion'];

        foxtrot::cargarAplicacion(_gestorAplicacion);
        
        //TODO Esto debe venir de foxtrot
        self::$jsonApl=json_decode(file_get_contents(_raizAplicacion.'aplicacion.json'));        
    }

    /**
     * Analiza y procesa la solicitud actual.
     */
    public static function procesarSolicitud() {
        if($_REQUEST['eliminarVista']) {
            self::eliminarVista($_REQUEST['eliminarVista']);
        } elseif($_REQUEST['seleccionarAplicacion']) {
            self::seleccionarAplicacion($_REQUEST['seleccionarAplicacion']);            
        } elseif($_REQUEST['asistente']) {
            self::ejecutarAsistente($_REQUEST['asistente']);
        }
        self::ok();
    }

    /**
     * Cambia la aplicación activa.
     * @var string $nombre Nombre de la aplicación.
     */
    protected static function seleccionarAplicacion($nombre) {
        $_SESSION['_gestorAplicacion']=$nombre;
    }

    /**
     * Elimina una vista.
     * @var string $nombre Nombre de la vista.
     */
    protected static function eliminarVista($nombre) {
        asistentes::obtenerAsistente('vistas')
            ->eliminar($nombre);
    }

    /**
     * Ejecuta un asistente tomando los datos del formulario.
     * @var string $nombre Nombre del asistente.
     */
    protected static function ejecutarAsistente($nombre) {
        asistentes::obtenerAsistente($nombre)
            ->ejecutar(json_decode($_REQUEST['parametros']));
    }

    /**
     * Redirecciona al gestor, cuando no se trate de una solicitud AJAX.
     */
    protected static function volver() {
        header('Location: ../');
        exit;
    }

    /**
     * Responde un OK.
     * @var mixed $datos Información a enviar.
     */
    public static function ok($datos=null) {
        echo json_encode(['r'=>'ok','d'=>$datos]);
        exit;
    }

    /**
     * Responde un mensaje de error.
     * @var mixed $datos Información a enviar.
     */
    public static function error($datos=null) {
        echo json_encode(['r'=>'error','d'=>$datos]);
        exit;
    }
}