<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de las aplicaciones.
 */
class aplicacion extends controlador {
    protected $cliente;
    
    function __construct() {
        //Inicializar comunicación con el cliente
        $this->cliente=new cliente();
        $this->cliente->establecerAplicacion();
    }

    public function obtenerCliente() {
        return $this->cliente;
    }
}