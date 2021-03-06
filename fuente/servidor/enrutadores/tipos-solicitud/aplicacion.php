<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace solicitud\tipos;

defined('_inc') or exit;

/**
 * Tipo de solicitud concreta que representa el acceso a un método del controlador público de la aplicación. Parámetro POST: `__a`. Parámetro CLI: `-metodo-apl`.
 */
class aplicacion extends \tipoSolicitud {    
    protected $metodo=null;

    /**
     * Ejecuta la solicitud.
     * @return \tipoSolicitud\tipos\aplicacion
     */
    public function ejecutar() {
        $obj=\foxtrot::obtenerAplicacionPublica();
        $this->ejecutarMetodo($obj,$this->obtenerMetodo());
        return $this;
    }

    /**
     * Determina si los parámetros dados a una solicitud de este tipo.
     * @var string $url URL
     * @var object $parametros Parámetros de la solicitud.
     * @return bool
     */
    public static function es($url,$parametros) {
        return (!\foxtrot::esCli()&&isset($parametros->__a))||
            isset($parametros->metodoApl);
    }

    /**
     * Devuelve el nombre del método solicitado.
     * @return string
     */
    public function obtenerMetodo() {
        if(!$this->metodo)
            $this->metodo=\util::limpiarValor(\foxtrot::esCli()?$this->parametros->metodoApl:$this->parametros->__a);

        return $this->metodo;
    }

    /**
     * Establece el nombre del método. Nota: Este valor no será sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $nombre Nombre del método.
     * @return \tipoSolicitud\tipos\aplicacion
     */
    public function establecerMetodo($nombre) {
        $this->metodo=$nombre;
        return $this;
    }
}