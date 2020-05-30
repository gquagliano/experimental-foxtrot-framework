<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase principal del sistema (prototipo).
 */
class foxtrot {
    protected static $enrutador=null;
    protected static $enrutadorApl=null;
    protected static $aplicacion=null;
    protected static $instanciaAplicacion=null;
    protected static $instanciaPublicaAplicacion=null;

    public function __destruct() {
        foxtrot::destructor();
    }

    public static function destructor() {
    }

    public static function obtenerUrl() {
        return configuracion::$url;
    }

    public static function esHttps() {
        return (!empty($_SERVER['REQUEST_SCHEME'])&&$_SERVER['REQUEST_SCHEME']== 'https')||
            (!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']=='on')||
            (!empty($_SERVER['SERVER_PORT'])&&$_SERVER['SERVER_PORT']=='443');
    }

    public static function establecerEnrutador($obj) {
        self::$enrutador=$obj;
    }

    public static function establecerEnrutadorAplicacion($obj) {
        self::$enrutadorApl=$obj;
    }

    protected static function definirConstantes() {
        define('_raiz',realpath(__DIR__.'/..').'/');
        define('_servidor',_raiz.'servidor/');
        define('_aplicaciones',_raiz.'aplicaciones/');
    }

    protected static function definirConstantesAplicacion() {
        define('_apl',self::$aplicacion);
        define('_raizAplicacion',_aplicaciones._apl.'/');
        define('_servidorAplicacion',_raizAplicacion.'servidor/');
        define('_clienteAplicacion',_raizAplicacion.'cliente/');
    }

    protected static function incluirArchivos() {
        include(_servidor.'funciones.php');
        include(_servidor.'configuracion.php');
        include(_servidor.'cliente.php');
        include(_servidor.'controlador.php');
        include(_servidor.'aplicacion.php');
        include(_servidor.'enrutador.php');
        include(_servidor.'enrutadorAplicacion.php');

        include(_servidor.'enrutadores/enrutadorPredeterminado.php');
        include(_servidor.'enrutadores/enrutadorAplicacionPredeterminado.php');
    }

    protected static function cargarAplicacion() {
        self::definirConstantesAplicacion();
        configuracion::cargarConfigAplicacion();
        
        //Si la aplicación no definió un enrutador en su configuración, utilizar el predeterminado
        if(!self::$enrutador&&!configuracion::$enrutador) {
            self::$enrutador=new enrutadorPredetermiando;
        } elseif(configuracion::$enrutador) {
            include(_servidorAplicacion.configuracion::$enrutador.'.php');            
            $cls='\\aplicaciones\\'._apl.'\\enrutadores\\'.configuracion::$enrutador;
            self::$enrutador=new $cls;
        }

        if(file_exists(_servidorAplicacion.'aplicacion.php')) include(_servidorAplicacion.'aplicacion.php');
        $cls='\\aplicaciones\\'._apl.'\\aplicacion';
        self::$instanciaAplicacion=new $cls;

        if(file_exists(_servidorAplicacion.'aplicacion.pub.php')) include(_servidorAplicacion.'aplicacion.pub.php');
        $cls='\\aplicaciones\\'._apl.'\\publico\\aplicacion';
        self::$instanciaAplicacion=new $cls;
    }

    public static function inicializar() {
        error_reporting(E_ALL^E_NOTICE^E_DEPRECATED);
        //TODO Registro de errores

        self::definirConstantes();
        self::incluirArchivos();

        configuracion::cargar();

        //Establecer url por defecto
        if(!configuracion::$url) configuracion::$url=(self::esHttps()?'https':'http').'://'.$_SERVER['HTTP_HOST'].configuracion::$rutaBase;

        self::$aplicacion=self::$enrutadorApl->determinarAplicacion();
        if(!self::$aplicacion) self::error();

        self::cargarAplicacion();
    }

    public static function error() {
        redir(configuracion::$rutaEror);
    }

    public static function ejecutar() {
        $uri=$_SERVER['REQUEST_URI'];
        //Remover la ruta base al sistema
        $uri=substr($uri,strlen(configuracion::$rutaBase));

        self::$enrutador->establecerSolicitud($uri,$_REQUEST);
        
        if(self::$enrutador->obtenerError()) self::error();

        $pagina=self::$enrutador->obtenerPagina();
        $vista=self::$enrutador->obtenerVista();
        $ctl=self::$enrutador->obtenerControlador();
        $metodo=self::$enrutador->obtenerMetodo();
        $params=self::$enrutador->obtenerParametros();
        $recurso=self::$enrutador->obtenerRecurso();

        header('Content-Type: text/html; charset=utf-8',true);

        $html=null;
        $res=null;

        if($pagina) {
            //Cargar una página independiente

            //TODO Validación configurable de páginas disponibles públicamente.
            if(!in_array($pagina,['error'])) self::error();

            include(_raiz.$pagina.'.php');
            exit;
        }

        if($recurso) {
            //Enviar archivos de la aplicación
            $dir=realpath(_raizAplicacion);
            $ruta=realpath($dir.'/'.$recurso);
            if(substr($ruta,0,strlen($dir))!=$dir||!file_exists($ruta)) self::error();

            $mime=\mime($ruta);
            header('Content-Type: '.$mime.'; charset=utf-8',true);       
            
            $f=fopen($ruta,'r');
            fpassthru($f);
            fclose($f);
            exit;
        }

        if($vista) {
            //Devuelve el contenido html de la vista

            //Validar que el archivo solicitado exista y no salga del directorio de cliente
            $dir=realpath(_clienteAplicacion);
            $rutaPhp=realpath($dir.'/'.$vista.'.php');
            $rutaHtml=realpath($dir.'/'.$vista.'.html');
            if($rutaPhp) {
                if(substr($rutaPhp,0,strlen($dir))!=$dir) self::error();
                ob_start();
                include($rutaPhp);
                $html=ob_get_clean();
            } elseif($rutaHtml) {
                if(substr($rutaHtml,0,strlen($dir))!=$dir) self::error();
                $html=file_get_contents($rutaHtml);
            } else {
                self::error();
            }
        }

        if($ctl) {
            if(preg_match('/[^a-z0-9_-]/i',$ctl)) self::error();

            $ruta=_servidorAplicacion.$ctl.'.pub.php';
            if(!file_exists($ruta)) self::error();

            include($ruta);
            $cls='\\aplicaciones\\'._apl.'\\publico\\'.$ctl;
            $obj=new $cls;            
        } elseif(self::$instanciaAplicacion) {
            //Si no se definió un controlador, notificaremos la solicitud a la clase pública de la aplicación
            $obj=self::$instanciaAplicacion;
        }       

        if($metodo) {
            if(!$obj||!method_exists($obj,$metodo)) self::error();
            $res=call_user_func_array([$obj,$metodo],$params);
        }

        if($html!==null) {
            //Pasaremos el html por el método html() del controlador para que pueda hacer algún preproceso si lo desea
            $html=$obj->html($html);
            echo $html;
        } elseif($res!==null) {
            header('Content-Type: text/plain; charset=utf-8',true);
            cliente::responder($res);         
        }   
        exit;     
    }
}

//Crear una instancia de foxtrot para poder contar con un destructor global
$foxtrot=new foxtrot;